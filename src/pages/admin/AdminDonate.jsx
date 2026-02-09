import React, { useState, useEffect } from "react";

const AdminDonate = () => {
    // ─── SECURITY STATE ───
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [pinError, setPinError] = useState("");
    const ADMIN_PIN = "1234"; 

    // ─── TAB STATE ───
    const [activeTab, setActiveTab] = useState("payment");

    // ─── DONATION STATE ───
    const [donations, setDonations] = useState([]);
    const [donFilter, setDonFilter] = useState("all");
    const [donSearch, setDonSearch] = useState("");
    const [donSort, setDonSort] = useState("date-desc");
    const [donAmountFilter, setDonAmountFilter] = useState("all"); // Lọc theo khoảng tiền

    // ─── PAYMENT STATE ───
    const [payments, setPayments] = useState([]);
    const [payFilter, setPayFilter] = useState("all");
    const [paySearch, setPaySearch] = useState("");
    const [paySort, setPaySort] = useState("date-desc");
    const [expandedPayment, setExpandedPayment] = useState(null);

    // ─── EXPORT MODAL STATE ───
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportType, setExportType] = useState(null);
    const [exportRange, setExportRange] = useState("all");
    const [exportStartDate, setExportStartDate] = useState("");
    const [exportEndDate, setExportEndDate] = useState("");

    // ─── MODAL STATE ───
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
    const [deleteAllType, setDeleteAllType] = useState(null);
    const [confirmText, setConfirmText] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // ─── HELPER: Phân loại mức ủng hộ theo số tiền ───
    const getAmountLevel = (amount) => {
        const amountInThousands = amount / 1000; // Chuyển sang nghìn
        if (amountInThousands < 100) return "Ủng hộ nhỏ";
        if (amountInThousands < 500) return "Ủng hộ vừa";
        if (amountInThousands < 1000) return "Ủng hộ lớn";
        return "Nhà bảo trợ nghệ thuật";
    };

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
                const normalized = parsed.map(d => {
                    const amount = d.amount || 0;
                    return {
                        ...d,
                        id: d.id || `DN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        donorName: d.donorName || "Không rõ",
                        amount: amount,
                        method: d.method || "N/A",
                        date: d.date || new Date().toLocaleDateString("vi-VN"),
                        time: d.time || new Date().toLocaleTimeString("vi-VN"),
                        level: getAmountLevel(amount) // Tự động tính level theo số tiền
                    };
                });
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

    // ─── PIN AUTHENTICATION ───
    const handlePinSubmit = () => {
        if (pinInput === ADMIN_PIN) {
            setIsAuthenticated(true);
            setPinError("");
            setPinInput("");
        } else {
            setPinError("Mã PIN không chính xác!");
            setPinInput("");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setActiveTab("payment");
        setPinInput("");
        setPinError("");
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

    // ─── FILTERED DONATIONS (CÓ LỌC THEO SỐ TIỀN) ───
    const getFilteredDonations = () => {
        let filtered = applyTimeFilter(donations, donFilter);
        
        // Lọc theo tìm kiếm
        if (donSearch) {
            filtered = filtered.filter(d =>
                d.donorName?.toLowerCase().includes(donSearch.toLowerCase()) ||
                d.method?.toLowerCase().includes(donSearch.toLowerCase()) ||
                d.bankName?.toLowerCase().includes(donSearch.toLowerCase())
            );
        }

        // Lọc theo khoảng số tiền
        if (donAmountFilter !== "all") {
            filtered = filtered.filter(d => {
                const amountInThousands = (d.amount || 0) / 1000;
                switch (donAmountFilter) {
                    case "small": return amountInThousands < 100; // 0-99k
                    case "medium": return amountInThousands >= 100 && amountInThousands < 500; // 100-499k
                    case "large": return amountInThousands >= 500 && amountInThousands < 1000; // 500-999k
                    case "patron": return amountInThousands >= 1000; // 1000k+
                    default: return true;
                }
            });
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
        "Nhà bảo trợ nghệ thuật": donations.filter(d => getAmountLevel(d.amount) === "Nhà bảo trợ nghệ thuật").length,
        "Ủng hộ lớn": donations.filter(d => getAmountLevel(d.amount) === "Ủng hộ lớn").length,
        "Ủng hộ vừa": donations.filter(d => getAmountLevel(d.amount) === "Ủng hộ vừa").length,
        "Ủng hộ nhỏ": donations.filter(d => getAmountLevel(d.amount) === "Ủng hộ nhỏ").length,
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

    // ─── EXPORT EXCEL ───
    const openExportModal = (type) => {
        setExportType(type);
        setShowExportModal(true);
        setExportRange("all");
        setExportStartDate("");
        setExportEndDate("");
    };

   const handleExportExcel = () => {
  let dataToExport = exportType === "payment" ? payments : donations;
  
  // Filter by date range
  if (exportRange === "custom" && exportStartDate && exportEndDate) {
    const start = new Date(exportStartDate);
    const end = new Date(exportEndDate);
    end.setHours(23, 59, 59, 999);
    
    dataToExport = dataToExport.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  } else if (exportRange === "today") {
    const today = new Date().toDateString();
    dataToExport = dataToExport.filter(item => new Date(item.timestamp).toDateString() === today);
  } else if (exportRange === "week") {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    dataToExport = dataToExport.filter(item => new Date(item.timestamp) >= weekAgo);
  } else if (exportRange === "month") {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    dataToExport = dataToExport.filter(item => new Date(item.timestamp) >= monthAgo);
  }

  // Sắp xếp donations theo thứ tự: Bảo trợ > Lớn > Vừa > Nhỏ
  if (exportType === "donation") {
    const levelOrder = {
      "Nhà bảo trợ nghệ thuật": 1,
      "Ủng hộ lớn": 2,
      "Ủng hộ vừa": 3,
      "Ủng hộ nhỏ": 4
    };
    dataToExport = [...dataToExport].sort((a, b) => {
      const levelA = getAmountLevel(a.amount);
      const levelB = getAmountLevel(b.amount);
      const orderDiff = levelOrder[levelA] - levelOrder[levelB];
      if (orderDiff === 0) {
        return b.amount - a.amount;
      }
      return orderDiff;
    });
  }

  // Sắp xếp payments theo ngày mới nhất
  if (exportType === "payment") {
    dataToExport = [...dataToExport].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  if (dataToExport.length === 0) {
    alert("Không có dữ liệu để xuất trong khoảng thời gian này!");
    return;
  }

  // Create Excel-compatible HTML with ENHANCED styling
  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Segoe UI', 'Arial', sans-serif;
            background: #f8f9fa;
            padding: 30px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        /* ===== HEADER ===== */
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ffd700, #ff6b6b, #4ecdc4, #667eea);
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.95;
            margin: 0 0 8px 0;
        }
        
        .header .export-info {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 8px;
            backdrop-filter: blur(10px);
        }
        
        /* ===== SUMMARY SECTION ===== */
        .summary {
            padding: 30px 40px;
            background: linear-gradient(to bottom, #f8f9fa 0%, white 100%);
            border-bottom: 3px solid #f1f3f5;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .summary-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #667eea, #764ba2);
        }
        
        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
            border-color: #667eea;
        }
        
        .summary-label {
            font-size: 13px;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .summary-value {
            font-size: 28px;
            font-weight: 700;
            color: #212529;
            margin-bottom: 4px;
        }
        
        .summary-sub {
            font-size: 13px;
            color: #868e96;
        }
        
        /* ===== TABLE ===== */
        .table-container {
            padding: 0;
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        thead th {
            padding: 16px 14px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        
        tbody tr {
            border-bottom: 1px solid #e9ecef;
            transition: background 0.2s ease;
        }
        
        tbody tr:hover {
            background: #f8f9ff;
        }
        
        tbody tr:nth-child(even) {
            background: #fafbfc;
        }
        
        tbody tr:nth-child(even):hover {
            background: #f8f9ff;
        }
        
        td {
            padding: 14px;
            color: #495057;
        }
        
        /* Row number */
        td:first-child {
            font-weight: 700;
            color: #667eea;
            text-align: center;
            width: 50px;
        }
        
        /* ===== BADGES & LABELS ===== */
        .amount {
            font-weight: 700;
            color: #10b981;
            text-align: right;
            font-size: 15px;
        }
        
        .level-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
        }
        
        .level-patron {
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #854d0e;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }
        
        .level-large {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        .level-medium {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }
        
        .level-small {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .payment-method {
            display: inline-block;
            padding: 5px 12px;
            background: #ede9fe;
            color: #5b21b6;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        /* ===== FOOTER ===== */
        .footer {
            margin-top: 40px;
            padding: 30px 40px;
            background: linear-gradient(to top, #f8f9fa 0%, white 100%);
            border-top: 3px solid #f1f3f5;
            text-align: center;
        }
        
        .footer-title {
            font-size: 18px;
            font-weight: 700;
            color: #212529;
            margin-bottom: 10px;
        }
        
        .footer-subtitle {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 20px;
        }
        
        .footer-note {
            background: ${exportType === "donation" ? "#fef3c7" : "#dbeafe"};
            border-left: 4px solid ${exportType === "donation" ? "#f59e0b" : "#3b82f6"};
            padding: 20px;
            border-radius: 8px;
            text-align: left;
            margin-bottom: 20px;
        }
        
        .footer-note strong {
            color: ${exportType === "donation" ? "#92400e" : "#1e40af"};
            display: block;
            margin-bottom: 12px;
            font-size: 15px;
        }
        
        .footer-note ul {
            margin: 0;
            padding-left: 20px;
            color: ${exportType === "donation" ? "#78350f" : "#1e3a8a"};
            line-height: 1.8;
        }
        
        .footer-note li {
            margin-bottom: 6px;
        }
        
        .footer-copyright {
            font-size: 12px;
            color: #adb5bd;
            margin-top: 15px;
        }
        
        /* ===== PRINT STYLES ===== */
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            .summary-card:hover { transform: none; box-shadow: none; }
            tbody tr:hover { background: inherit; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>📊 BÁO CÁO ${exportType === "payment" ? "LỊCH SỬ MUA HÀNG" : "LỊCH SỬ ỦNG HỘ"}</h1>
            <p class="subtitle">Heritage Art 4.0 - Dự Án Bảo Tồn Nghệ Thuật Di Sản Việt Nam</p>
            <div class="export-info">
                📅 Xuất lúc: ${new Date().toLocaleDateString("vi-VN", { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
        
        <!-- SUMMARY -->
        <div class="summary">
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-label">📦 Tổng giao dịch</div>
                    <div class="summary-value">${dataToExport.length}</div>
                    <div class="summary-sub">${exportType === "payment" ? "Đơn hàng" : "Khoản ủng hộ"}</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">💰 Tổng giá trị</div>
                    <div class="summary-value">${dataToExport.reduce((sum, item) => sum + (item.totalAmount || item.amount || 0), 0).toLocaleString("vi-VN")}₫</div>
                    <div class="summary-sub">Tổng thu</div>
                </div>`;

  // Thêm thống kê chi tiết cho donation
  if (exportType === "donation") {
    const patronCount = dataToExport.filter(d => getAmountLevel(d.amount) === "Nhà bảo trợ nghệ thuật").length;
    const largeCount = dataToExport.filter(d => getAmountLevel(d.amount) === "Ủng hộ lớn").length;
    const mediumCount = dataToExport.filter(d => getAmountLevel(d.amount) === "Ủng hộ vừa").length;
    const smallCount = dataToExport.filter(d => getAmountLevel(d.amount) === "Ủng hộ nhỏ").length;

    html += `
                <div class="summary-card">
                    <div class="summary-label">🌟 Nhà bảo trợ</div>
                    <div class="summary-value" style="color: #d97706;">${patronCount}</div>
                    <div class="summary-sub">≥ 1,000,000₫</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">💎 Ủng hộ lớn</div>
                    <div class="summary-value" style="color: #2563eb;">${largeCount}</div>
                    <div class="summary-sub">500k - 999k</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">💚 Ủng hộ vừa</div>
                    <div class="summary-value" style="color: #7c3aed;">${mediumCount}</div>
                    <div class="summary-sub">100k - 499k</div>
                </div>
                <div class="summary-card">
                    <div class="summary-label">💙 Ủng hộ nhỏ</div>
                    <div class="summary-value" style="color: #64748b;">${smallCount}</div>
                    <div class="summary-sub">0 - 99k</div>
                </div>`;
  }

  html += `
                <div class="summary-card">
                    <div class="summary-label">📊 Khoảng thời gian</div>
                    <div class="summary-value" style="font-size: 16px;">
                        ${exportRange === "custom" && exportStartDate && exportEndDate 
                            ? `${new Date(exportStartDate).toLocaleDateString("vi-VN")} - ${new Date(exportEndDate).toLocaleDateString("vi-VN")}`
                            : exportRange === "all" ? "Toàn bộ"
                            : exportRange === "today" ? "Hôm nay"
                            : exportRange === "week" ? "7 ngày qua"
                            : "30 ngày qua"
                        }
                    </div>
                    <div class="summary-sub">Thời gian xuất</div>
                </div>
            </div>
        </div>
        
        <!-- TABLE -->
        <div class="table-container">
            <table>`;

  if (exportType === "payment") {
    html += `
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Tổng tiền</th>
                        <th>Phương thức</th>
                        <th>Ngân hàng</th>
                        <th>Ngày GD</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>`;
    dataToExport.forEach((p, i) => {
      const products = p.items?.map(item => `${item.title} (${item.selectedType})`).join(", ") || "N/A";
      const totalItems = p.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td style="font-family: 'Courier New', monospace; font-size: 11px; color: #667eea;">${p.id}</td>
                        <td><strong>${p.customerName || "Không rõ"}</strong></td>
                        <td style="max-width: 300px;">${products}</td>
                        <td style="text-align: center; font-weight: 600;">${totalItems}</td>
                        <td class="amount">${(p.totalAmount || 0).toLocaleString("vi-VN")}₫</td>
                        <td><span class="payment-method">${p.paymentMethod || "N/A"}</span></td>
                        <td>${p.bankName || "—"}</td>
                        <td style="white-space: nowrap;">${p.date} ${p.time}</td>
                        <td><span class="status-badge status-success">${p.status || "Thành công"}</span></td>
                    </tr>`;
    });
  } else {
    html += `
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã giao dịch</th>
                        <th>Người ủng hộ</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Ngân hàng</th>
                        <th>Ngày GD</th>
                        <th>Mức độ</th>
                    </tr>
                </thead>
                <tbody>`;
    dataToExport.forEach((d, i) => {
      const level = getAmountLevel(d.amount);
      const levelClass = level === "Nhà bảo trợ nghệ thuật" ? "level-patron" 
          : level === "Ủng hộ lớn" ? "level-large"
          : level === "Ủng hộ vừa" ? "level-medium"
          : "level-small";
      
      html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td style="font-family: 'Courier New', monospace; font-size: 11px; color: #667eea;">${d.id}</td>
                        <td><strong>${d.isAnonymous ? "🎭 Ẩn danh" : d.donorName}</strong></td>
                        <td class="amount">${d.amount.toLocaleString("vi-VN")}₫</td>
                        <td><span class="payment-method">${d.method}</span></td>
                        <td>${d.bankName || "—"}</td>
                        <td style="white-space: nowrap;">${d.date} ${d.time}</td>
                        <td><span class="level-badge ${levelClass}">${level}</span></td>
                    </tr>`;
    });
  }

  html += `
                </tbody>
            </table>
        </div>
        
        <!-- FOOTER -->
        <div class="footer">
            <div class="footer-title">Heritage Art 4.0</div>
            <div class="footer-subtitle">Dự Án Bảo Tồn và Phát Triển Nghệ Thuật Truyền Thống Việt Nam</div>`;

  if (exportType === "donation") {
    html += `
            <div class="footer-note">
                <strong>📋 Phân loại mức ủng hộ:</strong>
                <ul>
                    <li>💙 Ủng hộ nhỏ: 0₫ - 99,000₫</li>
                    <li>💚 Ủng hộ vừa: 100,000₫ - 499,000₫</li>
                    <li>💎 Ủng hộ lớn: 500,000₫ - 999,000₫</li>
                    <li>🌟 Nhà bảo trợ nghệ thuật: từ 1,000,000₫ trở lên</li>
                </ul>
            </div>`;
  } else {
    html += `
            <div class="footer-note">
                <strong>📋 Thông tin chi tiết:</strong>
                <ul>
                    <li>Báo cáo này bao gồm toàn bộ lịch sử mua hàng trong khoảng thời gian đã chọn</li>
                    <li>Tất cả các giao dịch đã được sắp xếp theo thứ tự từ mới nhất đến cũ nhất</li>
                    <li>Dữ liệu được xuất từ hệ thống Heritage Art 4.0 - Mọi thông tin là bảo mật</li>
                </ul>
            </div>`;
  }

  html += `
            <div class="footer-copyright">
                © ${new Date().getFullYear()} Heritage Art 4.0. All rights reserved. | 
                Báo cáo được tạo tự động • Mọi thông tin trong báo cáo này là bảo mật
            </div>
        </div>
    </div>
</body>
</html>`;

  // Create and download file
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  const fileName = exportType === "payment" 
      ? `BaoCao_MuaHang_${new Date().toISOString().split('T')[0]}.xls`
      : `BaoCao_UngHo_${new Date().toISOString().split('T')[0]}.xls`;
  
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  setShowExportModal(false);
  showSuccess(`✅ Đã xuất ${dataToExport.length} giao dịch thành công!`);
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

    // ─── HANDLE TAB CLICK WITH AUTH CHECK ───
    const handleTabClick = (tabKey) => {
        if (tabKey === "donation") {
            if (!isAuthenticated) {
                setActiveTab("donation");
                return;
            }
            setActiveTab("donation");
        } else {
            setActiveTab(tabKey);
        }
    };

    // ─── PIN MODAL (shown over content, not replacing it) ───
    const showPinModal = activeTab === "donation" && !isAuthenticated;

    return (
        <div className="dashboard-wrapper">
            {/* ─── HEADER ─── */}
            <div className="dashboard-header">
                <div>
                    <h3>Quản lý ủng hộ & Thanh toán</h3>
                    <p className="panel-description">Theo dõi và quản lý các khoản ủng hộ & mua hàng của dự án Heritage Art 4.0</p>
                </div>
                {activeTab === "donation" && isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 16px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Thoát
                    </button>
                )}
            </div>

            {/* ─── COMBINED STATS ROW ─── */}
            <div className="dashboard-stats-row">
                <div className="dashboard-stat-card">
                    <h5>Doanh thu bán hàng</h5>
                    <div className="stat-value">{stats.totalRevenue.toLocaleString()}₫</div>
                    <div className="stat-sub">Từ {stats.paymentCount} đơn hàng</div>
                </div>

                <div className="dashboard-stat-card">
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
                        onClick={() => handleTabClick(tab.key)}
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
                                <button onClick={() => openExportModal("payment")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#10b981", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>📊 Xuất Excel</button>
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
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem", color: "#374151" }}>💰 Mức ủng hộ</label>
                                <select value={donAmountFilter} onChange={e => setDonAmountFilter(e.target.value)} style={{
                                    width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "13px", cursor: "pointer"
                                }}>
                                    <option value="all">Tất cả</option>
                                    <option value="patron">🌟 Bảo trợ (≥1,000k)</option>
                                    <option value="large">💎 Lớn (500-999k)</option>
                                    <option value="medium">💚 Vừa (100-499k)</option>
                                    <option value="small">💙 Nhỏ (0-99k)</option>
                                </select>
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
                                <button onClick={() => openExportModal("donation")} style={{
                                    flex: 1, padding: "6px 10px", backgroundColor: "#10b981", color: "#fff",
                                    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "13px"
                                }}>📊 Xuất Excel</button>
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
                                    {donSearch || donFilter !== "all" || donAmountFilter !== "all" ? "Không tìm thấy kết quả phù hợp" : "Khi có người ủng hộ, dữ liệu sẽ hiển thị tại đây"}
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
                                        {filteredDonations.map((donation, index) => {
                                            const level = getAmountLevel(donation.amount);
                                            return (
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
                                                            padding: "3px 10px", 
                                                            borderRadius: "12px", 
                                                            fontSize: "0.8rem", 
                                                            fontWeight: "600",
                                                            background: level === "Nhà bảo trợ nghệ thuật" ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
                                                                : level === "Ủng hộ lớn" ? "#dbeafe"
                                                                : level === "Ủng hộ vừa" ? "#e0e7ff"
                                                                : "#f3f4f6",
                                                            color: level === "Nhà bảo trợ nghệ thuật" ? "#854d0e"
                                                                : level === "Ủng hộ lớn" ? "#1e40af"
                                                                : level === "Ủng hộ vừa" ? "#4f46e5"
                                                                : "#6b7280"
                                                        }}>{level}</span>
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
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ─── MODAL: EXPORT EXCEL ─── */}
            {showExportModal && (
                <div style={overlayStyle} onClick={() => setShowExportModal(false)}>
                    <div style={{
                        ...modalBoxStyle,
                        maxWidth: "550px"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: "24px" }}>
                            <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#1e293b" }}>
                                📊 Xuất Excel
                            </h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                                Chọn khoảng thời gian để xuất báo cáo {exportType === "payment" ? "mua hàng" : "ủng hộ"}
                            </p>
                            
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#374151" }}>
                                Chọn khoảng thời gian
                            </label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {[
                                    { value: "all", label: "📅 Toàn bộ" },
                                    { value: "today", label: "📅 Hôm nay" },
                                    { value: "week", label: "📅 7 ngày qua" },
                                    { value: "month", label: "📅 30 ngày qua" }
                                ].map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setExportRange(option.value)}
                                        style={{
                                            padding: "10px",
                                            border: exportRange === option.value ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                            borderRadius: "8px",
                                            background: exportRange === option.value ? "#eff6ff" : "#fff",
                                            color: exportRange === option.value ? "#2563eb" : "#64748b",
                                            cursor: "pointer",
                                            fontWeight: exportRange === option.value ? "600" : "500",
                                            fontSize: "13px",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setExportRange("custom")}
                                    style={{
                                        gridColumn: "1 / -1",
                                        padding: "10px",
                                        border: exportRange === "custom" ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                        borderRadius: "8px",
                                        background: exportRange === "custom" ? "#eff6ff" : "#fff",
                                        color: exportRange === "custom" ? "#2563eb" : "#64748b",
                                        cursor: "pointer",
                                        fontWeight: exportRange === "custom" ? "600" : "500",
                                        fontSize: "13px"
                                    }}
                                >
                                    📅 Tùy chỉnh khoảng thời gian
                                </button>
                            </div>
                        </div>

                        {exportRange === "custom" && (
                            <div style={{ 
                                background: "#f8fafc", 
                                padding: "16px", 
                                borderRadius: "10px", 
                                marginBottom: "20px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>
                                        Từ ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={exportStartDate}
                                        onChange={e => setExportStartDate(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>
                                        Đến ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={exportEndDate}
                                        onChange={e => setExportEndDate(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            border: "1px solid #d1d5db",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                            </div>
                        )}

 

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setShowExportModal(false)}
                                style={{
                                    flex: 1,
                                    padding: "12px 0",
                                    border: "none",
                                    borderRadius: "10px",
                                    backgroundColor: "#f3f4f6",
                                    color: "#374151",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    cursor: "pointer"
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={exportRange === "custom" && (!exportStartDate || !exportEndDate)}
                                style={{
                                    flex: 1,
                                    padding: "12px 0",
                                    border: "none",
                                    borderRadius: "10px",
                                    background: (exportRange === "custom" && (!exportStartDate || !exportEndDate))
                                        ? "#d1d5db"
                                        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#fff",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    cursor: (exportRange === "custom" && (!exportStartDate || !exportEndDate))
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: (exportRange === "custom" && (!exportStartDate || !exportEndDate)) ? 0.6 : 1
                                }}
                            >
                                📥 Tải xuống Excel
                            </button>
                        </div>
                    </div>
                </div>
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
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗑️</div>
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

            {/* ─── PIN AUTHENTICATION MODAL ─── */}
            {showPinModal && (
                <div style={overlayStyle} onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("payment");
                }}>
                    <div style={{
                        ...modalBoxStyle,
                        maxWidth: "500px"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ 
                                width: "100px", height: "100px", margin: "0 auto 30px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "50%", display: "flex", alignItems: "center", 
                                justifyContent: "center", fontSize: "48px", color: "#fff",
                                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
                            }}>
                                🔒
                            </div>
                        
                            <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "14px" }}>
                                Chỉ admin có quyền xem thông tin ủng hộ 
                            </p> 
                            <h3 style={{ color: "#64748b", marginBottom: "30px", fontSize: "14px" }}>
                                Nhập mã PIN có 4 số
                            </h3>

                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handlePinSubmit()}
                                maxLength="4"
                                style={{
                                    width: "100%", 
                                    padding: "16px 20px", 
                                    fontSize: "24px",
                                    textAlign: "center",
                                    letterSpacing: "8px",
                                    border: pinError ? "2px solid #ef4444" : "2px solid #e2e8f0",
                                    borderRadius: "12px",
                                    marginBottom: "15px",
                                    boxSizing: "border-box",
                                    fontFamily: "monospace",
                                    outline: "none",
                                    transition: "all 0.2s"
                                }}
                                autoFocus
                            />

                            {pinError && (
                                <div style={{
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    marginBottom: "15px",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}>
                                    {pinError}
                                </div>
                            )}

                            <button
                                onClick={handlePinSubmit}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                                }}
                            >
                                Xác nhận
                            </button>

                            <button
                                onClick={() => setActiveTab("payment")}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                    padding: "12px",
                                    background: "transparent",
                                    color: "#64748b",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer"
                                }}
                            >
                                ← Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDonate;