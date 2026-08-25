import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  CursorPage,
  FollowUserDto,
  PublicProfileResponse,
  UserMeResponse,
} from "@/types/api";
import {
  UpdatePhoneRequest,
  SyncContactsRequest,
  UserOverviewResponse,
  UserSearchResponse,
  UserProfileResponse,
  UpdateProfileRequest,
} from "@/types/user-api";

export const userService = {
  getMe: async (): Promise<UserMeResponse> => {
    return apiClient.get(`${API_ENDPOINTS.USER.ME}?_t=${Date.now()}`);
  },

  updatePhoneNumber: async (data: UpdatePhoneRequest): Promise<void> => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PHONE, data);
  },

  syncContacts: async (
    data: SyncContactsRequest,
  ): Promise<UserOverviewResponse[]> => {
    return apiClient.post(API_ENDPOINTS.USER.SYNC_CONTACTS, data);
  },

  toggleFollow: async (id: number): Promise<boolean> => {
    return apiClient.post(API_ENDPOINTS.USER.TOGGLE_FOLLOW(id));
  },

  /**
   * BE trả về trang cursor ({items, nextCursor}), không còn mảng trần như trước.
   * Param `q` là tên mới (khuyến nghị); `keyword` cũ vẫn được BE nhận nhưng không dùng ở đây nữa.
   */
  searchUsers: async (
    q: string,
    cursor?: string,
  ): Promise<CursorPage<UserSearchResponse>> => {
    return apiClient.get(API_ENDPOINTS.USER.SEARCH, { q, cursor });
  },

  getProfileByUsername: async (
    username: string,
  ): Promise<UserProfileResponse> => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE(username));
  },

  /** Hồ sơ công khai theo id (mới) - kèm followerCount/followingCount/rankName/currentStreak. */
  getPublicProfile: async (id: number): Promise<PublicProfileResponse> => {
    return apiClient.get(API_ENDPOINTS.USER.PUBLIC_PROFILE(id));
  },

  getFollowers: async (
    id: number,
    cursor?: string,
  ): Promise<CursorPage<FollowUserDto>> => {
    return apiClient.get(API_ENDPOINTS.USER.FOLLOWERS(id), { cursor });
  },

  getFollowing: async (
    id: number,
    cursor?: string,
  ): Promise<CursorPage<FollowUserDto>> => {
    return apiClient.get(API_ENDPOINTS.USER.FOLLOWING(id), { cursor });
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  },
};
