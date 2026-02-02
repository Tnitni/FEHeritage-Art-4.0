import React, { useState, useEffect } from "react";

export default function AdminVIP() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  
  // ─── TOAST STATE ───
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // ─── MODAL STATE ───
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // ĐỊNH NGHĨA GÓI VIP (Master Data)
  const VIP_TIERS = {
    free: {
      name: "Miễn Phí (Freemium)",
      priceMonthly: 0,
      priceYearly: 0,
      color: "#9ca3af"
    },
    premium: {
      name: "Premium Cá Nhân",
      priceMonthly: 149000,
      priceYearly: 1432000, // 149k * 12 * 0.8 (giảm 20%)
      color: "#f97316"
    },
    patron: {
      name: "Nhà Bảo Trợ Nghệ Thuật",
      priceMonthly: 499000,
      priceYearly: 4792000, // 499k * 12 * 0.8 (giảm 20%)
      color: "#ef4444"
    }
  };

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    loadSubscriptions();

    // Kiểm tra gói hết hạn mỗi phút
    const interval = setInterval(() => {
      checkExpiredSubscriptions();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load danh sách subscriptions từ localStorage
  const loadSubscriptions = () => {
    const stored = localStorage.getItem("subscriptions");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSubscriptions(parsed);
    } else {
      // Mock data mẫu theo cấu trúc ERD
      const mockData = [
        {
          id: 1,
          user_id: 101,
          userName: "Huy Huy",
          userEmail: "giabao0009@gmail.com",
          tier: "premium",
          assignDate: "2026-01-31",
          expirationDate: "2026-03-03",
          cancelled_at: null,
          next_billing_date: "2026-03-03",
          payment_method: "momo",
          ai_generation_limit: -1, // unlimited
          ai_generations_used: 245,
          limit_reset_at: "2026-03-01",
          status: "active"
        },
        {
          id: 2,
          user_id: 102,
          userName: "Em Huy",
          userEmail: "giahuyjdol11122004@gmail.com",
          tier: "premium",
          assignDate: "2026-01-31",
          expirationDate: "2027-01-31",
          cancelled_at: null,
          next_billing_date: "2027-01-31",
          payment_method: "bank_transfer",
          ai_generation_limit: -1,
          ai_generations_used: 1523,
          limit_reset_at: "2026-02-01",
          status: "active"
        },
        {
          id: 3,
          user_id: 103,
          userName: "Nguyễn Văn A",
          userEmail: "nguyenvana@gmail.com",
          tier: "patron",
          assignDate: "2025-12-01",
          expirationDate: "2026-12-01",
          cancelled_at: null,
          next_billing_date: "2026-12-01",
          payment_method: "credit_card",
          ai_generation_limit: -1,
          ai_generations_used: 3421,
          limit_reset_at: "2026-02-01",
          status: "active"
        },
        {
          id: 4,
          user_id: 104,
          userName: "Trần Thị B",
          userEmail: "tranthib@gmail.com",
          tier: "free",
          assignDate: "2026-01-15",
          expirationDate: null,
          cancelled_at: null,
          next_billing_date: null,
          payment_method: null,
          ai_generation_limit: 10,
          ai_generations_used: 7,
          limit_reset_at: "2026-02-02",
          status: "active"
        },
      ];
      localStorage.setItem("subscriptions", JSON.stringify(mockData));
      setSubscriptions(mockData);
    }
  };

  // Kiểm tra và cập nhật gói hết hạn
  const checkExpiredSubscriptions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = subscriptions.map((item) => {
      if (!item.expirationDate) return item;
      
      const expiryDate = new Date(item.expirationDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today && item.status === "active") {
        return { ...item, status: "expired" };
      }
      return item;
    });

    const hasChanges = JSON.stringify(updated) !== JSON.stringify(subscriptions);
    if (hasChanges) {
      setSubscriptions(updated);
      localStorage.setItem("subscriptions", JSON.stringify(updated));
    }
  };

  // ─── TOAST HELPER ───
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  // ─── DELETE HANDLERS ───
  const handleDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const updated = subscriptions.filter((item) => item.id !== deleteTarget);
    setSubscriptions(updated);
    localStorage.setItem("subscriptions", JSON.stringify(updated));
    setShowDeleteModal(false);
    setDeleteTarget(null);
    showSuccess("✅ Đã xóa subscription thành công!");
  };

  // ─── EDIT HANDLERS ───
  const handleEdit = (subscription) => {
    setEditingSubscription({ ...subscription });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    const updated = subscriptions.map((item) =>
      item.id === editingSubscription.id ? editingSubscription : item
    );
    setSubscriptions(updated);
    localStorage.setItem("subscriptions", JSON.stringify(updated));
    setShowEditModal(false);
    setEditingSubscription(null);
    showSuccess("✅ Đã cập nhật subscription thành công!");
  };

  // ─── CANCEL SUBSCRIPTION ───
  const handleCancel = (id) => {
    const updated = subscriptions.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          cancelled_at: new Date().toISOString().split('T')[0],
          status: "cancelled"
        };
      }
      return item;
    });
    setSubscriptions(updated);
    localStorage.setItem("subscriptions", JSON.stringify(updated));
    showSuccess("✅ Đã hủy subscription!");
  };

  // Lọc dữ liệu
  const filteredData = subscriptions.filter((item) => {
    const matchSearch =
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm);

    const matchTier = filterTier === "all" || item.tier === filterTier;

    return matchSearch && matchTier;
  });

