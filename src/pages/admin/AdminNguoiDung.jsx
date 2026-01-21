import React, { useMemo, useState } from "react";

// Mock dữ liệu người dùng cho màn quản trị
const mockUsers = [
    { id: "U-1001", name: "Nguyễn Văn An", email: "an.nguyen@example.com", role: "Quản trị viên", joined: "2024-01-12", status: "active", posts: 34 },
    { id: "U-1002", name: "Trần Thu Hà", email: "ha.tran@example.com", role: "Cộng tác viên", joined: "2024-05-20", status: "locked", posts: 18 },
    { id: "U-1003", name: "Phạm Minh Khang", email: "khang.pham@example.com", role: "Thành viên", joined: "2024-09-02", status: "active", posts: 6 },
    { id: "U-1004", name: "Lê Mỹ Duyên", email: "duyen.le@example.com", role: "Thành viên", joined: "2025-01-04", status: "active", posts: 3 },
];

// Màn hình quản trị người dùng
const AdminNguoiDung = () => {
    const [users, setUsers] = useState(mockUsers);
    const [selectedId, setSelectedId] = useState(users[0]?.id || null);
    const [query, setQuery] = useState("");

    const selectedUser = useMemo(() => users.find((u) => u.id === selectedId), [selectedId, users]);

    // Danh sách người dùng sau khi áp dụng bộ lọc tìm kiếm
    const filteredUsers = useMemo(() => {
        const value = query.toLowerCase();
        return users.filter(
            (u) => u.name.toLowerCase().includes(value) || u.email.toLowerCase().includes(value) || u.id.toLowerCase().includes(value),
        );
    }, [users, query]);

    // Hàm khóa / mở khóa tài khoản người dùng
    const toggleStatus = (id) => {
        setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "locked" : "active" } : u)),
        );
    };

    return (
        <div className="stacked">
            {/* Tiêu đề trang & hành động chung */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Quản lý người dùng</h3>
                    <p className="panel-description">Danh sách, chi tiết và thao tác khóa / mở khóa</p>
                </div>
                <div className="btn secondary">Xuất mock CSV</div>
            </div>

            {/* Lưới 2 cột: Danh sách người dùng & Chi tiết người dùng */}
            <div className="admin-grid-2">
                {/* Panel: Danh sách người dùng + ô tìm kiếm */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <input
                            className="input"
                            placeholder="Tìm theo tên, email, mã..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    {/* Bảng danh sách người dùng */}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Họ tên</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Dòng dữ liệu người dùng */}
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`badge ${user.status === "active" ? "success" : "danger"}`}>
                                            {user.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className="btn secondary" onClick={() => setSelectedId(user.id)}>
                                            Chi tiết
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* Trạng thái rỗng khi không có kết quả tìm kiếm */}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">Không tìm thấy người dùng phù hợp</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Panel: Thông tin chi tiết người dùng */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Thông tin người dùng</h3>
                        {selectedUser && (
                            <span className={`badge ${selectedUser.status === "active" ? "success" : "danger"}`}>
                                {selectedUser.status === "active" ? "Hoạt động" : "Đã khóa"}
                            </span>
                        )}
                    </div>

                    {/* Thông tin chi tiết & hành động với người dùng được chọn */}
                    {selectedUser ? (
                        <div className="stacked">
                            {/* Thông tin cơ bản của người dùng */}
                            <div className="item-card">
                                <h4>{selectedUser.name}</h4>
                                <div className="item-meta">Email: {selectedUser.email}</div>
                                <div className="item-meta">Vai trò: {selectedUser.role}</div>
                                <div className="item-meta">Tham gia: {selectedUser.joined}</div>
                                <div className="item-meta">Đóng góp: {selectedUser.posts} bài</div>
                            </div>

                            {/* Nhóm nút hành động cho người dùng */}
                            <div className="responsive-stack">
                                <button
                                    className={`btn ${selectedUser.status === "active" ? "danger" : "primary"}`}
                                    onClick={() => toggleStatus(selectedUser.id)}
                                >
                                    {selectedUser.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
                                </button>
                                <button className="btn secondary">Gửi email thông báo</button>
                                <button className="btn secondary">Gán vai trò</button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">Chọn một người dùng để xem chi tiết</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNguoiDung;