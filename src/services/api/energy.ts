import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { EnergyResponse } from '@/types';

export const energyApi = {
  getEnergy: async (): Promise<EnergyResponse> => {
    return apiClient.get<EnergyResponse>(API_ENDPOINTS.ENERGY.GET_INFO);
  },
  practice: async (): Promise<EnergyResponse> => {
    return apiClient.post<EnergyResponse>(API_ENDPOINTS.ENERGY.PRACTICE);
  },
  refill: async (): Promise<EnergyResponse> => {
    return apiClient.post<EnergyResponse>(API_ENDPOINTS.ENERGY.REFILL);
  },
};
