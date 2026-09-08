"""Danh mục chủ đề hội thoại + hỗ trợ chủ đề do người học tự nhập.

Vì sao chủ đề dựng sẵn vẫn cần tồn tại khi đã có LLM
----------------------------------------------------
LLM thừa sức tự bịa ra một tình huống, nhưng người mới học N5 mở app lên
thường KHÔNG biết mình muốn nói về cái gì. Danh sách dựng sẵn là điểm khởi
hành; ô "chủ đề khác" là lối thoát cho người đã biết mình muốn luyện gì.

Chủ đề tự nhập KHÔNG bị kiểm duyệt nội dung ở đây - phần đó để bộ lọc an toàn
mặc định của Gemini lo. Ở đây chỉ cắt độ dài để một chuỗi rác dài không thổi
phồng prompt.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import yaml

#: Id quy ước cho chủ đề do người học tự nhập. Client gửi đúng chuỗi này kèm
#: `customTopic`, thay vì ta phải sinh id động rồi lưu ở đâu đó.
CUSTOM_TOPIC_ID = "custom"

#: Chủ đề tự nhập dài hơn mức này gần như chắc chắn là dán nhầm cả đoạn văn.
MAX_CUSTOM_TOPIC_LENGTH = 80

_DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "topics.yaml"


@dataclass(frozen=True)
class Topic:
    """Một chủ đề luyện tập. Bất biến - nạp một lần lúc khởi động."""

    id: str
    title: str
    title_ja: str
    level: str
    icon: str
    color: str
    description: str
    goal: str
    persona_name: str
    persona_name_ja: str
    persona_emoji: str
    #: Mô tả vai diễn + các mốc gợi ý, chèn thẳng vào system prompt.
    guidance: str


@lru_cache(maxsize=1)
def load_topics() -> dict[str, Topic]:
    """Nạp `data/topics.yaml`. Kết quả được cache theo vòng đời tiến trình."""
    raw = yaml.safe_load(_DATA_FILE.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        return {}
    topics: dict[str, Topic] = {}

    for entry in raw.get("topics", []):
        persona = entry.get("persona", {})
        topic = Topic(
            id=entry["id"],
            title=entry["title"],
            title_ja=entry.get("title_ja", ""),
            level=entry.get("level", "N5"),
            icon=entry.get("icon", "chatbubbles-outline"),
            color=entry.get("color", "#58CC02"),
            description=entry.get("description", ""),
            goal=entry.get("goal", ""),
            persona_name=persona.get("name", ""),
            persona_name_ja=persona.get("name_ja", ""),
            persona_emoji=persona.get("emoji", "💬"),
            guidance=entry.get("guidance", "").strip(),
        )
        if topic.id in topics:
            raise ValueError(f"Chủ đề trùng id: {topic.id}")
        topics[topic.id] = topic

    if CUSTOM_TOPIC_ID in topics:
        raise ValueError(f"'{CUSTOM_TOPIC_ID}' là id dành riêng cho chủ đề tự nhập")
    return topics


def build_custom_topic(text: str) -> Topic:
    """Dựng một `Topic` từ chuỗi người học gõ vào.

    Cố ý KHÔNG nhờ LLM sinh ra persona/goal trước: làm vậy tốn thêm một vòng
    gọi mạng (và một lần chờ) trước khi câu chào đầu tiên xuất hiện. Thay vào
    đó `guidance` để mở, và chính lời gọi mở đầu sẽ tự chọn vai phù hợp.
    """
    cleaned = " ".join(text.split())[:MAX_CUSTOM_TOPIC_LENGTH].strip()
    if not cleaned:
        raise ValueError("Chủ đề trống")

    return Topic(
        id=CUSTOM_TOPIC_ID,
        title=cleaned,
        title_ja="",
        level="N5",
        icon="sparkles-outline",
        color="#F59E0B",
        description=f"Chủ đề bạn tự chọn: {cleaned}",
        goal=f"Trò chuyện trọn vẹn bằng tiếng Nhật về: {cleaned}",
        persona_name="Người bạn Nhật",
        persona_name_ja="日本人の友だち",
        persona_emoji="✨",
        guidance=(
            f'Chủ đề do người học tự chọn: "{cleaned}".\n'
            "Hãy tự chọn một vai người Nhật hợp lý nhất với chủ đề này (nhân viên, "
            "bạn bè, đồng nghiệp, người quen...) và giữ nguyên vai đó suốt cuộc "
            "trò chuyện. Dựng một tình huống đời thường cụ thể chứ đừng nói chung "
            "chung, và giữ độ khó ở mức người mới học (N5-N4)."
        ),
    )


def resolve(topic_id: str, custom_topic: str | None) -> Topic | None:
    """Tra chủ đề theo id, tự dựng nếu đó là chủ đề tự nhập.

    Trả về None khi id không tồn tại - tầng API quyết định đó là 404 hay 400.
    """
    if topic_id == CUSTOM_TOPIC_ID:
        if not custom_topic or not custom_topic.strip():
            return None
        return build_custom_topic(custom_topic)
    return load_topics().get(topic_id)
