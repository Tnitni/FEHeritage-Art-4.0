import React, { useState, useEffect } from "react";

const VIP_STORAGE_KEY = "vipHistory";

export default function AdminPurchaseHistory() {
  const [vipHistory, setVipHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadVIPHistory();
    const interval = setInterval(loadVIPHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadVIPHistory = () => {
    const stored = localStorage.getItem(VIP_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVipHistory(Array.isArray(parsed) ? parsed : []);
      } catch {
        setVipHistory([]);
      }
    } else {
      const mockData = [
        { id: "VIP-001", userName: "Nguyễn Văn A", email: "nguyenvana@gmail.com", packageName: "Premium Cá Nhân", packagePrice: 149000, billingCycle: "monthly", purchaseDate: "2025-01-15", expiryDate: "2025-02-15", status: "active", autoRenew: true },
        { id: "VIP-002", userName: "Trần Thị B", email: "tranthib@gmail.com", packageName: "Nhà Bảo Trợ Nghệ Thuật", packagePrice: 4792000, billingCycle: "yearly", purchaseDate: "2024-12-01", expiryDate: "2025-12-01", status: "active", autoRenew: false },
        { id: "VIP-003", userName: "Lê Minh C", email: "leminhc@gmail.com", packageName: "Premium Cá Nhân", packagePrice: 1432800, billingCycle: "yearly", purchaseDate: "2024-11-20", expiryDate: "2025-01-20", status: "expired", autoRenew: false },
      ];
      localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(mockData));
      setVipHistory(mockData);
    }
  };

  const applyTimeFilter = (list) => {
    if (timeFilter === "all") return list;
    const now = new Date();
    return list.filter((item) => {
      const d = new Date(item.purchaseDate || item.expiryDate);
      if (timeFilter === "today") return d.toDateString() === now.toDateString();
      if (timeFilter === "week") return d >= new Date(now.getTime() - 7 * 86400000);
      if (timeFilter === "month") return d >= new Date(now.getTime() - 30 * 86400000);
      return true;
    });
  };

  const filteredData = applyTimeFilter(
    vipHistory.filter((item) => {
      const matchSearch =
        (item.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.packageName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === "all" || item.status === filterStatus;
      return matchSearch && matchStatus;
    })
  );

  const stats = {
    total: vipHistory.length,
    active: vipHistory.filter((item) => item.status === "active").length,
    expired: vipHistory.filter((item) => item.status === "expired").length,
    revenue: vipHistory.filter((item) => item.status === "active").reduce((sum, item) => sum + (item.packagePrice || 0), 0),
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      const updated = vipHistory.filter((item) => item.id !== deleteTarget);
      setVipHistory(updated);
      localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(updated));
      setShowDeleteModal(false);
      setDeleteTarget(null);
      showSuccess("✅ Đã xóa bản ghi lịch sử mua gói!");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ["Mã đơn", "Người dùng", "Email", "Tên gói", "Giá (₫)", "Chu kỳ", "Ngày mua", "Ngày hết hạn", "Trạng thái", "Tự động gia hạn"];
    const rows = filteredData.map((item) => [
      item.id,
      item.userName || "",
      item.email || "",
      item.packageName || "",
      (item.packagePrice || 0).toLocaleString(),
      item.billingCycle === "monthly" ? "Theo tháng" : "Theo năm",
      item.purchaseDate || "",
      item.expiryDate || "",
      item.status === "active" ? "Còn hiệu lực" : "Hết hạn",
      item.autoRenew ? "Bật" : "Tắt",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lich_su_mua_goi_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
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
    maxWidth: "440px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h3>📋 Lịch sử mua gói</h3>
          <p className="panel-description">Theo dõi lịch sử mua gói thành viên VIP / Premium tại cửa hàng</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={loadVIPHistory} className="dashboard-mock-btn">
            🔄 Làm mới
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.56rem 1.25rem",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "13px",
            }}
          >
            📊 Export CSV
          </button>
        </div>
      </div>

      <div className="dashboard-stats-row">
        <div className="dashboard-stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <h5>Tổng số giao dịch</h5>
          <div className="stat-value" style={{ color: "#87684a" }}>{stats.total}</div>
          <div className="stat-sub">Tất cả lần mua gói</div>
        </div>
        <div className="dashboard-stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <h5>Đang hoạt động</h5>
          <div className="stat-value" style={{ color: "#87684a" }}>{stats.active}</div>
          <div className="stat-sub">Gói còn hiệu lực</div>
        </div>
        <div className="dashboard-stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <h5>Đã hết hạn</h5>
          <div className="stat-value" style={{ color: "#87684a" }}>{stats.expired}</div>
          <div className="stat-sub">Gói hết hiệu lực</div>
        </div>
        <div className="dashboard-stat-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <h5>Doanh thu (gói đang hoạt động)</h5>
          <div className="stat-value" style={{ color: "#87684a" }}>{stats.revenue.toLocaleString()}₫</div>
          <div className="stat-sub">Tổng giá trị gói đang dùng</div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>🔍 Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên, email, mã đơn, tên gói..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>⏰ Thời gian</label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", "today", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: timeFilter === f ? "#2563eb" : "#e5e7eb",
                    color: timeFilter === f ? "#fff" : "#374151",
                    fontWeight: "500",
                    fontSize: "13px",
                  }}
                >
                  {f === "all" ? "Tất cả" : f === "today" ? "Hôm nay" : f === "week" ? "7 ngày" : "30 ngày"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-head">
          <h3>📦 Danh sách lịch sử mua gói</h3>
          <span className="badge success" style={{ backgroundColor: "#2563eb", color: "#fff" }}>{filteredData.length} bản ghi</span>
        </div>
        {filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
            <div style={{ fontSize: "3rem", marginBottom: "8px" }}>📭</div>
            <p style={{ fontSize: "1.05rem", fontWeight: "600", margin: "0 0 4px", color: "#374151" }}>Chưa có lịch sử mua gói</p>
            <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>Khi có người dùng mua gói VIP / Premium, dữ liệu sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "90px" }}>Mã đơn</th>
                  <th style={{ minWidth: "140px" }}>Người dùng</th>
                  <th style={{ minWidth: "140px" }}>Tên gói</th>
                  <th style={{ minWidth: "100px" }}>Giá</th>
                  <th style={{ minWidth: "100px" }}>Ngày mua</th>
                  <th style={{ minWidth: "100px" }}>Ngày hết hạn</th>
                  <th style={{ minWidth: "110px" }}>Trạng thái</th>
                  <th style={{ minWidth: "100px" }}>Tự động gia hạn</th>
                  <th style={{ minWidth: "80px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#334155", fontWeight: "600" }}>{item.id}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#374151", fontSize: "13px" }}>{item.userName || "—"}</div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.email || "—"}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#374151", fontSize: "13px" }}>{item.packageName || "—"}</div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.billingCycle === "monthly" ? "Theo tháng" : "Theo năm"}</div>
                    </td>
                    <td style={{ fontWeight: "700", color: "#f97316", fontSize: "14px" }}>{(item.packagePrice || 0).toLocaleString()}₫</td>
                    <td style={{ fontSize: "0.9rem", color: "#374151" }}>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("vi-VN") : "—"}</td>
                    <td style={{ fontSize: "0.9rem", color: "#374151" }}>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "—"}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: item.status === "active" ? "#dcfce7" : "#fee2e2",
                          color: item.status === "active" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {item.status === "active" ? "✓ Còn hiệu lực" : "✗ Hết hạn"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: item.autoRenew ? "#dbeafe" : "#f1f5f9",
                          color: item.autoRenew ? "#1e40af" : "#64748b",
                        }}
                      >
                        {item.autoRenew ? "🔄 Bật" : "⏸ Tắt"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#fecaca")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div style={overlayStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1f2937" }}>Xác nhận xóa</h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>Bạn có chắc muốn xóa bản ghi lịch sử mua gói này? Hành động không thể khôi phục.</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: "10px", backgroundColor: "#f3f4f6", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Hủy</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: "10px", backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Xóa</button>
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