// Tính billing cycle - DI CHUYỂN LÊN TRƯỚC
  const getBillingCycle = (subscription) => {
    if (!subscription.assignDate || !subscription.expirationDate) return "-";
    
    const assign = new Date(subscription.assignDate);
    const expiry = new Date(subscription.expirationDate);
    const diffMonths = (expiry.getFullYear() - assign.getFullYear()) * 12 + 
                       (expiry.getMonth() - assign.getMonth());
    
    return diffMonths >= 12 ? "Năm" : "Tháng";
  };

  // Bây giờ stats mới có thể sử dụng getBillingCycle
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((i) => i.status === "active").length,
    expired: subscriptions.filter((i) => i.status === "expired").length,
    cancelled: subscriptions.filter((i) => i.status === "cancelled").length,
    premium: subscriptions.filter((i) => i.tier === "premium" && i.status === "active").length,
    patron: subscriptions.filter((i) => i.tier === "patron" && i.status === "active").length,

    revenue: subscriptions.reduce((sum, item) => {
      if (item.status !== "active") return sum;

      const tier = VIP_TIERS[item.tier];
      if (!tier) return sum;

      const cycle = getBillingCycle(item); // ✅ Bây giờ đã OK
      const price = cycle === "Năm" ? tier.priceYearly : tier.priceMonthly;

      return sum + (price || 0);
    }, 0),
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: "1rem 1rem 0 0",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #bae6fd",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "bold",
                color: "#2563eb",
                margin: "0 0 0.25rem 0",
              }}
            >
              Quản lý gói thành viên VIP
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.99rem", margin: 0 }}>
              Theo dõi và quản lý đăng ký gói VIP của người dùng
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                loadSubscriptions();
                showSuccess("✅ Đã làm mới dữ liệu!");
              }}
              style={{
                background: "#e9ecf2",
                color: "#2673b8",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.56rem 1.25rem",
                cursor: "pointer",
                fontWeight: "500",
                boxShadow: "0 2px 6px 0 #e0e7ef88",
                transition: "background 0.14s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#e3e8ee")}
              onMouseLeave={(e) => (e.target.style.background = "#e9ecf2")}
            >
              🔄 Làm mới
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.75rem",
            marginTop: "1rem",
          }}
        >
          <div className="dashboard-stat-card-vip">
            <h5 style={{ color: "#87684a" }}>Tổng số gói</h5>
            <div className="stat-value" style={{ color: "#87684a" }}>{stats.total}</div>
            <div className="stat-sub" style={{ color: "#87684a" }}>Tất cả đăng ký</div>
          </div>

          <div className="dashboard-stat-card-vip active">
            <h5 style={{ color: "#87684a" }}>Đang hoạt động</h5>
            <div className="stat-value" style={{ color: "#87684a" }}>{stats.active}</div>
            <div className="stat-sub" style={{ color: "#87684a" }}>Gói đang hoạt động</div>
          </div>

          <div className="dashboard-stat-card-vip">
            <h5 style={{ color: "#87684a" }}>Premium</h5>
            <div className="stat-value" style={{ color: "#87684a" }}>{stats.premium}</div>
            <div className="stat-sub" style={{ color: "#87684a" }}>Gói Premium</div>
          </div>

          <div className="dashboard-stat-card-vip">
            <h5 style={{ color: "#87684a" }}>Bảo trợ nghệ thuật</h5>
            <div className="stat-value" style={{ color: "#87684a" }}>{stats.patron}</div>
            <div className="stat-sub" style={{ color: "#87684a" }}>Gói Bảo trợ nghệ thuật</div>
          </div>

          <div className="dashboard-stat-card-vip expired">
            <h5 style={{ color: "#87684a" }}>Đã hết hạn</h5>
            <div className="stat-value" style={{ color: "#87684a" }}>{stats.expired}</div>
            <div className="stat-sub" style={{ color: "#87684a" }}>Hết hạn</div>
          </div>
        </div>

        {/* Filter & Search */}
        <div
          style={{
            background: "#fff",
            padding: "1rem 1.5rem",
            marginTop: "1rem",
            borderRadius: "0.75rem",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
            border: "1px solid #e0e7ff",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: "1 1 300px",
              padding: "0.6em 1em",
              fontSize: "1em",
              borderRadius: "0.5em",
              border: "1.2px solid #bfdbfe",
              background: "#f8fafc",
              color: "#0c2860",
              outline: "none",
            }}
          />
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            style={{
              padding: "0.6em 1em",
              fontSize: "1em",
              borderRadius: "0.5em",
              border: "1.2px solid #bfdbfe",
              background: "#f8fafc",
              color: "#0c2860",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">Tất cả gói</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="patron">Bảo Trợ Nghệ Thuật</option>
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background: "#fff",
            borderRadius: "0 0 1rem 1rem",
            padding: "1.5rem",
            marginTop: "1rem",
            boxShadow: "0 2px 10px 0 #dbeafe5e",
            border: "1px solid #dbebff",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5fe" }}>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "center", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", width: "80px", maxWidth: "80px" }}>
                    ID
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "left", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "180px" }}>
                    Tên người dùng
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "left", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "140px" }}>
                    Gói
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "right", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "100px" }}>
                    Giá
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "center", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", width: "70px" }}>
                    Chu kỳ
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "left", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "100px" }}>
                    Ngày đăng ký
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "left", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "100px" }}>
                    Ngày hết hạn
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "center", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "90px" }}>
                    AI Gen
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "center", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", minWidth: "100px" }}>
                    Trạng thái
                  </th>
                  <th style={{ padding: "0.7em 0.5em", textAlign: "center", color: "#1e293b", fontWeight: "600", borderBottom: "2px solid #e0e7ff", fontSize: "0.98rem", width: "150px", minWidth: "150px" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8", fontSize: "1.05rem" }}>
                      Không tìm thấy dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const tierInfo = VIP_TIERS[item.tier] || {};
                    const cycle = getBillingCycle(item);
                    const price = cycle === "Năm" ? tierInfo.priceYearly : tierInfo.priceMonthly;
                    
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid #e0e7ff",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td 
                          style={{ 
                            padding: "0.45em 0.4em", 
                            fontSize: "0.97rem", 
                            color: "#334155", 
                            fontWeight: "600", 
                            textAlign: "center",
                            maxWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                          title={`VIP-${item.id}`}
                        >
                          {truncateText(`VIP-${item.id}`, 12)}
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                          <div style={{ fontWeight: "600" }}>{item.userName}</div>
                          <div 
                            style={{ 
                              fontSize: "0.85rem", 
                              color: "#64748b",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                            title={item.userEmail}
                          >
                            {truncateText(item.userEmail, 25)}
                          </div>
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.2em 0.8em",
                              borderRadius: "99em",
                              fontSize: "0.9em",
                              fontWeight: "600",
                              background: tierInfo.color + "22",
                              color: tierInfo.color,
                            }}
                          >
                            {tierInfo.name || item.tier}
                          </span>
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155", fontWeight: "600", textAlign: "right" }}>
                          {price ? `${price.toLocaleString()}₫` : "-"}
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155", textAlign: "center" }}>
                          {cycle}
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                          {item.assignDate ? new Date(item.assignDate).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                          {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString("vi-VN") : "-"}
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155", textAlign: "center" }}>
                          <div style={{ fontSize: "0.85em" }}>
                            {item.ai_generation_limit === -1 ? "∞" : `${item.ai_generation_limit}`}
                          </div>
                          <div style={{ fontSize: "0.75em", color: "#64748b" }}>
                            Đã dùng: {item.ai_generations_used}
                          </div>
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.17em 0.7em",
                              borderRadius: "99em",
                              fontSize: "0.9em",
                              fontWeight: "600",
                              background:
                                item.status === "active" ? "#d1fae5" :
                                item.status === "cancelled" ? "#fef3c7" : "#fee2e2",
                              color:
                                item.status === "active" ? "#065f46" :
                                item.status === "cancelled" ? "#92400e" : "#991b1b",
                            }}
                          >
                            {item.status === "active" ? "✓ Active" :
                             item.status === "cancelled" ? "⏸ Cancelled" : "✗ Expired"}
                          </span>
                        </td>
                        <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center", alignItems: "center" }}>
                            <button
                              onClick={() => handleEdit(item)}
                              style={{
                                background: "#dbeafe",
                                border: "1.2px solid #bfdbfe",
                                color: "#1e40af",
                                padding: "0.25em 0.5em",
                                borderRadius: "0.4em",
                                cursor: "pointer",
                                fontSize: "0.8em",
                                fontWeight: "500",
                                transition: "background 0.14s",
                                whiteSpace: "nowrap",
                                minWidth: "40px"
                              }}
                            >
                              Sửa
                            </button>
                            {item.status === "active" && (
                              <button
                                onClick={() => handleCancel(item.id)}
                                style={{
                                  background: "#fef3c7",
                                  border: "1.2px solid #fde047",
                                  color: "#92400e",
                                  padding: "0.25em 0.5em",
                                  borderRadius: "0.4em",
                                  cursor: "pointer",
                                  fontSize: "0.8em",
                                  fontWeight: "500",
                                  transition: "background 0.14s",
                                  whiteSpace: "nowrap",
                                  minWidth: "40px"
                                }}
                              >
                                Hủy
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(item.id)}
                              style={{
                                background: "#fee2e2",
                                border: "1.2px solid #fecaca",
                                color: "#ef4444",
                                padding: "0.25em 0.5em",
                                borderRadius: "0.4em",
                                cursor: "pointer",
                                fontSize: "0.8em",
                                fontWeight: "500",
                                transition: "background 0.14s",
                                whiteSpace: "nowrap",
                                minWidth: "40px"
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MODAL: EDIT SUBSCRIPTION ─── */}
      {showEditModal && editingSubscription && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "540px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: "20px", color: "#1f2937", textAlign: "center" }}>
              ✏️ Chỉnh sửa Subscription
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  User ID
                </label>
                <input
                  type="number"
                  value={editingSubscription.user_id}
                  disabled
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    background: "#f3f4f6",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Tier
                </label>
                <select
                  value={editingSubscription.tier}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, tier: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="patron">Patron</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    Ngày đăng ký
                  </label>
                  <input
                    type="date"
                    value={editingSubscription.assignDate || ""}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, assignDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "2px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                    Ngày hết hạn
                  </label>
                  <input
                    type="date"
                    value={editingSubscription.expirationDate || ""}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, expirationDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "2px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  AI Generation Limit (-1 = unlimited)
                </label>
                <input
                  type="number"
                  value={editingSubscription.ai_generation_limit}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, ai_generation_limit: parseInt(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Payment Method
                </label>
                <select
                  value={editingSubscription.payment_method || ""}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, payment_method: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Chọn phương thức</option>
                  <option value="momo">MoMo</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="credit_card">Thẻ tín dụng</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
                  Status
                </label>
                <select
                  value={editingSubscription.status}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "2px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSubscription(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={saveEdit}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE ─── */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "440px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1f2937" }}>
                Xác nhận xóa
              </h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                Bạn có chắc muốn xóa subscription này?
              </p>
              <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "13px" }}>
                Hành động này không thể khôi phục!
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST NOTIFICATION ─── */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "#22c55e",
              color: "#fff",
              padding: "16px 32px",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            {successMessage}
          </div>
        </div>
      )}
    </div>
  );
}