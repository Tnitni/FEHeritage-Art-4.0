import React, { useState, useEffect } from "react";

import imgHalong from "../../assets/halong.jpg";
import imgHue from "../../assets/hue.jpg";
import imgHoankiem from "../../assets/hoankiem.jpg";
import img123 from "../../assets/123.jpg";
import imgBanner from "../../assets/banner.png";

const STORAGE_KEY = "adminProducts";
const MOCK_IMAGES = [imgHalong, imgHue, imgHoankiem, img123, imgBanner];
const CATEGORIES = ["Tranh Canvas", "Tranh Gỗ", "Tranh Sơn Dầu", "Tranh In"];
const TOPICS = ["Phong cảnh", "Chân dung", "Trừu tượng", "Di sản văn hóa"];
const STYLES = ["Cổ điển", "Hiện đại", "Dân gian", "Đương đại"];

const defaultProduct = () => ({
  id: `SP-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name: "",
  price: 0,
  image: "",
  description: "",
  stock_quantity: 0,
  status: "active",
  category: CATEGORIES[0],
  topic: TOPICS[0],
  style: STYLES[0],
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(defaultProduct());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const patched = parsed.map((p, i) => ({
          ...p,
          image: p.image && p.image.trim() ? p.image : MOCK_IMAGES[i % MOCK_IMAGES.length],
        }));
        setProducts(patched);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(patched));
      } catch {
        setProducts([]);
      }
    } else {
      const mock = [
        { ...defaultProduct(), id: "SP-001", name: "Tranh Phong cảnh Hạ Long", price: 450000, stock_quantity: 20, status: "active", category: "Tranh Canvas", topic: "Phong cảnh", style: "Hiện đại", image: MOCK_IMAGES[0], description: "Tranh in canvas chất lượng cao." },
        { ...defaultProduct(), id: "SP-002", name: "Tranh Chân dung Bác Hồ", price: 680000, stock_quantity: 0, status: "inactive", category: "Tranh Gỗ", topic: "Chân dung", style: "Cổ điển", image: MOCK_IMAGES[1], description: "Tranh gỗ điêu khắc tinh xảo." },
        { ...defaultProduct(), id: "SP-003", name: "Tranh Phong cảnh Hồ Hoàn Kiếm", price: 380000, stock_quantity: 15, status: "active", category: "Tranh In", topic: "Phong cảnh", style: "Hiện đại", image: MOCK_IMAGES[2], description: "Tranh in chất lượng cao." },
        { ...defaultProduct(), id: "SP-004", name: "Tranh Di sản Huế", price: 520000, stock_quantity: 8, status: "active", category: "Tranh Canvas", topic: "Di sản văn hóa", style: "Cổ điển", image: MOCK_IMAGES[3], description: "Tranh canvas di sản văn hóa." },
        { ...defaultProduct(), id: "SP-005", name: "Tranh Trừu tượng", price: 290000, stock_quantity: 25, status: "active", category: "Tranh Sơn Dầu", topic: "Trừu tượng", style: "Đương đại", image: MOCK_IMAGES[4], description: "Tranh sơn dầu trừu tượng." },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      setProducts(mock);
    }
  };

  const saveProducts = (list) => {
    setProducts(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filteredData = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    outOfStock: products.filter((p) => (p.stock_quantity || 0) <= 0).length,
    totalValue: products.reduce((s, p) => s + (p.price || 0) * (p.stock_quantity || 0), 0),
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultProduct());
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ ...p });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }
    if (editingProduct) {
      const updated = products.map((x) => (x.id === editingProduct.id ? { ...form } : x));
      saveProducts(updated);
      showSuccess("Đã cập nhật sản phẩm!");
    } else {
      const newProduct = { ...form, id: `SP-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
      saveProducts([...products, newProduct]);
      showSuccess("Đã thêm sản phẩm!");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      saveProducts(products.filter((p) => p.id !== deleteTarget));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      showSuccess("Đã xóa sản phẩm!");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const modalBoxStyle = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "520px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h3>Quản lý Sản phẩm</h3>
          <p className="panel-description">Theo dõi và quản lý sản phẩm cửa hàng (tranh in, danh mục, tồn kho)</p>
        </div>
        <button onClick={openAdd} className="dashboard-btn-primary">Thêm sản phẩm</button>
      </div>

      <div className="dashboard-stats-row">
        <div className="dashboard-stat-card">
          <h5>Tổng sản phẩm</h5>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Tất cả sản phẩm trong kho</div>
        </div>
        <div className="dashboard-stat-card">
          <h5>Đang bán</h5>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-sub">Sản phẩm đang hiển thị</div>
        </div>
        <div className="dashboard-stat-card">
          <h5>Hết hàng</h5>
          <div className="stat-value">{stats.outOfStock}</div>
          <div className="stat-sub">Cần nhập thêm</div>
        </div>
        <div className="dashboard-stat-card">
          <h5>Tổng giá trị kho</h5>
          <div className="stat-value">{stats.totalValue.toLocaleString()}₫</div>
          <div className="stat-sub">Theo giá × tồn kho</div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", alignItems: "end" }}>
          <div>
            <label className="dashboard-input-label">Tìm kiếm</label>
            <input
              type="text"
              className="dashboard-input"
              placeholder="Tên, mã, danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="dashboard-input-label">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="dashboard-select"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
          <div>
            <label className="dashboard-input-label">Danh mục</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="dashboard-select"
            >
              <option value="all">Tất cả</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-head">
          <h3>Danh sách sản phẩm</h3>
          <span className="badge success" style={{ backgroundColor: "#2563eb", color: "#fff" }}>{filteredData.length} sản phẩm</span>
        </div>
        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
            <p style={{ fontSize: "1.05rem", fontWeight: "600", margin: "0 0 4px", color: "#374151" }}>Chưa có sản phẩm nào</p>
            <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>Thêm sản phẩm bằng nút "Thêm sản phẩm" phía trên.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "50px" }}>#</th>
                  <th style={{ minWidth: "80px" }}>Ảnh</th>
                  <th style={{ minWidth: "140px" }}>Mã / Tên</th>
                  <th style={{ minWidth: "100px" }}>Danh mục</th>
                  <th style={{ minWidth: "100px" }}>Giá</th>
                  <th style={{ minWidth: "80px" }}>Tồn kho</th>
                  <th style={{ minWidth: "100px" }}>Trạng thái</th>
                  <th style={{ minWidth: "120px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p, index) => (
                  <tr key={p.id} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ fontWeight: "600", color: "#666", fontSize: "13px" }}>{index + 1}</td>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "8px", border: "1px solid #e0e7ff" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, background: "#e0e7ff", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#64748b" }}>—</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#666" }}>{p.id}</div>
                      <strong style={{ color: "#374151", fontSize: "13px" }}>{p.name || "—"}</strong>
                    </td>
                    <td><span style={{ fontSize: "0.9rem", color: "#374151" }}>{p.category || "—"}</span></td>
                    <td><span className="dashboard-price">{(p.price || 0).toLocaleString()}₫</span></td>
                    <td style={{ fontWeight: "600", color: (p.stock_quantity || 0) <= 0 ? "#dc2626" : "#374151" }}>{p.stock_quantity ?? 0}</td>
                    <td>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: p.status === "active" ? "#dcfce7" : "#f1f5f9",
                          color: p.status === "active" ? "#16a34a" : "#64748b",
                        }}
                      >
                        {p.status === "active" ? "Đang bán" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button onClick={() => openEdit(p)} className="dashboard-btn-edit">Sửa</button>
                        <button onClick={() => handleDelete(p.id)} className="dashboard-btn-danger">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", color: "#2563eb" }}>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="dashboard-input-label">Tên sản phẩm *</label>
                <input
                  className="dashboard-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={{ padding: "8px 10px", fontSize: "14px" }}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dashboard-input-label">Giá (₫)</label>
                  <input
                    type="number"
                    className="dashboard-input"
                    min={0}
                    value={form.price || ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))}
                    style={{ padding: "8px 10px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="dashboard-input-label">Tồn kho</label>
                  <input
                    type="number"
                    className="dashboard-input"
                    min={0}
                    value={form.stock_quantity ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) || 0 }))}
                    style={{ padding: "8px 10px", fontSize: "14px" }}
                  />
                </div>
              </div>
              <div>
                <label className="dashboard-input-label">URL ảnh</label>
                <input
                  className="dashboard-input"
                  value={form.image || ""}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  style={{ padding: "8px 10px", fontSize: "14px" }}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="dashboard-input-label">Mô tả</label>
                <textarea
                  className="dashboard-input"
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  style={{ padding: "8px 10px", fontSize: "14px", resize: "vertical" }}
                  placeholder="Mô tả ngắn"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <div>
                  <label className="dashboard-input-label">Danh mục</label>
                  <select
                    value={form.category || CATEGORIES[0]}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="dashboard-select"
                    style={{ padding: "8px 10px", fontSize: "13px" }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dashboard-input-label">Chủ đề</label>
                  <select
                    value={form.topic || TOPICS[0]}
                    onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                    className="dashboard-select"
                    style={{ padding: "8px 10px", fontSize: "13px" }}
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dashboard-input-label">Phong cách</label>
                  <select
                    value={form.style || STYLES[0]}
                    onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
                    className="dashboard-select"
                    style={{ padding: "8px 10px", fontSize: "13px" }}
                  >
                    {STYLES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="dashboard-input-label">Trạng thái</label>
                <select
                  value={form.status || "active"}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="dashboard-select"
                  style={{ padding: "8px 10px", fontSize: "13px" }}
                >
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ẩn</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} className="dashboard-mock-btn" style={{ flex: 1, padding: "10px 0" }}>Hủy</button>
              <button onClick={handleSave} className="dashboard-btn-primary" style={{ flex: 1, padding: "10px 0" }}>{editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xóa */}
      {showDeleteModal && (
        <div style={overlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1f2937" }}>Xác nhận xóa</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Bạn có chắc muốn xóa sản phẩm này? Hành động không thể khôi phục.</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowDeleteModal(false)} className="dashboard-mock-btn" style={{ flex: 1, padding: "10px 0" }}>Hủy</button>
              <button onClick={confirmDelete} className="dashboard-btn-danger" style={{ flex: 1, padding: "10px 0", background: "#ef4444", color: "#fff" }}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, pointerEvents: "none" }}>
          <div style={{ backgroundColor: "#22c55e", color: "#fff", padding: "16px 32px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontSize: "18px", fontWeight: "700" }}>{successMessage}</div>
        </div>
      )}
    </div>
  );
}
