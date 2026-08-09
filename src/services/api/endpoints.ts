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
    ME: '/api/v1/users/me',
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
    BATCH_IMAGE: '/api/v1/uploads/images/batch',
    BATCH_AUDIO: '/api/v1/uploads/audio/batch',
  },
  ENERGY: {
    GET_INFO: '/api/v1/users/me/energy',
    PRACTICE: '/api/v1/users/me/energy/practice',
    REFILL: '/api/v1/users/me/energy/refill',
    ADS: '/api/v1/users/me/energy/ads',
  },
  STREAK: {
    GET_INFO: '/api/v1/users/me/streak',
    BUY_FREEZE: '/api/v1/users/me/streak/freeze/buy',
  },
  QUESTS: {
    GET_ALL: '/api/v1/users/me/quests',
  },
  CHEST: {
    GET_STATUS: '/api/v1/users/me/chest',
    OPEN: '/api/v1/users/me/chest/open',
  },
} as const;
