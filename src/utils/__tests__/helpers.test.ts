import { normalizeAlphabetPrompt } from "../helpers";

describe("normalizeAlphabetPrompt", () => {
  it("converts unaccented multiple choice prompt to Vietnamese accented", () => {
    expect(normalizeAlphabetPrompt("Nghe va chon chu cai dung")).toBe(
      "Nghe và chọn chữ cái đúng",
    );
    expect(normalizeAlphabetPrompt("nghe va chon chu cai dung")).toBe(
      "Nghe và chọn chữ cái đúng",
    );
  });

  it("converts unaccented drawing prompt to Vietnamese accented", () => {
    expect(normalizeAlphabetPrompt("Viet chu: a")).toBe("Viết chữ: a");
    expect(normalizeAlphabetPrompt("viet chu: ka")).toBe("Viết chữ: ka");
    expect(normalizeAlphabetPrompt("Viet chu:   o")).toBe("Viết chữ: o");
  });

  it("keeps already accented prompts unchanged", () => {
    expect(normalizeAlphabetPrompt("Nghe và chọn chữ cái đúng")).toBe(
      "Nghe và chọn chữ cái đúng",
    );
    expect(normalizeAlphabetPrompt("Viết chữ: o")).toBe("Viết chữ: o");
  });

  it("handles null or undefined or empty prompt gracefully", () => {
    expect(normalizeAlphabetPrompt(null)).toBe("");
    expect(normalizeAlphabetPrompt(undefined)).toBe("");
    expect(normalizeAlphabetPrompt("")).toBe("");
  });
});
