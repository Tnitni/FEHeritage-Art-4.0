import React, { useState, useEffect } from "react";

export default function AdminVIP() {
  const [vipHistory, setVipHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    loadVIPHistory();
    
    // Kiểm tra gói hết hạn mỗi phút
    const interval = setInterval(() => {
      checkExpiredPackages();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load lịch sử VIP từ localStorage
  const loadVIPHistory = () => {
    const stored = localStorage.getItem("vipHistory");
    if (stored) {
      const parsed = JSON.parse(stored);
      setVipHistory(parsed);
    } else {
      // Mock data mẫu
      const mockData = [
        {
          id: "VIP-001",
          userName: "Nguyễn Văn A",
          email: "nguyenvana@gmail.com",
          packageName: "Premium Cá Nhân",
          packagePrice: 149000,
          billingCycle: "monthly",
          purchaseDate: "2025-01-15",
          expiryDate: "2025-02-15",
          status: "active",
          autoRenew: true,
        },
        {
          id: "VIP-002",
          userName: "Trần Thị B",
          email: "tranthib@gmail.com",
          packageName: "Nhà Bảo Trợ Nghệ Thuật",
          packagePrice: 4792000,
          billingCycle: "yearly",
          purchaseDate: "2024-12-01",
          expiryDate: "2025-12-01",
          status: "active",
          autoRenew: false,
        },
        {
          id: "VIP-003",
          userName: "Lê Minh C",
          email: "leminhc@gmail.com",
          packageName: "Premium Cá Nhân",
          packagePrice: 1432800,
          billingCycle: "yearly",
          purchaseDate: "2024-11-20",
          expiryDate: "2025-01-20",
          status: "expired",
          autoRenew: false,
        },
        {
          id: "VIP-004",
          userName: "Phạm Hồng D",
          email: "phamhongd@gmail.com",
          packageName: "Premium Cá Nhân",
          packagePrice: 149000,
          billingCycle: "monthly",
          purchaseDate: "2025-01-25",
          expiryDate: "2025-02-25",
          status: "active",
          autoRenew: true,
        },
      ];
      localStorage.setItem("vipHistory", JSON.stringify(mockData));
      setVipHistory(mockData);
    }
  };

  // Kiểm tra và cập nhật gói hết hạn
  const checkExpiredPackages = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updated = vipHistory.map((item) => {
      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate < today && item.status === "active") {
        return { ...item, status: "expired" };
      }
      return item;
    });

    const hasChanges = JSON.stringify(updated) !== JSON.stringify(vipHistory);
    if (hasChanges) {
      setVipHistory(updated);
      localStorage.setItem("vipHistory", JSON.stringify(updated));
    }
  };

  // Xóa bản ghi
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử này?")) {
      const updated = vipHistory.filter((item) => item.id !== id);
      setVipHistory(updated);
      localStorage.setItem("vipHistory", JSON.stringify(updated));
    }
  };

  // Lọc dữ liệu
  const filteredData = vipHistory.filter((item) => {
    const matchSearch =
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Thống kê
  const stats = {
    total: vipHistory.length,
    active: vipHistory.filter((item) => item.status === "active").length,
    expired: vipHistory.filter((item) => item.status === "expired").length,
    revenue: vipHistory
      .filter((item) => item.status === "active")
      .reduce((sum, item) => sum + item.packagePrice, 0),
  };

  return (
    <div style={{minHeight: "100vh", padding: "2rem 1.5rem" }}>
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
              📦 Quản lý Gói Thành Viên VIP
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.99rem", margin: 0 }}>
              Theo dõi và quản lý lịch sử nâng cấp gói VIP của người dùng
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={loadVIPHistory}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.75rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              background: "linear-gradient(120deg, #f8fafc 60%, #dbeafe 94%)",
              borderRadius: "1rem",
              padding: "1.2rem 1rem 1.4rem 1.3rem",
              boxShadow: "0 2px 10px 0 #b6c7de28",
              border: "1px solid #dbebff",
            }}
          >
            <h5 style={{ fontSize: "1.08rem", margin: "0 0 0.25rem 0", fontWeight: "700", color: "#87684a" }}>
              Tổng số gói
            </h5>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "0.01em", color: "#5c3b1e" }}>
              {stats.total}
            </div>
            <div style={{ color: "#5c3b1e", fontSize: "0.97rem", fontWeight: "500" }}>Tất cả gói đã đăng ký</div>
          </div>

          <div
            style={{
              background: "linear-gradient(120deg, #f8fafc 60%, #dbeafe 94%)",
              borderRadius: "1rem",
              padding: "1.2rem 1rem 1.4rem 1.3rem",
              boxShadow: "0 2px 10px 0 #b6c7de28",
              border: "1px solid #00A24E",
            }}
          >
            <h5 style={{ fontSize: "1.08rem", margin: "0 0 0.25rem 0", fontWeight: "700", color: "#87684a" }}>
              Đang hoạt động
            </h5>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "0.01em", color: "#87684a" }}>
              {stats.active}
            </div>
            <div style={{ color: "#87684a", fontSize: "0.97rem", fontWeight: "500" }}>Gói còn hiệu lực</div>
          </div>

          <div
            style={{
              background: "linear-gradient(120deg, #f8fafc 60%, #dbeafe 94%)",
              borderRadius: "1rem",
              padding: "1.2rem 1rem 1.4rem 1.3rem",
              boxShadow: "0 2px 10px 0 #b6c7de28",
              border: "1px solid #E41C11",
            }}
          >
            <h5 style={{ fontSize: "1.08rem", margin: "0 0 0.25rem 0", fontWeight: "700", color: "#87684a" }}>
              Đã hết hạn
            </h5>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "0.01em", color: "#87684a" }}>
              {stats.expired}
            </div>
            <div style={{ color: "#87684a", fontSize: "0.97rem", fontWeight: "500" }}>Gói hết hiệu lực</div>
          </div>

          <div
            style={{
              background: "linear-gradient(120deg, #f8fafc 60%, #dbeafe 94%)",
              borderRadius: "1rem",
              padding: "1.2rem 1rem 1.4rem 1.3rem",
              boxShadow: "0 2px 10px 0 #b6c7de28",
              border: "1px solid #dbebff",
            }}
          >
            <h5 style={{ fontSize: "1.08rem", margin: "0 0 0.25rem 0", fontWeight: "700", color: "#87684a" }}>
              Doanh thu
            </h5>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "0.01em", color: "#5c3b1e" }}>
              {stats.total}
            </div>
            <div style={{ color: "#5c3b1e", fontSize: "0.97rem", fontWeight: "500" }}>Tất cả gói đã đăng ký</div>
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
            placeholder="🔍 Tìm theo tên, email, mã đơn..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Đã hết hạn</option>
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
                fontSize: "1rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f1f5fe" }}>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Mã đơn
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Người dùng
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Tên gói
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Giá
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Ngày mua
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "left",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Ngày hết hạn
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "center",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Trạng thái
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "center",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Tự động gia hạn
                  </th>
                  <th
                    style={{
                      padding: "0.7em 0.5em",
                      textAlign: "center",
                      color: "#1e293b",
                      fontWeight: "600",
                      borderBottom: "2px solid #e0e7ff",
                      fontSize: "0.98rem",
                    }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "2rem 0",
                        color: "#94a3b8",
                        fontSize: "1.05rem",
                      }}
                    >
                      Không tìm thấy dữ liệu
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #e0e7ff",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155", fontWeight: "600" }}>
                        {item.id}
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                        <div style={{ fontWeight: "600" }}>{item.userName}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.email}</div>
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                        <div style={{ fontWeight: "600" }}>{item.packageName}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {item.billingCycle === "monthly" ? "Theo tháng" : "Theo năm"}
                        </div>
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155", fontWeight: "600" }}>
                        {item.packagePrice.toLocaleString()}₫
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                        {new Date(item.purchaseDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", color: "#334155" }}>
                        {new Date(item.expiryDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.17em 0.7em",
                            borderRadius: "99em",
                            fontSize: "0.9em",
                            fontWeight: "600",
                            background: item.status === "active" ? "#d1fae5" : "#fee2e2",
                            color: item.status === "active" ? "#065f46" : "#991b1b",
                          }}
                        >
                          {item.status === "active" ? "✓ Còn hiệu lực" : "✗ Hết hạn"}
                        </span>
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.17em 0.7em",
                            borderRadius: "99em",
                            fontSize: "0.9em",
                            fontWeight: "600",
                            background: item.autoRenew ? "#dbeafe" : "#f1f5f9",
                            color: item.autoRenew ? "#1e40af" : "#64748b",
                          }}
                        >
                          {item.autoRenew ? "🔄 Bật" : "⏸ Tắt"}
                        </span>
                      </td>
                      <td style={{ padding: "0.45em 0.4em", fontSize: "0.97rem", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: "#fee2e2",
                            border: "1.2px solid #fecaca",
                            color: "#ef4444",
                            padding: "0.45em 1.1em",
                            borderRadius: "0.6em",
                            cursor: "pointer",
                            fontSize: "0.97em",
                            fontWeight: "500",
                            transition: "background 0.14s",
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "#fecaca")}
                          onMouseLeave={(e) => (e.target.style.background = "#fee2e2")}
                        >
                          🗑 Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}