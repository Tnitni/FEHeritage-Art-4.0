import React, { useState, useEffect } from "react";

const AdminDonate = () => {
    // ─── TAB STATE ───
    const [activeTab, setActiveTab] = useState("payment"); // "payment" | "donation"

    // ─── DONATION STATE ───
    const [donations, setDonations] = useState([]);
    const [donFilter, setDonFilter] = useState("all");
    const [donSearch, setDonSearch] = useState("");
    const [donSort, setDonSort] = useState("date-desc");

    // ─── PAYMENT STATE ───
    const [payments, setPayments] = useState([]);
    const [payFilter, setPayFilter] = useState("all");
    const [paySearch, setPaySearch] = useState("");
    const [paySort, setPaySort] = useState("date-desc");
    const [expandedPayment, setExpandedPayment] = useState(null);

    // ─── MODAL STATE ───
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // "payment" | "donation"
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [deleteAllType, setDeleteAllType] = useState(null);
    const [confirmText, setConfirmText] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // ─── LOAD DATA ───
    useEffect(() => {
        loadDonations();
        loadPayments();
        const interval = setInterval(() => { loadDonations(); loadPayments(); }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "donationHistory") loadDonations();
            if (e.key === "paymentHistory") loadPayments();
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const loadDonations = () => {
        const saved = localStorage.getItem("donationHistory");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const normalized = parsed.map(d => ({
                    ...d,
                    id: d.id || `DN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    donorName: d.donorName || "Không rõ",
                    amount: d.amount || 0,
                    method: d.method || "N/A",
                    date: d.date || new Date().toLocaleDateString("vi-VN"),
                    time: d.time || new Date().toLocaleTimeString("vi-VN"),
                    level: d.level || "Ủng hộ nhỏ"
                }));
                setDonations(normalized);
            } catch (error) {
                console.error("Error loading donations:", error);
                setDonations([]);
            }
        }
    };

    const loadPayments = () => {
        const saved = localStorage.getItem("paymentHistory");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPayments(parsed);
            } catch (error) {
                console.error("Error loading payments:", error);
                setPayments([]);
            }
        }
    };

    // ─── FILTER & SORT HELPERS ───
    const applyTimeFilter = (list, filter) => {
        const now = new Date();
        if (filter === "today") return list.filter(d => new Date(d.timestamp).toDateString() === now.toDateString());
        if (filter === "week") return list.filter(d => new Date(d.timestamp) >= new Date(now.getTime() - 7 * 86400000));
        if (filter === "month") return list.filter(d => new Date(d.timestamp) >= new Date(now.getTime() - 30 * 86400000));
        return list;
    };

    const applySort = (list, sortBy) => {
        return [...list].sort((a, b) => {
            switch (sortBy) {
                case "date-desc": return new Date(b.timestamp) - new Date(a.timestamp);
                case "date-asc": return new Date(a.timestamp) - new Date(b.timestamp);
                case "amount-desc": return (b.totalAmount || b.amount || 0) - (a.totalAmount || a.amount || 0);
                case "amount-asc": return (a.totalAmount || a.amount || 0) - (b.totalAmount || b.amount || 0);
                default: return 0;
            }
        });
    };

    // ─── FILTERED PAYMENTS ───
    const getFilteredPayments = () => {
        let filtered = applyTimeFilter(payments, payFilter);
        if (paySearch) {
            filtered = filtered.filter(p =>
                p.customerName?.toLowerCase().includes(paySearch.toLowerCase()) ||
                p.paymentMethod?.toLowerCase().includes(paySearch.toLowerCase()) ||
                p.bankName?.toLowerCase().includes(paySearch.toLowerCase()) ||
                p.items?.some(item => item.title?.toLowerCase().includes(paySearch.toLowerCase()))
            );
        }
        return applySort(filtered, paySort);
    };

    // ─── FILTERED DONATIONS ───
    const getFilteredDonations = () => {
        let filtered = applyTimeFilter(donations, donFilter);
        if (donSearch) {
            filtered = filtered.filter(d =>
                d.donorName?.toLowerCase().includes(donSearch.toLowerCase()) ||
                d.method?.toLowerCase().includes(donSearch.toLowerCase()) ||
                d.bankName?.toLowerCase().includes(donSearch.toLowerCase())
            );
        }
        return applySort(filtered, donSort);
    };

    const filteredPayments = getFilteredPayments();
    const filteredDonations = getFilteredDonations();

    // ─── COMBINED STATS ───
    const stats = {
        totalRevenue: payments.reduce((s, p) => s + (p.totalAmount || 0), 0),
        totalDonations: donations.reduce((s, d) => s + (d.amount || 0), 0),
        paymentCount: payments.length,
        donationCount: donations.length,
    };

    const levelStats = {
        "Nhà bảo trợ nghệ thuật": filteredDonations.filter(d => d.level === "Nhà bảo trợ nghệ thuật").length,
        "Ủng hộ lớn": filteredDonations.filter(d => d.level === "Ủng hộ lớn").length,
        "Ủng hộ vừa": filteredDonations.filter(d => d.level === "Ủng hộ vừa").length,
        "Ủng hộ nhỏ": filteredDonations.filter(d => d.level === "Ủng hộ nhỏ").length,
    };

    // ─── DELETE HANDLERS ───
    const handleDelete = (id, type) => {
        setDeleteTarget(id);
        setDeleteType(type);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (deleteType === "payment") {
            const updated = payments.filter(p => p.id !== deleteTarget);
            setPayments(updated);
            localStorage.setItem("paymentHistory", JSON.stringify(updated));
        } else {
            const updated = donations.filter(d => d.id !== deleteTarget);
            setDonations(updated);
            localStorage.setItem("donationHistory", JSON.stringify(updated));
        }
        setShowDeleteModal(false);
        setDeleteTarget(null);
        setDeleteType(null);
        showSuccess(deleteType === "payment" ? "✅ Đã xóa đơn hàng thành công!" : "✅ Đã xóa khoản ủng hộ thành công!");
    };

    const handleDeleteAll = (type) => {
        setDeleteAllType(type);
        setShowDeleteAllModal(true);
        setConfirmText("");
    };

    const confirmDeleteAll = () => {
        const keyword = deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA";
        if (confirmText === keyword) {
            if (deleteAllType === "payment") {
                localStorage.removeItem("paymentHistory");
                setPayments([]);
            } else {
                localStorage.removeItem("donationHistory");
                setDonations([]);
            }
            setShowDeleteAllModal(false);
            setConfirmText("");
            showSuccess(deleteAllType === "payment" ? "✅ Đã xóa toàn bộ lịch sử mua hàng!" : "✅ Đã xóa toàn bộ lịch sử ủng hộ!");
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
    };

    // ─── EXPORT CSV ───
    const handleExportCSV = (type) => {
        let headers, rows, filename;
        if (type === "payment") {
            headers = ["Mã GD", "Khách hàng", "Số mặn hàng", "Tổng tiền", "Phương thức", "Ngân hàng", "Thời gian", "Trạng thái"];
            rows = filteredPayments.map(p => [
                p.id, p.customerName, p.items?.length || 0, p.totalAmount,
                p.paymentMethod, p.bankName || "", `${p.date} ${p.time}`, p.status || "Thành công"
            ]);
            filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            headers = ["Mã GD", "Người ủng hộ", "Số tiền", "Phương thức", "Ngân hàng", "Thời gian", "Mức độ"];
            rows = filteredDonations.map(d => [
                d.id, d.isAnonymous ? "Ẩn danh" : d.donorName, d.amount,
                d.method, d.bankName || "", `${d.date} ${d.time}`, d.level
            ]);
            filename = `donations_${new Date().toISOString().split('T')[0]}.csv`;
        }
        const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    // ─── SHARED STYLES ───
    const overlayStyle = {
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    };
    const modalBoxStyle = {
        backgroundColor: "#fff", borderRadius: "16px", padding: "24px",
        maxWidth: "440px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    };

    // ─── STATUS BADGE ───
    const getStatusStyle = (status) => {
        if (status === "Thành công" || status === "completed") return { bg: "#dcfce7", color: "#16a34a" };
        if (status === "Đang xử lý" || status === "pending") return { bg: "#fef3c7", color: "#d97706" };
        if (status === "Thất bại" || status === "failed") return { bg: "#fee2e2", color: "#dc2626" };
        return { bg: "#e0e7ff", color: "#4f46e5" };
    };

    return (
        <div className="dashboard-wrapper">
            {/* ─── HEADER ─── */}
            <div className="dashboard-header">
                <div>
                    <h3>Quản lý ủng hộ & Thanh toán</h3>
                    <p className="panel-description">Theo dõi và quản lý các khoản ủng hộ & mua hàng của dự án Heritage Art 4.0</p>
                </div>
            </div>

            {/* ─── COMBINED STATS ROW ─── */}
            <div className="dashboard-stats-row">
                <div className="dashboard-stat-card" >
                    <h5>Doanh thu bán hàng</h5>
                    <div className="stat-value">{stats.totalRevenue.toLocaleString()}₫</div>
                    <div className="stat-sub">Từ {stats.paymentCount} đơn hàng</div>
                </div>

                <div className="dashboard-stat-card" >
                    <h5>Tổng ủng hộ</h5>
                    <div className="stat-value">{stats.totalDonations.toLocaleString()}₫</div>
                    <div className="stat-sub">Từ {stats.donationCount} khoản ủng hộ</div>
                </div>
                <div className="dashboard-stat-card">
                    <h5>Tổng thu</h5>
                    <div className="stat-value">{(stats.totalRevenue + stats.totalDonations).toLocaleString()}₫</div>
                    <div className="stat-sub">{stats.paymentCount + stats.donationCount} giao dịch tổng</div>
                </div>
                <div className="dashboard-stat-card">
                    <h5>Đơn hàng hôm nay</h5>
                    <div className="stat-value">
                        {payments.filter(p => new Date(p.timestamp).toDateString() === new Date().toDateString()).length}
                    </div>
                    <div className="stat-sub">Đơn hàng mới nhất</div>
                </div>
            </div>

            {/* ─── TAB SWITCHER ─── */}
            <div style={{
                display: "flex", gap: "0", background: "#fff", borderRadius: "14px",
                border: "1px solid #e0e7ff", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
                {[
                    { key: "payment", label: "Lịch sử mua hàng", count: payments.length, color: "#2563eb" },
                    { key: "donation", label: "Lịch sử ủng hộ", count: donations.length, color: "#2563eb" }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: "14px 20px", border: "none", cursor: "pointer",
                            background: activeTab === tab.key ? `linear-gradient(135deg, ${tab.color}15, ${tab.color}08)` : "transparent",
                            borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : "3px solid transparent",
                            transition: "all 0.25s ease", display: "flex", alignItems: "center",
                            justifyContent: "center", gap: "10px"
                        }}
                    >
                        <span style={{
                            fontSize: "15px", fontWeight: activeTab === tab.key ? "700" : "500",
                            color: activeTab === tab.key ? tab.color : "#64748b"
                        }}>{tab.label}</span>
                        <span style={{
                            fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px",
                            background: activeTab === tab.key ? tab.color : "#e2e8f0",
                            color: activeTab === tab.key ? "#fff" : "#64748b"
                        }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* ─── PAYMENT TAB ─── */}
            {/* ════════════════════════════════════════════════════ */}
            {activeTab === "payment" && (
                <>
                    {/* Filter Row */}
                    <div className="dashboard-panel">
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", alignItems: "end" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Lọc thời gian</label>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {["all", "today", "week", "month"].map(f => (
                                        <button key={f} onClick={() => setPayFilter(f)} style={{
                                            cursor: "pointer", padding: "6px 12px", border: "none", borderRadius: "8px",
                                            backgroundColor: payFilter === f ? "#2563eb" : "#e5e7eb",
                                            color: payFilter === f ? "#fff" : "#374151", fontWeight: "500", fontSize: "13px"
                                        }}>
                                            {f === "all" ? "Tất cả" : f === "today" ? "Hôm nay" : f === "week" ? "7 ngày" : "30 ngày"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>🔽 Sắp xếp</label>
                                <select value={paySort} onChange={e => setPaySort(e.target.value)} style={{
                                    width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer"
                                }}>
                                    <option value="date-desc">Mới nhất</option>
                                    <option value="date-asc">Cũ nhất</option>
                                    <option value="amount-desc">Số tiền giảm dần</option>
                                    <option value="amount-asc">Số tiền tăng dần</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>🔍 Tìm kiếm</label>
                                <input type="text" placeholder="Tên, sản phẩm, ngân hàng..." value={paySearch}
                                    onChange={e => setPaySearch(e.target.value)} style={{
                                        width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box"
                                    }} />
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleExportCSV("payment")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#10b981", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>📊 Export</button>
                                <button onClick={() => handleDeleteAll("payment")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#ef4444", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>Xóa tất cả</button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Table */}
                    <div className="dashboard-panel">
                        <div className="panel-head">
                            <h3>Lịch sử mua hàng</h3>
                            <span className="badge success" style={{ backgroundColor: "#2563EB", color: "#fff" }}>{filteredPayments.length} đơn</span>
                        </div>

                        {filteredPayments.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "8px" }}>📭</div>
                                <p style={{ fontSize: "1.05rem", fontWeight: "600", margin: "0 0 4px", color: "#374151" }}>Chưa có đơn hàng nào</p>
                                <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                                    {paySearch || payFilter !== "all" ? "Không tìm thấy kết quả phù hợp" : "Khi có khách hàng mua tranh, dữ liệu sẽ hiển thị tại đây"}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "40px" }}>#</th>
                                            <th style={{ minWidth: "130px" }}>Mã đơn</th>
                                            <th style={{ minWidth: "140px" }}>Khách hàng</th>
                                            <th style={{ minWidth: "80px" }}>Mặt hàng</th>
                                            <th style={{ minWidth: "120px" }}>Tổng tiền</th>
                                            <th style={{ minWidth: "120px" }}>Phương thức</th>
                                            <th style={{ minWidth: "110px" }}>Ngân hàng</th>
                                            <th style={{ minWidth: "150px" }}>Thời gian</th>
                                            <th style={{ minWidth: "110px" }}>Trạng thái</th>
                                            <th style={{ minWidth: "80px" }}>Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment, index) => {
                                            const statusStyle = getStatusStyle(payment.status);
                                            const isExpanded = expandedPayment === payment.id;
                                            return (
                                                <React.Fragment key={payment.id}>
                                                    <tr style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                        <td style={{ fontWeight: "600", color: "#666", fontSize: "13px" }}>{index + 1}</td>
                                                        <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#666" }}>
                                                            {String(payment.id).substring(0, 20)}...
                                                        </td>
                                                        <td><strong style={{ color: "#374151", fontSize: "13px" }}>{payment.customerName || "Không rõ"}</strong></td>
                                                        <td>
                                                            <button onClick={() => setExpandedPayment(isExpanded ? null : payment.id)} style={{
                                                                background: "#eef2ff", color: "#000000", border: "none",
                                                                padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem",
                                                                fontWeight: "600", cursor: "pointer"
                                                            }}>
                                                                {payment.items?.length || 0} mặt hàng {isExpanded ? "▲" : "▼"}
                                                            </button>
                                                        </td>
                                                        <td><span style={{ fontWeight: "700", color: "#000000", fontSize: "14px" }}>{(payment.totalAmount || 0).toLocaleString()}₫</span></td>
                                                        
                                                        <td>
                                                            <span style={{
                                                                padding: "3px 10px", backgroundColor: "#A8266D", color: "#fff",
                                                                borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600"
                                                            }}>{payment.paymentMethod || "N/A"}</span>
                                                        </td>
                                                        <td><span style={{ fontWeight: "500", color: "#374151", fontSize: "13px" }}>{payment.bankName || "—"}</span></td>
                                                        <td>
                                                            <div style={{ fontSize: "0.82rem", fontWeight: "500", color: "#374151" }}>📅 {payment.date}</div>
                                                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>🕐 {payment.time}</div>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem",
                                                                fontWeight: "600", background: statusStyle.bg, color: statusStyle.color
                                                            }}>{payment.status || "Thành công"}</span>
                                                        </td>
                                                        <td>
                                                            <button onClick={() => handleDelete(payment.id, "payment")} style={{
                                                                background: "#fee2e2", color: "#dc2626", border: "none",
                                                                padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
                                                                fontWeight: "600", fontSize: "0.8rem"
                                                            }}
                                                                onMouseOver={e => e.currentTarget.style.background = "#fecaca"}
                                                                onMouseOut={e => e.currentTarget.style.background = "#fee2e2"}
                                                            >Xóa</button>
                                                        </td>
                                                    </tr>
                                                    {/* Expanded Items Detail */}
                                                    {isExpanded && (
                                                        <tr style={{ backgroundColor: "#f0f4ff" }}>
                                                            <td colSpan={10} style={{ padding: "12px 16px" }}>
                                                                <div style={{
                                                                    background: "#fff", borderRadius: "10px", border: "1px solid #e0e7ff",
                                                                    padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px"
                                                                }}>
                                                                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb", marginBottom: "4px" }}>Chi tiết mặt hàng:</div>
                                                                    {payment.items?.map((item, i) => (
                                                                        <div key={i} style={{
                                                                            display: "flex", alignItems: "center", gap: "12px",
                                                                            padding: "8px 12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0"
                                                                        }}>
                                                                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151", flex: 1 }}>{item.title}</span>
                                                                            <span style={{ fontSize: "12px", color: "#000000", background: "#ede9fe", padding: "2px 8px", borderRadius: "8px" }}>{item.selectedType}</span>
                                                                            <span style={{ fontSize: "12px", color: "#666" }}>x{item.quantity}</span>
                                                                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#000000" }}>{(item.price * item.quantity).toLocaleString()}₫</span>
                                                                            <span className="dashboard-price">{(item.price * item.quantity).toLocaleString()}₫</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* ─── DONATION TAB ─── */}
            {/* ════════════════════════════════════════════════════ */}
            {activeTab === "donation" && (
                <>
                    {/* Level Stats */}
                    <div className="dashboard-panel">
                        <div className="panel-head"><h3>Thống kê theo mức độ ủng hộ</h3></div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                            {Object.entries(levelStats).map(([level, count]) => (
                                <div key={level} style={{
                                    padding: "14px 10px", background: "linear-gradient(120deg, #f8fafc 60%, #dbeafe 94%)",
                                    borderRadius: "10px", textAlign: "center", border: "0.5px solid rgb(92, 59, 30)"
                                }}>
                                    <div style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "4px" }}>{count}</div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: "500", color: "#374151" }}>{level}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="dashboard-panel">
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", alignItems: "end" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>Lọc thời gian</label>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {["all", "today", "week", "month"].map(f => (
                                        <button key={f} onClick={() => setDonFilter(f)} style={{
                                            cursor: "pointer", padding: "6px 12px", border: "none", borderRadius: "8px",
                                            backgroundColor: donFilter === f ? "#2563eb" : "#e5e7eb",
                                            color: donFilter === f ? "#fff" : "#374151", fontWeight: "500", fontSize: "13px"
                                        }}>
                                            {f === "all" ? "Tất cả" : f === "today" ? "Hôm nay" : f === "week" ? "7 ngày" : "30 ngày"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>🔽 Sắp xếp</label>
                                <select value={donSort} onChange={e => setDonSort(e.target.value)} style={{
                                    width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer"
                                }}>
                                    <option value="date-desc">Mới nhất</option>
                                    <option value="date-asc">Cũ nhất</option>
                                    <option value="amount-desc">Số tiền giảm dần</option>
                                    <option value="amount-asc">Số tiền tăng dần</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>🔍 Tìm kiếm</label>
                                <input type="text" placeholder="Tên, phương thức..." value={donSearch}
                                    onChange={e => setDonSearch(e.target.value)} style={{
                                        width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box"
                                    }} />
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleExportCSV("donation")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#10b981", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>📊 Export</button>
                                <button onClick={() => handleDeleteAll("donation")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#ef4444", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>Xóa tất cả</button>
                            </div>
                        </div>
                    </div>

                    {/* Donation Table */}
                    <div className="dashboard-panel">
                        <div className="panel-head">
                            <h3>Lịch sử ủng hộ</h3>
                            <span className="badge success" style={{ backgroundColor: "#2563EB", color: "#fff" }}>{filteredDonations.length} khoản</span>
                        </div>

                        {filteredDonations.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#999" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "8px" }}>📭</div>
                                <p style={{ fontSize: "1.05rem", fontWeight: "600", margin: "0 0 4px", color: "#374151" }}>Chưa có khoản ủng hộ nào</p>
                                <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
                                    {donSearch || donFilter !== "all" ? "Không tìm thấy kết quả phù hợp" : "Khi có người ủng hộ, dữ liệu sẽ hiển thị tại đây"}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th style={{ minWidth: "40px" }}>#</th>
                                            <th style={{ minWidth: "120px" }}>Mã GD</th>
                                            <th style={{ minWidth: "150px" }}>Người ủng hộ</th>
                                            <th style={{ minWidth: "110px" }}>Số tiền</th>
                                            <th style={{ minWidth: "120px" }}>Phương thức</th>
                                            <th style={{ minWidth: "110px" }}>Ngân hàng</th>
                                            <th style={{ minWidth: "140px" }}>Thời gian</th>
                                            <th style={{ minWidth: "140px" }}>Mức độ</th>
                                            <th style={{ minWidth: "80px" }}>Xóa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDonations.map((donation, index) => (
                                            <tr key={donation.id} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                <td style={{ fontWeight: "600", color: "#666", fontSize: "13px" }}>{index + 1}</td>
                                                <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#666" }}>{String(donation.id).substring(0, 18)}...</td>
                                                <td>
                                                    {donation.isAnonymous ? (
                                                        <span style={{ fontStyle: "italic", color: "#999", fontSize: "13px" }}>🎭 Ẩn danh</span>
                                                    ) : (
                                                        <strong style={{ color: "#374151", fontSize: "13px" }}>{donation.donorName}</strong>
                                                    )}
                                                </td>

                                                <td><span style={{ fontWeight: "700", color: "#000000", fontSize: "14px" }}>{donation.amount.toLocaleString()}₫</span></td>
                                               
                                                <td>
                                                    <span style={{
                                                        padding: "3px 10px", backgroundColor: "#A8266D", color: "#fff",
                                                        borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600"
                                                    }}>{donation.method}</span>
                                                </td>
                                                <td>
                                                    {donation.bankName ? (
                                                        <span style={{ fontWeight: "500", color: "#374151", fontSize: "13px" }}>{donation.bankName}</span>
                                                    ) : <span style={{ color: "#999" }}>—</span>}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: "0.82rem", fontWeight: "500", color: "#374151" }}>📅 {donation.date}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>🕐 {donation.time}</div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600",
                                                        background: "linear-gradient(120deg, #f8fafc 60%, #ede9fe 94%)", color: "#000000"
                                                    }}>{donation.level}</span>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete(donation.id, "donation")} style={{
                                                        background: "#fee2e2", color: "#dc2626", border: "none",
                                                        padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem"
                                                    }}
                                                        onMouseOver={e => e.currentTarget.style.background = "#fecaca"}
                                                        onMouseOut={e => e.currentTarget.style.background = "#fee2e2"}
                                                    >Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ─── MODAL: XÓA 1 KHOẢN ─── */}
            {showDeleteModal && (
                <div style={overlayStyle} onClick={() => setShowDeleteModal(false)}>
                    <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
                            <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1f2937" }}>Xác nhận xóa</h3>
                            <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                                Bạn có chắc muốn xóa {deleteType === "payment" ? "đơn hàng" : "khoản ủng hộ"} này?
                            </p>
                            <p style={{ margin: "6px 0 0", color: "#dc2626", fontSize: "13px" }}>Hành động này không thể khôi phục!</p>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{
                                flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                                backgroundColor: "#f3f4f6", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                            }}>Hủy</button>
                            <button onClick={confirmDelete} style={{
                                flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                                backgroundColor: "#ef4444", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                            }}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── MODAL: XÓA TẤT CẢ ─── */}
            {showDeleteAllModal && (
                <div style={overlayStyle} onClick={() => setShowDeleteAllModal(false)}>
                    <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}></div>
                            <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "15px", fontWeight: "600" }}>
                                Xóa toàn bộ lịch sử {deleteAllType === "payment" ? "mua hàng" : "ủng hộ"}?
                            </p>
                            <p style={{ margin: 0, color: "#dc2626", fontSize: "13px", fontWeight: "600" }}>Không thể khôi phục!</p>
                        </div>
                        <div style={{
                            backgroundColor: "#fefce8", border: "2px solid #fde047",
                            borderRadius: "10px", padding: "16px", marginBottom: "20px"
                        }}>
                            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151" }}>
                                Nhập <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#dc2626" }}>
                                    {deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA"}
                                </span> để xác nhận:
                            </p>
                            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
                                placeholder={deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA"}
                                style={{
                                    width: "100%", padding: "8px 12px", border: "2px solid #d1d5db",
                                    borderRadius: "8px", fontSize: "14px", fontFamily: "monospace",
                                    textAlign: "center", boxSizing: "border-box", outline: "none"
                                }} />
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => { setShowDeleteAllModal(false); setConfirmText(""); }} style={{
                                flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                                backgroundColor: "#f3f4f6", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                            }}>Hủy</button>
                            <button onClick={confirmDeleteAll}
                                disabled={confirmText !== (deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA")}
                                style={{
                                    flex: 1, padding: "10px 0", border: "none", borderRadius: "10px",
                                    backgroundColor: confirmText === (deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA") ? "#ef4444" : "#d1d5db",
                                    color: confirmText === (deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA") ? "#fff" : "#6b7280",
                                    fontWeight: "600", fontSize: "14px",
                                    cursor: confirmText === (deleteAllType === "payment" ? "XOA PAYMENT" : "XOA TAT CA") ? "pointer" : "not-allowed"
                                }}>Xóa tất cả</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── TOAST ─── */}
            {showSuccessModal && (
                <div style={{
                    position: "fixed", inset: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 9999, pointerEvents: "none"
                }}>
                    <div style={{
                        backgroundColor: "#22c55e", color: "#fff", padding: "16px 32px",
                        borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        fontSize: "18px", fontWeight: "700"
                    }}>{successMessage}</div>
                </div>
            )}
        </div>
    );
};

export default AdminDonate;