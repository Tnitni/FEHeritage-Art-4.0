import React, { useState } from "react";
import CKEditorField from "../../components/common/CKEditorField";
// Dữ liệu mock sự kiện
const initialEvents = [
    {
        id: "E-001",
        title: "Lễ hội Nghinh Ông 2024",
        summary: "Tái hiện lễ rước truyền thống tại Bình Thuận.",
        content: "<p>Sự kiện quy tụ hơn 5.000 người tham gia với nhiều hoạt động văn hóa biển.</p>",
        thumbnail: "",
    },
    {
        id: "E-002",
        title: "Triển lãm tranh Đông Hồ",
        summary: "Bộ sưu tập hơn 80 bức tranh quý hiếm.",
        content: "<p>Trưng bày kết hợp trải nghiệm thực tế ảo giúp người xem tiếp cận nghệ thuật dân gian.</p>",
        thumbnail: "",
    },
];

// Màn hình quản trị sự kiện
const AdminSuKien = () => {
    
    const [items, setItems] = useState(initialEvents);
    const [form, setForm] = useState({ id: "", title: "", summary: "", content: "", thumbnail: "" });
    const [editingId, setEditingId] = useState(null);

    // Reset lại form & trạng thái chỉnh sửa
    const resetForm = () => {
        setForm({ id: "", title: "", summary: "", content: "", thumbnail: "" });
        setEditingId(null);
    };
    const [viewItem, setViewItem] = useState(null);

    // Xử lý lưu sự kiện: thêm mới hoặc cập nhật
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.summary) return;

        if (editingId) {
            setItems((prev) => prev.map((item) => (item.id === editingId ? { ...item, ...form, id: editingId } : item)));
        } else {
            const nextId = `E-${String(items.length + 1).padStart(3, "0")}`;
            setItems((prev) => [...prev, { ...form, id: nextId }]);
        }
        resetForm();
    };

    // Nạp dữ liệu một sự kiện lên form để chỉnh sửa
    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm(item);
    };

    // Xóa một sự kiện theo ID
    const handleDelete = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) resetForm();
    };

    return (
        <div className="stacked">
            {/* Tiêu đề trang & nút thêm mới sự kiện */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Sự kiện</h3>
                    <p className="panel-description">Quản lý sự kiện: tiêu đề, mô tả, nội dung định dạng, ảnh đại diện</p>
                </div>
                <button className="btn primary" onClick={resetForm}>
                    Thêm mới
                </button>
            </div>

            {/*  cột: Danh sách sự kiện & Form thêm / sửa */}
            <div className="admin-grid-2">

                {/* Panel: danh sách sự kiện hiện có */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <span className="badge warning">{items.length} sự kiện</span>
                    </div>
                    {/* Danh sách thẻ sự kiện */}
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
                        {items.length === 0 && <div className="empty-state">Chưa có sự kiện</div>}
                    </div>
                </div>

                {/* Panel: form thêm mới / chỉnh sửa sự kiện */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>{editingId ? "Chỉnh sửa" : "Thêm mới"}</h3>
                        {editingId && <span className="badge warning">Đang sửa {editingId}</span>}
                    </div>
                    {/* Form nhập nội dung sự kiện */}
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
                                placeholder="Nhập nội dung sự kiện, sử dụng thanh công cụ để định dạng văn bản..."
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

export default AdminSuKien;
