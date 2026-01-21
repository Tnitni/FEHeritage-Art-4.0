import React, { useEffect, useMemo, useState } from "react";

// Dữ liệu mock nội dung văn hóa – lịch sử
const initialCulture = [
    {
        id: "C-01",
        title: "Nghệ thuật Chăm pa",
        topic: "Văn hóa",
        period: "Thế kỷ 7 - 15",
        image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=600&q=80",
        content: "Điêu khắc đá và kiến trúc tháp gạch đặc sắc của vương quốc Chăm pa.",
    },
    {
        id: "C-02",
        title: "Khởi nghĩa Lam Sơn",
        topic: "Lịch sử",
        period: "1418 - 1427",
        image: "https://images.unsplash.com/photo-1478088702442-5a17d94b241c?auto=format&fit=crop&w=600&q=80",
        content: "Cuộc khởi nghĩa giải phóng dân tộc, đặt nền móng cho triều đại Hậu Lê.",
    },
];

// Các chủ đề phân loại nội dung
const topics = [
    { label: "Văn hóa", value: "Văn hóa" },
    { label: "Lịch sử", value: "Lịch sử" },
];

// Mẫu form rỗng để reset / khởi tạo
const emptyForm = { title: "", topic: "Văn hóa", period: "", image: "", content: "" };

// Màn hình quản trị nội dung Văn hóa – Lịch sử
const AdminVanHoaLichSu = () => {
    const [items, setItems] = useState(initialCulture);
    const [selectedId, setSelectedId] = useState(initialCulture[0]?.id || null);
    const [form, setForm] = useState(emptyForm);

    // Nội dung đang được chọn để hiển thị & chỉnh sửa
    const selected = useMemo(() => items.find((i) => i.id === selectedId), [items, selectedId]);

    // Khi chọn item mới thì đồng bộ dữ liệu vào form
    useEffect(() => {
        if (selected) {
            setForm(selected);
        }
    }, [selected]);

    // Lưu cập nhật nội dung đang chỉnh sửa
    const updateItem = (e) => {
        e.preventDefault();
        if (!selected) return;
        setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...selected, ...form } : i)));
    };

    // Chọn một nội dung để xem chi tiết & sửa
    const onSelect = (item) => {
        setSelectedId(item.id);
        setForm(item);
    };

    return (
        <div className="stacked">
            {/* Tiêu đề trang nội dung Văn hóa – Lịch sử */}
            <div className="panel-head">
                <div>
                    <h3 style={{ margin: 0 }}>Văn hóa – Lịch sử</h3>
                    <p className="panel-description">Quản lý nội dung, chỉnh sửa và cập nhật hình ảnh</p>
                </div>
            </div>

            {/* cột: Danh sách & Form chi tiết */}
            <div className="admin-grid-2">
                {/* Panel: danh sách nội dung */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Danh sách</h3>
                        <span className="badge warning">{items.length} nội dung</span>
                    </div>
                    {/* Thẻ hiển thị từng nội dung văn hóa – lịch sử */}
                    <div className="list-cards">
                        {items.map((item) => (
                            <div key={item.id} className="item-card" onClick={() => onSelect(item)} style={{ cursor: "pointer" }}>
                                <h4>{item.title}</h4>
                                <div className="item-meta">
                                    Chủ đề: {item.topic} • Thời gian: {item.period}
                                </div>
                                <div className="item-meta" style={{ marginTop: 6 }}>
                                    {item.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel: chi tiết & form chỉnh sửa nội dung */}
                <div className="admin-panel">
                    <div className="panel-head">
                        <h3>Chi tiết & chỉnh sửa</h3>
                        {selected && <span className="badge success">{selected.topic}</span>}
                    </div>

                    {selected ? (
                        /* Form chỉnh sửa thông tin chi tiết */
                        <form className="stacked" onSubmit={updateItem}>
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
                                    <label>Chủ đề</label>
                                    <select
                                        className="select"
                                        value={form.topic}
                                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
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
                                        onChange={(e) => setForm({ ...form, period: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label>Nội dung chi tiết</label>
                                <textarea
                                    className="textarea"
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label>Hình ảnh (URL)</label>
                                <input
                                    className="input"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="responsive-stack">
                                <button className="btn primary" type="submit">
                                    Lưu cập nhật
                                </button>
                                <button className="btn secondary" type="button" onClick={() => setForm(selected)}>
                                    Hoàn tác
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="empty-state">Chọn nội dung để chỉnh sửa</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminVanHoaLichSu;
