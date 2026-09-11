/**
 * Unit tests cho tiện ích màu.
 *
 * `readableOn` là thứ giữ cho các chỉ số trong header đọc được ở theme sáng,
 * nên ngưỡng tương phản phải được khoá lại bằng số, không dựa vào mắt nhìn.
 */
import { contrastRatio, darken, lighten, readableOn } from "../color";

describe("contrastRatio", () => {
  it("đen trên trắng đạt tỉ lệ tối đa 21:1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("hai màu giống nhau cho 1:1", () => {
    expect(contrastRatio("#3B4C82", "#3B4C82")).toBeCloseTo(1, 5);
  });

  it("không phụ thuộc thứ tự tham số", () => {
    expect(contrastRatio("#C4922E", "#FFFFFF")).toBeCloseTo(
      contrastRatio("#FFFFFF", "#C4922E"),
      5,
    );
  });

  it("trả về 1 khi không đọc được mã màu, để bên gọi coi như 'không kiểm được'", () => {
    expect(contrastRatio("rgba(0,0,0,0.5)", "#FFFFFF")).toBe(1);
  });
});

describe("readableOn", () => {
  // Đây chính là 3 màu đã làm header khó đọc trên nền sáng.
  it.each([
    ["chuỗi", "#D9762E"],
    ["xu", "#C4922E"],
    ["năng lượng", "#4ADE80"],
  ])("kéo màu %s lên đủ ngưỡng AA trên nền trắng", (_label, tone) => {
    expect(contrastRatio(tone, "#FFFFFF")).toBeLessThan(4.5);

    const fixed = readableOn(tone, "#FFFFFF");

    expect(contrastRatio(fixed, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("giữ nguyên màu đã đạt ngưỡng, không tối hoá thừa", () => {
    const alreadyDark = "#2B2420";
    expect(readableOn(alreadyDark, "#FFFFFF")).toBe(alreadyDark);
  });

  it("dừng ngay ở bước đầu tiên đạt ngưỡng, để sắc màu bám sát bản gốc", () => {
    const fixed = readableOn("#4ADE80", "#FFFFFF");
    // Vẫn phải còn là màu xanh lá: kênh lục trội hơn hẳn đỏ và lam.
    const g = parseInt(fixed.slice(3, 5), 16);
    const r = parseInt(fixed.slice(1, 3), 16);
    const b = parseInt(fixed.slice(5, 7), 16);
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
    // Và không được tối tới mức thành gần đen.
    expect(contrastRatio(fixed, "#FFFFFF")).toBeLessThan(7);
  });

  it("tôn trọng ngưỡng tuỳ chỉnh", () => {
    const fixed = readableOn("#C4922E", "#FFFFFF", 7);
    expect(contrastRatio(fixed, "#FFFFFF")).toBeGreaterThanOrEqual(7);
  });

  // Cửa hàng vẽ cùng một bảng màu lên hai loại nền: quầy sơn mài tối cố định
  // và kệ hàng theo theme. Nếu chỉ biết tối dần, gọi trên nền tối sẽ làm mọi
  // bước tệ đi cho tới khi thành gần đen.
  it("làm SÁNG màu khi nền tối, thay vì tối thêm", () => {
    const lacquer = "#171E35";
    const tone = "#3B4C82"; // chàm đậm, chìm vào nền sơn mài

    const fixed = readableOn(tone, lacquer);

    expect(contrastRatio(tone, lacquer)).toBeLessThan(4.5);
    expect(contrastRatio(fixed, lacquer)).toBeGreaterThanOrEqual(4.5);
    // Sáng hơn bản gốc, không phải tối hơn.
    expect(parseInt(fixed.slice(1, 3), 16)).toBeGreaterThan(0x3b);
  });

  it("giữ nguyên màu đã đủ tương phản trên nền tối", () => {
    expect(readableOn("#E0AE4A", "#171E35")).toBe("#E0AE4A");
  });

  it("trả nguyên đầu vào khi không phải mã hex", () => {
    expect(readableOn("rgba(255,255,255,0.5)", "#FFFFFF")).toBe(
      "rgba(255,255,255,0.5)",
    );
  });
});

describe("darken / lighten", () => {
  it("darken tối dần từng kênh", () => {
    expect(darken("#FFFFFF", 0.5)).toBe("#808080");
  });

  it("lighten pha dần về trắng", () => {
    expect(lighten("#000000", 0.5)).toBe("#808080");
  });

  it("hỗ trợ dạng rút gọn 3 ký tự", () => {
    expect(darken("#fff", 0.5)).toBe("#808080");
  });

  it("bỏ qua giá trị không đọc được thay vì trả ra màu hỏng", () => {
    expect(darken("tomato", 0.3)).toBe("tomato");
  });
});
