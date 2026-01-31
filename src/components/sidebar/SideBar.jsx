import React, { useState } from "react";
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
            { label: "Tin tức", path: "/admin/news" },
            { label: "Sự kiện", path: "/admin/events" },
            { label: "Hành Trình Lịch Sử", path: "/admin/culture-history" },
            { label: "Phân tích", path: "/admin/analysis" },
            { label: "Góc nhìn", path: "/admin/viewpoint" },
            { label: "Trải Nghiệm", path: "/admin/TraiNghiem" },
            { label: "Diễn đàn", path: "/admin/forum" },
            {
                label: "Cửa hàng",
                path: "/admin/cuahang",
                hasSubmenu: true,
                submenu: [
                    { label: "Quản lý sản phẩm", path: "/admin/cuahang/products" },
                    { label: "Quản lý payment, donate", path: "/admin/cuahang/payment-donate" },
                    { label: "Quản lý gói thành viên VIP", path: "/admin/cuahang/vip-packages" },
                    { label: "Quản lý lịch sử mua gói", path: "/admin/cuahang/purchase-history" },
                ]
            },
        ],
    },
];

export const SideBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [clickedItem, setClickedItem] = useState(null);

    const isActive = (itemPath) => {
        if (itemPath === "/admin/dashboard" && location.pathname === "/admin") return true;
        return location.pathname === itemPath || location.pathname.startsWith(itemPath + "/");
    };

    const handleItemClick = (item) => {
        if (item.hasSubmenu) {
            // Toggle submenu khi click vào item có submenu
            setClickedItem(clickedItem === item.path ? null : item.path);
        } else {
            // Navigate nếu không có submenu
            navigate(item.path);
            setClickedItem(null);
        }
    };

    const isSubmenuOpen = (itemPath) => {
        return hoveredItem === itemPath || clickedItem === itemPath;
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
                            <div
                                key={item.path}
                                style={{ position: "relative" }}
                                onMouseEnter={() => item.hasSubmenu && setHoveredItem(item.path)}
                                onMouseLeave={() => item.hasSubmenu && setHoveredItem(null)}
                            >
                                <button
                                    onClick={() => handleItemClick(item)}
                                    className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
                                    style={{ 
                                        width: "100%", 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                >
                                    <span>{item.label}</span>
                                    {item.hasSubmenu && (
                                        <span 
                                            style={{ 
                                                fontSize: "0.8rem",
                                                transform: isSubmenuOpen(item.path) ? "rotate(90deg)" : "rotate(0deg)",
                                                transition: "transform 0.2s ease"
                                            }}
                                        >
                                            ▸
                                        </span>
                                    )}
                                </button>

                                {/* SUBMENU DROPDOWN - Hiển thị khi hover HOẶC click */}
                                {item.hasSubmenu && isSubmenuOpen(item.path) && (
                                    <div
                                        className="submenu-dropdown"
                                        style={{
                                            position: "absolute",
                                            left: "100%",
                                            top: 0,
                                            backgroundColor: "#4a3728",
                                            minWidth: "240px",
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                            zIndex: 1000,
                                            padding: "0.5rem 0",
                                            marginLeft: "0.5rem",
                                            animation: "slideIn 0.2s ease-out"
                                        }}
                                        onMouseEnter={() => setHoveredItem(item.path)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        {item.submenu.map((sub) => (
                                            <button
                                                key={sub.path}
                                                onClick={() => {
                                                    navigate(sub.path);
                                                    setClickedItem(null);
                                                }}
                                                className={`sidebar-link ${isActive(sub.path) ? "active" : ""}`}
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "0.75rem 1.25rem",
                                                    border: "none",
                                                    backgroundColor: isActive(sub.path) ? "#f97316" : "transparent",
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontSize: "0.9rem",
                                                    transition: "all 0.2s"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive(sub.path)) {
                                                        e.currentTarget.style.backgroundColor = "#5a4838";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive(sub.path)) {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                    }
                                                }}
                                            >
                                                {sub.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </div>
            ))}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </aside>
    );
};

export default SideBar;