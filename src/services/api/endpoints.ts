/**
 * Centralized API Endpoints
 * 
 * Keep all API paths here for easy maintenance and versioning.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
  },
  USER: {
    UPDATE_PHONE: '/api/v1/users/me/phone',
    SYNC_CONTACTS: '/api/v1/users/sync-contacts',
    TOGGLE_FOLLOW: (id: number | string) => `/api/v1/users/${id}/follow`,
    SEARCH: '/api/v1/users/search',
    PROFILE: (username: string) => `/api/v1/users/profile/${username}`,
    UPDATE_PROFILE: '/api/v1/users/me/profile',
  },
  ROADMAP: {
    GET_TOPICS: '/api/v1/topics',
  },
  LESSONS: {
    START: (id: number | string) => `/api/v1/lessons/${id}/start`,
    SUBMIT: (id: number | string) => `/api/v1/lessons/${id}/submit`,
    CANCEL: (id: number | string) => `/api/v1/lessons/${id}/cancel`,
  },
  UPLOADS: {
    IMAGE: '/api/v1/uploads/images',
    AUDIO: '/api/v1/uploads/audio',
  },
} as const;
