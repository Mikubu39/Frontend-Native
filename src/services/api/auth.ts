import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/v1/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post('/api/v1/auth/register', data);
  },
};
