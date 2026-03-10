import axios from "axios";
import { API_CONFIG } from "../configs";

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor - No longer need to manually add token from localStorage
api.interceptors.request.use(
  (config) => {
    // Token is automatically sent via HTTP-Only cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Xử lý response và errors
api.interceptors.response.use(
  (response) => {
    // Trả về data từ response
    return response.data;
  },
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
                `${API_CONFIG.BASE_URL}/api/auth/refresh-token`,
                {},
                { withCredentials: true },
              );

              // Retry original request
              return api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              console.error("Token refresh failed, redirecting to login");

              // Redirect to login nếu không phải trang public
              if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register"
              ) {
                window.location.href = "/login";
              }

              return Promise.reject(refreshError);
            }
          }
          break;

        case 403:
          // Forbidden - Không có quyền truy cập
          console.error("Bạn không có quyền truy cập tài nguyên này");
          break;

        case 404:
          // Not Found
          console.error("Tài nguyên không tồn tại");
          break;

        case 409:
          // Conflict - Dữ liệu đã tồn tại
          console.error("Dữ liệu đã tồn tại");
          break;

        case 500:
          // Internal Server Error
          console.error("Lỗi máy chủ, vui lòng thử lại sau");
          break;

        default:
          console.error(`Lỗi ${status}: ${data?.message || "Có lỗi xảy ra"}`);
      }

      return Promise.reject(data || error);
    } else if (error.request) {
      console.error("Không thể kết nối đến máy chủ");
      return Promise.reject({
        success: false,
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      });
    } else {
      console.error("Lỗi:", error.message);
      return Promise.reject({
        success: false,
        message: error.message,
      });
    }
  },
);

export default api;
