import React, { useState } from "react";
import CKEditorField from "../../components/common/CKEditorField";

/* ===== DỮ LIỆU MẪU ===== */
const initialNews = [
    {
        id: "N-001",
        title: "Khám phá nghệ thuật Đông Sơn",
        summary: "Tìm hiểu về nền văn hóa Đông Sơn qua các hiện vật khảo cổ.",
        content: "<p>Nền văn hóa Đông Sơn là một trong những nền văn hóa cổ đại quan trọng của Việt Nam.</p>",
        thumbnail: "",
    },
    {
        id: "N-002",
        title: "Bảo tồn di sản văn hóa phi vật thể",
        summary: "Các biện pháp bảo tồn và phát huy giá trị di sản văn hóa.",
        content: "<p>Việc bảo tồn di sản văn hóa phi vật thể đóng vai trò quan trọng trong việc duy trì bản sắc dân tộc.</p>",
        thumbnail: "",
    },
];

const AdminTinTuc = () => {
    const [items, setItems] = useState(initialNews);
    const [form, setForm] = useState({
        id: "",
        title: "",
        summary: "",
        content: "",
        thumbnail: "",
    });
    const [editingId, setEditingId] = useState(null);

    // 👉 state xem chi tiết
    const [viewItem, setViewItem] = useState(null);



    /* ===== RESET FORM ===== */
    const resetForm = () => {
        setForm({ id: "", title: "", summary: "", content: "", thumbnail: "" });
        setEditingId(null);
    };

    /* ===== SUBMIT ===== */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.summary) return;

        if (editingId) {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === editingId ? { ...form, id: editingId } : item
                )
            );
        } else {
            const nextId = `N-${String(items.length + 1).padStart(3, "0")}`;
            setItems((prev) => [...prev, { ...form, id: nextId }]);
        }

        resetForm();
    };

    /* ===== EDIT ===== */
    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm(item);
    };

    /* ===== DELETE ===== */
    const handleDelete = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) resetForm();
    };

    return (
        <div className="stacked">
            {/* ===== HEADER ===== */}
            <div className="panel-head">
                <div>
                    <h3>Tin tức</h3>
                    <p className="panel-description">
                        Quản lý tin tức: tiêu đề, mô tả, nội dung, ảnh đại diện
                    </p>
                </div>
                <button className="btn primary" onClick={resetForm}>
                    Thêm mới
                </button>
            </div>

            <div className="admin-grid-2">
                {/* ===== DANH SÁCH ===== */}
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
                                    <button
                                        className="btn secondary"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        className="btn danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <div className="empty-state">Chưa có bài viết</div>
                        )}
                    </div>
                </div>

                {/* ===== FORM ===== */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>{editingId ? "Chỉnh sửa" : "Thêm mới"}</h3>
                        {editingId && (
                            <span className="badge warning">Đang sửa {editingId}</span>
                        )}
                    </div>

                    <form className="stacked" onSubmit={handleSubmit}>
                        <div>
                            <label>Tiêu đề</label>
                            <input
                                className="input"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div>
                            <label>Mô tả ngắn</label>
                            <input
                                className="input"
                                value={form.summary}
                                onChange={(e) =>
                                    setForm({ ...form, summary: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div  >
                            <label>Nội dung</label>
                            <CKEditorField
                                value={form.content}
                                onChange={(content) =>
                                    setForm({ ...form, content })
                                }
                                placeholder="Nhập nội dung tin tức..."
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
                                    <img src={form.thumbnail} alt="preview" />
                                </div>
                            )}
                        </div>

                        <div className="responsive-stack">
                            <button className="btn primary" type="submit">
                                {editingId ? "Lưu thay đổi" : "Tạo mới"}
                            </button>
                            <button
                                className="btn secondary"
                                type="button"
                                onClick={resetForm}
                            >
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

export default AdminTinTuc;
