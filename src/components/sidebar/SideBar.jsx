import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

// Cấu hình menu điều hướng cho khu vực Admin
const menu = [
    {
        title: "Bảng điều khiển",
        items: [{ label: "Tổng quan", path: "/admin/dashboard" }],
    },
    {
        title: "Quản trị",
        items: [{ label: "Quản lý người dùng", path: "/admin/users" }],
    },
    {
        title: "Cộng đồng",
        items: [
            { label: "Tin tức – Sự kiện", path: "/admin/news-events" },
            { label: "Văn hóa – Lịch sử", path: "/admin/culture-history" },
            { label: "Phân tích – Góc nhìn", path: "/admin/analysis" },
            { label: "Diễn đàn", path: "/admin/forum" },
        ],
    },
];

export const SideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (itemPath) => {
        // Đảm bảo trạng thái active khi ở /admin (route index)
        if (itemPath === "/admin/dashboard" && location.pathname === "/admin") return true;
        return location.pathname === itemPath;
    };

    return (
        <aside className="admin-sidebar">
            <div className="brand">
                <img src={logo} alt="Heritage Art" />
                <div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>Heritage Art 4.0</div>
                    <div style={{ fontWeight: 700 }}>Admin</div>
                </div>
            </div>

            {menu.map((section) => (
                <div key={section.title} className="sidebar-section">
                    <h4>{section.title}</h4>
                    <nav className="sidebar-nav">
                        {section.items.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
                            >
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            ))}
        </aside>
    );
};

export default SideBar;