/**
 * Media URL resolution.
 *
 * Backend lưu đường dẫn ảnh/âm thanh ở dạng **tương đối** (`/uploads/audios/...`)
 * để đổi domain/IP không phải sửa dữ liệu. React Native thì không có khái niệm
 * "origin hiện tại" như trình duyệt, nên `<Image source={{ uri: "/uploads/..." }}>`
 * và `Audio.Sound.createAsync({ uri: "/uploads/..." })` đều fail im lặng.
 *
 * Mọi chỗ nhận URL media từ API phải đi qua `resolveMediaUrl` trước khi dùng.
 */

import { config } from "@/config";

/** Các scheme đã tự đủ thông tin, không cần ghép base URL. */
const ABSOLUTE_SCHEME = /^(https?:|file:|data:|content:|asset:|blob:)/i;

/** Giá trị "rỗng" mà backend/JSON hay trả về dưới dạng chuỗi. */
const EMPTY_VALUES = new Set(["", "null", "undefined"]);

/**
 * Ghép đường dẫn media tương đối với base URL của backend.
 *
 * @returns URL tuyệt đối phát/hiển thị được, hoặc `undefined` nếu không có media.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (url === null || url === undefined) return undefined;

  const trimmed = String(url).trim();
  if (EMPTY_VALUES.has(trimmed) || EMPTY_VALUES.has(trimmed.toLowerCase())) {
    return undefined;
  }

  if (ABSOLUTE_SCHEME.test(trimmed)) return trimmed;

  const base = config.apiBaseUrl.replace(/\/+$/, "");
  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}

/** Bản `resolveMediaUrl` trả `null` thay vì `undefined`, hợp với các prop kiểu `string | null`. */
export function resolveMediaUrlOrNull(url?: string | null): string | null {
  return resolveMediaUrl(url) ?? null;
}
