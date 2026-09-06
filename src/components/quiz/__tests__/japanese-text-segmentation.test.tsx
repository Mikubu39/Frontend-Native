import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { JapaneseText } from "@/components/ui/japanese-text";
import { useTheme } from "@/contexts/theme-context";
import { useGlossary, useGlossaryLockdown } from "@/contexts/glossary-context";

jest.mock("@/contexts/theme-context", () => ({ useTheme: jest.fn() }));
jest.mock("@/contexts/glossary-context", () => ({
  useGlossary: jest.fn(),
  useGlossaryLockdown: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.Mock;
const mockedUseGlossary = useGlossary as jest.Mock;
const mockedUseGlossaryLockdown = useGlossaryLockdown as jest.Mock;

describe("JapaneseText — Tách từ vựng tối ưu và bóc tách câu (DP Tokenizer)", () => {
  const sampleGlobalGlossary = {
    これ: { r: "kore", v: "cái này" },
    は: { r: "wa", v: "trợ từ chủ đề (đọc là wa)" },
    いくら: { r: "ikura", v: "bao nhiêu (tiền)" },
    です: { r: "desu", v: "là, thì, ở (kính ngữ)" },
    か: { r: "ka", v: "trợ từ nghi vấn cuối câu (?)" },
    はい: { r: "hai", v: "vâng, đúng vậy" }, // Có thể gây bẫy nuốt 'は' + 'い' nếu thuật toán tham lam lỗi
    たなかさん: { r: "Tanaka-san", v: "anh Tanaka" },
    はいしゃ: { r: "haisha", v: "nha sĩ" },
    じゃありません: { r: "ja arimasen", v: "không phải là (phủ định)" },
    わたし: { r: "watashi", v: "tôi" },
    にほんじん: { r: "nihonjin", v: "người Nhật" },
    おげんき: { r: "ogenki", v: "khỏe mạnh (lịch sự)" },
    げんき: { r: "genki", v: "khỏe mạnh" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      isDark: false,
      colors: {
        textPrimary: "#1F2937",
        textSecondary: "#6B7280",
      },
    });
    mockedUseGlossary.mockReturnValue({
      glossary: sampleGlobalGlossary,
      loading: false,
      refresh: jest.fn(),
    });
    mockedUseGlossaryLockdown.mockReturnValue(false);
  });

  it("phân đoạn đúng câu 'これはいくらですか。' mà KHÔNG bị bẫy nuốt nhầm từ 'はい'", async () => {
    const { getByText } = await render(
      <JapaneseText text="これはいくらですか。" />,
    );

    // Xác nhận các từ hoàn chỉnh được nhận diện độc lập
    expect(getByText("これ")).toBeTruthy();
    expect(getByText("は")).toBeTruthy();
    expect(getByText("いくら")).toBeTruthy();
    expect(getByText("です")).toBeTruthy();
    expect(getByText("か")).toBeTruthy();
  });

  it("phân đoạn chuẩn câu 'たなかさんはいしゃじゃありません。' gồm anh Tanaka, nha sĩ, không phải là", async () => {
    const { getByText } = await render(
      <JapaneseText text="たなかさんはいしゃじゃありません。" />,
    );

    expect(getByText("たなかさん")).toBeTruthy();
    expect(getByText("はいしゃ")).toBeTruthy();
    expect(getByText("じゃありません")).toBeTruthy();
  });

  it("khi nhấn vào từ sẽ hiển thị modal tooltip giải nghĩa tiếng Việt và romaji chính xác", async () => {
    const { getByText } = await render(
      <JapaneseText text="これはいくらですか。" />,
    );

    const ikuraWord = getByText("いくら");
    await fireEvent.press(ikuraWord);

    // Tooltip modal hiện ra
    expect(getByText("bao nhiêu (tiền)")).toBeTruthy();
    expect(getByText("ikura")).toBeTruthy();
  });

  it("ưu tiên glossary riêng của câu hỏi ghi đè lên glossary toàn cục", async () => {
    const localGlossary = {
      これ: { r: "kore-custom", v: "vật này (ngữ cảnh riêng)" },
    };

    const { getByText } = await render(
      <JapaneseText text="これ" glossary={localGlossary} />,
    );

    await fireEvent.press(getByText("これ"));
    expect(getByText("vật này (ngữ cảnh riêng)")).toBeTruthy();
    expect(getByText("kore-custom")).toBeTruthy();
  });

  it("khi đang trong vùng GlossaryLockdown thì không tạo các từ bấm tra được", async () => {
    mockedUseGlossaryLockdown.mockReturnValue(true);

    const { queryByText } = await render(
      <JapaneseText text="これはいくらですか。" />,
    );

    // Không render clickable word nào có handler (khi lockdown dict là rỗng)
    expect(queryByText("bao nhiêu (tiền)")).toBeNull();
  });

  it("chèn ký tự Thin Space '\\u2009' phân tách giữa các từ tra cứu liền kề và không chèn trước dấu câu", async () => {
    const { getAllByText } = await render(
      <JapaneseText text="これはいくらですか。" />,
    );

    // 5 từ tra cứu liên tiếp (これ - は - いくら - です - か) có đúng 4 khe ngắt
    // Không chèn khe ngắt giữa 'か' và dấu câu '。'
    const separators = getAllByText("\u2009");
    expect(separators).toHaveLength(4);

    // Kiểm tra câu chỉ có 1 từ tra cứu: không có bất kỳ separator nào
    const singleWord = await render(<JapaneseText text="これ" />);
    expect(singleWord.queryAllByText("\u2009")).toHaveLength(0);
  });
});
