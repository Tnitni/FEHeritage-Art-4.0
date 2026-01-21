import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SideBar } from "../sidebar/SideBar";
import "../../pages/admin/adminStyles.css";

const AdminLayout = () => {
    const location = useLocation();

    return (
        <div className="admin-shell">
            <SideBar />

            <div className="admin-main">
                <header className="admin-header">
                    <div>
                        <div className="title">Heritage Art 4.0 • Admin</div>
                        <div className="breadcrumbs">{location.pathname}</div>
                    </div>
                    <div className="admin-profile">
                        <div>
                            <div style={{ fontWeight: 700 }}>Admin</div>
                            <div style={{ fontSize: 12, color: "#87684a" }}>Giám sát nội dung</div>
                        </div>
                        <div className="admin-avatar">HA</div>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;