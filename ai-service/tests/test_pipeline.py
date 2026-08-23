"""Test cho tầng AI: dữ liệu, tầng chặn, phân loại, máy hội thoại.

Các test ở đây bảo vệ những BẤT BIẾN VỀ HÀNH VI chứ không chốt cứng con số độ
chính xác. Chốt cứng "accuracy >= 0.677" sẽ vỡ mỗi lần thêm dữ liệu, kể cả khi
hệ thống tốt lên. Thứ cần bảo vệ là: câu rác không bao giờ lọt, hội thoại
không bao giờ vào ngõ cụt, và luồng chính luôn đi tới đích.
"""

from __future__ import annotations

import pytest

from nihongo_ai import grammar, guards
from nihongo_ai.classifier import IntentClassifier, PredictionStatus
from nihongo_ai.dataset import OUT_OF_SCOPE, load_dataset
from nihongo_ai.dialogue import DialogueEngine, TurnOutcome, load_scenarios
from nihongo_ai.guards import RejectReason


@pytest.fixture(scope="module")
def data():
    return load_dataset(strict=False)


@pytest.fixture(scope="module")
def engine():
    classifier = IntentClassifier.load()
    return DialogueEngine(classifier, load_scenarios())


# ---------------------------------------------------------------------------
# Dữ liệu
# ---------------------------------------------------------------------------
def test_dataset_loads_and_has_rejection_class(data):
    assert len(data.texts) > 500
    assert OUT_OF_SCOPE in data.intents


def test_no_conflicting_labels_within_a_scenario(data):
    """Cùng một câu chữ không được mang hai nhãn trong CÙNG một kịch bản."""
    seen: dict[tuple[str, str], str] = {}
    for text, label in zip(data.texts, data.labels):
        scenario = data.scenario_of(label)
        key = (scenario, text)
        if key in seen:
            assert seen[key] == label, f"{text!r} mâu thuẫn trong '{scenario}'"
        seen[key] = label


def test_scenario_label_space_always_includes_globals(data):
    for scenario in data.scenarios:
        allowed = data.intents_for_scenario(scenario)
        assert OUT_OF_SCOPE in allowed
        assert "greeting" in allowed  # ý định chung phải có mặt khắp nơi


# ---------------------------------------------------------------------------
# Tầng chặn - phải TUYỆT ĐỐI không chặn nhầm câu hợp lệ
# ---------------------------------------------------------------------------
@pytest.mark.parametrize(
    "text,reason",
    [
        ("", RejectReason.EMPTY),
        ("ん", RejectReason.TOO_SHORT),
        ("😂😂😂", RejectReason.NO_LETTERS),
        ("12345", RejectReason.NO_LETTERS),
        ("？？？", RejectReason.NO_LETTERS),
        ("ああああああ", RejectReason.GIBBERISH),
        ("asdfghjkl", RejectReason.WRONG_SCRIPT),
        ("cho toi xin mot bat mi", RejectReason.WRONG_SCRIPT),
        ("あ" * 300, RejectReason.TOO_LONG),
    ],
)
def test_guard_rejects_junk(text, reason):
    verdict = guards.inspect(text)
    assert verdict.rejected
    assert verdict.reason is reason


def test_guard_never_blocks_a_real_training_sentence(data):
    """Chặn nhầm câu hợp lệ là lỗi nặng hơn bỏ lọt câu rác."""
    wrongly_blocked = [
        text
        for text, label in zip(data.texts, data.labels)
        if label != OUT_OF_SCOPE and guards.inspect(text).rejected
    ]
    assert wrongly_blocked == []


@pytest.mark.parametrize(
    "text",
    [
        "tシャツはありますか",   # nhiều ký tự latin nhưng vẫn hợp lệ
        "paypayは使えますか",
        "aセットをお願いします",
        "はい",
    ],
)
def test_guard_allows_mixed_script_sentences(text):
    assert guards.inspect(text).passed


