/**
 * Nội dung tour hướng dẫn lần đầu.
 *
 * Chủ ý: KHÔNG giải thích những thứ tự nó đã rõ (xu, năng lượng, chuỗi ngày —
 * nhìn là hiểu). Tour dành chỗ cho những nơi người dùng mới không tự tìm ra:
 * các tab bên cạnh, và nhất là Trung tâm luyện tập nằm sau nút "Thêm".
 *
 * Tour đi xuyên hai màn: thanh tab ở màn Học → Trung tâm luyện tập.
 */

import type { TutorialStep } from "@/types";

const HOME_ROUTE = "/(tabs)";
const REVIEW_ROUTE = "/review";

export const HOME_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    target: null,
    route: HOME_ROUTE,
    title: "Xin chào, mình là Koto!",
    body: "App còn vài chỗ hay ho nằm hơi khuất. Đi một vòng 30 giây với mình nhé — xong bạn sẽ biết mở chúng ở đâu.",
    mascot: "hi",
    ctaLabel: "Đi thôi!",
  },
  {
    id: "lesson-node",
    target: "lesson-node",
    route: HOME_ROUTE,
    title: "Bài học của bạn ở đây",
    body: "Ô đang phát sáng là bài kế tiếp. Bấm vào để xem trước rồi bắt đầu. Xong một ô, ô sau mở ra.",
    mascot: "school",
    padding: 12,
    shape: "circle",
  },
  {
    id: "tab-leaderboard",
    target: "tab-leaderboard",
    route: HOME_ROUTE,
    title: "Bảng xếp hạng 🏆",
    body: "Kinh nghiệm mỗi tuần đưa bạn lên hạng. Đủ điểm thì thăng bậc, tụt lại thì rớt xuống — đua với bạn bè cho vui.",
    mascot: "winner",
    placement: "top",
  },
  {
    id: "tab-shop",
    target: "tab-shop",
    route: HOME_ROUTE,
    title: "Cửa hàng 🛍️",
    body: "Xu kiếm được đổi ở đây: hồi năng lượng, mua vật phẩm giữ chuỗi ngày và trang phục cho hồ sơ của bạn.",
    mascot: "happy",
    placement: "top",
  },
  {
    id: "tab-quests",
    target: "tab-quests",
    route: HOME_ROUTE,
    title: "Nhiệm vụ 🚩",
    body: "Vài việc ngắn mỗi ngày, làm xong có xu và kinh nghiệm. Đây là cách kiếm xu nhanh nhất.",
    mascot: "happy",
    placement: "top",
  },
  {
    id: "tab-friends",
    target: "tab-friends",
    route: HOME_ROUTE,
    title: "Bạn bè 👥",
    body: "Theo dõi bạn bè để thấy họ học tới đâu, thành tích mới của họ, và cổ vũ nhau giữ chuỗi ngày.",
    mascot: "school",
    placement: "top",
  },
  {
    id: "tab-more",
    target: "tab-more",
    route: HOME_ROUTE,
    title: "Chỗ dễ bỏ sót nhất",
    body: 'Nút "Thêm" mở ra Hồ sơ, bảng chữ Kana và Trung tâm luyện tập. Mình dẫn bạn vào Trung tâm luyện tập ngay đây — phần đáng giá nhất của app.',
    mascot: "confuse",
    placement: "top",
    ctaLabel: "Vào xem",
  },
  {
    id: "review-vocab",
    target: "review-vocab",
    route: REVIEW_ROUTE,
    title: "Ôn tập từ vựng ⏳",
    body: "Hệ thống ghi nhớ ngắt quãng tự nhắc bạn ôn lại các từ sắp quên đúng thời điểm để khắc sâu vào trí nhớ dài hạn.",
    mascot: "school",
  },
  {
    id: "review-mistakes",
    target: "review-mistakes",
    route: REVIEW_ROUTE,
    title: "Luyện tập Lỗi Sai",
    body: "Mọi câu bạn từng làm sai được gom về đây. Làm lại tới khi đúng thì câu đó mới rời khỏi danh sách.",
    mascot: "confuse",
  },
  {
    id: "review-conversation",
    target: "review-conversation",
    route: REVIEW_ROUTE,
    title: "Luyện hội thoại AI",
    body: "Đóng vai tình huống thật — hỏi đường, gọi món — và nói bằng tiếng Nhật. App nghe bạn nói rồi trả lời lại.",
    mascot: "happy",
  },
  {
    id: "review-pronunciation",
    target: "review-pronunciation",
    route: REVIEW_ROUTE,
    title: "Luyện phát âm chuyên sâu 🎙️",
    body: "Nghe phát âm chuẩn từ người bản xứ và luyện nói lại để rèn luyện phản xạ và ngữ điệu tự nhiên.",
    mascot: "winner",
    padding: 8,
  },
  {
    id: "done",
    target: null,
    route: HOME_ROUTE,
    title: "Xong rồi, tuyệt lắm!",
    body: "Giờ bạn biết mọi thứ nằm ở đâu. Quay lại lộ trình và bắt đầu bài đầu tiên nhé — mình đợi ở cuối chặng đường!",
    mascot: "winner",
    ctaLabel: "Bắt đầu học",
  },
];
