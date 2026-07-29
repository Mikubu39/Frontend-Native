import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },
};
