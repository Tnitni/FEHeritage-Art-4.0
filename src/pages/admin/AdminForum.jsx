import React, { useState } from "react";

// Dữ liệu mock các chủ đề / bài viết diễn đàn
const initialThreads = [
    { id: "F-201", title: "Làm sao bảo tồn kiến trúc đình làng?", author: "Thanh Tùng", topic: "Kiến trúc", status: "pending", createdAt: "2025-01-11" },
    { id: "F-202", title: "Ảnh tư liệu phố cổ Hội An", author: "Mai Hương", topic: "Tư liệu", status: "approved", createdAt: "2025-01-08" },
    { id: "F-203", title: "Góp ý trải nghiệm 3D", author: "Nhật Linh", topic: "Công nghệ", status: "hidden", createdAt: "2024-12-30" },
];

// Các trạng thái có thể áp dụng cho bài viết
const statusOptions = [
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "hidden", label: "Ẩn bài viết" },
];

// Màn hình quản trị diễn đàn
const AdminForum = () => {
    const [threads, setThreads] = useState(initialThreads);
    const [selectedId, setSelectedId] = useState(initialThreads[0]?.id || null);

    // Cập nhật trạng thái bài viết theo ID
    const onStatusChange = (id, status) => {
        setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    };

    // Bài viết đang được chọn bên panel chi tiết
    const selected = threads.find((t) => t.id === selectedId);

    return (
        <div className="stacked">
            {/* Tiêu đề trang quản trị diễn đàn */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Quản lý diễn đàn</h3>
                    <p className="panel-description"> cập nhật trạng thái: Chờ duyệt, Đã duyệt, Ẩn bài</p>
                </div>
            </div>

            {/* Lưới 2 cột: Danh sách bài & Chi tiết cập nhật */}
            <div className="admin-grid-2">
                {/* Panel: danh sách bài viết */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Bài viết</h3>
                        <span className="badge warning">{threads.length} bài</span>
                    </div>
                    {/* Bảng danh sách bài viết trong diễn đàn */}
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Tác giả</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {threads.map((item) => (
                                <tr key={item.id} onClick={() => setSelectedId(item.id)} style={{ cursor: "pointer" }}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.author}</td>
                                    <td>
                                        <span className={`status-pill ${item.status}`}>
                                            {statusOptions.find((opt) => opt.value === item.status)?.label}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Panel: chi tiết bài viết & form thay đổi trạng thái */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Chi tiết bài viết</h3>
                        {selected && (
                            <span className={`status-pill ${selected.status}`}>
                                {statusOptions.find((opt) => opt.value === selected.status)?.label}
                            </span>
                        )}
                    </div>
                    {/* Nếu đã chọn một bài viết thì hiển thị chi tiết & hành động */}
                    {selected ? (
                        <div className="stacked">
                            {/* Thông tin cơ bản của bài viết */}
                            <div className="item-card">
                                <h4>{selected.title}</h4>
                                <div className="item-meta">Tác giả: {selected.author}</div>
                                <div className="item-meta">Chủ đề: {selected.topic}</div>
                                <div className="item-meta">Ngày tạo: {selected.createdAt}</div>
                            </div>

                            {/* Form chọn trạng thái bài viết */}
                            <div className="form-grid">
                                <div>
                                    <label>Trạng thái</label>
                                    <select
                                        className="select"
                                        value={selected.status}
                                        onChange={(e) => onStatusChange(selected.id, e.target.value)}
                                    >
                                        {statusOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Nhóm nút thao tác nhanh: duyệt / ẩn bài */}
                            <div className="responsive-stack">
                                <button className="btn primary" onClick={() => onStatusChange(selected.id, "approved")}>
                                    Duyệt bài
                                </button>
                                <button className="btn danger" onClick={() => onStatusChange(selected.id, "hidden")}>
                                    Ẩn bài
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">Chọn một bài viết để cập nhật trạng thái</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminForum;