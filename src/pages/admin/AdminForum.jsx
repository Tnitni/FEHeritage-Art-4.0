import React, { useState } from "react";

// Dữ liệu mock
const initialThreads = [
    { id: "F-201", title: "Làm sao bảo tồn kiến trúc đình làng?", author: "Thanh Tùng", topic: "Kiến trúc", status: "pending", createdAt: "2025-01-11" },
    { id: "F-202", title: "Ảnh tư liệu phố cổ Hội An", author: "Mai Hương", topic: "Tư liệu", status: "approved", createdAt: "2025-01-08" },
    { id: "F-203", title: "Góp ý trải nghiệm 3D", author: "Nhật Linh", topic: "Công nghệ", status: "hidden", createdAt: "2024-12-30" },
];

const AdminForum = () => {
    const [threads, setThreads] = useState(initialThreads);
    const [selectedId, setSelectedId] = useState(initialThreads[0]?.id || null);

    const selected = threads.find((t) => t.id === selectedId);

    // Ẩn / Hiện bài viết
    const toggleHide = (id) => {
        setThreads((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, status: item.status === "hidden" ? "approved" : "hidden" }
                    : item
            )
        );
    };

    return (
        <div className="stacked">
            {/* Header */}
            <div className="panel-head">
                <h3>Quản lý diễn đàn</h3>
                <p className="panel-description">Quản lý & ẩn bài viết</p>
            </div>

            <div className="admin-grid-2">
                {/* Danh sách bài */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Bài viết</h3>
                        <span className="badge warning">{threads.length} bài</span>
                    </div>

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
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    style={{
                                        cursor: "pointer",
                                        opacity: item.status === "hidden" ? 0.5 : 1,
                                    }}
                                >
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.author}</td>
                                    <td>{item.status === "hidden" ? "Đã ẩn" : "Hiển thị"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Chi tiết bài */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Chi tiết bài viết</h3>
                    </div>

                    {selected ? (
                        <div className="stacked">
                            <div className="item-card">
                                <h4>{selected.title}</h4>
                                <div className="item-meta">Tác giả: {selected.author}</div>
                                <div className="item-meta">Chủ đề: {selected.topic}</div>
                                <div className="item-meta">Ngày tạo: {selected.createdAt}</div>
                                <div className="item-meta">
                                    Trạng thái: <b>{selected.status}</b>
                                </div>
                            </div>

                            <button
                                className="btn danger"
                                onClick={() => toggleHide(selected.id)}
                            >
                                {selected.status === "hidden"
                                    ? "Hiện bài viết"
                                    : "Ẩn bài viết"}
                            </button>
                        </div>
                    ) : (
                        <div className="empty-state">Chọn một bài viết</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminForum;
