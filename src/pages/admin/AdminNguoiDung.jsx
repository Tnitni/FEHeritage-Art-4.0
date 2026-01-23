import React, { useMemo, useState } from "react";


const mockUsers = [
    {
        id: "U-1001",
        name: "Nguyễn Văn An",
        identityNumber: "012345678901",
        dateOfBirth: "1998-03-12",
        email: "an.nguyen@example.com",
        gender: "male",
        intro: "Quản trị viên hệ thống",
        avatar: "https://i.pravatar.cc/150?img=12",
        created_at: "2024-01-12",
        status: "active",
    },
    {
        id: "U-1002",
        name: "Trần Thu Hà",
        identityNumber: "079845612300",
        dateOfBirth: "2000-07-21",
        email: "ha.tran@example.com",
        gender: "female",
        intro: "Cộng tác viên nội dung",
        avatar: "https://i.pravatar.cc/150?img=32",
        created_at: "2024-05-20",
        status: "locked",
    },
];

const AdminNguoiDung = () => {
    const [users, setUsers] = useState(mockUsers);
    const [selectedId, setSelectedId] = useState(users[0]?.id || null);
    const [query, setQuery] = useState("");

    /** user đang được chọn */
    const selectedUser = useMemo(
        () => users.find((u) => u.id === selectedId),
        [users, selectedId]
    );

    /** filter danh sách */
    const filteredUsers = useMemo(() => {
        const q = query.toLowerCase();
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.id.toLowerCase().includes(q)
        );
    }, [users, query]);

    /** khóa / mở khóa */
    const toggleStatus = (id) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id
                    ? { ...u, status: u.status === "active" ? "locked" : "active" }
                    : u
            )
        );
    };

    return (
        <div className="stacked">
            {/* HEADER */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Quản lý người dùng</h3>
                    <p className="panel-description">
                        Quản lý tài khoản 
                    </p>
                </div>
            </div>

            <div className="admin-grid-2">
                {/* ================= LIST PANEL ================= */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h4>Danh sách người dùng</h4>
                        <input
                            className="input"
                            placeholder="Tìm theo tên, email, mã..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                u.status === "active"
                                                    ? "success"
                                                    : "danger"
                                            }`}
                                        >
                                            {u.status === "active"
                                                ? "Hoạt động"
                                                : "Đã khóa"}
                                        </span>
                                    </td>
                                    <td align="right">
                                        <button
                                            className="btn secondary"
                                            onClick={() => setSelectedId(u.id)}
                                        >
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            Không tìm thấy người dùng
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ================= DETAIL PANEL ================= */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h4>Thông tin chi tiết</h4>
                        {selectedUser && (
                            <span
                                className={`badge ${
                                    selectedUser.status === "active"
                                        ? "success"
                                        : "danger"
                                }`}
                            >
                                {selectedUser.status}
                            </span>
                        )}
                    </div>

                    {selectedUser ? (
                        <div className="stacked">
                            <div className="item-card">
                                <img
                                    src={selectedUser.avatar}
                                    alt=""
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                    }}
                                />

                                <h4>{selectedUser.name}</h4>
                                <div className="item-meta">
                                    Email: {selectedUser.email}
                                </div>
                                <div className="item-meta">
                                    CCCD: {selectedUser.identityNumber}
                                </div>
                                <div className="item-meta">
                                    Ngày sinh: {selectedUser.dateOfBirth}
                                </div>
                                <div className="item-meta">
                                    Giới tính: {selectedUser.gender}
                                </div>
                                <div className="item-meta">
                                    Giới thiệu: {selectedUser.intro}
                                </div>
                                <div className="item-meta">
                                    Tạo lúc: {selectedUser.created_at}
                                </div>
                            </div>

                            <div className="responsive-stack">
                                <button
                                    className={`btn ${
                                        selectedUser.status === "active"
                                            ? "danger"
                                            : "primary"
                                    }`}
                                    onClick={() =>
                                        toggleStatus(selectedUser.id)
                                    }
                                >
                                    {selectedUser.status === "active"
                                        ? "Khóa tài khoản"
                                        : "Mở khóa"}
                                </button>

                                {/* password xử lý ĐÚNG CÁCH */}
                                {/* <button className="btn secondary">
                                    Reset mật khẩu
                                </button> */}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            Chọn người dùng để xem chi tiết
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNguoiDung;
