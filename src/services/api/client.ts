/**
 * API Client
 *
 * Centralized HTTP client configuration.
 * Customize base URL, headers, interceptors, and error handling here.
 */

import { storage } from '@/services/storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";
export const TOKEN_KEY = 'auth_token';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    const url = this.buildUrl(endpoint, params);

    const token = await storage.get(TOKEN_KEY);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((fetchConfig.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    if (response.status === 401) {
      await storage.remove(TOKEN_KEY);
      // Optional: trigger event to force re-login
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) errorMessage = errorJson.message;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }

    // Xử lý trường hợp endpoint trả về rỗng (như 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : undefined as any;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
