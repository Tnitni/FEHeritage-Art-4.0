import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Flower2,
  FolderOpen,
  Settings,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";

// --- IMPORT ẢNH NỀN ---
import bgVietnam from "../../src/assets/visual-ai-vietnam.png";

// --- 1. DỮ LIỆU MẪU ---

const VIETNAM_STYLES = [
  {
    id: "son_dau",
    name: "Sơn Dầu",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694658/sondau_h20ugz.jpg",
  },
  {
    id: "son_mai",
    name: "Sơn Mài",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694659/sonmai_pzmnhi.jpg",
  },
  {
    id: "dong_ho",
    name: "Đông Hồ",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694658/dongho_mshg5f.jpg",
  },
  {
    id: "hang_trong",
    name: "Hàng Trống",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694657/hangtrong_bjbs7h.jpg",
  },
  {
    id: "khac_go",
    name: "Khắc Gỗ",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694659/khacgo_e1ls7k.jpg",
  },
  {
    id: "lang_sinh_hue",
    name: "Làng Sình",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694657/langsinh_devj72.jpg",
  },
  {
    id: "lua",
    name: "Tranh Lụa",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694660/tranhlua_elnhph.jpg",
  },
  {
    id: "dan_toc_thieu_so",
    name: "Dân tộc thiểu số",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770694657/dantocthieuso_xvhclt.jpg",
  },
  {
    id: "gao",
    name: "Tranh Gạo",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772504836/tranh-gao_exf8il.jpg",
  },
];

const OTHER_STYLES = [
  {
    id: "neon_cyberpunk",
    name: "Neon Cyberpunk",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695158/cyberpunk_rjdxte.webp",
  },
  {
    id: "vibrant_color_pop",
    name: "Màu Sắc Rực Rỡ",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695158/M%C3%A0u_S%E1%BA%AFc_R%E1%BB%B1c_R%E1%BB%A1_pziyee.jpg",
  },
  {
    id: "social_meme",
    name: "Meme MXH",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695159/Meme_MXH_bzh1qt.png",
  },
  {
    id: "glossy_commercial",
    name: "Quảng Cáo Thương Mại",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695158/Qu%E1%BA%A3ng_C%C3%A1o_Th%C6%B0%C6%A1ng_M%E1%BA%A1i_bx9msj.jpg",
  },
  {
    id: "product_isometric",
    name: "Isometric Sản Phẩm",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695157/Isometric_S%E1%BA%A3n_Ph%E1%BA%A9m_nbhagp.jpg",
  },
  {
    id: "bg_removed_shadow",
    name: "Tách nền + Đổ bóng",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695159/T%C3%A1ch_n%E1%BB%81n_%C4%90%E1%BB%95_b%C3%B3ng_o2casp.png",
  },
  {
    id: "minimalist_flat",
    name: "Thiết kế phẳng tối giản",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695163/Thi%E1%BA%BFt_k%E1%BA%BF_ph%E1%BA%B3ng_t%E1%BB%91i_gi%E1%BA%A3n_jtswud.jpg",
  },
  {
    id: "cinematic_portrait",
    name: "Chân dung điện ảnh",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695157/Ch%C3%A2n_dung_%C4%91i%E1%BB%87n_%E1%BA%A3nh_d5qi9y.jpg",
  },
  {
    id: "black_white_classic",
    name: "Đen trắng cổ điển",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1770695157/%C4%90en_tr%E1%BA%AFng_c%E1%BB%95_%C4%91i%E1%BB%83n_cdkqw4.webp",
  },
  {
    id: "mau_nuoc",
    name: "Màu Nước",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505789/tranh-mau-nuoc_jajkbg.webp",
  },
  {
    id: "anime",
    name: "Anime",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505784/anime_neateh.jpg",
  },
  {
    id: "3d_pixar",
    name: "3D Pixar",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505783/3D_Pixar_uyxkar.jpg",
  },
  {
    id: "retro_pop_art",
    name: "Retro Pop-Art",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505784/Retro_Pop-Art_fjdmdo.webp",
  },
  {
    id: "soft_pastel",
    name: "Màu Phấn (Pastel)",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505784/M%C3%A0u_Ph%E1%BA%A5n_Pastel_xbjw1q.webp",
  },
  {
    id: "luxury_editorial",
    name: "Tạp Chí Cao Cấp",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505787/T%E1%BA%A1p_Ch%C3%AD_Cao_C%E1%BA%A5p_nzbge9.jpg",
  },
  {
    id: "double_exposure",
    name: "Phơi Sáng Kép",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505784/Ph%C6%A1i_S%C3%A1ng_K%C3%A9p_i8z5xw.jpg",
  },
  {
    id: "ai_painted",
    name: "Tranh Vẽ AI",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505789/Tranh_V%E1%BA%BD_AI_pyqegt.png",
  },
  {
    id: "high_contrast_editorial",
    name: "Chân Dung Tương Phản",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505784/Ch%C3%A2n_Dung_T%C6%B0%C6%A1ng_Ph%E1%BA%A3n_u1bqlq.webp",
  },
  {
    id: "flat_lay",
    name: "Sắp Đặt Flat-lay",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505787/S%E1%BA%AFp_%C4%90%E1%BA%B7t_Flat-lay_cqn9zr.jpg",
  },
  {
    id: "3d_render_realistic",
    name: "3D Chân Thực",
    img: "https://res.cloudinary.com/dypm5avrx/image/upload/v1772505783/3D_Ch%C3%A2n_Th%E1%BB%B1c_jqs0qw.webp",
  },
];

