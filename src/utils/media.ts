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
import { buildAvatarUrl, DEFAULT_AVATAR_CONFIG } from "@/data/avatar-options";

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

/**
 * Chuẩn hoá avatar URL trên toàn bộ app theo phong cách hoạt hình (DiceBear).
 * - Bỏ qua ảnh Google (googleusercontent.com) hoặc rỗng để luôn rơi về avatar nhân vật tùy chỉnh mặc định.
 * - Nếu là đường dẫn Dicebear hoặc file upload từ backend, resolve đúng URL.
 */
export function resolveAvatarUri(url?: string | null): string {
  if (!url) {
    return buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
  }
  const trimmed = String(url).trim();
  if (EMPTY_VALUES.has(trimmed) || EMPTY_VALUES.has(trimmed.toLowerCase())) {
    return buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
  }
  if (trimmed.includes("googleusercontent.com")) {
    return buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
  }
  return resolveMediaUrl(trimmed) ?? buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
}
