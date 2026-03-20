// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Forum
  FORUM: {
    POST: "forums/posts",
    GETCAT: "forum-category",
    GET: "forums/posts?status=Active",
    GETFORADMIN: "forums/posts",
    GETBYID: (postId) => `forums/posts/${postId}`,
    UPDATEBYID: (postId) => `forums/posts/${postId}`,
    DELETE: (postId) => `forums/posts/${postId}`,
    ACTIVE: (postId) => `forums/posts/status/${postId}`,
    LIKE: (postId) => `forums/reactions/${postId}`,
    POSTCOMMENT: (postId) => `forums/posts/${postId}/comments`,
    DELETECOMMENT: (postId) => `forums/comments/${postId}`,
    GETUSERBYID: (userId) => `users/${userId}`,
    GETTAG: "tag",
    FILTERISMINE: (userId) => `forums/user/${userId}`,
  },
  // Historical periods
  HISTORICAL_PERIODS: {
    GETALL: "periods",
    GETBYID: (periodId) => `periods/${periodId}`,
  },
  // Historical events
  HISTORICAL_EVENTS: {
    GETALL: (periodId) => `history-event/${periodId}`,
  },
  // Celebrities
  CELEBRITIES: {
    GETALL: (periodId) => `Celebrities/${periodId}`,
  },
};
