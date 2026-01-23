import React, { useState } from "react";

import CKEditorField from "../../components/common/CKEditorField";

// Dữ liệu mock cho mục Phân tích – Góc nhìn
const initialPosts = [
    {
        id: "A-01",
        title: "Góc nhìn về bảo tồn phố cổ",
        summary: "Những thách thức trong bảo tồn kiến trúc đô thị lịch sử.",
        content: "<p>Việc bảo tồn phố cổ cần kết hợp giữa quy hoạch hiện đại và giữ gìn giá trị nguyên bản...</p>",
        thumbnail: "",
    },
];

const AdminGocNhin = () => {
    const [viewItem, setViewItem] = useState(null);
    const [items, setItems] = useState(initialPosts);
    const [form, setForm] = useState({ id: "", title: "", summary: "", content: "", thumbnail: "" });
    const [editingId, setEditingId] = useState(null);

    const resetForm = () => {
        setForm({ id: "", title: "", summary: "", content: "", thumbnail: "" });
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.summary) return;

        if (editingId) {
            setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...form, id: editingId } : item)));
        } else {
            const nextId = `A-${String(items.length + 1).padStart(2, "0")}`;
            setItems((prev) => [...prev, { ...form, id: nextId }]);
        }
        resetForm();
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm(item);
    };

    const handleDelete = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) resetForm();
    };

    return (
        <div className="stacked">
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}> Góc nhìn</h3>
                    <p className="panel-description">Quản lý bài viết,góc nhìn với nội dung có định dạng & ảnh đại diện</p>
                </div>
                <button className="btn primary" onClick={resetForm}>
                    Thêm mới
                </button>
            </div>

            <div className="admin-grid-2">
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <span className="badge warning">{items.length} bài</span>
                    </div>
                    <div className="list-cards">
                        {items.map((item) => (
                            <div key={item.id} className="item-card">
                                <h4>{item.title}</h4>
                                <div className="item-meta">{item.summary}</div>
                                {item.thumbnail && (
                                    <div className="thumb-preview">
                                        <img src={item.thumbnail} alt={item.title} />
                                    </div>
                                )}
                                <div className="card-actions">
                                <button
                                        className="btn ghost"
                                        onClick={() => setViewItem(item)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button className="btn secondary" onClick={() => handleEdit(item)}>
                                        Chỉnh sửa
                                    </button>
                                    <button className="btn danger" onClick={() => handleDelete(item.id)}>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <div className="empty-state">Chưa có bài viết</div>}
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>{editingId ? "Chỉnh sửa" : "Thêm mới"}</h3>
                        {editingId && <span className="badge warning">Đang sửa {editingId}</span>}
                    </div>
                    <form className="stacked" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div>
                                <label>Tiêu đề</label>
                                <input
                                    className="input"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label>Mô tả ngắn</label>
                            <input
                                className="input"
                                value={form.summary}
                                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <CKEditorField
                            value={form.content}
                            onChange={(content) => setForm({ ...form, content })}
                            placeholder="Nhập nội dung phân tích, có thể in đậm, danh sách, trích dẫn, hình ảnh..."
                        />
                        </div>

                        <div>
                            <label>Ảnh đại diện</label>
                            <input
                                className="input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        setForm({ ...form, thumbnail: url });
                                    }
                                }}
                            />
                            {form.thumbnail && (
                                <div className="thumb-preview thumb-preview-inline">
                                    <img src={form.thumbnail} alt="Xem trước" />
                                </div>
                            )}
                        </div>

                        <div className="responsive-stack">
                            <button className="btn primary" type="submit">
                                {editingId ? "Lưu thay đổi" : "Tạo mới"}
                            </button>
                            <button className="btn secondary" type="button" onClick={resetForm}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
             {/* ===== MODAL XEM CHI TIẾT ===== */}
             {viewItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-head">
                            <h3>{viewItem.title}</h3>
                            <button
                                className="btn danger"
                                onClick={() => setViewItem(null)}
                            >
                                Đóng
                            </button>
                        </div>

                        {viewItem.thumbnail && (
                            <img
                                src={viewItem.thumbnail}
                                alt={viewItem.title}
                                style={{
                                    width: "100%",
                                    maxHeight: 300,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginBottom: 16,
                                }}
                            />
                        )}

                        <p style={{ opacity: 0.8 }}>{viewItem.summary}</p>

                        <div
                            className="ck-content"
                            dangerouslySetInnerHTML={{
                                __html: viewItem.content,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGocNhin;