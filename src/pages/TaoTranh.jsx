import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, Wand2, Palette, Download, X, Loader2,
    Star, ExternalLink, AlertTriangle,
    Zap, Ghost, Brush, Mountain, Box, Gem, Leaf, Feather
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// --- 2. CẬP NHẬT MẢNG `aiTools` ---
// (Đã xóa 'icon' và thêm 'rating'/'ratingCount')
const aiTools = [
    { id: 1, name: "Bing Image Creator", desc: "Phát triển bởi DALL·E 3, mạnh mẽ và sáng tạo.", link: "https://www.bing.com/images/create", rating: 5, ratingCount: 120 },
    { id: 2, name: "Midjourney", desc: "Tiêu chuẩn vàng cho AI nghệ thuật đỉnh cao.", link: "https://www.midjourney.com/", rating: 5, ratingCount: 250 },
    { id: 3, name: "Stable Diffusion", desc: "Lựa chọn mã nguồn mở mạnh mẽ, có thể tùy chỉnh.", link: "https://huggingface.co/spaces/stabilityai/stable-diffusion", rating: 4, ratingCount: 90 },
    { id: 4, name: "Pika Labs", desc: "Chuyên gia tạo video AI từ văn bản hoặc ảnh.", link: "https://www.pika.art/", rating: 4, ratingCount: 75 },
    { id: 5, name: "NightCafe", desc: "Cung cấp nhiều phong cách và thuật toán AI.", link: "https://www.nightcafe.studio/", rating: 4, ratingCount: 60 },
    { id: 6, name: "Runway ML", desc: "Biến video, ảnh tĩnh hoặc văn bản thành video.", link: "https://www.runwayml.com/", rating: 5, ratingCount: 150 },
];

// --- DANH SÁCH 8 PHONG CÁCH NGHỆ THUẬT ---
const artStyles = [
    { id: "cyberpunk", name: "Cyberpunk", icon: Zap, desc: "Neon, Tương lai" },
    { id: "anime", name: "Anime", icon: Ghost, desc: "Ghibli, Manga" },
    { id: "oil_painting", name: "Sơn Dầu", icon: Brush, desc: "Cổ điển, Van Gogh" },
    { id: "realistic", name: "Chân Thực", icon: Mountain, desc: "4K, Chi tiết" },
    { id: "3d_render", name: "3D Render", icon: Box, desc: "Pixar, Blender" },
    { id: "fantasy", name: "Huyền Bí", icon: Gem, desc: "Phép thuật, Rồng" },
    { id: "watercolor", name: "Màu Nước", icon: Leaf, desc: "Nhẹ nhàng, Loang" },
    { id: "sketch", name: "Phác Thảo", icon: Feather, desc: "Chì, Đen trắng" },
];


// --- 3. THÊM COMPONENT `ToolCard` MÀ BẠN CUNG CẤP ---
const ToolCard = ({ tool }) => {
    // Lấy favicon tự động từ domain
    const favicon = `https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=64`;

    // Rating (mặc định 5 sao nếu không có)
    const rating = tool.rating || 5;
    const ratingCount = tool.ratingCount || 0;

    return (
        <motion.a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -3 }}
            className="group relative flex flex-col justify-between p-5 bg-white border border-[#e9dbc2] rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#d4b47c] h-[230px]"
        >
            {/* Overlay gradient khi hover */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,230,180,0.25), rgba(255,210,150,0.25))",
                }}
            ></div>

            {/* Nội dung chính */}
            <div className="relative z-10 flex flex-col gap-2">
                {/* Header: icon + tên */}
                <div className="flex items-center gap-3">
                    <img
                        src={favicon}
                        alt={tool.name}
                        className="w-8 h-8 rounded-lg shadow-sm"
                    />
                    <h3 className="font-semibold text-lg text-[#3b2412] leading-tight">
                        {tool.name}
                    </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={`${i < rating ? "fill-[#f4c542] text-[#f4c542]" : "text-[#d4c7a2]"
                                } transition-colors`}
                        />
                    ))}
                    <span className="text-xs text-[#8a7a5c] ml-2">
                        ({ratingCount})
                    </span>
                </div>

                {/* Mô tả */}
                <p className="text-sm text-[#7a6850] mt-1 line-clamp-3">
                    {tool.desc}
                </p>
            </div>

            {/* Footer: nút truy cập */}
            <div className="relative z-10 mt-3 flex justify-end">
                <div className="flex items-center gap-1 text-[#c18a3d] font-semibold text-sm border border-[#c18a3d] rounded-lg px-3 py-1.5 hover:bg-[#c18a3d] hover:text-white transition-all">
                    Truy cập <ExternalLink size={14} />
                </div>
            </div>
        </motion.a>
    );
};

