import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  UpdatePhoneRequest,
  SyncContactsRequest,
  UserOverviewResponse,
  UserSearchResponse,
  UserProfileResponse,
  UpdateProfileRequest,
} from '@/types/user-api';

export const userService = {
  updatePhoneNumber: async (data: UpdatePhoneRequest): Promise<void> => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PHONE, data);
  },

  syncContacts: async (data: SyncContactsRequest): Promise<UserOverviewResponse[]> => {
    return apiClient.post(API_ENDPOINTS.USER.SYNC_CONTACTS, data);
  },

  toggleFollow: async (id: number): Promise<boolean> => {
    return apiClient.post(API_ENDPOINTS.USER.TOGGLE_FOLLOW(id));
  },

  searchUsers: async (keyword: string): Promise<UserSearchResponse[]> => {
    return apiClient.get(API_ENDPOINTS.USER.SEARCH, { keyword });
  },

  getProfileByUsername: async (username: string): Promise<UserProfileResponse> => {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE(username));
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    return apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  },
};