const FONT_OPTIONS = [
  { id: "serif", name: "Trang trọng", className: "font-trangtrong" },
  { id: "handwriting", name: "Thư pháp", className: "font-thuphap" },
  { id: "brush", name: "Cọ vẽ", className: "font-cove" },
  { id: "classic", name: "Cổ điển", className: "font-codien" },
  { id: "arial", name: "Arial", className: "font-arial font-bold" },
  { id: "calibri", name: "Calibri", className: "font-calibri" },
];

// // --- 2. DỮ LIỆU CÔNG CỤ AI ---
const aiTools = [
  {
    id: 1,
    name: "Bing Image Creator",
    desc: "Phát triển bởi DALL·E 3, mạnh mẽ và sáng tạo.",
    link: "https://www.bing.com/images/create",
    rating: 5,
    ratingCount: 120,
  },
  {
    id: 2,
    name: "Midjourney",
    desc: "Tiêu chuẩn vàng cho AI nghệ thuật đỉnh cao.",
    link: "https://www.midjourney.com/",
    rating: 5,
    ratingCount: 250,
  },
  {
    id: 3,
    name: "Stable Diffusion",
    desc: "Lựa chọn mã nguồn mở mạnh mẽ, có thể tùy chỉnh.",
    link: "https://huggingface.co/spaces/stabilityai/stable-diffusion",
    rating: 4,
    ratingCount: 90,
  },
  {
    id: 4,
    name: "Pika Labs",
    desc: "Chuyên gia tạo video AI từ văn bản hoặc ảnh.",
    link: "https://www.pika.art/",
    rating: 4,
    ratingCount: 75,
  },
  {
    id: 5,
    name: "NightCafe",
    desc: "Cung cấp nhiều phong cách và thuật toán AI.",
    link: "https://www.nightcafe.studio/",
    rating: 4,
    ratingCount: 60,
  },
  {
    id: 6,
    name: "Runway ML",
    desc: "Biến video, ảnh tĩnh hoặc văn bản thành video.",
    link: "https://www.runwayml.com/",
    rating: 5,
    ratingCount: 150,
  },
];

