/**
 * Centralized API Endpoints
 *
 * Keep all API paths here for easy maintenance and versioning.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    SOCIAL_GOOGLE: "/api/v1/auth/social/google",
    SOCIAL_FACEBOOK: "/api/v1/auth/social/facebook",
    LOGOUT: "/api/v1/auth/logout",
  },
  USER: {
    ME: "/api/v1/users/me",
    UPDATE_PHONE: "/api/v1/users/me/phone",
    SYNC_CONTACTS: "/api/v1/users/sync-contacts",
    TOGGLE_FOLLOW: (id: number | string) => `/api/v1/users/${id}/follow`,
    SEARCH: "/api/v1/users/search",
    PROFILE: (username: string) => `/api/v1/users/profile/${username}`,
    UPDATE_PROFILE: "/api/v1/users/me/profile",
    PUBLIC_PROFILE: (id: number | string) => `/api/v1/users/${id}/profile`,
    FOLLOWERS: (id: number | string) => `/api/v1/users/${id}/followers`,
    FOLLOWING: (id: number | string) => `/api/v1/users/${id}/following`,
  },
  ROADMAP: {
    GET_TOPICS: "/api/v1/topics",
  },
  RANK: {
    GET_ALL: "/api/v1/ranks",
    LEADERBOARD: (rankId?: number | string) =>
      rankId ? `/api/v1/leaderboard?rankId=${rankId}` : "/api/v1/leaderboard",
  },
  LESSONS: {
    START: (id: number | string) => `/api/v1/lessons/${id}/start`,
    SUBMIT: (id: number | string) => `/api/v1/lessons/${id}/submit`,
    CANCEL: (id: number | string) => `/api/v1/lessons/${id}/cancel`,
  },
  PLACEMENT: {
    START: "/api/v1/placement/start",
    ANSWER: (attemptId: number | string) =>
      `/api/v1/placement/${attemptId}/answer`,
  },
  UPLOADS: {
    IMAGE: "/api/v1/uploads/images",
    AUDIO: "/api/v1/uploads/audio",
    BATCH_IMAGE: "/api/v1/uploads/images/batch",
    BATCH_AUDIO: "/api/v1/uploads/audio/batch",
  },
  ENERGY: {
    GET_INFO: "/api/v1/users/me/energy",
    PRACTICE: "/api/v1/users/me/energy/practice",
    REFILL: "/api/v1/users/me/energy/refill",
    ADS: "/api/v1/users/me/energy/ads",
  },
  STREAK: {
    GET_INFO: "/api/v1/users/me/streak",
    BUY_FREEZE: "/api/v1/users/me/streak/freeze/buy",
    CALENDAR: "/api/v1/users/me/streak/calendar",
  },
  QUESTS: {
    GET_ALL: "/api/v1/users/me/quests",
  },
  CHEST: {
    GET_STATUS: "/api/v1/users/me/chest",
    OPEN: "/api/v1/users/me/chest/open",
  },
  SHOP: {
    GET_ALL: "/api/v1/users/me/shop",
    BUY: (itemId: number | string) => `/api/v1/users/me/shop/buy/${itemId}`,
    INVENTORY: "/api/v1/users/me/shop/inventory",
    CONSUME: (inventoryId: number | string) =>
      `/api/v1/users/me/shop/inventory/${inventoryId}/consume`,
    EQUIP: (inventoryId: number | string) =>
      `/api/v1/users/me/shop/inventory/${inventoryId}/equip`,
  },
  ALPHABETS: {
    GET_ALL: (type: string) => `/api/v1/alphabets?type=${type}`,
    PRACTICE_START: "/api/v1/alphabets/practice/start",
    PRACTICE_SUBMIT: "/api/v1/alphabets/practice/submit",
    ADMIN_CREATE: "/api/v1/admin/alphabets",
    ADMIN_BULK_CREATE: "/api/v1/admin/alphabets/bulk",
  },
  VOCABULARY: {
    /** Từ đã tới hạn ôn hôm nay. */
    DUE: "/api/v1/vocabulary/due",
    /** Sổ tay: các từ đã gặp ít nhất một lần. */
    LEARNED: "/api/v1/vocabulary/learned",
    /** Toàn bộ kho từ, để client cache làm từ điển tra tại chỗ. */
    GLOSSARY: "/api/v1/vocabulary/glossary",
    /** Nộp kết quả phiên ôn -> server áp SM-2. */
    REVIEW_SUBMIT: "/api/v1/vocabulary/review/submit",
  },
  PRONUNCIATION: {
    DUE: "/api/v1/pronunciation/due",
    REVIEW_SUBMIT: "/api/v1/pronunciation/review/submit",
  },
  MISTAKES: {
    SUMMARY: "/api/v1/reviews/mistakes/summary",
    START: "/api/v1/reviews/mistakes/start",
    SUBMIT: "/api/v1/reviews/mistakes/submit",
  },
  ACHIEVEMENTS: {
    GET_ALL: "/api/v1/users/me/achievements",
  },
  FEED: {
    GET: "/api/v1/feed",
  },
  POSTS: {
    CREATE: "/api/v1/posts",
    DELETE: (id: number | string) => `/api/v1/posts/${id}`,
    LIKE: (id: number | string) => `/api/v1/posts/${id}/like`,
    COMMENTS: (id: number | string) => `/api/v1/posts/${id}/comments`,
  },
  COMMENTS: {
    DELETE: (id: number | string) => `/api/v1/comments/${id}`,
  },
} as const;
