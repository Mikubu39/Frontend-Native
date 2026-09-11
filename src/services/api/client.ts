/**
 * API Client
 *
 * Centralized HTTP client configuration.
 * Customize base URL, headers, interceptors, and error handling here.
 */

import axios, { AxiosInstance, create } from "axios";
import { storage } from "@/services/storage/async-storage";
import { ApiError, extractApiErrorMessage } from "@/utils/error-handler";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";
export const TOKEN_KEY = "auth_token";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private onUnauthorizedCallbacks: (() => void)[] = [];

  constructor(baseUrl: string) {
    this.axiosInstance = create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "ngrok-skip-browser-warning": "true",
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
      (error) => Promise.reject(error),
    );

    // Response Interceptor: Global error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        const isAuthEndpoint =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register");

        // 401: Unauthorized (session expired / token invalid)
        if (status === 401 && !isAuthEndpoint) {
          await storage.remove(TOKEN_KEY);
          await storage.remove("user_data");
          this.notifyUnauthorized();
        }

        // Do not use console.error here as it triggers Expo LogBox for expected errors like 401/403
        const friendlyMessage = extractApiErrorMessage(error);
        const apiError = new ApiError(
          friendlyMessage,
          status,
          error.response,
          error.code,
        );
        return Promise.reject(apiError);
      },
    );
  }

  public onUnauthorized(callback: () => void): () => void {
    this.onUnauthorizedCallbacks.push(callback);
    return () => {
      this.onUnauthorizedCallbacks = this.onUnauthorizedCallbacks.filter(
        (cb) => cb !== callback,
      );
    };
  }

  private notifyUnauthorized(): void {
    this.onUnauthorizedCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error("Error in onUnauthorized callback:", e);
      }
    });
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
