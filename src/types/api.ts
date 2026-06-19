/**
 * API response and request types.
 * Define shared interfaces for your API layer here.
 */

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}