// // --- 3. COMPONENT TOOLCARD ---
const ToolCard = ({ tool }) => {
  const favicon = `https://www.google.com/s2/favicons?domain=${new URL(tool.link).hostname}&sz=64`;
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
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,230,180,0.25), rgba(255,210,150,0.25))",
        }}
      ></div>
      <div className="relative z-10 flex flex-col gap-2">
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
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={`${
                i < rating ? "fill-[#f4c542] text-[#f4c542]" : "text-[#d4c7a2]"
              } transition-colors`}
            />
          ))}
          <span className="text-xs text-[#8a7a5c] ml-2">({ratingCount})</span>
        </div>
        <p className="text-sm text-[#7a6850] mt-1 line-clamp-3">{tool.desc}</p>
      </div>
      <div className="relative z-10 mt-3 flex justify-end">
        <div className="flex items-center gap-1 text-[#c18a3d] font-semibold text-sm border border-[#c18a3d] rounded-lg px-3 py-1.5 hover:bg-[#c18a3d] hover:text-white transition-all">
          Truy cập <ExternalLink size={14} />
        </div>
      </div>
    </motion.a>
  );
};

// --- 4. COMPONENT LOGIN POPUP ---
const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-amber-100 rounded-full border-4 border-amber-200">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-amber-800 mb-2">
          Yêu Cầu Đăng Nhập
        </h3>
        <p className="text-gray-600 mb-6">
          Hãy đăng nhập hoặc đăng ký để tiếp tục sử dụng tính năng tạo ảnh bằng
          AI này.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleLoginClick}
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

