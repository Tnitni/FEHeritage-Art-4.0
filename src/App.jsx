import { RouterProvider } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import router from "./routes";
import { ArtProvider } from "./context/ArtContext";
import { UserProvider, useUser } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { SettingsProvider } from "./context/SettingsContext";
import SocketStatus from "./components/SocketStatus";
import SettingsPreview from "./components/SettingsPreview";
import SettingsTest from "./components/SettingsTest";
import "./styles/settings.css";
import { useEffect } from "react";

const AppContent = () => {
  const { isInitialCheckDone, isLoggedIn, user } = useUser();

  const isFromSocialAuth =
    localStorage.getItem("social_auth_status") === "pending";

  useEffect(() => {
    if (isInitialCheckDone && isLoggedIn && user) {
      const status = localStorage.getItem("social_auth_status");
      const type = localStorage.getItem("social_auth_type");

      if (status === "pending") {
        if (type === "register") {
          toast.success("Đăng ký thành công", {
            icon: "🎉",
            duration: 5000,
          });
        } else {
          toast.success("Đăng nhập thành công", {
            icon: "👋",
            duration: 3000,
          });
        }

        // Xóa cả 2 cờ sau khi đã hiện thông báo
        localStorage.removeItem("social_auth_status");
        localStorage.removeItem("social_auth_type");
      }
    }
  }, [isInitialCheckDone, isLoggedIn, user]);

  // Nếu UserContext chưa check xong API, hiện màn hình Loading
  if (isFromSocialAuth && !isInitialCheckDone) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121212",
          color: "white",
          flexDirection: "column",
          fontFamily: "sans-serif",
        }}
      >
        <div className="loader"></div>
        <p style={{ marginTop: "20px" }}>Đang khởi tạo ứng dụng...</p>
        <style>{`
          .loader {
            border: 4px solid #333;
            border-top: 4px solid #4caf50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Khi đã check xong, render toàn bộ nội dung App
  return (
    <ArtProvider>
      <CartProvider>
        <RouterProvider router={router} />
        {/* Socket Connection Status Indicator */}
        {/* <SocketStatus />             */}
        {/* Settings Preview for Development - Bottom Right */}
        {/* <SettingsPreview /> */}
        {/* Settings Test Panel - Top Left (for debugging only) */}
        {/* <SettingsTest /> */}
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            // Default options
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "14px",
            },
            // Success toast style
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4caf50",
                secondary: "#fff",
              },
              style: {
                background: "#4caf50",
                color: "#fff",
              },
            },
            // Error toast style
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#f44336",
                secondary: "#fff",
              },
              style: {
                background: "#f44336",
                color: "#fff",
              },
            },
          }}
        />
      </CartProvider>
    </ArtProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </SettingsProvider>
  );
}

export default App;
