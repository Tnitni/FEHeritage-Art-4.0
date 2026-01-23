import React, { useEffect, useMemo, useState } from "react";
import CKEditorField from "../../components/common/CKEditorField";

/* ===== DỮ LIỆU MẪU ===== */
const initialCulture = [
    {
        id: "C-01",
        title: "Nghệ thuật Chăm pa",
        topic: "Văn hóa",
        period: "Thế kỷ 7 - 15",
        image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80",
        content: "<p>Điêu khắc đá và kiến trúc tháp gạch đặc sắc của vương quốc Chăm pa.</p>",
    },
    {
        id: "C-02",
        title: "Khởi nghĩa Lam Sơn",
        topic: "Lịch sử",
        period: "1418 - 1427",
        image: "https://images.unsplash.com/photo-1478088702442-5a17d94b241c?auto=format&fit=crop&w=600&q=80",
        content: "<p>Cuộc khởi nghĩa giải phóng dân tộc, đặt nền móng cho triều đại Hậu Lê.</p>",
    },
];

const topics = [
    { label: "Văn hóa", value: "Văn hóa" },
    { label: "Lịch sử", value: "Lịch sử" },
];

const emptyForm = {
    id: "",
    title: "",
    topic: "Văn hóa",
    period: "",
    image: "",
    content: "",
};

const AdminVanHoaLichSu = () => {
    const [items, setItems] = useState(initialCulture);
    const [selectedId, setSelectedId] = useState(initialCulture[0]?.id || null);
    const [form, setForm] = useState(emptyForm);
    const [viewItem, setViewItem] = useState(null);

    const selected = useMemo(
        () => items.find((i) => i.id === selectedId),
        [items, selectedId]
    );

    /* ===== đồng bộ form khi đổi item ===== */
    useEffect(() => {
        if (selected) setForm(selected);
    }, [selectedId]); // ❗ không phụ thuộc items

    /* ===== LƯU ===== */
    const updateItem = (e) => {
        e.preventDefault();
        if (!selected) return;

        setItems((prev) =>
            prev.map((i) => (i.id === selected.id ? { ...form } : i))
        );
    };

    /* ===== XÓA ===== */
    const deleteItem = (id) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (id === selectedId) {
            setSelectedId(null);
            setForm(emptyForm);
        }
    };

    return (
        <div className="stacked">
            {/* ===== HEADER ===== */}
            <div className="panel-head">
                <div>
                    <h3>Hành trình lịch sử</h3>
                    <p className="panel-description">
                        Quản lý nội dung văn hóa – lịch sử
                    </p>
                </div>
            </div>

            <div className="admin-grid-2">
                {/* ===== DANH SÁCH ===== */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <span className="badge warning">{items.length} nội dung</span>
                    </div>

                    <div className="list-cards">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="item-card"
                                onClick={() => setSelectedId(item.id)}
                                style={{ cursor: "pointer" }}
                            >
                                <h4>{item.title}</h4>
                                <div className="item-meta">
                                    {item.topic} • {item.period}
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewItem(item);
                                        }}
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button
                                        className="btn secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(item.id);
                                        }}
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        className="btn danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem(item.id);
                                        }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== FORM ===== */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Chi tiết & chỉnh sửa</h3>
                        {selected && <span className="badge success">{selected.topic}</span>}
                    </div>

                    {selected ? (
                        <form className="stacked" onSubmit={updateItem}>
                            <div className="form-grid">
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
                                    <label>Chủ đề</label>
                                    <select
                                        className="select"
                                        value={form.topic}
                                        onChange={(e) =>
                                            setForm({ ...form, topic: e.target.value })
                                        }
                                    >
                                        {topics.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Thời gian</label>
                                    <input
                                        className="input"
                                        value={form.period}
                                        onChange={(e) =>
                                            setForm({ ...form, period: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label>Nội dung chi tiết</label>
                                <CKEditorField
                                    value={form.content}
                                    onChange={(content) =>
                                        setForm({ ...form, content })
                                    }
                                />
                            </div>

                            <div>
                                <label>Hình ảnh</label>
                                <input
                                    className="input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            setForm({ ...form, image: url });
                                        }
                                    }}
                                />
                                {form.image && (
                                    <div className="thumb-preview thumb-preview-inline">
                                        <img src={form.image} alt="preview" />
                                    </div>
                                )}
                            </div>

                            <div className="responsive-stack">
                                <button className="btn primary" type="submit">
                                    Lưu cập nhật
                                </button>
                                <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={() => setForm(selected)}
                                >
                                    Hoàn tác
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="empty-state">Chọn nội dung để chỉnh sửa</div>
                    )}
                </div>
            </div>

            {/* ===== MODAL ===== */}
            {viewItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-head">
                            <h3>{viewItem.title}</h3>
                            <button
                                className="btn ghost"
                                onClick={() => setViewItem(null)}
                            >
                                Đóng
                            </button>
                        </div>

                        {viewItem.image && (
                            <img
                                src={viewItem.image}
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

                        <p style={{ opacity: 0.7 }}>
                            {viewItem.topic} • {viewItem.period}
                        </p>

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

export default AdminVanHoaLichSu;
