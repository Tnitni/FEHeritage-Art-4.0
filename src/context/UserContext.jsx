// src/context/UserContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { authService, socketService } from "../services";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userProfile");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!authService.isAuthenticated());
  const [error, setError] = useState(null);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("userProfile");
    socketService.disconnect();
  }, []);

  // 🔄 HIỆU CHỈNH DỮ LIỆU
  useEffect(() => {
    const syncAuth = async () => {
      const hasToken = authService.isAuthenticated();

      if (!hasToken) {
        if (isLoggedIn) clearAuthData();
        return;
      }

      // Kết nối socket ngay nếu đã có user id từ local
      if (user?.id) {
        socketService.connect(user.id);
      }

      try {
        // Cập nhật thông tin mới nhất từ server
        const response = await authService.getProfile();
        if (response.success && response.data?.user) {
          const freshUser = response.data.user;
          setUser(freshUser);
          setIsLoggedIn(true);
          localStorage.setItem("userProfile", JSON.stringify(freshUser));
          socketService.connect(freshUser.id);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          authService.logout();
          clearAuthData();
        }
      }
    };

    syncAuth();
  }, []);

  // 🟢 ĐĂNG NHẬP
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      if (response.success && response.data?.user) {
        const loggedInUser = response.data.user;
        setUser(loggedInUser);
        setIsLoggedIn(true);
        localStorage.setItem("userProfile", JSON.stringify(loggedInUser));
        socketService.connect(loggedInUser.id);
        return { success: true, data: response.data };
      }
      throw new Error(response.message || "Đăng nhập thất bại");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 📝 ĐĂNG KÝ
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      if (response.success && response.data?.user) {
        const newUser = response.data.user;
        setUser(newUser);
        setIsLoggedIn(true);
        localStorage.setItem("userProfile", JSON.stringify(newUser));
        socketService.connect(newUser.id);
        return { success: true, data: response.data };
      }
      throw new Error(response.message || "Đăng ký thất bại");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 🔴 ĐĂNG XUẤT
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuthData();
    }
  };

  // ✏️ CẬP NHẬT HỒ SƠ
  const updateProfile = async (newData) => {
    try {
      setError(null);
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
      throw err;
    }
  };

  // 🔄 REFRESH PROFILE
  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem("userProfile", JSON.stringify(response.data.user));
        return { success: true, data: response.data.user };
      }
    } catch (err) {
      console.error("Refresh profile failed:", err);
      throw err;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        error,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
