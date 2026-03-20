import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  redirectTo = '/login',
  loadingComponent = null,
  unauthorizedComponent = null,
}) => {
  const { user, isLoggedIn, loading } = useUser();
  const location = useLocation();

  // Hiển thị loading state
  if (loading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      )
    );
  }

  // Kiểm tra đăng nhập
  if (!isLoggedIn) {
    // Lưu location hiện tại để redirect về sau khi login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Kiểm tra admin role nếu yêu cầu
  if (requireAdmin) {
    const isAdmin = user?.roles?.some((role) => role.role_code === 'ADMIN');

    if (!isAdmin) {
      return (
        unauthorizedComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                403 - Forbidden
              </h1>
              <p className="text-gray-600 mb-6">
                Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên
                nếu bạn nghĩ đây là lỗi.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Quay lại
              </button>
            </div>
          </div>
        )
      );
    }
  }

  // Render children nếu tất cả điều kiện đều thỏa mãn
  return children;
};

export default ProtectedRoute;
