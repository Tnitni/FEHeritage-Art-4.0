import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Trang cảm ơn sau thanh toán - 3 giao diện: VIP, Sản phẩm, Donate
export default function ThankYou() {
  const [order, setOrder] = useState(null);
  const [orderType, setOrderType] = useState(null); // "vip" | "product" | "donation"
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin đơn hàng từ localStorage
    try {
      const lastOrder = localStorage.getItem("lastOrder");
      if (lastOrder) {
        const orderData = JSON.parse(lastOrder);
        setOrder(orderData);
        
        // Xác định loại đơn hàng
        if (orderData.type === "vip-subscription") {
          setOrderType("vip");
        } else if (orderData.source === "donation" || orderData.type === "donation") {
          setOrderType("donation");
        } else {
          setOrderType("product");
        }
      } else {
        // Nếu không có đơn hàng, redirect về trang chủ
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      navigate("/");
    }
  }, [navigate]);

  // Hiển thị loading khi chưa có dữ liệu
  if (!order || !orderType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GIAO DIỆN ĐƠN GIẢN CHO DONATE - CHỈ CÓ LỜI CẢM ƠN
  // ═══════════════════════════════════════════════════════════════
  if (orderType === "donation" && order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-16 px-4">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon với Animation */}
          <motion.div 
            className="text-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 10 }}
          >
            <div className="inline-block relative">
              <motion.div 
                className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl"
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(251, 146, 60, 0.7)",
                    "0 0 0 20px rgba(251, 146, 60, 0)",
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="text-7xl">🎉</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Thank You Message */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 mb-8 text-center border border-orange-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-4">
              Cảm ơn bạn rất nhiều!
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Khoản ủng hộ <span className="font-bold text-orange-600 text-2xl">{order.payment.amount.toLocaleString()}₫</span> của bạn 
              đã được ghi nhận thành công!
            </p>
            <p className="text-gray-600 leading-relaxed">
              Sự đóng góp của bạn giúp chúng tôi tiếp tục hành trình bảo tồn và phát triển 
              <span className="font-semibold text-orange-600"> Di sản Văn hóa Việt Nam</span> thông qua nghệ thuật và công nghệ.
            </p>
          </motion.div>

         
          {/* Quick Info Card */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Mã giao dịch</div>
                <div className="font-mono text-xs text-gray-800 break-all">{order.id}</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Phương thức</div>
                <div className="font-semibold text-gray-800">
                  {order.payment.method === 'momo' ? '🟣 MoMo' : 
                   order.payment.method === 'bank_transfer' ? '🏦 Chuyển khoản' :
                   order.payment.method === 'credit_card' ? '💳 Thẻ tín dụng' : 
                   '💰 PayPal'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              to="/donate"
              className="flex-1 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-orange-300"
            >
              Ủng hộ thêm
            </Link>
            <Link
              to="/"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-center shadow-lg hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              🏠 Về trang chủ
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <p className="text-sm text-gray-600 mb-3">
              Bạn sẽ nhận được email xác nhận trong vài phút tới
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a href="mailto:support@heritage-art.vn" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                <span>📧</span> support@heritage-art.vn
              </a>
              <span className="text-gray-400">•</span>
              <a href="tel:1900xxxx" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                <span>📱</span> 1900 xxxx
              </a>
            </div>
          </motion.div>

          
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GIAO DIỆN CHO ĐƠN VIP
  // ═══════════════════════════════════════════════════════════════
  if (orderType === "vip" && order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12 px-4">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Header */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center border-t-4 border-orange-500"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <span className="text-5xl">🎉</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Nâng cấp thành công!
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              Chào mừng bạn đến với gói <span className="font-bold text-orange-600">{order.packageName}</span>
            </p>
            <p className="text-sm text-gray-500">
              Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng
            </p>
          </motion.div>

          {/* VIP Package Info */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⭐</span> Thông tin gói thành viên
            </h2>
            
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gói đã chọn:</span>
                <span className="font-bold text-orange-600 text-lg">{order.packageName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chu kỳ thanh toán:</span>
                <span className="font-semibold text-gray-800">
                  {order.billingCycle === "monthly" ? "Theo tháng" : "Theo năm"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số tiền đã thanh toán:</span>
                <span className="font-bold text-orange-600 text-xl">
                  {order.payment.amount.toLocaleString()}₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-800">
                  {order.payment.method === 'momo' ? '🟣 Ví MoMo' : 
                   order.payment.method === 'bank_transfer' ? '🏦 Chuyển khoản' :
                   order.payment.method === 'credit_card' ? '💳 Thẻ tín dụng' : 
                   '💰 PayPal'}
                </span>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày kích hoạt:</span>
                <span className="font-medium text-gray-800">
                  {new Date(order.subscription.assignDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày hết hạn:</span>
                <span className="font-medium text-gray-800">
                  {new Date(order.subscription.expirationDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gia hạn tự động:</span>
                <span className={`font-medium ${order.subscription.autoRenew ? 'text-green-600' : 'text-gray-500'}`}>
                  {order.subscription.autoRenew ? 'Đã bật' : 'Tắt'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t mt-4 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Thông tin người đăng ký</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600 w-24">Họ tên:</span>
                  <span className="font-medium text-gray-800">{order.customer.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-24">Email:</span>
                  <span className="font-medium text-gray-800">{order.customer.email}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Reminder */}
          <motion.div 
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg p-6 text-white text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-xl font-bold mb-2">✨ Chúc mừng bạn đã trở thành thành viên VIP!</h3>
            <p className="text-orange-100 text-sm">
              Bạn đã mở khóa toàn bộ tính năng cao cấp và có thể bắt đầu sáng tạo không giới hạn ngay bây giờ
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
           
            <Link
              to="/"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all text-center"
            >
              🏠 Về trang chủ
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="mt-8 text-center text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="mb-2">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
            <div className="flex flex-wrap justify-center gap-4 text-orange-600 font-medium">
              <span>📧 support@heritage-art.vn</span>
              <span>📱 1900 xxxx</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GIAO DIỆN ĐẦY ĐỦ CHO ĐƠN HÀNG MUA SẢN PHẨM
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center border-t-4 border-green-500"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <span className="text-5xl">✅</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Cảm ơn bạn đã tin tưởng và ủng hộ Heritage Art 4.0
          </p>
          <p className="text-sm text-gray-500">
            Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất có thể
          </p>
        </motion.div>

        {/* Order Details */}
        {order && (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📦</span> Thông tin đơn hàng
            </h2>
            
            {/* Order ID and Date */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ngày đặt hàng:</span>
                <span className="font-semibold text-gray-800">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-800">
                  {order.payment.method === 'momo' ? '🟣 Ví MoMo' : 
                   order.payment.method === 'bank' ? '🏦 Chuyển khoản' : 
                   '💳 Thẻ quốc tế'}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Thông tin người nhận</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Họ tên:</span>
                  <span className="font-medium text-gray-800">{order.customer.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Số điện thoại:</span>
                  <span className="font-medium text-gray-800">{order.customer.phone}</span>
                </div>
                {order.customer.email && (
                  <div className="flex gap-2">
                    <span className="text-gray-600 w-32">Email:</span>
                    <span className="font-medium text-gray-800">{order.customer.email}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-gray-600 w-32">Địa chỉ:</span>
                  <span className="font-medium text-gray-800">{order.customer.address}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Sản phẩm đã mua</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        {item.selectedType} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-orange-600">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <span className="text-lg font-semibold text-gray-800">Tổng cộng</span>
                <span className="text-2xl font-bold text-orange-600">
                  {order.amounts.total.toLocaleString()}₫
                </span>
              </div>
            </div>
          </motion.div>
        )}

        

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            to="/do-luu-niem"
            className="px-8 py-3 bg-white text-orange-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all border-2 border-orange-200 text-center"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all text-center"
          >
            🏠 Về trang chủ
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="mt-8 text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="mb-2">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
          <div className="flex flex-wrap justify-center gap-4 text-orange-600 font-medium">
            <span>📧 support@heritage-art.vn</span>
            <span>📱 1900 xxxx</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}