# ---------------------------------------------------------------------------
# Bộ phân loại
# ---------------------------------------------------------------------------
def test_classifier_recognises_core_intents(engine):
    clf = engine.classifier
    assert clf.predict("駅はどこですか", "directions").intent == "directions_ask_where"
    assert clf.predict("ラーメンをください", "restaurant").intent == "restaurant_order"
    assert clf.predict("お会計お願いします", "restaurant").intent == "restaurant_ask_bill"


def test_classifier_never_returns_intent_outside_scenario(engine, data):
    """Ràng buộc cốt lõi: không gian nhãn bị thu hẹp theo kịch bản."""
    clf = engine.classifier
    for scenario in data.scenarios:
        allowed = set(data.intents_for_scenario(scenario))
        for probe in ["お会計お願いします", "駅はどこですか", "私はアンです", "はい"]:
            prediction = clf.predict(probe, scenario)
            if prediction.intent is not None:
                assert prediction.intent in allowed


def test_classifier_flags_junk_as_rejected(engine):
    prediction = engine.classifier.predict("asdfghjkl", "restaurant")
    assert prediction.status is PredictionStatus.REJECTED
    assert not prediction.actionable


def test_offtopic_japanese_is_not_actionable(engine):
    """Tiếng Nhật đúng ngữ pháp nhưng lạc đề thì không được kích hoạt hành động."""
    prediction = engine.classifier.predict("今日はいい天気ですね", "restaurant")
    assert not prediction.actionable


# ---------------------------------------------------------------------------
# Máy hội thoại
# ---------------------------------------------------------------------------
def test_happy_path_restaurant_reaches_completion(engine):
    turns = [
        "二人です",
        "おすすめは何ですか",
        "ラーメンをください",
        "いいえ、大丈夫です",
        "お会計お願いします",
        "ありがとうございました",
    ]
    state = engine.start("restaurant").next_state
    completed = False
    for text in turns:
        result = engine.respond("restaurant", state, text)
        state = result.next_state
        completed = result.completed
    assert completed


def test_happy_path_directions_reaches_completion(engine):
    state = engine.start("directions").next_state
    completed = False
    for text in ["駅はどこですか", "どのくらいかかりますか", "ありがとうございました"]:
        result = engine.respond("directions", state, text)
        state = result.next_state
        completed = result.completed
    assert completed


def test_every_turn_offers_a_way_forward(engine):
    """Bất biến chống ngõ cụt: mọi lượt hỏng đều phải kèm gợi ý cụ thể."""
    junk = ["asdfghjkl", "😂", "今日はいい天気ですね", "ナルトを見ましたか", "ん"]
    for text in junk:
        result = engine.respond("restaurant", "welcome", text)
        assert result.hints, f"{text!r} khiến người dùng bị kẹt, không có gợi ý"
        assert result.reply.vi, f"{text!r} không có lời giải thích"


def test_wrong_time_is_distinct_from_off_topic(engine):
    """Câu đúng nhưng sai lúc PHẢI khác câu lạc đề - nếu không người học
    sẽ tưởng mình viết sai tiếng Nhật."""
    wrong_time = engine.respond("restaurant", "welcome", "お会計お願いします")
    off_topic = engine.respond("restaurant", "welcome", "今日はいい天気ですね")
    assert wrong_time.outcome is TurnOutcome.WRONG_TIME
    assert off_topic.outcome is TurnOutcome.OFF_TOPIC


def test_rescue_triggers_after_repeated_failures(engine):
    state, failures, rescued = "welcome", 0, False
    for text in ["今日はいい天気ですね", "ナルトが好きです", "asdfgh"]:
        result = engine.respond("restaurant", state, text, failures)
        failures = result.consecutive_failures
        rescued = result.rescue
    assert failures == 3
    assert rescued


def test_success_resets_the_failure_streak(engine):
    result = engine.respond("restaurant", "welcome", "二人です", 2)
    assert result.consecutive_failures == 0


def test_asking_for_help_is_served_everywhere_and_is_not_a_failure(engine):
    result = engine.respond("restaurant", "welcome", "ヒントをください", 1)
    assert result.consecutive_failures == 1  # không bị cộng thêm
    assert result.reply.vi


