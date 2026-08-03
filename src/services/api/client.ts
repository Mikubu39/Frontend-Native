/**
 * API Client
 *
 * Centralized HTTP client configuration.
 * Customize base URL, headers, interceptors, and error handling here.
 */

import axios, { AxiosInstance } from 'axios';
import { storage } from '@/services/storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";
export const TOKEN_KEY = 'auth_token';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor: Attach token automatically
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await storage.get(TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Global error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await storage.remove(TOKEN_KEY);
          // Optional: Trigger event to force user to login screen
        }
        
        // Do not use console.error here as it triggers Expo LogBox for expected errors like 401/403
        // console.error("API Error in Axios interceptor:", error);
        const errorMessage = error.response?.data?.message || error.message || 'API Error';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
