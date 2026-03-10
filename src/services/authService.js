import api from './api';
import { API_ENDPOINTS } from '../configs';

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      // Token is now stored in HTTP-Only cookies automatically
      return response;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      // Token is now stored in HTTP-Only cookies automatically
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      // Clear any user data from localStorage (but not tokens - they're in cookies)
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isLoggedIn');
      return response;
    } catch (error) {
      // Still clear user data even if API call failed
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isLoggedIn');
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check authentication by checking local storage
  isAuthenticated: () => {
    return !!localStorage.getItem('userProfile');
  },
};

export default authService;
