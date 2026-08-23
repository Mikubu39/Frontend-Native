import { resolveMediaUrl, resolveMediaUrlOrNull } from "../media";

// Khớp với EXPO_PUBLIC_API_URL trong `.env`; config đọc biến này lúc import.
const BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

describe("resolveMediaUrl", () => {
  it("ghép base URL cho đường dẫn tương đối mà backend trả về", () => {
    // Đây chính là dạng dữ liệu thật trong DB — thiếu bước này thì
    // Audio.Sound.createAsync nhận uri "/uploads/..." và fail im lặng.
    expect(resolveMediaUrl("/uploads/audios/kana/kana-a.mp3")).toBe(
      `${BASE}/uploads/audios/kana/kana-a.mp3`,
    );
  });

  it("không nhân đôi dấu gạch chéo khi ghép", () => {
    expect(resolveMediaUrl("uploads/images/vocab/neko.png")).toBe(
      `${BASE}/uploads/images/vocab/neko.png`,
    );
  });

  it("giữ nguyên URL đã tuyệt đối", () => {
    expect(resolveMediaUrl("https://cdn.example.com/a.mp3")).toBe(
      "https://cdn.example.com/a.mp3",
    );
    expect(resolveMediaUrl("file:///tmp/a.mp3")).toBe("file:///tmp/a.mp3");
    expect(resolveMediaUrl("data:audio/mp3;base64,AAA")).toBe(
      "data:audio/mp3;base64,AAA",
    );
  });

  it("coi các giá trị rỗng là không có media", () => {
    // "null" dạng chuỗi đến từ params của expo-router (xem friends/search).
    expect(resolveMediaUrl(undefined)).toBeUndefined();
    expect(resolveMediaUrl(null)).toBeUndefined();
    expect(resolveMediaUrl("")).toBeUndefined();
    expect(resolveMediaUrl("   ")).toBeUndefined();
    expect(resolveMediaUrl("null")).toBeUndefined();
    expect(resolveMediaUrl("undefined")).toBeUndefined();
  });

  it("resolveMediaUrlOrNull trả null thay cho undefined", () => {
    expect(resolveMediaUrlOrNull(null)).toBeNull();
    expect(resolveMediaUrlOrNull("/uploads/images/shop/double_xp.png")).toBe(
      `${BASE}/uploads/images/shop/double_xp.png`,
    );
  });
});
