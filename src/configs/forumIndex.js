// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Forum
  FORUM: {
    POST: "/api/forums/posts",
    GETCAT: "/api/forum-category",
    GET: "/api/forums/posts?status=Active",
    GETBYID: (postId) => `/api/forums/posts/${postId}`,
    UPDATEBYID: (postId) => `/api/forums/posts/${postId}`,
    DELETE: (postId) => `/api/forums/posts/${postId}`,
    LIKE: (postId) => `/api/forums/reactions/${postId}`,
    POSTCOMMENT: (postId) => `/api/forums/posts/${postId}/comments`,
    DELETECOMMENT: (postId) => `/api/forums/comments/${postId}`,
    GETUSERBYID: (userId) => `/api/users/${userId}`,
    GETTAG: "/api/tag",
    FILTERISMINE: "/api/forums/myposts",
  },
  // Historical periods
  HISTORICAL_PERIODS: {
    GETALL: "/api/periods",
    GETBYID: (periodId) => `/api/periods/${periodId}`,
  },
  // Historical events
  HISTORICAL_EVENTS: {
    GETALL: (periodId) => `/api/history-event/${periodId}`,
  },
  // Celebrities
  CELEBRITIES: {
    GETALL: (periodId) => `/api/Celebrities/${periodId}`,
  },
};
