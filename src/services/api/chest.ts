import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { ChestStatus, OpenChestResponse } from '@/types';

export const chestApi = {
  getChestStatus: async (): Promise<ChestStatus> => {
    return apiClient.get<ChestStatus>(API_ENDPOINTS.CHEST.GET_STATUS);
  },
  openChest: async (): Promise<OpenChestResponse> => {
    return apiClient.post<OpenChestResponse>(API_ENDPOINTS.CHEST.OPEN);
  },
};