// --- 5. COMPONENT IMAGECREATOR ---
const ImageCreator = () => {
  // 1. GLOBAL STATE
  const { isLoggedIn } = useUser();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);

  // 2. Upload image State
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("1/1");

  // 3. Promt State
  const [prompt, setPrompt] = useState("");

  // 4. Tabs State
  const [activeTab, setActiveTab] = useState("available");
  const [activeFilter, setActiveFilter] = useState("Nghệ thuật");
  const filterCategories = ["Nghệ thuật", "Nhân vật", "Nhóm", "Khác"];

  const [activeSubTab, setActiveSubTab] = useState("vietnam");
  const [selectedStyle, setSelectedStyle] = useState(VIETNAM_STYLES[0].id);
  const scrollRef = useRef(null);

  // 5. Template State
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState(null);

  // 6. Settings State
  const [isCopyright, setIsCopyright] = useState(false);
  const [copyrightText, setCopyrightText] = useState("");
  const [selectedFont, setSelectedFont] = useState("serif");

  // 7. Camera State
  const [showCamera, setShowCamera] = useState(false); // Bật/tắt chế độ chụp ảnh
  const videoRef = useRef(null); // Ref để điều khiển thẻ video
  const canvasRef = useRef(null); // Ref để chụp ảnh từ video

  // Tự động chọn style đầu tiên và reset thanh cuộn khi đổi SubTab
  useEffect(() => {
    // 1. Xác định danh sách mới là gì
    const newList = activeSubTab === "vietnam" ? VIETNAM_STYLES : OTHER_STYLES;

    // 2. Set active cho item đầu tiên trong danh sách mới
    if (newList.length > 0) {
      setSelectedStyle(newList[0].id);
    }

    // 3. Reset thanh cuộn về đầu (bên trái) cho gọn
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [activeSubTab]);

  // Hàm cuộn ngang
  const scrollList = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Xác định danh sách ảnh hiện tại để map ra
  const currentStyles =
    activeSubTab === "vietnam" ? VIETNAM_STYLES : OTHER_STYLES;

  // Hàm xử lý Filter Bar
  const handleFilterClick = (category) => {
    setActiveFilter(category);
    setResultUrl(null);
  };

  // Hàm xử lý upload ảnh
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hàm xử lý upload Template
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTemplateFile(file);
      setTemplatePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Hàm xóa ảnh đầu vào
  const clearImageInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
  };

  // Hàm xóa Template
  const clearTemplate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateFile(null);
    setTemplatePreviewUrl(null);
  };

  // === HÀM CHUYỂN IMAGE URL THÀNH FILE (Để gửi đi) ===
  const createFileFromUrl = async (url, filename) => {
    const response = await fetch(url);
    const data = await response.blob();
    const metadata = { type: "image/png" };
    return new File([data], filename, metadata);
  };

  // === HÀM GỌT ẢNH THÀNH HÌNH VUÔNG 1:1 BẰNG CANVAS ===
  // === HÀM GỌT ẢNH THEO TỶ LỆ CHỌN TRÊN GIAO DIỆN ===
  const cropImageByRatio = (imageUrl, ratioString) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        // 1. Tách tỷ lệ từ chuỗi (VD: "4/3" -> w=4, h=3)
        const [ratioW, ratioH] = ratioString.split("/").map(Number);
        const targetRatio = ratioW / ratioH;
        const imageRatio = img.width / img.height;

        let cropWidth = img.width;
        let cropHeight = img.height;

        // 2. Tính toán kích thước cắt sao cho khung hình không bị méo
        if (imageRatio > targetRatio) {
          // Ảnh gốc quá rộng -> Giữ nguyên chiều cao, xén bớt 2 bên chiều rộng
          cropHeight = img.height;
          cropWidth = cropHeight * targetRatio;
        } else {
          // Ảnh gốc quá cao -> Giữ nguyên chiều rộng, xén bớt trên dưới
          cropWidth = img.width;
          cropHeight = cropWidth / targetRatio;
        }

        // 3. Tính tọa độ để luôn cắt ở chính giữa trung tâm bức ảnh
        const startX = (img.width - cropWidth) / 2;
        const startY = (img.height - cropHeight) / 2;

        // 4. Mở khung Canvas và tiến hành cắt
        const canvas = document.createElement("canvas");
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          img,
          startX,
          startY,
          cropWidth,
          cropHeight, // Lấy phần lõi của ảnh gốc
          0,
          0,
          cropWidth,
          cropHeight, // Dán vừa khít vào Canvas
        );

        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  //Hàm tạo ảnh
  const generateImage = async () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }
    if (!imageFile) {
      toast.warning("Vui lòng chọn ảnh đầu vào!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      let apiUrl = "";

      if (activeFilter === "Nghệ thuật") {
        // --- LOGIC STYLE TRANSFER (CŨ) ---
        apiUrl =
          "https://nova-ai-3-n1yj.onrender.com/style_transfer/style-transfer";
        const croppedImageUrl = await cropImageByRatio(previewUrl, aspectRatio);
        const croppedImageFile = await createFileFromUrl(
          croppedImageUrl,
          "input.png",
        );

        formData.append("image", croppedImageFile);
        formData.append("style", selectedStyle);
      } else if (activeFilter === "Nhân vật") {
        // --- LOGIC FACE SWAP (MỚI) ---
        if (!templateFile) {
          toast.warning("Vui lòng upload ảnh Template để đổi mặt!");
          setLoading(false);
          return;
        }
        apiUrl = "https://nova-ai-3-n1yj.onrender.com/faceswap/faceswap/style";

        formData.append("file", imageFile); // Ảnh mặt mình
        formData.append("template", templateFile); // Ảnh người mẫu/lịch sử
        formData.append("upscale", true); // Cho ảnh nét hơn
      }

      const response = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      setResultUrl(URL.createObjectURL(response.data));
      toast.success("Tạo ảnh thành công!");
    } catch (error) {
      toast.error("Lỗi máy chủ AI!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm khởi động Camera
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Lỗi mở camera:", err);
      toast.error(
        "Không thể truy cập Camera. Vui lòng kiểm tra quyền truy cập!",
        { position: "top-right" },
      );
      setShowCamera(false);
    }
  };

  // Hàm chụp ảnh từ Video
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      // Thiết lập kích thước canvas bằng kích thước video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Vẽ ảnh từ video lên canvas
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Chuyển canvas thành URL ảnh
      const photoUrl = canvas.toDataURL("image/png");
      setPreviewUrl(photoUrl); // Hiển thị ảnh chụp lên khung preview

      // Chuyển canvas thành File object (để gửi đi xử lý sau này nếu cần)
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-photo.png", {
          type: "image/png",
        });
        setImageFile(file);
      });

      stopCamera(); // Chụp xong thì tắt camera
    }
  };

  // Hàm tắt Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Dừng tất cả các luồng camera
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  return (
    <div className="bg-white w-full max-w-6xl rounded-[30px] border-1 border-amber-200 shadow-2xl overflow-hidden p-8 md:p-10 relative">
      <h2 className="text-3xl text-amber-800 md:text-4xl font-bold text-center mb-8">
        Biến ảnh thành tác phẩm nghệ thuật
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* === CỘT TRÁI: UPLOAD & CAMERA === */}
        <div className="flex flex-col gap-4 w-full">
          {/* 1. KHUNG ẢNH BIẾN HÌNH (MAGIC BOX)
              - Thay aspect-square bằng style={{ aspectRatio }}
              - Thêm transition-all duration-500 để hiệu ứng mượt mà
          */}
          <div
            className="relative w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center group hover:bg-slate-100 transition-all duration-500 ease-in-out cursor-pointer overflow-hidden shadow-inner"
            style={{ aspectRatio: aspectRatio }}
          >
            {showCamera ? (
              <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-full"></div>
                </button>
                <button
                  onClick={stopCamera}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : !previewUrl ? (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <span className="text-gray-500 font-medium text-lg">
                  Ảnh đầu vào
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="main-upload-input"
                />
              </label>
            ) : (
              <div className="relative w-full h-full">
                {/* Ảnh preview: object-cover để tràn khung, object-contain để hiện full ảnh.
                    Dựa theo yêu cầu "tràn hình vuông", dùng object-cover sẽ đẹp hơn khi đổi tỷ lệ */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={clearImageInput}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>
            )}
          </div>

          {/* 2. THANH CÔNG CỤ */}
          <div className="grid grid-cols-12 gap-3 h-14">
            <div className="col-span-6 relative h-full">
              {/* DROPDOWN CHỌN TỶ LỆ */}
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full h-full appearance-none bg-white border border-gray-200 text-gray-700 font-semibold text-base pl-4 pr-10 rounded-xl cursor-pointer transition-all outline-none focus:border-amber-100 focus:ring-0 hover:border-amber-400 shadow-sm"
              >
                <option value="1/1">Vuông 1:1</option>
                <option value="3/4">Chân dung 3:4</option>
                <option value="4/3">Phong cảnh 4:3</option>
                <option value="9/16">Chân dung 9:16</option>
                <option value="16/9">Phong cảnh 16:9</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <ChevronDown size={20} />
              </div>
            </div>

            <label
              htmlFor="main-upload-input"
              className="col-span-3 h-full bg-white border border-gray-200 rounded-xl hover:bg-yellow-50 hover:border-yellow-400 hover:scale-105 transition-all shadow-sm flex items-center justify-center group relative cursor-pointer"
              title="Chọn từ thư viện"
            >
              <FolderOpen
                size={28}
                className="text-yellow-500 fill-yellow-400 drop-shadow-sm"
              />
            </label>
            <button
              onClick={startCamera}
              className="col-span-3 h-full bg-white border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 hover:scale-105 transition-all shadow-sm flex items-center justify-center group relative"
              title="Chụp ảnh mới"
            >
              <div className="relative">
                <Camera size={28} className="text-slate-600 fill-slate-200" />
                <Sparkles
                  size={14}
                  className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-400 animate-pulse"
                />
              </div>
            </button>
          </div>
        </div>

        {/* === CỘT PHẢI: BẢNG ĐIỀU KHIỂN === */}
        <div className="flex flex-col gap-6">
          {/* 1. Phần Tùy Chỉnh */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-1">
              <Settings className="w-5 h-5 text-gray-400 animate-spin-slow" />
              <span className="font-bold text-gray-700 text-lg">Tùy chỉnh</span>
            </div>

            {/* A. Toggle Bản Quyền */}
            <div
              className={`border rounded-2xl p-5 transition-all duration-300 ${isCopyright ? "bg-pink-50/30 border-rose-100 shadow-sm" : "bg-pink-50/30 border-pink-200"}`}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flower2 className="w-6 h-6 text-pink-400 fill-pink-50" />
                  <span className="font-bold text-gray-700 text-base">
                    Đóng dấu bản quyền
                  </span>
                </div>

                <button
                  onClick={() => setIsCopyright(!isCopyright)}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center ${
                    isCopyright ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      isCopyright ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* BODY (HIỆN KHI BẬT) */}
              {isCopyright && (
                <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Ô NHẬP TÊN */}
                  <input
                    type="text"
                    value={copyrightText}
                    maxLength={15}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    placeholder="Nhập tên của bạn..."
                    className="w-full p-3 border border-rose-200 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-200 transition-all text-center font-medium bg-white shadow-sm mb-4"
                  />

                  {/* GRID CHỌN FONT */}
                  <div>
                    <p className="text-sm font-bold text-gray-600 mb-2">
                      Chọn kiểu chữ:
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <div
                          key={font.id}
                          onClick={() => setSelectedFont(font.id)}
                          className={`cursor-pointer h-24 rounded-xl border flex flex-col items-center justify-between py-2 px-1 transition-all ${
                            selectedFont === font.id
                              ? "border-rose-500 bg-rose-50 ring-1 ring-rose-200 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          {/* KHUNG CHỨA CHỮ REVIEW */}
                          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                            <span
                              className={`text-[16px] text-[#B91C1C] ${font.className} leading-tight break-words w-full text-center`}
                            >
                              {/* Nếu có nhập text thì hiện text, không thì hiện "Tên" */}
                              {copyrightText || "Tên"}
                            </span>
                          </div>

                          {/* TÊN FONT (Subtitle nhỏ và mờ) */}
                          <span className="text-[10px] text-gray-400 text-center leading-none mt-1">
                            {font.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* B. Chọn kiểu áp dụng */}
            <div className="bg-amber-50/30 border border-[#FFE5CC] rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(255,150,0,0.1)]">
              <h3 className="font-bold text-gray-700 text-base mb-4">
                Chọn kiểu áp dụng
              </h3>

              {/* GIỮ NGUYÊN 2 TABS LỚN THEO Ý SẾP */}
              <div className="flex gap-4 mb-5">
                <button
                  onClick={() => setActiveTab("available")}
                  className={`flex-1 py-3 rounded-xl cursor-pointer border-2 font-bold text-sm transition-all ${activeTab === "available" ? "border-orange-400 text-amber-600 bg-amber-50/40 shadow-sm" : "border-gray-100 bg-white text-gray-500"}`}
                >
                  Style có sẵn
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 py-3 rounded-xl cursor-pointer border-2 font-bold text-sm transition-all ${activeTab === "upload" ? "border-orange-400 text-amber-600 bg-amber-50/40 shadow-sm" : "border-gray-100 bg-white text-gray-500"}`}
                >
                  Upload
                </button>
              </div>

              {/* NỘI DUNG TRONG TAB STYLE CÓ SẴN */}
              {activeTab === "available" ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  {/* 4 SUB-TABS (Nghệ thuật, Nhân vật...) */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-1.5 mb-4">
                    {filterCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilterClick(category)}
                        className={`flex-1 py-2 text-sm rounded-lg transition-all ${activeFilter === category ? "bg-white text-rose-500 font-bold shadow-sm" : "text-gray-500 font-medium cursor-pointer hover:text-gray-700"}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* NẾU LÀ SUB-TAB NGHỆ THUẬT -> HIỆN SLIDER NHƯ CŨ */}
                  {activeFilter === "Nghệ thuật" && (
                    <div className="animate-in fade-in duration-300">
                      <div className="flex justify-center gap-3 mb-4">
                        <button
                          onClick={() => setActiveSubTab("vietnam")}
                          className={`px-5 py-1.5 rounded-full cursor-pointer text-xs font-bold transition-all border ${activeSubTab === "vietnam" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        >
                          Nghệ thuật Việt
                        </button>
                        <button
                          onClick={() => setActiveSubTab("other")}
                          className={`px-5 py-1.5 rounded-full cursor-pointer text-xs font-bold transition-all border ${activeSubTab === "other" ? "bg-purple-50 text-purple-600 border-purple-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        >
                          Khác
                        </button>
                      </div>

                      <div className="mb-2">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex justify-between items-center">
                          Phong cách nghệ thuật
                          <div className="flex gap-2">
                            <button
                              onClick={() => scrollList("left")}
                              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm active:scale-95 transition-all"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={() => scrollList("right")}
                              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm active:scale-95 transition-all"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </h4>
                        <div
                          ref={scrollRef}
                          className="flex gap-3 overflow-x-auto pb-4 scroll-smooth no-scrollbar"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {currentStyles.map((style) => (
                            <div
                              key={style.id}
                              onClick={() => setSelectedStyle(style.id)}
                              className="flex-shrink-0 w-[100px] cursor-pointer group relative"
                            >
                              <div
                                className={`overflow-hidden rounded-xl aspect-square border-2 transition-all ${selectedStyle === style.id ? "border-green-500 ring-2 ring-green-100" : "border-transparent"}`}
                              >
                                <img
                                  src={style.img}
                                  alt={style.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {selectedStyle === style.id && (
                                <div className="absolute top-1 right-1 bg-green-500 text-white p-0.5 rounded-full">
                                  <Check size={10} />
                                </div>
                              )}
                              <p
                                className={`text-center text-[11px] font-semibold mt-2 ${selectedStyle === style.id ? "text-green-600" : "text-gray-600"}`}
                              >
                                {style.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NẾU LÀ SUB-TAB NHÂN VẬT -> HIỆN KHUNG UPLOAD TEMPLATE NHỎ */}
                  {activeFilter === "Nhân vật" && (
                    <div className="animate-in fade-in zoom-in duration-300">
                      <div className="text-center text-gray-500 text-sm mb-3 font-semibold italic">
                        Tải ảnh mẫu Face Swap
                      </div>
                      <div className="border-2 border-dashed border-amber-200 rounded-xl bg-white min-h-[140px] flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50 transition-colors relative overflow-hidden group">
                        {!templatePreviewUrl ? (
                          <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer">
                            <FolderOpen
                              size={32}
                              className="text-amber-500 mb-2 group-hover:scale-110 transition-transform"
                            />
                            <span className="font-bold text-gray-700 text-xs">
                              Chọn ảnh mẫu muốn ghép
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleTemplateUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="relative w-full p-2">
                            <img
                              src={templatePreviewUrl}
                              alt="Template"
                              className="w-full h-32 object-contain mx-auto rounded-lg"
                            />
                            <div className="absolute bottom-2 left-0 right-0 bg-green-500/80 py-1 flex items-center justify-center text-[10px] text-white font-bold">
                              <Check size={12} className="mr-1" /> ĐÃ CHỌN
                              TEMPLATE
                            </div>
                            <button
                              onClick={clearTemplate}
                              className="absolute top-3 right-3 bg-white/90 p-1 rounded-full text-red-500 shadow-sm"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CÁC SUB-TAB CÒN LẠI */}
                  {(activeFilter === "Nhóm" || activeFilter === "Khác") && (
                    <div className="py-10 text-center text-gray-400 italic text-sm">
                      Tính năng "{activeFilter}" đang phát triển...
                    </div>
                  )}
                </div>
              ) : (
                /* TAB UPLOAD LỚN (GIỮ NGUYÊN CODE CŨ) */
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="text-center text-gray-500 text-sm mb-2">
                    Upload Template
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white min-h-[130px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
                    {!templatePreviewUrl ? (
                      <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer">
                        <FolderOpen
                          size={40}
                          className="fill-yellow-400 text-yellow-400 mb-1"
                        />
                        <span className="font-bold text-gray-700 text-sm">
                          Chọn ảnh template
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTemplateUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative w-full p-2">
                        <img
                          src={templatePreviewUrl}
                          alt="Template Preview"
                          className="w-full h-auto max-h-64 object-contain mx-auto rounded-lg shadow-md"
                        />
                        <button
                          onClick={clearTemplate}
                          className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 2. Button Tạo ảnh */}
          <button
            onClick={generateImage}
            disabled={loading}
            className="w-full py-3.5 mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:bg-[#ff5500] text-white cursor-pointer rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Tạo ảnh"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {resultUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-20 p-8 flex flex-col items-center justify-center"
          >
            <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <Sparkles /> Hoàn thành!
            </h3>
            <img
              src={resultUrl}
              className="max-h-[60vh] w-auto object-contain rounded-xl shadow-2xl mb-6"
              alt="Result"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setResultUrl(null);
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="px-6 py-2 bg-gray-100 rounded-full font-medium hover:bg-gray-200"
              >
                Làm lại
              </button>
              <a
                href={resultUrl}
                download
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={18} /> Tải về
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginPopup && (
          <LoginPopup onClose={() => setShowLoginPopup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 6. COMPONENT TAOTRANH ---
const TaoTranh = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const navigate = useNavigate();
  const handleExploreAI = () => {
    navigate("/congngheai#image");
  };

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&family=Playfair+Display:wght@700&display=swap");

        .font-trangtrong {
          font-family: "Times New Roman", Times, serif !important;
        }
        .font-thuphap {
          font-family: "Dancing Script", cursive !important;
        }
        .font-cove {
          font-family: "Pacifico", cursive !important;
        }
        .font-codien {
          font-family: "Playfair Display", serif !important;
        }
        .font-arial {
          font-family: Arial, sans-serif !important;
        }
        .font-calibri {
          font-family: "Calibri", sans-serif !important;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
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

      {/* WRAPPER CHÍNH: Relative + Min-Screen */}
      <div className="relative min-h-screen font-body overflow-hidden">
        <ToastContainer
          style={{ zIndex: 99999, top: "100px" }}
          autoClose={3000}
        />
        {/* === A. LỚP BACKGROUND CỐ ĐỊNH === */}
        <div className="fixed inset-0 z-0">
          <img
            src={bgVietnam}
            alt="Background Heritage"
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ đen nhẹ để chữ nổi bật hơn */}
          <div className="absolute inset-0 bg-[#FFF9F2]/80"></div>

          {/* Hạt Particle bay bay (Giữ nguyên từ code cũ nhưng đặt trong fixed) */}
          <div className="absolute inset-0 pointer-events-none">
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
        </div>

        {/* === B. LỚP NỘI DUNG CUỘN === */}
        {/* relative z-10 để nổi lên trên nền fixed */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header Hero */}
            <motion.header
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring", stiffness: 100 }}
              className="text-center py-16 md:py-24 relative"
            >
              <h1 className="text-4xl md:text-6xl font-title font-bold mb-6 drop-shadow-md">
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Tạo ảnh AI
                </span>
              </h1>
              <p className="text-xl italic md:text-2xl text-amber-900 font-medium max-w-4xl mx-auto leading-relaxed drop-shadow-sm">
                Upload hoặc chụp ảnh → Hóa thân → Thanh toán → Tải ảnh
              </p>
            </motion.header>

            {/* Component Tạo Ảnh (Layout Ngang Mới) */}
            <section
              data-aos="fade-up"
              data-aos-delay="200"
              className="flex justify-center mb-24"
            >
              <ImageCreator />
            </section>

            {/* Danh sách công cụ AI khác (Layout Cũ) */}
            <section data-aos="fade-up" data-aos-delay="400">
              <h2 className="text-4xl font-title font-bold text-center mb-12 text-amber-900 drop-shadow-sm">
                Khám Phá Các Công Cụ AI Khác
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {aiTools.map((tool, i) => (
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

            {/* Footer Call to Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-20 py-12"
            >
              <p className="text-amber-900 text-lg font-medium">
                Sẵn sàng để{" "}
                <span className="font-bold text-orange-700">
                  Khám phá những công cụ AI khác
                </span>
                ?
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
      </div>
    </>
  );
};

export default TaoTranh;
