// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    BASE: "/auth",
    REGISTER: "auth/register",
    LOGIN: "auth/login",
    LOGOUT: "auth/logout",
    PROFILE: "auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  // Users
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
    ASSIGN_ROLES: (id) => `/users/${id}/roles`,
  },
  // Roles
  ROLES: {
    BASE: "/roles",
    BY_ID: (id) => `/roles/${id}`,
  },
  // Health
  HEALTH: "/health",
};