def test_every_scenario_can_be_started(engine):
    for scenario_id in engine.scenarios:
        result = engine.start(scenario_id)
        assert result.next_state in engine.scenarios[scenario_id].states


# ---------------------------------------------------------------------------
# Hội thoại tự nhiên: lưới đỡ `anytime` + câu xã giao
#
# Các test dưới đây khoá lại quyết định thiết kế "không phạt cách diễn đạt,
# chỉ dạy trình tự". Chúng quét TOÀN BỘ trạng thái chứ không kiểm vài ca lẻ,
# vì lỗi cũ chính là kiểu lỗ hổng rải rác mà ca lẻ không bắt được.
# ---------------------------------------------------------------------------
SOCIAL_SAMPLES = {
    "thanks": "ありがとうございます",
    "apologize": "すみません",
    "greeting": "こんにちは",
    "not_understand": "わかりません",
}


def _live_states(engine, scenario_id):
    """Mọi trạng thái không phải kết thúc của một kịch bản."""
    return [s for s in engine.scenarios[scenario_id].states.values() if not s.terminal]


@pytest.mark.parametrize("intent,text", sorted(SOCIAL_SAMPLES.items()))
def test_social_sentences_are_never_wrong_time(engine, intent, text):
    """Bảo bạn học rằng "cảm ơn" chưa hợp bước này thì không cách nào biện
    minh được - người thật không bao giờ làm vậy."""
    for scenario_id in engine.scenarios:
        for state in _live_states(engine, scenario_id):
            result = engine.respond(scenario_id, state.id, text, 0)
            assert result.outcome is not TurnOutcome.WRONG_TIME, (
                f"{intent} bị chặn ở {scenario_id}/{state.id}"
            )


def test_social_sentences_do_not_count_as_a_failure(engine):
    """Chào hỏi giữa chừng không được đẩy người học tới ngưỡng 'cần cứu'."""
    for text in SOCIAL_SAMPLES.values():
        result = engine.respond("directions", "approach", text, 1)
        assert result.consecutive_failures <= 1


def test_anytime_intents_are_accepted_in_every_state(engine):
    """Ý định đã khai `anytime` thì phải đi được ở MỌI trạng thái - đó là
    toàn bộ lý do khối này tồn tại."""
    for scenario_id, scenario in engine.scenarios.items():
        for intent in scenario.anytime:
            for state in _live_states(engine, scenario_id):
                assert (
                    intent in state.expects
                    or intent in scenario.anytime
                ), f"{intent} không tới được {scenario_id}/{state.id}"


def test_asking_how_to_get_there_works_from_the_very_first_turn(engine):
    """Hồi quy: hỏi 'đi thế nào' ngay lượt đầu từng bị trả wrong_time dù mô
    hình phân loại đúng với độ tin cậy > 0.8."""
    result = engine.respond("directions", "approach", "レストランはどうやって行きますか", 0)
    assert result.outcome is not TurnOutcome.WRONG_TIME
    assert result.intent == "directions_ask_how_to_get"
    assert result.consecutive_failures == 0
    assert result.reply.ja


def test_self_introduction_accepts_any_order(engine):
    """Tên / quê / nghề / sở thích vốn không có trình tự bắt buộc."""
    for text in ["趣味は音楽です", "学生です", "ベトナムから来ました"]:
        result = engine.respond("self_intro", "first_meet", text, 0)
        assert result.outcome is not TurnOutcome.WRONG_TIME


def test_scripted_transitions_still_win_over_the_safety_nets(engine):
    """`expects` của trạng thái phải được xét TRƯỚC `anytime`, nếu không mạch
    truyện sẽ đứng yên tại chỗ mãi mãi."""
    # `restaurant_ask_menu` có mặt ở CẢ `seated.expects` lẫn `anytime`.
    result = engine.respond("restaurant", "seated", "おすすめは何ですか", 0)
    assert result.intent == "restaurant_ask_menu"
    # Câu đáp phải là bản soạn riêng của `seated`, không phải bản dùng chung.
    assert "一番人気" in result.reply.ja