// --- MỚI: Component Popup Đăng Nhập ---
const LoginPopup = ({ onClose }) => {
    const navigate = useNavigate(); // Hook để điều hướng

    const handleLoginClick = () => {
        // Điều hướng đến trang đăng nhập (thay '/dangnhap' bằng link thật của bạn)
        navigate('/dangnhap');
        onClose(); // Đóng popup sau khi điều hướng
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose} // Bấm ra ngoài để đóng
        >
            <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.7, opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-amber-200"
                onClick={(e) => e.stopPropagation()} // Ngăn bấm vào popup làm đóng
            >
                {/* Nút đóng trong popup */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Icon cảnh báo */}
                <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-amber-100 rounded-full border-4 border-amber-200">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>

                {/* Nội dung */}
                <h3 className="text-xl font-bold text-amber-800 mb-2">Yêu Cầu Đăng Nhập</h3>
                <p className="text-gray-600 mb-6">
                    Hãy đăng nhập hoặc đăng ký để tiếp tục sử dụng tính năng tạo ảnh bằng AI này.
                </p>

                {/* Nút hành động */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleLoginClick} // Gọi hàm điều hướng
                        className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 text-white font-semibold rounded-lg shadow hover:bg-amber-700 transition-colors"
                    >
                        Đăng Nhập Ngay
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Để Sau
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Component ImageCreator (Giữ nguyên, không thay đổi)
const ImageCreator = () => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState(artStyles[0].id);
    const [loading, setLoading] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const generateImage = async () => {
        // --- CẬP NHẬT LOGIC ---
        // 1. Kiểm tra đăng nhập trước
        if (!isLoggedIn) {
            setShowLoginPopup(true); // Hiện popup nếu chưa đăng nhập
            return; // Dừng hàm tại đây
        }

        // 2. Nếu đã đăng nhập, tiếp tục kiểm tra ảnh và prompt
        if (!imageFile || !prompt) return;

        // 3. Tiến hành gọi API (như cũ)
        setLoading(true);
        setResultUrl(null);
        setTimeout(() => {
            setResultUrl(previewUrl);
            setLoading(false);
        }, 3000);
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 md:p-8 shadow-2xl ring-2 ring-amber-200/50">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-transparent to-orange-400/20 blur-3xl"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-400/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="relative z-10">
                <motion.h3
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent"
                >
                    <Wand2 className="inline-block w-10 h-10 mr-3 text-amber-600" />
                    Biến Ảnh Thành Tác Phẩm Nghệ Thuật
                </motion.h3>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Cột Trái: Upload Ảnh (Chiếm 5 phần) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-dashed border-amber-300/50 hover:border-amber-500 transition-all h-full min-h-[300px] flex flex-col justify-center">
                            {!previewUrl ? (
                                <label className="flex flex-col items-center justify-center cursor-pointer text-amber-700 py-10">
                                    <Sparkles className="w-16 h-16 mb-4 animate-pulse" />
                                    <p className="text-lg font-semibold">Tải ảnh gốc lên</p>
                                    <p className="text-sm text-amber-600 mt-1">Hỗ trợ PNG, JPG</p>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                            ) : (
                                <div className="relative w-full">
                                    <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-xl shadow-lg object-cover" />
                                    <button
                                        onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Cột Phải: Chọn Style & Prompt (Chiếm 7 phần) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7 space-y-6"
                    >
                        {/* --- 1. PHẦN CHỌN STYLE MỚI --- */}
                        <div>
                            <label className="block text-amber-800 font-semibold mb-3 flex items-center gap-2">
                                <Palette className="w-5 h-5" /> Chọn phong cách nghệ thuật
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {artStyles.map((style) => {
                                    const Icon = style.icon;
                                    const isSelected = selectedStyle === style.id;
                                    return (
                                        <motion.div
                                            key={style.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedStyle(style.id)}
                                            className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col items-center justify-center gap-2 text-center
                                                ${isSelected 
                                                    ? "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-500 shadow-md ring-1 ring-amber-300" 
                                                    : "bg-white/60 border-amber-100 hover:border-amber-300 hover:shadow-sm"
                                                }
                                            `}
                                        >
                                            <Icon className={`w-6 h-6 ${isSelected ? "text-orange-600" : "text-amber-400"}`} />
                                            <div>
                                                <p className={`text-sm font-bold leading-none ${isSelected ? "text-amber-900" : "text-amber-700"}`}>{style.name}</p>
                                                <p className="text-[10px] text-amber-600/70 mt-1">{style.desc}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- 2. INPUT PROMPT --- */}
                        <div className="relative">
                            <label className="block text-amber-800 font-semibold mb-2 ml-1">Mô tả ý tưởng của bạn</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ví dụ: Một chú mèo phi hành gia đang uống trà..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all resize-none text-amber-900 placeholder:text-amber-400"
                            />
                        </div>

                        {/* --- 3. BUTTON GENERATE --- */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generateImage}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Đang sáng tạo...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Tạo Tác Phẩm Ngay
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>

                {/* --- KẾT QUẢ --- */}
                <AnimatePresence>
                    {resultUrl && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mt-12 border-t border-amber-200 pt-8"
                        >
                            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border border-amber-100 flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-full md:w-1/2">
                                    <h4 className="text-2xl font-bold text-amber-800 mb-2 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-amber-600" /> Kết quả
                                    </h4>
                                    <p className="text-amber-700 mb-4">
                                        Phong cách: <span className="font-semibold">{artStyles.find(s => s.id === selectedStyle)?.name}</span>
                                    </p>
                                    <div className="relative group rounded-2xl overflow-hidden shadow-lg">
                                        <img src={resultUrl} alt="AI Art" className="w-full" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={resultUrl}
                                                download="ai-art.png"
                                                className="bg-white/90 text-amber-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-white transition-colors"
                                            >
                                                <Download size={18} /> Tải về
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 text-amber-800">
                                    <h5 className="font-bold text-lg mb-2">Bạn thấy thế nào?</h5>
                                    <p className="text-sm text-amber-700/80 mb-4">
                                        AI đã kết hợp bức ảnh gốc của bạn với phong cách <strong>{artStyles.find(s => s.id === selectedStyle)?.name}</strong>. 
                                        Bạn có thể thử lại với một phong cách khác để xem sự khác biệt!
                                    </p>
                                    <button 
                                        onClick={() => {setResultUrl(null);}}
                                        className="text-amber-600 border border-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm font-semibold"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showLoginPopup && (
                    <LoginPopup onClose={() => setShowLoginPopup(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

// Component TaoTranh (Component chính của trang)
const TaoTranh = () => {
    useEffect(() => {
        AOS.init({ duration: 1000, once: true });
    }, []);
    const navigate = useNavigate(); // Thêm hook này

    const handleExploreAI = () => {
        navigate("/congngheai#image");
    };
    return (
        <>
            {/* CSS Toàn cục */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .float { animation: float 6s ease-in-out infinite; }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #fbbf24;
          border-radius: 50%;
          pointer-events: none;
          animation: float 8s infinite linear;
        }
      `}</style>

            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 font-body text-amber-900 overflow-hidden">
                {/* Hạt ánh sáng nền */}
                <div className="fixed inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 8}s`,
                                animationDuration: `${6 + Math.random() * 6}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* Header Hero (Giữ nguyên) */}
                    <motion.header
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, type: "spring", stiffness: 100 }}
                        className="text-center py-16 md:py-24 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-200/20 to-transparent blur-3xl"></div>
                        <h1 className="text-5xl md:text-7xl font-title font-bold mb-6">
                            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                                AI, Vẽ Cho Tôi!
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-amber-700 max-w-4xl mx-auto leading-relaxed">
                            Chỉ cần <span className="font-bold text-orange-600">1 bức ảnh</span> +{" "}
                            <span className="font-bold text-amber-600">1 ý tưởng</span> →{" "}
                            <span className="italic text-orange-800">tác phẩm nghệ thuật độc nhất</span>
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                            <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
                            <div className="w-24 h-1 bg-gradient-to-l from-amber-500 to-orange-500 rounded-full"></div>
                        </div>
                    </motion.header>

                    {/* Main Creator (Giữ nguyên) */}
                    <section data-aos="fade-up" data-aos-delay="200">
                        <ImageCreator />
                    </section>

                    {/* --- 4. CẬP NHẬT VÒNG LẶP `.map()` --- */}
                    <section className="mt-24" data-aos="fade-up" data-aos-delay="400">
                        <h2 className="text-4xl font-title font-bold text-center mb-12 text-amber-800">
                            Khám Phá Các Công Cụ AI Khác
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {aiTools.map((tool, i) => (
                                // Bọc ToolCard trong motion.div để giữ hiệu ứng animation
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <ToolCard tool={tool} />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center mt-20 py-12"
                    >
                        <p className="text-amber-700 text-lg">
                            Sẵn sàng để <span className="font-bold text-orange-600">Khám phá những công cụ AI khác</span>?
                        </p>
                        <button
                            onClick={handleExploreAI}
                            className="mt-4 px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                        >
                            Bắt Đầu Ngay
                        </button>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default TaoTranh;