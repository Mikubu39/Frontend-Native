import { apiClient } from "@/services/api/client";
import { DEFAULT_AVATAR_CONFIG, buildAvatarUrl } from "@/data/avatar-options";

interface AvatarUrlResponse {
  avatarUrl: string | null;
}

/**
 * Gọi thẳng 2 endpoint đã có sẵn ở backend Java:
 *   GET /api/v1/users/me/avatar  -> { avatarUrl: string | null }
 *   PUT /api/v1/users/me/avatar  <- { avatarUrl: string }
 * apiClient tự đính kèm token đăng nhập (xem interceptor trong client.ts),
 * nên không cần tự quản lý header Authorization ở đây.
 */
export const avatarApi = {
  async getAvatarUrl(): Promise<string> {
    try {
      const data = await apiClient.get<AvatarUrlResponse>(
        "/api/v1/users/me/avatar",
      );
      return data.avatarUrl || buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
    } catch (err) {
      // Chưa đăng nhập, hoặc user mới chưa từng lưu avatar -> dùng mặc định,
      // không throw để không vỡ màn hình Profile.
      console.warn("Không lấy được avatarUrl từ server:", err);
      return buildAvatarUrl(DEFAULT_AVATAR_CONFIG);
    }
  },

  async updateAvatarUrl(url: string): Promise<string> {
    await apiClient.put("/api/v1/users/me/avatar", { avatarUrl: url });
    return url;
  },
};
