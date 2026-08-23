/**
 * Test tích hợp cho tính năng Luyện hội thoại AI.
 *
 * Mô phỏng tương tác thật của người dùng (gõ chữ, bấm gửi, chạm chip gợi ý)
 * với API được mock, và kiểm tra những BẤT BIẾN VỀ TRẢI NGHIỆM quan trọng
 * nhất - đặc biệt là quy tắc: câu lạc đề và câu "chưa hợp bước" KHÔNG được
 * hiển thị như lỗi sai tiếng Nhật.
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import ScenarioListScreen from "../index";
import ChatScreen from "../[id]";
import { conversationApi } from "@/services/api/conversation";
import { useTheme } from "@/contexts/theme-context";
import type {
  ConversationRespondResponse,
  ConversationScenario,
} from "@/types/conversation";

jest.mock("@/services/api/conversation", () => ({
  conversationApi: {
    getScenarios: jest.fn(),
    start: jest.fn(),
    respond: jest.fn(),
  },
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
  useLocalSearchParams: () => ({ id: "restaurant" }),
}));

const mockedApi = conversationApi as jest.Mocked<typeof conversationApi>;
const mockedUseTheme = useTheme as jest.Mock;

const scenario: ConversationScenario = {
  id: "restaurant",
  title: "Ở nhà hàng",
  titleJa: "レストランで",
  level: "N5",
  icon: "restaurant-outline",
  color: "#E8613C",
  description: "Vào quán, báo số người và gọi món.",
  goal: "Gọi được một món và xin tính tiền.",
  personaName: "Nhân viên phục vụ",
  personaEmoji: "🍜",
};

const respond = (
  overrides: Partial<ConversationRespondResponse>,
): ConversationRespondResponse => ({
  outcome: "advanced",
  reply: { ja: "かしこまりました。", vi: "Vâng ạ." },
  state: "seated",
  hints: [{ ja: "おすすめは何ですか。", vi: "Món nào ngon ạ?" }],
  intent: "restaurant_seat",
  confidence: 0.9,
  consecutiveFailures: 0,
  rescue: false,
  completed: false,
  grammarNotes: [],
  alternatives: [],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseTheme.mockReturnValue({
    isDark: false,
    colors: {
      text: "#1A1A2E",
      textSecondary: "#6B7280",
      background: "#FFF8E7",
      backgroundElement: "#FFF3D0",
      backgroundSelected: "#FFE082",
      card: "#FFFFFF",
      cardElevated: "#FFFFFF",
      border: "#E5E7EB",
      borderSubtle: "#F3F4F6",
      tabBarBg: "#FFFFFF",
    },
  });

  mockedApi.getScenarios.mockResolvedValue([scenario]);
  mockedApi.start.mockResolvedValue({
    scenarioId: "restaurant",
    state: "welcome",
    reply: {
      ja: "いらっしゃいませ！何名様ですか。",
      vi: "Mời vào! Mấy người ạ?",
    },
    hints: [{ ja: "二人です。", vi: "Hai người ạ." }],
  });
});

// ---------------------------------------------------------------------------
// Màn chọn tình huống
// ---------------------------------------------------------------------------
describe("Màn chọn tình huống", () => {
  it("hiển thị tình huống kèm mục tiêu rồi mở được hội thoại", async () => {
    const { getByText } = await render(<ScenarioListScreen />);

    await waitFor(() => expect(getByText("Ở nhà hàng")).toBeTruthy());
    // Mục tiêu phải hiện ngay ở thẻ: người học cần biết "xong thì được gì".
    expect(getByText("Gọi được một món và xin tính tiền.")).toBeTruthy();

    fireEvent.press(getByText("Ở nhà hàng"));
    expect(mockPush).toHaveBeenCalledWith("/conversation/restaurant");
  });

  it("hiện nút thử lại khi không kết nối được máy chủ AI", async () => {
    mockedApi.getScenarios.mockRejectedValueOnce(
      new Error("Không kết nối được tới máy chủ AI."),
    );
    const { getByText } = await render(<ScenarioListScreen />);

    await waitFor(() =>
      expect(getByText("Không kết nối được tới máy chủ AI.")).toBeTruthy(),
    );

    mockedApi.getScenarios.mockResolvedValueOnce([scenario]);
    fireEvent.press(getByText("Thử lại"));
    await waitFor(() => expect(getByText("Ở nhà hàng")).toBeTruthy());
  });
});

// ---------------------------------------------------------------------------
// Màn hội thoại
// ---------------------------------------------------------------------------
describe("Màn hội thoại", () => {
  it("mở đầu bằng câu chào của AI và gợi ý câu trả lời", async () => {
    const { getByText } = await render(<ChatScreen />);

    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );
    expect(getByText("二人です。")).toBeTruthy();
  });

  it("gửi được câu trả lời và hiện phản hồi của AI", async () => {
    mockedApi.respond.mockResolvedValue(respond({}));
    const { getByText, getByLabelText } = await render(<ChatScreen />);

    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "二人です",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("かしこまりました。")).toBeTruthy());
    expect(mockedApi.respond).toHaveBeenCalledWith({
      scenarioId: "restaurant",
      state: "welcome",
      text: "二人です",
      consecutiveFailures: 0,
    });
  });

  it("chạm chip gợi ý thì ĐIỀN vào ô nhập chứ không gửi luôn", async () => {
    const { getByText, getByLabelText } = await render(<ChatScreen />);
    await waitFor(() => expect(getByText("二人です。")).toBeTruthy());

    await fireEvent.press(getByText("二人です。"));

    // Người học phải còn cơ hội đọc và sửa câu -> chưa gọi API.
    expect(mockedApi.respond).not.toHaveBeenCalled();
    expect(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật").props.value,
    ).toBe("二人です。");
  });

  it("câu lạc đề được điều hướng lại chứ không báo là lỗi sai", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        outcome: "off_topic",
        reply: { ja: "", vi: "Câu này hơi lạc khỏi tình huống rồi." },
        state: "welcome",
        intent: "out_of_scope",
        consecutiveFailures: 1,
      }),
    );
    const { getByText, getByLabelText, queryByText } = await render(
      <ChatScreen />,
    );
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "今日はいい天気ですね",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("Lạc chủ đề")).toBeTruthy());
    // Không được dán nhãn "sai" - câu tiếng Nhật của người học vốn đúng.
    expect(queryByText("Chưa đọc được")).toBeNull();
  });

  it("phân biệt 'chưa hợp bước này' với 'lạc chủ đề'", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        outcome: "wrong_time",
        reply: { ja: "", vi: "Câu đúng nhưng chưa hợp bước này." },
        state: "welcome",
        intent: "restaurant_ask_bill",
        consecutiveFailures: 1,
      }),
    );
    const { getByText, getByLabelText } = await render(<ChatScreen />);
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "お会計お願いします",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("Chưa hợp bước này")).toBeTruthy());
  });

  it("hiện góp ý chính tả kèm bản sửa", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        grammarNotes: [
          {
            kind: "spelling",
            messageVi: "Trợ từ は trong lời chào viết là は.",
            original: "こんにちわ",
            suggestion: "こんにちは",
          },
        ],
      }),
    );
    const { getByText, getByLabelText } = await render(<ChatScreen />);
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "こんにちわ",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("Chính tả")).toBeTruthy());
    expect(getByText("こんにちは")).toBeTruthy();
  });

  it("làm nổi bật gợi ý khi người học hỏng nhiều lượt liên tiếp", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        outcome: "off_topic",
        reply: { ja: "", vi: "Lạc đề rồi." },
        state: "welcome",
        consecutiveFailures: 2,
        hints: [{ ja: "二人です。", vi: "Hai người ạ." }],
      }),
    );
    const { getByText, getByLabelText, queryByText } = await render(
      <ChatScreen />,
    );
    await waitFor(() => expect(getByText("二人です。")).toBeTruthy());

    // Lúc chưa hỏng lần nào thì gợi ý ở dạng nhạt, chưa có tiêu đề.
    expect(queryByText("Thử câu này xem")).toBeNull();

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "ナルトが好きです",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("Thử câu này xem")).toBeTruthy());
    // Ở mức nổi bật, chip hiện thêm bản dịch để người học hiểu mình sắp nói gì.
    expect(getByText("Hai người ạ.")).toBeTruthy();
  });

  it("hiện màn chúc mừng và ẩn ô nhập khi đi hết kịch bản", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        outcome: "completed",
        reply: { ja: "ありがとうございました。", vi: "Cảm ơn quý khách." },
        state: "done",
        completed: true,
        hints: [],
      }),
    );
    const { getByText, getByLabelText, queryByLabelText } = await render(
      <ChatScreen />,
    );
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "ありがとうございました",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() =>
      expect(getByText("Hoàn thành hội thoại!")).toBeTruthy(),
    );
    expect(queryByLabelText("Ô nhập câu trả lời bằng tiếng Nhật")).toBeNull();
  });

  it("lỗi mạng không làm mất tiến độ hội thoại", async () => {
    mockedApi.respond.mockRejectedValueOnce(new Error("Mất kết nối."));
    const { getByText, getByLabelText } = await render(<ChatScreen />);
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "二人です",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("Mất kết nối.")).toBeTruthy());

    // Vẫn ở đúng trạng thái cũ -> gửi lại được ngay, không phải bắt đầu lại.
    mockedApi.respond.mockResolvedValueOnce(respond({}));
    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "二人です",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("かしこまりました。")).toBeTruthy());
    expect(mockedApi.respond).toHaveBeenLastCalledWith(
      expect.objectContaining({ state: "welcome" }),
    );
  });
});

// ---------------------------------------------------------------------------
// Giọng nói — nói VÀ gõ luôn dùng được song song, không ép chọn một
// ---------------------------------------------------------------------------
describe("Giọng nói", () => {
  it("mic và ô gõ chữ cùng tồn tại, không cái nào loại trừ cái nào", async () => {
    const { getByLabelText } = await render(<ChatScreen />);
    await waitFor(() =>
      expect(getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật")).toBeTruthy(),
    );

    expect(getByLabelText("Nói bằng micro")).toBeTruthy();
    expect(getByLabelText("Gửi câu trả lời")).toBeTruthy();
  });

  it("gõ chữ vẫn gửi được bình thường khi có nút mic", async () => {
    mockedApi.respond.mockResolvedValue(respond({}));
    const { getByText, getByLabelText } = await render(<ChatScreen />);
    await waitFor(() =>
      expect(getByText("いらっしゃいませ！何名様ですか。")).toBeTruthy(),
    );

    await fireEvent.changeText(
      getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
      "二人です",
    );
    await fireEvent.press(getByLabelText("Gửi câu trả lời"));

    await waitFor(() => expect(getByText("かしこまりました。")).toBeTruthy());
  });

  it("bấm mic sẽ xin quyền và bật nhận diện giọng nói", async () => {
    const { ExpoSpeechRecognitionModule } = require("expo-speech-recognition");
    const { getByLabelText } = await render(<ChatScreen />);
    await waitFor(() => expect(getByLabelText("Nói bằng micro")).toBeTruthy());

    await fireEvent.press(getByLabelText("Nói bằng micro"));

    await waitFor(() =>
      expect(
        ExpoSpeechRecognitionModule.requestPermissionsAsync,
      ).toHaveBeenCalled(),
    );
    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith(
      expect.objectContaining({ lang: "ja-JP" }),
    );
  });

  it("bong bóng của bot có nút nghe đọc, bong bóng người dùng thì không", async () => {
    const { getByLabelText, queryByLabelText } = await render(<ChatScreen />);
    await waitFor(() => expect(getByLabelText("Dừng đọc")).toBeTruthy());

    // Tắt tự đọc để nút trở về trạng thái nghỉ, rồi mới kiểm nhãn đầy đủ.
    await fireEvent.press(getByLabelText("Tắt tự động đọc"));

    await waitFor(() =>
      expect(
        getByLabelText("Nghe đọc: いらっしゃいませ！何名様ですか。"),
      ).toBeTruthy(),
    );
    expect(queryByLabelText("Nghe đọc: 二人です")).toBeNull();
  });

  it("tự động đọc câu của bot, và tắt được", async () => {
    const Speech = require("expo-speech");
    const { getByLabelText } = await render(<ChatScreen />);

    // Bật sẵn vì đây là bài luyện NÓI -> câu chào đầu tiên được đọc luôn.
    await waitFor(() =>
      expect(Speech.speak).toHaveBeenCalledWith(
        "いらっしゃいませ！何名様ですか。",
        expect.objectContaining({ language: "ja-JP" }),
      ),
    );

    await fireEvent.press(getByLabelText("Tắt tự động đọc"));
    expect(Speech.stop).toHaveBeenCalled();
    expect(getByLabelText("Bật tự động đọc")).toBeTruthy();
  });
});
