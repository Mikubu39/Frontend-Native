/**
 * Avatar rơi về phương án dự phòng khi ảnh tải hỏng.
 *
 * `<Image source={{ uri }}>` thất bại im lặng, nên trước đây một avatar bị xoá
 * trên server để lại vòng tròn trống — không phải con gấu trúc dự phòng vốn đã
 * được viết sẵn ngay bên dưới. Test này khoá lại đường đi từ `onError` sang
 * nhánh dự phòng đó.
 */

import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { AvatarDisplay } from "@/components/user/avatar-display";

// `render` của phiên bản @testing-library/react-native này trả về Promise:
// thiếu `await` thì destructuring lấy phải Promise và mọi query đều undefined.

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

describe("AvatarDisplay", () => {
  it("hiện ảnh khi có URL, và ghép base URL cho đường dẫn tương đối", async () => {
    const { getByTestId, queryByText } = await render(
      <AvatarDisplay uri="/uploads/images/avatars/a.png" />,
    );

    expect(getByTestId("avatar-image").props.source).toEqual({
      uri: `${API_BASE}/uploads/images/avatars/a.png`,
    });
    expect(queryByText("🐼")).toBeNull();
  });

  it("quay về gấu trúc khi ảnh tải hỏng", async () => {
    const { getByTestId, getByText } = await render(
      <AvatarDisplay uri="/uploads/images/avatars/deleted.png" />,
    );

    await fireEvent(getByTestId("avatar-image"), "error");

    expect(getByText("🐼")).toBeTruthy();
  });

  it("hiện avatar nhân vật DiceBear mặc định khi không có URL hoặc URL là Google photo", async () => {
    const { getByTestId, queryByText } = await render(<AvatarDisplay />);

    expect(getByTestId("avatar-image").props.source.uri).toContain(
      "api.dicebear.com",
    );
    expect(queryByText("🐼")).toBeNull();

    const googleRes = await render(
      <AvatarDisplay uri="https://lh3.googleusercontent.com/a/mock-photo" />,
    );
    expect(googleRes.getByTestId("avatar-image").props.source.uri).toContain(
      "api.dicebear.com",
    );
    expect(googleRes.queryByText("🐼")).toBeNull();
  });

  it("cho lineHeight co theo kích thước để emoji không bị cắt ở avatar nhỏ khi tải hỏng", async () => {
    // lineHeight co theo size khi rơi vào fallback lỗi tải ảnh
    const { getByTestId, getByText } = await render(
      <AvatarDisplay uri="/uploads/images/avatars/broken.png" size={40} />,
    );

    await fireEvent(getByTestId("avatar-image"), "error");

    expect(getByText("🐼")).toHaveStyle({ lineHeight: 40 });
  });
});
