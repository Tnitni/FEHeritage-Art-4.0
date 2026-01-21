import React, { useState } from "react";

const initialArticles = [
    {
        id: "A-01",
        title: "Bảo tồn di sản số: Cơ hội và thách thức",
        author: "Phạm Thu Thảo",
        content: "Phân tích cách số hóa giúp tiếp cận di sản và những rủi ro khi phụ thuộc vào công nghệ.",
        date: "2025-01-14",
    },
    {
        id: "A-02",
        title: "Góc nhìn: Du lịch di sản bền vững",
        author: "Ngô Minh Quân",
        content: "Đề xuất mô hình cộng đồng tham gia quản lý và chia sẻ lợi ích từ du lịch văn hóa.",
        date: "2024-12-30",
    },
];

const emptyForm = { title: "", author: "", content: "", date: "" };

const AdminPhanTich = () => {
    const [articles, setArticles] = useState(initialArticles);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.author || !form.date) return;

        if (editingId) {
            setArticles((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form, id: editingId } : a)));
        } else {
            const nextId = `A-${String(articles.length + 1).padStart(2, "0")}`;
            setArticles((prev) => [...prev, { ...form, id: nextId }]);
        }
        setForm(emptyForm);
        setEditingId(null);
    };

    const onEdit = (item) => {
        setEditingId(item.id);
        setForm(item);
    };

    const onDelete = (id) => {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setForm(emptyForm);
        }
    };

    return (
        <div className="stacked">
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Phân tích – Góc nhìn</h3>
                    <p className="panel-description"> (tiêu đề, nội dung, tác giả, ngày)</p>
                </div>
                <button className="btn primary" onClick={() => onEdit({ ...emptyForm })}>
                    Thêm bài phân tích
                </button>
            </div>

            <div className="admin-grid-2">
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Bài viết</h3>
                        <span className="badge warning">{articles.length} bài</span>
                    </div>
                    <div className="stacked">
                        {articles.map((item) => (
                            <div key={item.id} className="item-card">
                                <h4>{item.title}</h4>
                                <div className="item-meta">Tác giả: {item.author}</div>
                                <div className="item-meta">Ngày đăng: {item.date}</div>
                                <p style={{ marginTop: 8, color: "#5f422a" }}>{item.content}</p>
                                <div className="responsive-stack" style={{ marginTop: 10 }}>
                                    <button className="btn secondary" onClick={() => onEdit(item)}>
                                        Chỉnh sửa
                                    </button>
                                    <button className="btn danger" onClick={() => onDelete(item.id)}>
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                        {articles.length === 0 && <div className="empty-state">Chưa có bài viết</div>}
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>{editingId ? "Cập nhật bài viết" : "Soạn bài mới"}</h3>
                        {editingId && <span className="badge warning">Đang sửa {editingId}</span>}
                    </div>
                    <form className="stacked" onSubmit={onSubmit}>
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
                                <label>Tác giả</label>
                                <input
                                    className="input"
                                    value={form.author}
                                    onChange={(e) => setForm({ ...form, author: e.target.value })}
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
                            <label>Nội dung</label>
                            <textarea
                                className="textarea"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                required
                            />
                        </div>

                        <div className="responsive-stack">
                            <button className="btn primary" type="submit">
                                {editingId ? "Lưu thay đổi" : "Xuất bản mock"}
                            </button>
                            <button
                                className="btn secondary"
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setForm(emptyForm);
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminPhanTich;