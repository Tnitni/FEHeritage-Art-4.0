import axios from "axios";
import { API_CONFIG } from "../configs";

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động xử lý Refresh Token khi gặp lỗi 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshError) {
        const path = window.location.pathname;
        const skipRedirect = path.startsWith("/admin") || path === "/login" || path === "/register";
        if (!skipRedirect) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ==================== AUTH ====================
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/change-password", data);

// ==================== EXPERIENCE POSTS ====================
export const getPosts = () => api.get("/experience-posts");
export const getPostById = (postId) => api.get(`/experience-posts/${postId}`);
export const getPostsByUser = (userId) => api.get(`/experience-posts/user/${userId}`);

export const createPost = (formData) =>
  api.post("/experience-posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePost = (postId, formData) =>
  api.put(`/experience-posts/${postId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePost = (postId) => api.delete(`/experience-posts/${postId}`);

// ==================== EXPERIENCE COMMENTS ====================
export const getCommentsByPost = (postId) =>
  api.get(`/experience-comments/post/${postId}`);

export const getCommentById = (commentId) =>
  api.get(`/experience-comments/${commentId}`);

export const getCommentReplies = (commentId) =>
  api.get(`/experience-comments/${commentId}/replies`);

export const createPostComment = (postId, data) => {
  const payload = typeof data === "string" ? { content: data } : data;
  return api.post(`/experience-comments/post/${postId}`, payload);
};

export const updateComment = (commentId, content) =>
  api.put(`/experience-comments/${commentId}`, { content });

export const deleteComment = (commentId) =>
  api.delete(`/experience-comments/${commentId}`);

export const likeComment = (commentId, action = "like") =>
  api.post(`/experience-comments/${commentId}/like`, { action });

// ==================== HISTORICAL PERIODS ====================
export const getPeriods = () => api.get("/periods");
export const getPeriodById = (periodId) => api.get(`/periods/${periodId}`);

// ==================== UPLOAD ====================
export const uploadFile = (formData) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ==================== NEWS (Tin tức) ====================
// Backend Hoppscotch: /api/news/ (có trailing slash), BASE_URL = .../api
export const getNews = (params) => api.get("/news/", { params });
export const getNewsById = (id) => api.get(`/news/${id}`);
export const createNews = (data) => api.post("/news/", data);
export const updateNews = (id, data) => api.put(`/news/${id}`, data);
export const deleteNews = (id) => api.delete(`/news/${id}`);
export const updateNewsStatus = (id, data) => api.patch(`/news/${id}/status`, data);
export const uploadNewsMedia = (id, formData) =>
  api.post(`/news/${id}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ==================== EVENTS (Sự kiện) ====================
export const getEvents = (params) => api.get("/events/", { params });
export const getEventById = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post("/events/", data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

export default api;