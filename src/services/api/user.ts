import { apiClient } from './client';
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
    return apiClient.put('/api/v1/users/me/phone', data);
  },

  syncContacts: async (data: SyncContactsRequest): Promise<UserOverviewResponse[]> => {
    return apiClient.post('/api/v1/users/sync-contacts', data);
  },

  toggleFollow: async (id: number): Promise<boolean> => {
    return apiClient.post(`/api/v1/users/${id}/follow`);
  },

  searchUsers: async (keyword: string): Promise<UserSearchResponse[]> => {
    return apiClient.get('/api/v1/users/search', { keyword });
  },

  getProfileByUsername: async (username: string): Promise<UserProfileResponse> => {
    return apiClient.get(`/api/v1/users/profile/${username}`);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    return apiClient.put('/api/v1/users/me/profile', data);
  },
};
