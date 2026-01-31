import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentMethods from "../../components/PaymentMethods";

export default function DonatUngHo() {
  // State cho số tiền, ẩn danh, carousel, modal
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recentDonors, setRecentDonors] = useState([]);

  // Dữ liệu mức ủng hộ
  const donateLevels = [
    { amount: 50000, desc: "Ủng hộ nhỏ – Cảm ơn tấm lòng của bạn", img: "https://cdn-icons-png.freepik.com/512/2545/2545462.png", perks: ["Nhận thư cảm ơn điện tử", "Tên hiển thị trong danh sách tri ân"] },
    { amount: 100000, desc: "Ủng hộ vừa – Đồng hành cùng dự án", img: "https://cdn-icons-png.flaticon.com/512/10642/10642264.png", perks: ["Thư cảm ơn cá nhân hóa", "Tên hiển thị nổi bật", "Nhận 1 hình nền AI độc quyền"] },
    { amount: 500000, desc: "Ủng hộ lớn – Vinh danh trên website", img: "https://cdn-icons-png.freepik.com/512/16135/16135977.png", perks: ["Logo/tên trên trang tri ân", "Truy cập nội dung đặc biệt", "Giấy chứng nhận ủng hộ"] },
    { amount: 1000000, desc: "Nhà bảo trợ nghệ thuật – Góp vào quỹ từ thiện", img: "https://cdn-icons-png.flaticon.com/256/10303/10303229.png", perks: ["Vinh danh riêng trên trang chủ", "Tặng NFT tranh AI độc bản", "Mời tham dự sự kiện offline"] },
  ];

  // Load recent donors from localStorage
  useEffect(() => {
    loadRecentDonors();
    const interval = setInterval(loadRecentDonors, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadRecentDonors = () => {
    const saved = localStorage.getItem("donationHistory");
    if (saved) {
      try {
        const history = JSON.parse(saved);
        // Lấy 12 người ủng hộ gần nhất
        const recent = history.slice(-12).reverse();
        setRecentDonors(recent);
      } catch (error) {
        console.error("Error loading donors:", error);
      }
    }
  };

  // Hiệu ứng chuyển động
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Xử lý chọn mức ủng hộ
  const handleDonateClick = (amount) => setSelectedAmount(amount);
  
  // Xử lý nhập số tiền tuỳ chọn
  const handleCustomDonate = () => {
    const parsed = parseInt(customAmount);
    if (!parsed || parsed < 10000) {
      alert("Vui lòng nhập số tiền hợp lệ (tối thiểu 10.000₫).");
      return;
    }
    setSelectedAmount(parsed);
  };
  
  // Hàm xác định mức độ ủng hộ
  const getDonateLevel = (amount) => {
    if (amount >= 1000000) return "Nhà bảo trợ nghệ thuật";
    if (amount >= 500000) return "Ủng hộ lớn";
    if (amount >= 100000) return "Ủng hộ vừa";
    return "Ủng hộ nhỏ";
  };

  // Xử lý thanh toán - LƯU VÀO LOCALSTORAGE
  const handlePayment = (method, details) => {
    const donorName = isAnonymous ? "Người ủng hộ ẩn danh" : details.name || "Bạn";
    
    // Tạo object donation
    const donation = {
      id: `DN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      donorName: donorName,
      amount: details.amount,
      method: method,
      bankName: details.bankName || null,
      isAnonymous: isAnonymous,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("vi-VN"),
      time: new Date().toLocaleTimeString("vi-VN"),
      level: getDonateLevel(details.amount)
    };

    // Lưu vào localStorage
    try {
      const existing = localStorage.getItem("donationHistory");
      const history = existing ? JSON.parse(existing) : [];
      history.push(donation);
      localStorage.setItem("donationHistory", JSON.stringify(history));
      
      // Hiển thị thông báo thành công
      alert(`🎉 Cảm ơn ${donorName} đã ủng hộ ${details.amount.toLocaleString()}₫ bằng ${method}!`);
      
      // Reset form
      setSelectedAmount(null);
      setCustomAmount("");
      setIsAnonymous(false);
      
      // Reload recent donors
      loadRecentDonors();
    } catch (error) {
      console.error("Error saving donation:", error);
      alert("❌ Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!");
    }
  };

  // Carousel nhà tài trợ
  const visibleCount = 3;
  const displayDonors = recentDonors.length > 0 ? recentDonors : [
    { donorName: "Nguyễn Minh Anh", level: "Nhà bảo trợ nghệ thuật", amount: 1000000 },
    { donorName: "Trần Quốc Huy", level: "Ủng hộ lớn", amount: 500000 },
    { donorName: "Lê Hà My", level: "Ủng hộ vừa", amount: 100000 },
  ];
  const total = displayDonors.length;
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && total > visibleCount) {
        setCarouselIndex((prev) => (prev + 1) % total);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, total, visibleCount]);
  
  const prevSlide = () => setCarouselIndex((prev) => (prev - 1 + total) % total);
  const nextSlide = () => setCarouselIndex((prev) => (prev + 1) % total);

  // Modal báo cáo minh bạch
  const ReportModal = () => {
    const saved = localStorage.getItem("donationHistory");
    const history = saved ? JSON.parse(saved) : [];
    const totalDonations = history.reduce((sum, d) => sum + d.amount, 0);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white rounded-2xl p-6 max-w-3xl w-full relative shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold text-orange-600 mb-4">📄 Báo cáo minh bạch</h2>
          <p className="text-gray-700 mb-4">
            Dưới đây là báo cáo tổng hợp các khoản ủng hộ và sử dụng quỹ dự án:
          </p>
          
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-lg text-orange-800 mb-2">📊 Thống kê tổng quan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Tổng số khoản ủng hộ</p>
                <p className="text-2xl font-bold text-orange-600">{history.length}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tổng số tiền nhận được</p>
                <p className="text-2xl font-bold text-orange-600">{totalDonations.toLocaleString()}₫</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold text-lg text-orange-800 mb-2">📅 Báo cáo theo tháng</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Tháng 01/2025: Tổng ủng hộ 2.000.000₫ – Đã sử dụng: 1.800.000₫</li>
              <li>Tháng 02/2025: Tổng ủng hộ 3.500.000₫ – Đã sử dụng: 3.200.000₫</li>
              <li>Tháng 03/2025: Tổng ủng hộ 1.800.000₫ – Đã sử dụng: 1.500.000₫</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Cam kết minh bạch:</strong> Tất cả khoản ủng hộ đều được công khai, minh bạch 
              và sử dụng đúng mục đích bảo tồn văn hóa & nghệ thuật. Dữ liệu được cập nhật realtime 
              và có thể truy vấn bất cứ lúc nào.
            </p>
          </div>

          <button 
            onClick={() => setShowReport(false)} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl"
          >
            &times;
          </button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto py-12 px-6 text-center">
        {/* HERO */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-orange-600 mb-4">
            Ủng Hộ Dự Án{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Nghệ Thuật Ký Ức 4.0
            </span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Mọi khoản đóng góp của bạn giúp chúng tôi <b>bảo tồn</b> và <b>tái hiện văn hóa Việt Nam</b> qua công nghệ và nghệ thuật.
          </p>
          <p className="text-gray-700 mt-6 max-w-3xl mx-auto leading-relaxed">
            <b>Minh bạch & Tác động:</b> 100% số tiền quyên góp được sử dụng cho hoạt động nghệ thuật và cộng đồng.
            Xem chi tiết tại{" "}
            <button onClick={() => setShowReport(true)} className="text-orange-600 font-semibold underline hover:text-amber-600">
              Báo cáo minh bạch
            </button>.
          </p>
        </div>

        {/* DONATE LEVELS */}
        {!selectedAmount && (
          <>
            <motion.div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6" variants={containerVariants} initial="hidden" animate="show">
              {donateLevels.map((level) => (
                <motion.div 
                  key={level.amount} 
                  variants={cardVariants} 
                  whileHover={{ scale: 1.05, boxShadow: "0px 0px 25px rgba(255,200,50,0.6)", transition: { duration: 0.4 } }} 
                  whileTap={{ scale: 0.97 }} 
                  className="bg-white rounded-2xl shadow-md border border-orange-100 p-6 cursor-pointer flex flex-col h-full"
                >
                  <img src={level.img} alt="Donate" className="rounded-xl mb-4 object-cover h-36 w-full shadow-sm" />
                  <h2 className="text-2xl font-extrabold text-orange-500 mb-2">{level.amount.toLocaleString()}₫</h2>
                  <p className="text-sm text-gray-700 mb-4">{level.desc}</p>
                  <ul className="text-sm text-gray-600 mb-6 list-disc pl-5 text-left">
                    {level.perks.map((perk, i) => (<li key={i}>{perk}</li>))}
                  </ul>
                  <button 
                    onClick={() => handleDonateClick(level.amount)} 
                    className="mt-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl shadow hover:from-orange-600 hover:to-amber-600 w-full transition-all font-semibold"
                  >
                    Ủng hộ ngay
                  </button>
                </motion.div>
              ))}
            </motion.div>

            {/* CUSTOM AMOUNT FORM */}
            <motion.div 
              className="mt-12 bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto border border-orange-100" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-orange-600 mb-4">Tùy chọn số tiền ủng hộ</h2>
              <p className="text-gray-600 mb-6">Bạn có thể nhập số tiền tùy ý và chọn ẩn danh nếu muốn.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <input 
                  type="number" 
                  placeholder="Nhập số tiền (₫)" 
                  value={customAmount} 
                  onChange={(e) => setCustomAmount(e.target.value)} 
                  className="border border-gray-300 rounded-xl px-4 py-2 w-full sm:w-1/2 text-center focus:outline-none focus:ring-2 focus:ring-orange-300" 
                />
                <button 
                  onClick={handleCustomDonate} 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl shadow hover:from-orange-600 hover:to-amber-600 transition font-semibold"
                >
                  Ủng hộ ngay
                </button>
              </div>
              <div className="mt-4 flex justify-center items-center gap-2">
                <input 
                  type="checkbox" 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onChange={(e) => setIsAnonymous(e.target.checked)} 
                  className="w-4 h-4 text-orange-500 focus:ring-orange-400" 
                />
                <label htmlFor="anonymous" className="text-gray-700 text-sm">Ủng hộ ẩn danh</label>
              </div>
            </motion.div>
          </>
        )}

        {/* PAYMENT UI */}
        {selectedAmount && (
          <motion.div 
            className="mt-12 bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Chọn phương thức thanh toán cho <span className="text-orange-600">{selectedAmount.toLocaleString()}₫</span>
            </h2>
            <PaymentMethods total={selectedAmount} onPay={handlePayment} />
            <button 
              onClick={() => setSelectedAmount(null)} 
              className="mt-6 px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all"
            >
              ⬅ Quay lại
            </button>
          </motion.div>
        )}

        {/* TRI ÂN NHÀ TÀI TRỢ - CAROUSEL */}
        <section className="mt-20 relative">
          <h2 className="text-3xl font-bold text-orange-600 mb-8 text-center">🌟 Tri Ân Nhà Tài Trợ</h2>
          <p className="text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Cảm ơn những tấm lòng vàng đã đồng hành cùng dự án. Mỗi đóng góp là một viên gạch xây nên hành trình bảo tồn văn hóa Việt.
          </p>
          {displayDonors.length > 0 && (
            <div 
              className="relative flex justify-center items-center" 
              onMouseEnter={() => setIsPaused(true)} 
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence initial={false}>
                <motion.div 
                  key={carouselIndex} 
                  initial={{ x: "100%", opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: "-100%", opacity: 0 }} 
                  transition={{ type: "tween", duration: 0.8 }} 
                  className="flex gap-6 justify-center flex-wrap"
                >
                  {Array.from({ length: Math.min(visibleCount, displayDonors.length) }).map((_, i) => {
                    const donor = displayDonors[(carouselIndex + i) % total];
                    return (
                      <div 
                        key={i} 
                        className="w-full sm:w-1/2 lg:w-1/3 max-w-xs bg-gradient-to-tr from-orange-50 via-white to-amber-50 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-orange-100 transition-all hover:shadow-2xl"
                      >
                        <img 
                          src={donor.isAnonymous ? "https://i.pravatar.cc/150?u=anonymous" : `https://i.pravatar.cc/150?u=${donor.donorName}`} 
                          alt={donor.donorName} 
                          className="w-24 h-24 rounded-full mb-4 shadow-md object-cover" 
                        />
                        <h3 className="text-xl font-semibold text-orange-600">
                          {donor.isAnonymous ? "🎭 Ẩn danh" : donor.donorName}
                        </h3>
                        <p className="text-gray-700 mt-1">{donor.level}</p>
                        <p className="text-gray-500 mt-2 font-medium">{donor.amount.toLocaleString()}₫</p>
                        <span className="mt-4 inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Nhà tài trợ
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
              {/* Prev / Next buttons */}
              {total > visibleCount && (
                <>
                  <button 
                    onClick={prevSlide} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white text-orange-600 hover:bg-orange-100 rounded-full p-3 shadow-lg z-10"
                  >
                    ◀
                  </button>
                  <button 
                    onClick={nextSlide} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white text-orange-600 hover:bg-orange-100 rounded-full p-3 shadow-lg z-10"
                  >
                    ▶
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
      
      {/* SHARE + CONTACT */}
      <div className="mt-16 flex justify-center space-x-4">
        <a 
          href="https://facebook.com/sharer/sharer.php?u=https://nghethuackyuc.vn" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Chia sẻ Facebook
        </a>
        <a 
          href="https://zalo.me/share?url=https://nghethuackyuc.vn" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition"
        >
          Chia sẻ Zalo
        </a>
      </div>
      
      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Hợp tác tài trợ</h2>
        <a href="mailto:lienhe@nghethuackyuc.vn" className="text-orange-600 font-semibold underline hover:text-amber-600">
          📧 Gửi email: lienhe@nghethuackyuc.vn
        </a>
      </div>
      
      {/* MODAL */}
      {showReport && <ReportModal />}
    </div>
  );
}