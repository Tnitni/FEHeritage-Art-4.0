import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PaymentMethods from "../../components/PaymentMethods";

export default function ThanhVienVIP() {
  const navigate = useNavigate();
  
  // State cho gói chọn, chu kỳ, tự động gia hạn
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [autoRenew, setAutoRenew] = useState(false);
  
  // State cho thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    userName: "",
    email: "",
  });
  
  const discountRate = 0.2;

  // Danh sách gói hội viên - THÊM TIER
  const vipPlans = [
    {
      title: "Miễn Phí (Freemium)",
      tier: "free",
      priceMonthly: 0,
      benefits: [
        { text: "Tạo ảnh AI 2 lượt/ngày", tooltip: "Mỗi ngày được tạo tối đa 2 lượt ảnh AI" },
        { text: "Sử dụng mẫu di sản có sẵn", tooltip: "Chọn từ thư viện mẫu cơ bản" },
        { text: "Tham gia cộng đồng sáng tạo", tooltip: "Tương tác, học hỏi, chia sẻ tác phẩm" },
        { text: "Xem nội dung văn hóa Việt", tooltip: "Truy cập miễn phí các bài viết, video văn hóa" },
      ],
      color: "from-gray-300 to-gray-400",
    },
    {
      title: "Premium Cá Nhân",
      tier: "premium",
      priceMonthly: 149000,
      benefits: [
        { text: "Tạo ảnh AI 50 lượt/tháng", tooltip: "Mỗi tháng được tạo tối đa 50 lượt ảnh AI" },
        { text: "Tùy chỉnh phong cách sáng tạo", tooltip: "Tùy biến phong cách AI theo sở thích" },
        { text: "Truy cập thư viện di sản phong phú", tooltip: "Kho dữ liệu di sản, mẫu AI nâng cao" },
        { text: "Quyền thương mại hóa sản phẩm", tooltip: "Được phép in ấn, NFT, merchandise" },
      ],
      color: "from-orange-400 to-amber-500",
      popular: true,
    },
    {
      title: "Nhà Bảo Trợ Nghệ Thuật",
      tier: "patron",
      priceMonthly: 499000,
      benefits: [
        { text: "Tất cả quyền lợi gói Premium", tooltip: "Bao gồm mọi quyền lợi của gói Premium" },
        { text: "Tên hiển thị trên website", tooltip: "Vinh danh trên trang Tri ân nghệ thuật" },
        { text: "Tham gia triển lãm ảo đặc biệt", tooltip: "Trải nghiệm không gian trưng bày ảo" },
        { text: "Nhận NFT tranh độc quyền", tooltip: "Mỗi tháng tặng 1 NFT tranh AI duy nhất" },
      ],
      color: "from-red-500 to-orange-500",
    },
  ];

  // Tổng hợp quyền lợi
  const allBenefits = [
    "Tạo ảnh AI 2 lượt/ngày",
    "Sử dụng mẫu di sản có sẵn",
    "Tham gia cộng đồng sáng tạo",
    "Xem nội dung văn hóa Việt",
    "Tạo ảnh AI 50 lượt/tháng",
    "Tùy chỉnh phong cách sáng tạo",
    "Truy cập thư viện di sản phong phú",
    "Quyền thương mại hóa sản phẩm",
    "Tên hiển thị trên website",
    "Tham gia triển lãm ảo đặc biệt",
    "Nhận NFT tranh độc quyền",
  ];

  // Tính giá theo chu kỳ
  const getPrice = (plan) => {
    if (plan.priceMonthly === 0) return 0;
    if (billingCycle === "monthly") return plan.priceMonthly;
    return plan.priceMonthly * 12 * (1 - discountRate);
  };

  // Hàm tính ngày hết hạn
  const calculateExpiryDate = (cycle) => {
    const today = new Date();
    if (cycle === "monthly") {
      today.setMonth(today.getMonth() + 1);
    } else {
      today.setFullYear(today.getFullYear() + 1);
    }
    return today.toISOString().split('T')[0];
  };

  // Hàm lấy ID tiếp theo
  const getNextSubscriptionId = () => {
    const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    if (subscriptions.length === 0) return 1;
    const maxId = Math.max(...subscriptions.map(sub => sub.id));
    return maxId + 1;
  };

  // Hàm tạo user_id ngẫu nhiên
  const generateUserId = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  // Chọn gói
  const handleSelectPlan = (plan) => {
    if (plan.priceMonthly === 0) {
      alert("🎉 Bạn đang ở gói miễn phí – hãy nâng cấp để mở khóa tính năng nâng cao!");
      return;
    }
    setSelectedPlan(plan);
    setAutoRenew(false);
    // Reset thông tin người dùng
    setUserInfo({ userName: "", email: "" });
  };

  // Validate thông tin người dùng
  const validateUserInfo = () => {
    if (!userInfo.userName.trim()) {
      alert("⚠️ Vui lòng nhập họ tên!");
      return false;
    }
    if (!userInfo.email.trim()) {
      alert("⚠️ Vui lòng nhập email!");
      return false;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      alert("⚠️ Email không hợp lệ!");
      return false;
    }
    return true;
  };

  // Thanh toán - LƯU VÀO SUBSCRIPTIONS và CHUYỂN HƯỚNG
  const handlePayment = (method, details) => {
    // Validate thông tin trước khi thanh toán
    if (!validateUserInfo()) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const expiryDate = calculateExpiryDate(billingCycle);

    // Tạo bản ghi theo cấu trúc AdminVIP
    const newSubscription = {
      id: getNextSubscriptionId(),
      user_id: generateUserId(),
      userName: userInfo.userName.trim(),
      userEmail: userInfo.email.trim(),
      tier: selectedPlan.tier, // "free", "premium", "patron"
      assignDate: today,
      expirationDate: expiryDate,
      cancelled_at: null,
      next_billing_date: expiryDate,
      payment_method: method,
      ai_generation_limit: selectedPlan.tier === "free" ? 10 : -1,
      ai_generations_used: 0,
      limit_reset_at: expiryDate,
      status: "active"
    };

    // Lấy dữ liệu subscriptions hiện tại
    const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    
    // Thêm subscription mới
    subscriptions.push(newSubscription);
    
    // Lưu lại vào localStorage
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));

    // Lưu thông tin VIP vào lastOrder để hiển thị ở Thank You page
    const vipOrder = {
      id: `VIP-${Date.now()}`,
      type: "vip-subscription", // Đánh dấu đây là đơn VIP
      createdAt: new Date().toISOString(),
      packageName: selectedPlan.title,
      packageTier: selectedPlan.tier,
      billingCycle: billingCycle,
      customer: {
        name: userInfo.userName.trim(),
        email: userInfo.email.trim(),
      },
      payment: {
        amount: getPrice(selectedPlan),
        method: method,
        status: "success",
      },
      subscription: {
        assignDate: today,
        expirationDate: expiryDate,
        autoRenew: autoRenew,
      }
    };

    // Lưu vào lastOrder
    localStorage.setItem("lastOrder", JSON.stringify(vipOrder));

    // CHUYỂN HƯỚNG THẲNG SANG THANK YOU (không có modal)
    navigate("/thank-you");
  };

  return (
    <div style={{ background: '#f6eadf', minHeight: '100vh', width: '100%', paddingBottom: '3rem', paddingTop: '3rem' }}>
      <div className="max-w-7xl mx-auto py-12 px-6 bg-white rounded-2xl shadow-lg" style={{ boxShadow: '0 4px 32px 0 rgba(0,0,0,0.04)' }}>
        <h1 className="text-4xl font-bold text-orange-600 mb-4 text-center">🌟 Thành Viên VIP & Premium</h1>
        <p className="text-gray-600 text-center mb-10">
          Trải nghiệm sáng tạo không giới hạn với hội viên VIP & Premium! 
          Bắt đầu với gói miễn phí, nâng cấp để mở khóa tính năng sáng tạo và quyền thương mại hóa.
        </p>
        
        {/* Bộ chọn chu kỳ thanh toán */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-2 rounded-lg flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg font-semibold ${billingCycle === "monthly" ? "bg-orange-500 text-white shadow" : "text-gray-700"}`}
            >
              Trả theo tháng
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg font-semibold ${billingCycle === "yearly" ? "bg-orange-500 text-white shadow" : "text-gray-700"}`}
            >
              Trả theo năm (-20%)
            </button>
          </div>
        </div>

        {/* Danh sách gói */}
        {!selectedPlan && (
          <>
            <div className="grid gap-8 md:grid-cols-3">
              {vipPlans.map((plan, idx) => {
                const price = getPrice(plan);
                const priceLabel =
                  plan.priceMonthly === 0
                    ? "Miễn phí"
                    : billingCycle === "monthly"
                    ? `${plan.priceMonthly.toLocaleString()}₫ / tháng`
                    : `${price.toLocaleString()}₫ / năm`;
                return (
                  <motion.div
                    key={idx}
                    className={`relative bg-gradient-to-br ${plan.color} rounded-2xl shadow-lg p-8 text-white transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full cursor-pointer`}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {plan.popular && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Most Popular</div>
                    )}
                    <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
                    <p className="text-lg font-semibold mb-4">{priceLabel}</p>
                    <ul className="mb-6 space-y-2 text-sm flex-1">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="relative group">
                          <span>• {b.text}</span>
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity z-50">{b.tooltip}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="mt-auto bg-white text-orange-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-orange-100 transition-all">
                      {plan.priceMonthly === 0 ? "Dùng miễn phí" : "Nâng cấp ngay 🚀"}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Bảng so sánh quyền lợi */}
            <div className="mt-16 overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-lg border border-gray-200">
                <thead>
                  <tr className="bg-orange-100">
                    <th className="p-4 text-left text-gray-800">Quyền lợi</th>
                    {vipPlans.map((plan, idx) => (
                      <th key={idx} className="p-4 text-center text-gray-800">
                        {plan.title}
                        {plan.popular && (
                          <div className="mt-1 inline-block bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">Most Popular</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allBenefits.map((benefit, i) => (
                    <motion.tr key={i} className="border-t border-gray-200 hover:bg-orange-50 transition-colors duration-300">
                      <td className="p-4 text-gray-700">{benefit}</td>
                      {vipPlans.map((plan, idx) => (
                        <td key={idx} className="p-4 text-center">
                          {plan.benefits.some((b) => b.text === benefit) ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Giao diện thanh toán */}
        {selectedPlan && selectedPlan.priceMonthly > 0 && (
          <motion.div className="mt-12 bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Thanh toán gói <span className="text-orange-600">{selectedPlan.title}</span>
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              {billingCycle === "monthly"
                ? `${selectedPlan.priceMonthly.toLocaleString()}₫ / tháng`
                : `${getPrice(selectedPlan).toLocaleString()}₫ / năm`}
            </p>

            {/* Form thông tin người dùng */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  👤 Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={userInfo.userName}
                  onChange={(e) => setUserInfo({ ...userInfo, userName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  📧 Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-center mb-6">
              <input 
                type="checkbox" 
                id="autoRenew" 
                checked={autoRenew} 
                onChange={(e) => setAutoRenew(e.target.checked)} 
                className="mr-2 w-4 h-4" 
              />
              <label htmlFor="autoRenew" className="text-gray-700 text-sm">
                🔄 Gia hạn tự động mỗi kỳ thanh toán
              </label>
            </div>

            <PaymentMethods total={getPrice(selectedPlan)} onPay={handlePayment} />

            <button 
              onClick={() => setSelectedPlan(null)} 
              className="mt-6 w-full px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            >
              ⬅ Quay lại chọn gói
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}