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

    // Xử lý các lỗi phổ biến
    if (error.response) {
      // Server trả về response với status code ngoài 2xx
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Token hết hạn hoặc không hợp lệ
          // Try to refresh token if not already retrying
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              // Call refresh token endpoint
              await axios.post(
                `${API_CONFIG.BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true }
              );

              // Retry original request
              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear local auth state
              console.error('Token refresh failed, redirecting to login');

              const wasLoggedIn = !!localStorage.getItem('userProfile');
              localStorage.removeItem('userProfile');
              localStorage.removeItem('isLoggedIn');

              // Only redirect to login automatically if the user was previously logged in
              if (wasLoggedIn && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
              }

              return Promise.reject(refreshError);
            }
          }
          break;

        case 403:
          // Forbidden - Không có quyền truy cập
          console.error('Bạn không có quyền truy cập tài nguyên này');
          break;

        case 404:
          // Not Found
          console.error('Tài nguyên không tồn tại');
          break;

        case 409:
          // Conflict - Dữ liệu đã tồn tại
          console.error('Dữ liệu đã tồn tại');
          break;

        case 500:
          // Internal Server Error
          console.error('Lỗi máy chủ, vui lòng thử lại sau');
          break;

        default:
          console.error(`Lỗi ${status}: ${data?.message || 'Có lỗi xảy ra'}`);
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

export default api;