import React, { useState, useEffect } from "react";

import imgHalong from "../../assets/halong.jpg";
import imgHue from "../../assets/hue.jpg";
import imgHoankiem from "../../assets/hoankiem.jpg";
import img123 from "../../assets/123.jpg";
import imgBanner from "../../assets/banner.png";

const STORAGE_KEY = "adminSouvenirs";
const MOCK_IMAGES = [imgHalong, imgHue, imgHoankiem, img123, imgBanner];

// Cấu hình cho đồ lưu niệm
const CATEGORIES = ["Áo thun", "Cốc/Ly", "Túi vải", "Móc khóa", "Tranh mini", "Digital Art", "Nón lá", "Postcard", "Bookmark", "Magnet", "Đèn lồng", "Balo"];
const TOPICS = ["Di tích lịch sử", "Văn hóa", "Phố cổ", "Thiên nhiên"];
const STYLES = ["Cổ điển", "Hiện đại", "Trừu tượng", "Thiên nhiên"];

const defaultProduct = () => ({
  id: Date.now(),
  title: "",
  price: {},
  images: {},
  description: "",
  category: CATEGORIES[0],
  type: "souvenir",
  souvenirType: CATEGORIES[0],
  style: STYLES[0],
  details: {
    warrantyType: "Bảo hành 30 ngày",
    warrantyPeriod: "30 ngày",
    style: STYLES[0],
    material: "",
    origin: "Việt Nam",
    shipFrom: "Hà Nội, Việt Nam"
  }
});

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tất cả");
  const [filterTopic, setFilterTopic] = useState("Tất cả");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(defaultProduct());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState("all");

  // State cho price options
  const [priceOptions, setPriceOptions] = useState([
    { key: "Size S", value: 0 },
  ]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProducts(parsed);
      } catch {
        setProducts([]);
      }
    } else {
      // Mock data mẫu
      const mock = [
        {
          id: 1001,
          title: "Áo Thun In Hình Cố Đô Huế",
          category: "Di tích lịch sử",
          type: "souvenir",
          souvenirType: "Áo Thun",
          style: "Cổ điển",
          description: "Áo thun cotton 100% in hình Cố Đô Huế với chất lượng cao, thiết kế độc đáo.",
          price: {
            "Size S": 250000,
            "Size M": 250000,
            "Size L": 280000,
            "Size XL": 300000,
          },
          images: {
            "Size S": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            "Size M": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            "Size L": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            "Size XL": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
          },
          details: {
            warrantyType: "Bảo hành 30 ngày lỗi nhà sản xuất",
            warrantyPeriod: "30 ngày",
            style: "Cổ điển",
            material: "Cotton 100%",
            origin: "Việt Nam",
            shipFrom: "Huế, Việt Nam"
          }
        },
        {
          id: 1002,
          title: "Cốc Nghệ Thuật Chùa Một Cột",
          category: "Văn hóa",
          type: "souvenir",
          souvenirType: "Cốc/Ly",
          style: "Hiện đại",
          description: "Cốc sứ cao cấp in hình Chùa Một Cột, thiết kế tinh tế, phù hợp làm quà tặng.",
          price: {
            "Cốc Nhỏ": 120000,
            "Cốc Vừa": 150000,
            "Cốc Lớn": 180000,
          },
          images: {
            "Cốc Nhỏ": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
            "Cốc Vừa": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
            "Cốc Lớn": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
          },
          details: {
            warrantyType: "Bảo hành 60 ngày lỗi vỡ do nhà sản xuất",
            warrantyPeriod: "60 ngày",
            style: "Hiện đại",
            material: "Sứ cao cấp",
            origin: "Việt Nam",
            shipFrom: "Hà Nội, Việt Nam"
          }
        },
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
    const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "Tất cả" || p.category === filterCategory;
    const matchTopic = filterTopic === "Tất cả" || p.souvenirType === filterTopic;
    return matchSearch && matchCategory && matchTopic;
  });

  // 🔹 SỬA STATS - TÍNH TỔNG GIÁ TRỊ TẤT CẢ SẢN PHẨM
  const stats = {
    total: products.length,
    categories: new Set(products.map(p => p.souvenirType)).size,
    // Tính tổng giá trị của tất cả các tùy chọn giá trong tất cả sản phẩm
    totalValue: products.reduce((sum, p) => {
      const allPrices = Object.values(p.price);
      const productTotal = allPrices.reduce((pSum, price) => pSum + price, 0);
      return sum + productTotal;
    }, 0),
    avgPrice: products.length > 0 ? products.reduce((sum, p) => {
      const firstPrice = Object.values(p.price)[0] || 0;
      return sum + firstPrice;
    }, 0) / products.length : 0,
  };

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultProduct());
    setPriceOptions([{ key: "Size S", value: 0 }]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ ...p });
    // Convert price object to array for editing
    const options = Object.entries(p.price).map(([key, value]) => ({ key, value }));
    setPriceOptions(options.length > 0 ? options : [{ key: "Size S", value: 0 }]);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title?.trim()) {
      alert("Vui lòng nhập tên sản phẩm.");
      return;
    }

    // Convert price options array back to object
    const priceObj = {};
    const imagesObj = {};
    priceOptions.forEach(opt => {
      if (opt.key.trim()) {
        priceObj[opt.key] = opt.value;
        imagesObj[opt.key] = form.images[opt.key] || MOCK_IMAGES[0];
      }
    });

    const finalProduct = {
      ...form,
      price: priceObj,
      images: imagesObj,
    };

    if (editingProduct) {
      const updated = products.map((x) => (x.id === editingProduct.id ? finalProduct : x));
      saveProducts(updated);
      showSuccess("✅ Đã cập nhật sản phẩm!");
    } else {
      const newProduct = { ...finalProduct, id: Date.now() };
      saveProducts([...products, newProduct]);
      showSuccess("✅ Đã thêm sản phẩm!");
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
      showSuccess("✅ Đã xóa sản phẩm!");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  // Price options handlers
  const addPriceOption = () => {
    setPriceOptions([...priceOptions, { key: "", value: 0 }]);
  };

  const removePriceOption = (index) => {
    if (priceOptions.length > 1) {
      setPriceOptions(priceOptions.filter((_, i) => i !== index));
    }
  };

  const updatePriceOption = (index, field, value) => {
    const updated = [...priceOptions];
    updated[index][field] = field === 'value' ? Number(value) : value;
    setPriceOptions(updated);
  };

  // Export Excel
  const openExportModal = () => {
    setShowExportModal(true);
    setExportRange("all");
  };

  const handleExportExcel = () => {
    let dataToExport = exportRange === "all" 
      ? products 
      : products.filter(p => p.category === exportRange);

    if (dataToExport.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // 🔹 TÍNH TỔNG CỘNG
    const totalSum = dataToExport.reduce((sum, p) => {
      const allPrices = Object.values(p.price);
      const productTotal = allPrices.reduce((pSum, price) => pSum + price, 0);
      return sum + productTotal;
    }, 0);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
        .summary { background: white; padding: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; border-left: 3px solid #9333ea; border-right: 3px solid #9333ea; }
        .summary-item { padding: 15px; background: #faf5ff; border-radius: 8px; border-left: 4px solid #9333ea; }
        .summary-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
        .summary-value { font-size: 24px; font-weight: 700; color: #333; }
        table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 0 0 10px 10px; }
        thead { background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%); color: white; }
        th { padding: 15px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
        tbody tr:hover { background: #faf5ff; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .price { font-weight: 700; color: #9333ea; text-align: right; }
        .total-row { background: #fef3c7 !important; font-weight: 700; border-top: 3px solid #9333ea; }
        .total-row td { font-size: 16px; padding: 18px 12px; }
        .footer { margin-top: 30px; padding: 20px; background: white; border-radius: 10px; text-align: center; color: #666; font-size: 12px; border: 2px solid #e0e0e0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎁 BÁO CÁO ĐỒ LƯU NIỆM</h1>
        <p>Heritage Art 4.0 - Quản Lý Đồ Lưu Niệm</p>
        <p>Xuất ngày: ${new Date().toLocaleDateString("vi-VN", { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</p>
    </div>
    <div class="summary">
        <div class="summary-item">
            <div class="summary-label">Tổng sản phẩm</div>
            <div class="summary-value">${dataToExport.length}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Danh mục</div>
            <div class="summary-value">${new Set(dataToExport.map(p => p.souvenirType)).size}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Loại xuất</div>
            <div class="summary-value" style="font-size: 16px;">
                ${exportRange === "all" ? "Toàn bộ" : exportRange}
            </div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Tổng giá trị</div>
            <div class="summary-value" style="color: #9333ea;">${totalSum.toLocaleString()}₫</div>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Loại</th>
                <th>Chủ đề</th>
                <th>Phong cách</th>
                <th>Giá (từ)</th>
                <th>Tùy chọn giá</th>
            </tr>
        </thead>
        <tbody>
            ${dataToExport.map((p, i) => {
              const priceEntries = Object.entries(p.price);
              const minPrice = Math.min(...Object.values(p.price));
              const priceOptions = priceEntries.map(([k, v]) => `${k}: ${v.toLocaleString()}₫`).join(", ");
              return `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${p.title || "—"}</strong></td>
                <td>${p.souvenirType || "—"}</td>
                <td>${p.category || "—"}</td>
                <td>${p.style || "—"}</td>
                <td class="price">${minPrice.toLocaleString()}₫</td>
                <td style="font-size: 12px; color: #666;">${priceOptions}</td>
            </tr>
            `;
            }).join('')}
            <tr class="total-row">
                <td colspan="5" style="text-align: right;">🔸 TỔNG CỘNG</td>
                <td colspan="2" class="price" style="font-size: 18px; color: #9333ea;">${totalSum.toLocaleString()}₫</td>
            </tr>
        </tbody>
    </table>
    <div class="footer">
        <p><strong>Heritage Art 4.0</strong> - Dự án Bảo Tồn và Phát Triển Nghệ Thuật Truyền Thống Việt Nam</p>
        <p>Báo cáo đồ lưu niệm được tạo tự động từ hệ thống quản lý</p>
        <p style="margin-top: 10px; color: #999; font-size: 11px;">© ${new Date().getFullYear()} Heritage Art 4.0. All rights reserved.</p>
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DoLuuNiem_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();

    setShowExportModal(false);
    showSuccess(`✅ Đã xuất ${dataToExport.length} sản phẩm thành công!`);
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
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h3>🎁 Quản lý Đồ Lưu Niệm</h3>
          <p className="panel-description">Theo dõi và quản lý đồ lưu niệm cửa hàng</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={openExportModal} style={{
            background: "#10b981", color: "#fff", border: "none", borderRadius: "8px",
            padding: "8px 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px"
          }}>📊 Xuất Excel</button>
          <button onClick={openAdd} style={{
            background: "#9333ea", color: "#fff", border: "none", borderRadius: "8px",
            padding: "8px 16px", cursor: "pointer", fontWeight: "600", fontSize: "14px"
          }}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div className="dashboard-stats-row">
        <div className="dashboard-stat-card">
          <h5>Tổng sản phẩm</h5>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Đồ lưu niệm</div>
        </div>
        <div className="dashboard-stat-card">
          <h5>Danh mục</h5>
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-sub">Loại sản phẩm khác nhau</div>
        </div>
        <div className="dashboard-stat-card">
          <h5>Tổng giá trị</h5>
          <div className="stat-value">{Math.round(stats.totalValue).toLocaleString()}₫</div>
          <div className="stat-sub">Tổng tất cả sản phẩm</div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div>
            <label className="dashboard-input-label">Tìm kiếm</label>
            <input
              type="text"
              className="dashboard-input"
              placeholder="Tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="dashboard-input-label">Chủ đề</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="dashboard-select"
            >
              <option value="Tất cả">Tất cả</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="dashboard-input-label">Loại sản phẩm</label>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="dashboard-select"
            >
              <option value="Tất cả">Tất cả</option>
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
          <span className="badge success" style={{ backgroundColor: "#9333ea", color: "#fff" }}>{filteredData.length} sản phẩm</span>
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
                  <th style={{ minWidth: "200px" }}>Tên sản phẩm</th>
                  <th style={{ minWidth: "100px" }}>Loại</th>
                  <th style={{ minWidth: "100px" }}>Chủ đề</th>
                  <th style={{ minWidth: "100px" }}>Giá (từ)</th>
                  <th style={{ minWidth: "200px" }}>Tùy chọn giá</th>
                  <th style={{ minWidth: "120px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p, index) => {
                  const firstImage = Object.values(p.images)[0] || MOCK_IMAGES[0];
                  const minPrice = Math.min(...Object.values(p.price));
                  const priceOptions = Object.entries(p.price).map(([k, v]) => `${k}: ${v.toLocaleString()}₫`).join(", ");
                  
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "#666" }}>{index + 1}</td>
                      <td>
                        <img src={firstImage} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "8px" }} />
                      </td>
                      <td><strong>{p.title || "—"}</strong></td>
                      <td>{p.souvenirType || "—"}</td>
                      <td>{p.category || "—"}</td>
                      <td><span className="dashboard-price">{minPrice.toLocaleString()}₫</span></td>
                      <td><span style={{ fontSize: "12px", color: "#666" }}>{priceOptions}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => openEdit(p)} className="dashboard-btn-edit">Sửa</button>
                          <button onClick={() => handleDelete(p.id)} className="dashboard-btn-danger">Xóa</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Export */}
      {showExportModal && (
        <div style={overlayStyle} onClick={() => setShowExportModal(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: "450px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: "20px", color: "#1e293b" }}>📊 Xuất báo cáo Excel</h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>Chọn loại để xuất</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={() => setExportRange("all")}
                style={{
                  padding: "12px 16px",
                  border: exportRange === "all" ? "2px solid #9333ea" : "1px solid #e2e8f0",
                  borderRadius: "8px",
                  background: exportRange === "all" ? "#faf5ff" : "#fff",
                  color: exportRange === "all" ? "#9333ea" : "#64748b",
                  cursor: "pointer",
                  fontWeight: exportRange === "all" ? "600" : "500",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>📦 Toàn bộ sản phẩm</span>
                <span style={{ 
                  background: exportRange === "all" ? "#9333ea" : "#e2e8f0",
                  color: exportRange === "all" ? "#fff" : "#64748b",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>{products.length}</span>
              </button>
              
              {TOPICS.map(topic => {
                const count = products.filter(p => p.category === topic).length;
                return (
                  <button
                    key={topic}
                    onClick={() => setExportRange(topic)}
                    style={{
                      padding: "12px 16px",
                      border: exportRange === topic ? "2px solid #9333ea" : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      background: exportRange === topic ? "#faf5ff" : "#fff",
                      color: exportRange === topic ? "#9333ea" : "#64748b",
                      cursor: "pointer",
                      fontWeight: exportRange === topic ? "600" : "500",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between"
                    }}
                  >
                    <span>{topic}</span>
                    <span style={{ 
                      background: exportRange === topic ? "#9333ea" : "#e2e8f0",
                      color: exportRange === topic ? "#fff" : "#64748b",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "700"
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowExportModal(false)} style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                backgroundColor: "#f3f4f6", color: "#374151", fontWeight: "600", cursor: "pointer"
              }}>Hủy</button>
              <button onClick={handleExportExcel} style={{
                flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff", fontWeight: "600", cursor: "pointer"
              }}>📥 Tải xuống</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", color: "#9333ea" }}>
              {editingProduct ? "Sửa sản phẩm" : "Thêm đồ lưu niệm mới"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="dashboard-input-label">Tên sản phẩm *</label>
                <input
                  className="dashboard-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dashboard-input-label">Loại sản phẩm</label>
                  <select
                    value={form.souvenirType}
                    onChange={(e) => setForm((f) => ({ ...f, souvenirType: e.target.value }))}
                    className="dashboard-select"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dashboard-input-label">Chủ đề</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="dashboard-select"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dashboard-input-label">Phong cách</label>
                  <select
                    value={form.style}
                    onChange={(e) => setForm((f) => ({ ...f, style: e.target.value, details: { ...f.details, style: e.target.value } }))}
                    className="dashboard-select"
                  >
                    {STYLES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="dashboard-input-label">Mô tả</label>
                <textarea
                  className="dashboard-input"
                  value={form.description || ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Mô tả sản phẩm"
                />
              </div>

              {/* Price Options */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className="dashboard-input-label" style={{ margin: 0 }}>Tùy chọn giá & ảnh</label>
                  <button
                    onClick={addPriceOption}
                    style={{
                      padding: "4px 12px",
                      background: "#9333ea",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    + Thêm tùy chọn
                  </button>
                </div>
                {priceOptions.map((opt, index) => (
                  <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <input
                      className="dashboard-input"
                      placeholder="Tên (VD: Size S)"
                      value={opt.key}
                      onChange={(e) => updatePriceOption(index, 'key', e.target.value)}
                      style={{ padding: "6px 8px", fontSize: "13px" }}
                    />
                    <input
                      type="number"
                      className="dashboard-input"
                      placeholder="Giá"
                      value={opt.value}
                      onChange={(e) => updatePriceOption(index, 'value', e.target.value)}
                      style={{ padding: "6px 8px", fontSize: "13px" }}
                    />
                    <button
                      onClick={() => removePriceOption(index)}
                      disabled={priceOptions.length === 1}
                      style={{
                        padding: "6px",
                        background: priceOptions.length === 1 ? "#e5e7eb" : "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: priceOptions.length === 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>

              {/* Image URL for each price option */}
              <div>
                <label className="dashboard-input-label">URL ảnh cho từng tùy chọn</label>
                {priceOptions.map((opt, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <input
                      className="dashboard-input"
                      placeholder={`URL ảnh cho "${opt.key || 'tùy chọn ' + (index + 1)}"`}
                      value={form.images[opt.key] || ""}
                      onChange={(e) => setForm((f) => ({
                        ...f,
                        images: { ...f.images, [opt.key]: e.target.value }
                      }))}
                      style={{ padding: "6px 8px", fontSize: "13px" }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="dashboard-input-label">Chất liệu</label>
                  <input
                    className="dashboard-input"
                    value={form.details.material}
                    onChange={(e) => setForm((f) => ({ ...f, details: { ...f.details, material: e.target.value } }))}
                    placeholder="VD: Cotton 100%"
                  />
                </div>
                <div>
                  <label className="dashboard-input-label">Giao hàng từ</label>
                  <input
                    className="dashboard-input"
                    value={form.details.shipFrom}
                    onChange={(e) => setForm((f) => ({ ...f, details: { ...f.details, shipFrom: e.target.value } }))}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} className="dashboard-mock-btn" style={{ flex: 1, padding: "10px 0" }}>Hủy</button>
              <button onClick={handleSave} style={{
                flex: 1,
                padding: "10px 0",
                background: "#9333ea",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}>{editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}</button>
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
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Bạn có chắc muốn xóa sản phẩm này?</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowDeleteModal(false)} className="dashboard-mock-btn" style={{ flex: 1, padding: "10px 0" }}>Hủy</button>
              <button onClick={confirmDelete} className="dashboard-btn-danger" style={{ flex: 1, padding: "10px 0" }}>Xóa</button>
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