def test_out_of_order_milestones_are_still_refused(engine):
    """`wrong_time` phải SỐNG SÓT ở đúng chỗ của nó: đòi hoá đơn khi chưa ngồi
    vào bàn, đòi trả tiền khi chưa chọn đồ. Đây mới là lúc nó dạy được."""
    assert (
        engine.respond("restaurant", "welcome", "お会計お願いします", 0).outcome
        is TurnOutcome.WRONG_TIME
    )
    assert (
        engine.respond("shopping", "welcome", "カードで払えますか", 0).outcome
        is TurnOutcome.WRONG_TIME
    )


def test_wrong_time_names_the_sentence_it_is_waiting_for(engine):
    """Từ chối mà không nói bước nào mới đúng thì người học không bám vào đâu."""
    result = engine.respond("restaurant", "welcome", "お会計お願いします", 0)
    hint = engine.scenarios["restaurant"].states["welcome"].hints[0]
    assert hint.ja in result.reply.ja
    assert hint.ja in result.reply.vi


def test_no_state_is_a_dead_end_for_social_sentences(engine):
    """Mọi câu đáp xã giao đều phải có nội dung ở CẢ hai ngôn ngữ."""
    for scenario_id in engine.scenarios:
        for state in _live_states(engine, scenario_id):
            result = engine.respond(scenario_id, state.id, "ありがとうございます", 0)
            assert result.reply.ja and result.reply.vi


# ---------------------------------------------------------------------------
# Mẫu "nêu đích đến": 「〜に行きたいです」
#
# Cặp test này khoá lại một RANH GIỚI MONG MANH. Cả hai phía dùng chung y hệt
# đuôi câu 「に行きたいです」; thứ duy nhất phân biệt là danh từ. Nếu ai đó thêm
# một địa danh xa vào directions, hoặc bỏ nhóm đối chứng khỏi out_of_scope,
# ranh giới sẽ đổ ngay và test này bắt được.
# ---------------------------------------------------------------------------
@pytest.mark.parametrize(
    "text",
    ["コンビニに行きたいです", "駅に行きたいです", "レストランに行きたいです",
     "トイレに行きたいんですが", "薬局に行きたいです"],
)
def test_stating_a_nearby_destination_asks_for_directions(engine, text):
    """Nêu một địa điểm đi bộ tới được = đang hỏi đường, không phải lạc đề."""
    result = engine.respond("directions", "approach", text, 0)
    assert result.outcome is not TurnOutcome.OFF_TOPIC
    assert result.intent == "directions_ask_how_to_get"


@pytest.mark.parametrize(
    "text",
    ["日本に行きたいです", "ハワイに行きたいです", "ディズニーランドに行きたいです",
     "沖縄に行きたいです"],
)
def test_stating_a_far_destination_stays_out_of_scope(engine, text):
    """Ước mơ du lịch vẫn phải là lạc đề - đây là phía dễ vỡ của ranh giới."""
    result = engine.respond("directions", "approach", text, 0)
    assert result.outcome is TurnOutcome.OFF_TOPIC


# ---------------------------------------------------------------------------
# Góp ý ngữ pháp
# ---------------------------------------------------------------------------
def test_grammar_catches_classic_kana_mistakes():
    notes = grammar.analyse("こんにちわ")
    assert any(n.suggestion == "こんにちは" for n in notes)


def test_grammar_praises_advanced_patterns():
    notes = grammar.analyse("試着してもいいですか")
    assert any(n.kind.value == "praise" for n in notes)


def test_grammar_stays_silent_on_short_correct_answers():
    """Không được 'sửa' những câu vốn đã đúng - báo nhầm dạy người học điều sai."""
    for text in ["はい", "いいえ", "二人です", "ありがとうございます"]:
        spelling = [n for n in grammar.analyse(text) if n.kind.value == "spelling"]
        assert spelling == [], f"báo lỗi nhầm cho {text!r}"
