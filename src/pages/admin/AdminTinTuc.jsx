import React, { useState } from "react";

// Dữ liệu mock tin tức / sự kiện
const initialNews = [
    {
        id: "N-001",
        title: "Lễ hội Nghinh Ông 2024",
        summary: "Tái hiện lễ rước truyền thống tại Bình Thuận.",
        content: "Sự kiện quy tụ hơn 5.000 người tham gia với nhiều hoạt động văn hóa biển.",
        thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80",
        date: "2024-12-28",
    },
    {
        id: "N-002",
        title: "Triển lãm tranh Đông Hồ",
        summary: "Bộ sưu tập hơn 80 bức tranh quý hiếm.",
        content: "Trưng bày kết hợp trải nghiệm thực tế ảo giúp người xem tiếp cận nghệ thuật dân gian.",
        thumbnail: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=600&q=80",
        date: "2025-01-10",
    },
];

// Màn hình quản trị tin tức – sự kiện
const AdminTinTuc = () => {
    const [items, setItems] = useState(initialNews);
    const [form, setForm] = useState({ id: "", title: "", summary: "", content: "", thumbnail: "", date: "" });
    const [editingId, setEditingId] = useState(null);

    // Reset lại form & trạng thái chỉnh sửa
    const resetForm = () => {
        setForm({ id: "", title: "", summary: "", content: "", thumbnail: "", date: "" });
        setEditingId(null);
    };

    // Xử lý lưu tin: thêm mới hoặc cập nhật
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.summary || !form.date) return;

        if (editingId) {
            setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...form, id: editingId } : item)));
        } else {
            const nextId = `N-${String(items.length + 1).padStart(3, "0")}`;
            setItems((prev) => [...prev, { ...form, id: nextId }]);
        }
        resetForm();
    };

    // Nạp dữ liệu một bản tin lên form để chỉnh sửa
    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm(item);
    };

    // Xóa một bản tin theo ID
    const handleDelete = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) resetForm();
    };

    return (
        <div className="stacked">
            {/* Tiêu đề trang & nút thêm mới tin */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Tin tức – Sự kiện</h3>
                    <p className="panel-description">tiêu đề, mô tả, nội dung, ảnh, ngày đăng</p>
                </div>
                <button className="btn primary" onClick={resetForm}>
                    Thêm mới
                </button>
            </div>

            {/* Lưới 2 cột: Danh sách tin & Form thêm / sửa */}
            <div className="admin-grid-2">
                {/* Panel: danh sách tin tức hiện có */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <span className="badge warning">{items.length} bài</span>
                    </div>
                    {/* Danh sách thẻ tin tức */}
                    <div className="list-cards">
                        {items.map((item) => (
                            <div key={item.id} className="item-card">
                                <h4>{item.title}</h4>
                                <div className="item-meta">{item.summary}</div>
                                <div className="item-meta" style={{ marginTop: 6 }}>
                                    Ngày đăng: {item.date}
                                </div>
                                <div className="card-actions">
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

                {/* Panel: form thêm mới / chỉnh sửa tin */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>{editingId ? "Chỉnh sửa" : "Thêm mới"}</h3>
                        {editingId && <span className="badge warning">Đang sửa {editingId}</span>}
                    </div>
                    {/* Form nhập nội dung tin tức */}
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
                            <div>
                                <label>Ngày đăng</label>
                                <input
                                    className="input"
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                            <label>Nội dung</label>
                            <textarea
                                className="textarea"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Ảnh đại diện (URL)</label>
                            <input
                                className="input"
                                value={form.thumbnail}
                                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                                placeholder="https://..."
                                
                            />
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
        </div>
    );
};

export default AdminTinTuc;