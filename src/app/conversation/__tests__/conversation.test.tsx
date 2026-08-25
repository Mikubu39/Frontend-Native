/**
 * Test tích hợp cho tính năng Luyện hội thoại AI (chạy trên LLM).
 *
 * Mô phỏng tương tác thật của người dùng (gõ chữ, bấm gửi, chạm chip gợi ý,
 * kết thúc phiên) với API được mock, và kiểm tra những BẤT BIẾN VỀ TRẢI NGHIỆM
 * quan trọng nhất:
 *
 *   - lịch sử hội thoại phải được gửi lại đầy đủ mỗi lượt (server phi trạng thái),
 *   - góp ý phải gắn vào câu của NGƯỜI HỌC chứ không phải câu đáp của AI,
 *   - `suggestion` KHÔNG được hiển thị như lỗi sai,
 *   - hết giờ thì phiên tự đóng và bản tổng kết phải hiện ra,
 *   - tổng kết hỏng vẫn phải cho người học lối thoát, không treo màn hình chờ.
 */

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import TopicListScreen from "../index";
import ChatScreen from "../[id]";
import { conversationApi } from "@/services/api/conversation";
import { useTheme } from "@/contexts/theme-context";
import type {
  ConversationRespondResponse,
  ConversationSummary,
  ConversationTopic,
} from "@/types/conversation";

jest.mock("@/services/api/conversation", () => ({
  conversationApi: {
    getTopics: jest.fn(),
    start: jest.fn(),
    respond: jest.fn(),
    summarize: jest.fn(),
  },
}));

jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

let mockSearchParams: { id: string; topic?: string } = { id: "restaurant" };

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
  useLocalSearchParams: () => mockSearchParams,
}));

const mockedApi = conversationApi as jest.Mocked<typeof conversationApi>;
const mockedUseTheme = useTheme as jest.Mock;

const topic: ConversationTopic = {
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

const GREETING = "いらっしゃいませ！何名様ですか。";

const respond = (
  overrides: Partial<ConversationRespondResponse> = {},
): ConversationRespondResponse => ({
  reply: { ja: "かしこまりました。", vi: "Vâng ạ." },
  hints: [{ ja: "おすすめは何ですか。", vi: "Món nào ngon ạ?" }],
  corrections: [],
  understood: true,
  ...overrides,
});

const summary = (
  overrides: Partial<ConversationSummary> = {},
): ConversationSummary => ({
  overallVi: "Bạn đã gọi món thành công bằng tiếng Nhật.",
  score: 78,
  strengths: ["Dùng đúng thể ですます"],
  mistakes: [
    {
      original: "わたしはラーメンをたべたい",
      corrected: "ラーメンをお願いします。",
      explanationVi: "Khi gọi món nên dùng お願いします.",
      category: "naturalness",
      severity: "suggestion",
    },
  ],
  grammarPoints: [
    {
      pattern: "〜をお願いします",
      explanationVi: "Mẫu gọi món lịch sự.",
      exampleJa: "ラーメンをお願いします。",
      exampleVi: "Cho tôi một ramen.",
    },
  ],
  naturalnessTips: [
    {
      instead: "たべたいです",
      prefer: "お願いします",
      whyVi: "Người Nhật gọi món bằng お願いします.",
    },
  ],
  nextFocus: ["Luyện mẫu 〜をお願いします"],
  turnCount: 2,
  durationSeconds: 300,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = { id: "restaurant" };

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

  mockedApi.getTopics.mockResolvedValue([topic]);
  mockedApi.start.mockResolvedValue({
    topic,
    reply: { ja: GREETING, vi: "Mời vào! Mấy người ạ?" },
    hints: [{ ja: "二人です。", vi: "Hai người ạ." }],
    durationSeconds: 300,
  });
  mockedApi.summarize.mockResolvedValue(summary());
});

/** Mở màn chat và chờ câu chào của AI hiện ra. */
const openChat = async () => {
  const utils = await render(<ChatScreen />);
  await waitFor(() => expect(utils.getByText(GREETING)).toBeTruthy());
  return utils;
};

/** Gõ một câu rồi bấm gửi. */
const say = async (
  utils: Awaited<ReturnType<typeof openChat>>,
  text: string,
) => {
  await fireEvent.changeText(
    utils.getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
    text,
  );
  await fireEvent.press(utils.getByLabelText("Gửi câu trả lời"));
};

// ---------------------------------------------------------------------------
// Màn chọn chủ đề
// ---------------------------------------------------------------------------
describe("Màn chọn chủ đề", () => {
  it("hiển thị chủ đề kèm mục tiêu rồi mở được hội thoại", async () => {
    const { getByText } = await render(<TopicListScreen />);

    await waitFor(() => expect(getByText("Ở nhà hàng")).toBeTruthy());
    // Mục tiêu phải hiện ngay ở thẻ: người học cần biết "xong thì được gì".
    expect(getByText("Gọi được một món và xin tính tiền.")).toBeTruthy();

    await fireEvent.press(getByText("Ở nhà hàng"));
    expect(mockPush).toHaveBeenCalledWith("/conversation/restaurant");
  });

  it("nói rõ phiên có giới hạn thời gian ngay trước khi vào", async () => {
    const { getByText } = await render(<TopicListScreen />);

    // Đồng hồ đếm ngược là luật chơi, không phải bất ngờ giữa chừng.
    await waitFor(() =>
      expect(
        getByText(/Mỗi phiên 5 phút\. Hết giờ, AI sẽ chỉ ra lỗi/),
      ).toBeTruthy(),
    );
  });

  it("nhập được chủ đề tự do và mở đúng route custom", async () => {
    const { getByText, getByLabelText } = await render(<TopicListScreen />);
    await waitFor(() => expect(getByText("Ở nhà hàng")).toBeTruthy());

    await fireEvent.press(getByLabelText("Tự chọn chủ đề muốn luyện"));
    await fireEvent.changeText(
      getByLabelText("Chủ đề muốn luyện"),
      "đặt phòng khách sạn",
    );
    await fireEvent.press(getByLabelText("Bắt đầu luyện chủ đề này"));

    expect(mockPush).toHaveBeenCalledWith(
      `/conversation/custom?topic=${encodeURIComponent("đặt phòng khách sạn")}`,
    );
  });

  it("hiện nút thử lại khi không kết nối được máy chủ AI", async () => {
    mockedApi.getTopics.mockRejectedValueOnce(
      new Error("Không kết nối được tới máy chủ AI."),
    );
    const { getByText } = await render(<TopicListScreen />);

    await waitFor(() =>
      expect(getByText("Không kết nối được tới máy chủ AI.")).toBeTruthy(),
    );

    mockedApi.getTopics.mockResolvedValueOnce([topic]);
    await fireEvent.press(getByText("Thử lại"));
    await waitFor(() => expect(getByText("Ở nhà hàng")).toBeTruthy());
  });
});

// ---------------------------------------------------------------------------
// Màn hội thoại
// ---------------------------------------------------------------------------
describe("Màn hội thoại", () => {
  it("mở đầu bằng câu chào của AI và gợi ý câu trả lời", async () => {
    const { getByText } = await openChat();
    expect(getByText("二人です。")).toBeTruthy();
  });

  it("gửi kèm TOÀN BỘ lịch sử vì server phi trạng thái", async () => {
    mockedApi.respond.mockResolvedValue(respond());
    const utils = await openChat();

    await say(utils, "二人です");
    await waitFor(() =>
      expect(utils.getByText("かしこまりました。")).toBeTruthy(),
    );

    expect(mockedApi.respond).toHaveBeenCalledWith({
      topicId: "restaurant",
      customTopic: undefined,
      text: "二人です",
      history: [{ role: "ai", text: GREETING }],
      remainingSeconds: 300,
    });

    // Lượt thứ hai phải mang theo cả lượt đầu, nếu không AI mất mạch chuyện.
    mockedApi.respond.mockResolvedValue(
      respond({ reply: { ja: "少々お待ちください。", vi: "Xin chờ chút ạ." } }),
    );
    await say(utils, "ラーメンをお願いします");

    await waitFor(() =>
      expect(mockedApi.respond).toHaveBeenLastCalledWith(
        expect.objectContaining({
          history: [
            { role: "ai", text: GREETING },
            { role: "user", text: "二人です" },
            { role: "ai", text: "かしこまりました。" },
          ],
        }),
      ),
    );
  });

  it("chuyển tiếp chủ đề tự nhập xuống server", async () => {
    mockSearchParams = { id: "custom", topic: "đặt phòng khách sạn" };
    mockedApi.respond.mockResolvedValue(respond());

    const utils = await openChat();
    await say(utils, "こんにちは");

    await waitFor(() =>
      expect(mockedApi.respond).toHaveBeenCalledWith(
        expect.objectContaining({
          topicId: "custom",
          customTopic: "đặt phòng khách sạn",
        }),
      ),
    );
  });

  it("gắn góp ý vào câu của NGƯỜI HỌC, không phải câu đáp của AI", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        corrections: [
          {
            severity: "error",
            category: "spelling",
            original: "こんにちわ",
            suggestion: "こんにちは",
            explanationVi: "Trợ từ は trong lời chào viết là は.",
          },
        ],
      }),
    );

    const utils = await openChat();
    await say(utils, "こんにちわ");

    await waitFor(() =>
      expect(
        utils.getByText("Trợ từ は trong lời chào viết là は."),
      ).toBeTruthy(),
    );
    expect(utils.getByText("Cần sửa")).toBeTruthy();
    expect(utils.getByText("こんにちは")).toBeTruthy();
  });

  it("gợi ý cách nói hay hơn KHÔNG được hiển thị như lỗi sai", async () => {
    mockedApi.respond.mockResolvedValue(
      respond({
        corrections: [
          {
            severity: "suggestion",
            category: "naturalness",
            original: "たべたいです",
            suggestion: "お願いします",
            explanationVi: "Gọi món thì người Nhật nói お願いします.",
          },
        ],
      }),
    );

    const utils = await openChat();
    await say(utils, "ラーメンをたべたいです");

    // Câu người học ĐÚNG ngữ pháp - dán nhãn "Cần sửa" lên nó sẽ dạy họ điều sai.
    await waitFor(() => expect(utils.getByText("Nói hay hơn")).toBeTruthy());
    expect(utils.queryByText("Cần sửa")).toBeNull();
  });

  it("chạm chip gợi ý thì ĐIỀN vào ô nhập chứ không gửi luôn", async () => {
    const utils = await openChat();

    await fireEvent.press(utils.getByText("二人です。"));

    // Người học phải còn cơ hội đọc và sửa câu -> chưa gọi API.
    expect(mockedApi.respond).not.toHaveBeenCalled();
    expect(
      utils.getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật").props.value,
    ).toBe("二人です。");
  });

  it("lỗi mạng giữa chừng không làm mất lượt đã gõ và vẫn cho gửi lại", async () => {
    mockedApi.respond.mockRejectedValueOnce(
      new Error("Gemini đang quá tải. Chờ một phút rồi thử lại nhé."),
    );
    const utils = await openChat();

    await say(utils, "二人です");

    await waitFor(() =>
      expect(
        utils.getByText("Gemini đang quá tải. Chờ một phút rồi thử lại nhé."),
      ).toBeTruthy(),
    );
    // Ô nhập vẫn dùng được - lỗi hạ tầng không được khoá bài luyện.
    expect(
      utils.getByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Kết thúc phiên & tổng kết
// ---------------------------------------------------------------------------
describe("Kết thúc phiên", () => {
  it("bấm kết thúc thì dựng bản tổng kết đầy đủ", async () => {
    mockedApi.respond.mockResolvedValue(respond());
    const utils = await openChat();
    await say(utils, "二人です");
    await waitFor(() =>
      expect(utils.getByText("かしこまりました。")).toBeTruthy(),
    );

    await fireEvent.press(utils.getByLabelText("Kết thúc sớm và xem tổng kết"));

    await waitFor(() =>
      expect(utils.getByText("Tổng kết phiên luyện")).toBeTruthy(),
    );

    // Đủ cả bốn phần: nhận xét, lỗi + cách sửa, ngữ pháp, độ tự nhiên.
    expect(utils.getByText("78")).toBeTruthy();
    expect(
      utils.getByText("Bạn đã gọi món thành công bằng tiếng Nhật."),
    ).toBeTruthy();
    expect(utils.getByText("Khi gọi món nên dùng お願いします.")).toBeTruthy();
    expect(utils.getByText("〜をお願いします")).toBeTruthy();
    expect(utils.getByText("Nói sao cho tự nhiên hơn")).toBeTruthy();
    expect(utils.getByText("Luyện mẫu 〜をお願いします")).toBeTruthy();

    // Hết phiên thì không còn gõ tiếp được nữa.
    expect(
      utils.queryByLabelText("Ô nhập câu trả lời bằng tiếng Nhật"),
    ).toBeNull();
  });

  it("gửi đúng lịch sử và độ dài phiên khi tổng kết", async () => {
    mockedApi.respond.mockResolvedValue(respond());
    const utils = await openChat();
    await say(utils, "二人です");
    await waitFor(() =>
      expect(utils.getByText("かしこまりました。")).toBeTruthy(),
    );

    await fireEvent.press(utils.getByLabelText("Kết thúc sớm và xem tổng kết"));

    await waitFor(() =>
      expect(mockedApi.summarize).toHaveBeenCalledWith({
        topicId: "restaurant",
        customTopic: undefined,
        durationSeconds: 300,
        history: [
          { role: "ai", text: GREETING },
          { role: "user", text: "二人です" },
          { role: "ai", text: "かしこまりました。" },
        ],
      }),
    );
  });

  it("chưa nói câu nào thì nói thẳng, không gọi API tổng kết", async () => {
    const utils = await openChat();

    await fireEvent.press(utils.getByLabelText("Kết thúc sớm và xem tổng kết"));

    await waitFor(() =>
      expect(
        utils.getByText(
          "Phiên kết thúc mà bạn chưa nói câu nào, nên chưa có gì để tổng kết.",
        ),
      ).toBeTruthy(),
    );
    expect(mockedApi.summarize).not.toHaveBeenCalled();
  });

  it("tổng kết hỏng vẫn cho lối thoát chứ không treo màn hình chờ", async () => {
    mockedApi.respond.mockResolvedValue(respond());
    mockedApi.summarize.mockRejectedValueOnce(
      new Error("Máy chủ AI phản hồi hơi lâu."),
    );

    const utils = await openChat();
    await say(utils, "二人です");
    await waitFor(() =>
      expect(utils.getByText("かしこまりました。")).toBeTruthy(),
    );

    await fireEvent.press(utils.getByLabelText("Kết thúc sớm và xem tổng kết"));

    await waitFor(() =>
      expect(utils.getByText("Máy chủ AI phản hồi hơi lâu.")).toBeTruthy(),
    );

    // Có nút thử lại riêng cho phần tổng kết, và vẫn đi tiếp được.
    mockedApi.summarize.mockResolvedValueOnce(summary());
    await fireEvent.press(utils.getByLabelText("Thử tổng kết lại"));
    await waitFor(() =>
      expect(utils.getByText("Tổng kết phiên luyện")).toBeTruthy(),
    );
  });
});
