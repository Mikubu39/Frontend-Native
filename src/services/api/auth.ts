import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  FacebookLoginRequest,
} from "@/types/api";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  loginWithGoogle: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.SOCIAL_GOOGLE, data);
  },

  loginWithFacebook: async (
    data: FacebookLoginRequest,
  ): Promise<AuthResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH.SOCIAL_FACEBOOK, data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
