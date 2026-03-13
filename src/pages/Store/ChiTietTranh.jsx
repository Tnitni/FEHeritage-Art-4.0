// // src/pages/ChiTietTranh.jsx
// import React, { useState, useEffect, useContext } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import toast, { Toaster } from "react-hot-toast";
// import { useArts } from "../../context/ArtContext";
// import { UserContext } from "../../context/UserContext";
// import { useCart } from "../../context/CartContext";
// import logoWatermark from "../../assets/logo-watermark.png";

// // Component sản phẩm tương tự
// function SimilarProductItem({ item, logoWatermark, addWatermark }) {
//   const [simWatermarked, setSimWatermarked] = useState(null);
//   const defaultImage = item.images ? item.images[Object.keys(item.images)[0]] : "";
  
//   useEffect(() => {
//     if (defaultImage) {
//       addWatermark(defaultImage, logoWatermark, setSimWatermarked);
//     }
//   }, [item, logoWatermark, addWatermark, defaultImage]);

//   return (
//     <Link to={`/chi-tiet/${item.id}`} className="group bg-gray-50 rounded-md shadow hover:shadow-md overflow-hidden transition">
//       <div className="relative">
//         <img 
//           src={simWatermarked || defaultImage} 
//           alt={item.title} 
//           className="h-32 w-full object-cover group-hover:scale-105 transition-transform" 
//         />
//         {item.type === "souvenir" && (
//           <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
//             🎁 Đồ lưu niệm
//           </div>
//         )}
//       </div>
//       <div className="p-2">
//         <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
//         <p className="text-orange-600 text-sm font-bold">
//           {item.price[Object.keys(item.price)[0]].toLocaleString()}₫
//         </p>
//       </div>
//     </Link>
//   );
// }

// export default function ChiTietTranh() {
//   // Context & state
//   const user = useContext(UserContext);
//   const { addToCart } = useCart();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { arts: allArts } = useArts();
  
//   // Tìm sản phẩm (bao gồm cả đồ lưu niệm nếu có trong context)
//   const art = allArts.find((a) => a.id === parseInt(id));
  
//   const [selectedType, setSelectedType] = useState("");
//   const [prevIndex, setPrevIndex] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [isZoomed, setIsZoomed] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
//   const [watermarkedImage, setWatermarkedImage] = useState(null);

//   // Khởi tạo selectedType khi component mount hoặc art thay đổi
//   useEffect(() => {
//     if (art && art.price) {
//       const firstType = Object.keys(art.price)[0];
//       setSelectedType(firstType);
//     }
//   }, [art]);

//   // Load đánh giá từ localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem(`reviews_${id}`);
//     if (saved) setReviews(JSON.parse(saved));
//   }, [id]);

//   // Loại, giá, ảnh (an toàn khi art chưa sẵn sàng)
//   const types = art && art.images ? Object.keys(art.images) : [];
//   const selectedIndex = types.indexOf(selectedType);
//   const price = art && selectedType ? (art.price[selectedType] || 0) : 0;
//   const image = art && selectedType ? art.images[selectedType] : undefined;

//   // Chuyển loại
//   const changeType = (type) => {
//     setPrevIndex(selectedIndex);
//     setSelectedType(type);
//   };

//   const direction = (() => {
//     const newIndex = types.indexOf(selectedType);
//     if (prevIndex === newIndex) return 0;
//     return newIndex > prevIndex ? 1 : -1;
//   })();

//   const variants = {
//     enter: (dir) => ({ x: dir * 200, opacity: 0 }),
//     center: { x: 0, opacity: 1 },
//     exit: (dir) => ({ x: -dir * 200, opacity: 0 }),
//   };

//   // Thêm watermark vào ảnh
//   const addWatermark = (imageSrc, logoSrc, callback) => {
//     const img = new window.Image();
//     img.crossOrigin = "anonymous";
//     img.src = imageSrc;
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
//       const logo = new window.Image();
//       logo.src = logoSrc;
//       logo.onload = () => {
//         const logoWidth = img.width * 0.25;
//         const logoHeight = (logo.height / logo.width) * logoWidth;
//         const x = (img.width - logoWidth) / 2;
//         const y = (img.height - logoHeight) / 2;
//         ctx.globalAlpha = 0.35;
//         ctx.drawImage(logo, x, y, logoWidth, logoHeight);
//         const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
//         callback(dataUrl);
//       };
//     };
//   };

//   // Khi ảnh thay đổi, thêm watermark
//   useEffect(() => {
//     if (image) {
//       addWatermark(image, logoWatermark, setWatermarkedImage);
//     }
//   }, [image]);

//   // Nếu không tìm thấy sản phẩm (đặt SAU tất cả hooks)
//   if (!art)
//     return <div className="p-10 text-center text-red-600 font-bold text-xl">Không tìm thấy sản phẩm!</div>;

//   // Toast
//   const toastAddCart = () => toast.success("Đã thêm vào giỏ hàng");
//   const toastReview = () => toast.success("Đánh giá của bạn đã được lưu!");

//   // Thêm vào giỏ hàng
//   const handleAddToCart = () => {
//     if (typeof addToCart === "function") {
//       addToCart(art, selectedType, quantity);
//       toastAddCart();
//     } else {
//       toast.error("❌ Lỗi: Chưa có hàm addToCart!");
//     }
//   };

//   // Mua ngay
//   const handleBuyNow = () => {
//     if (typeof addToCart === "function") {
//       addToCart(art, selectedType, quantity);
//       toast.success("🧾 Đang chuyển đến trang thanh toán...");
//       navigate("/checkout");
//     } else {
//       toast.error("❌ Lỗi: Chưa có hàm addToCart!");
//     }
//   };

//   // Thêm đánh giá
//   const handleAddReview = (e) => {
//     e.preventDefault();
//     if (!newReview.name.trim() || !newReview.comment.trim()) {
//       toast.error("Vui lòng nhập đầy đủ thông tin");
//       return;
//     }
//     const r = { ...newReview, date: new Date().toLocaleString() };
//     const updated = [r, ...reviews];
//     setReviews(updated);
//     localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
//     setNewReview({ name: "", rating: 5, comment: "" });
//     toastReview();
//   };

//   // Sản phẩm tương tự
//   const similarItems = allArts?.filter((a) => a.category === art?.category && a.id !== art?.id) || [];
  
//   const renderSimilarProducts = () => {
//     if (similarItems.length === 0) return <p className="text-gray-500">Không có sản phẩm tương tự.</p>;
//     return (
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {similarItems.map((item) => (
//           <SimilarProductItem key={item.id} item={item} logoWatermark={logoWatermark} addWatermark={addWatermark} />
//         ))}
//       </div>
//     );
//   };

//   // Kiểm tra loại sản phẩm
//   const isSouvenir = art.type === "souvenir";

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-10">
//       <Toaster position="top-right" />
//       <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 grid md:grid-cols-2 gap-8">
//         {/* Ảnh chính */}
//         <div>
//           <motion.div className="overflow-hidden rounded-lg shadow-md relative cursor-zoom-in select-none" onClick={() => setIsZoomed(true)}>
//             <AnimatePresence custom={direction} mode="wait">
//               <motion.img
//                 key={selectedType}
//                 src={watermarkedImage || image}
//                 alt={`${art.title} - ${selectedType}`}
//                 className="w-full h-[460px] object-cover rounded-lg pointer-events-none"
//                 custom={direction}
//                 variants={variants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 transition={{ duration: 0.45 }}
//               />
//             </AnimatePresence>
//             <div className="absolute bottom-3 left-3 bg-black/40 text-white text-sm px-3 py-1 rounded">{selectedType}</div>
//           </motion.div>
          
//           {/* Thumbnails */}
//           <div className="flex gap-3 mt-4 overflow-x-auto">
//             {types.map((type) => (
//               <motion.button
//                 key={type}
//                 onClick={() => changeType(type)}
//                 whileHover={{ scale: 1.05 }}
//                 className={`flex-none border rounded-lg overflow-hidden ${selectedType === type ? "ring-2 ring-orange-400" : "border-gray-200"}`}
//               >
//                 <img src={art.images[type]} alt={type} className="w-20 h-20 object-cover" />
//               </motion.button>
//             ))}
//           </div>
//         </div>

//         {/* Thông tin */}
//         <div className="flex flex-col">
//           <h1 className="text-3xl font-bold text-gray-800">{art.title}</h1>
//           <p className="text-sm text-gray-500 mb-2">Chủ đề: {art.category}</p>
          
//           <div className="flex items-center gap-3 my-2">
//             <div className="text-yellow-400">{"★".repeat(reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 5)}</div>
//             <div className="text-sm text-gray-600">({reviews.length} đánh giá)</div>
//           </div>
          
//           <div className="text-3xl font-extrabold text-orange-600 mb-4">{price.toLocaleString()}₫</div>
          
//           {/* Chọn loại */}
//           <div className="mb-4">
//             <div className="text-sm font-medium mb-2">
//               {isSouvenir ? "Chọn tùy chọn:" : "Chọn loại:"}
//             </div>
//             <div className="flex flex-wrap gap-3">
//               {types.map((type) => (
//                 <button
//                   key={type}
//                   onClick={() => changeType(type)}
//                   className={`px-4 py-2 rounded-md border ${selectedType === type ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"}`}
//                 >
//                   {type}
//                 </button>
//               ))}
//             </div>
//           </div>
          
//           {/* Số lượng */}
//           <div className="mb-4">
//             <div className="text-sm font-medium mb-2">Số lượng</div>
//             <div className="inline-flex items-center border rounded-md">
//               <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
//               <div className="px-6">{quantity}</div>
//               <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2">+</button>
//             </div>
//           </div>
          
//           {/* Nút hành động */}
//           <div className="flex gap-3 mt-2">
//             <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition">🛒 Thêm vào giỏ</button>
//             <button onClick={handleBuyNow} className="flex-1 bg-amber-400 text-white py-3 rounded-md font-semibold hover:bg-amber-500 transition">Mua ngay</button>
//           </div>
//         </div>
//       </div>

//       {/* Mô tả chi tiết */}
//       <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
//         <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2"><span className="text-indigo-600">📖</span> Mô tả chi tiết</h2>
//         <p className="text-gray-700 leading-relaxed whitespace-pre-line">{art.description}</p>
//       </div>

//       {/* Đánh giá + sản phẩm tương tự */}
//       <div className="max-w-7xl mx-auto mt-6 grid md:grid-cols-3 gap-6">
//         <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
//           <h3 className="text-lg font-semibold mb-4">Đánh giá của người dùng</h3>
//           <form onSubmit={handleAddReview} className="space-y-3 mb-6">
//             <input type="text" placeholder="Tên của bạn" className="w-full border rounded p-2" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} required />
//             <div className="flex gap-3 items-center">
//               <label className="text-sm">Chấm sao:</label>
//               <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })} className="border rounded p-2">
//                 {[5, 4, 3, 2, 1].map((r) => (
//                   <option key={r} value={r}>{r} sao</option>
//                 ))}
//               </select>
//             </div>
//             <textarea placeholder="Viết nhận xét..." className="w-full border rounded p-2 h-28" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} required />
//             <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded">Gửi đánh giá</button>
//           </form>
//           <div>
//             {reviews.length === 0 ? (
//               <p className="text-gray-500">Chưa có đánh giá nào.</p>
//             ) : (
//               reviews.map((r, i) => (
//                 <div key={i} className="border-t py-3">
//                   <div className="flex items-center justify-between">
//                     <div className="font-semibold">{r.name}</div>
//                     <div className="text-sm text-gray-400">{r.date}</div>
//                   </div>
//                   <div className="text-yellow-500">{"⭐".repeat(r.rating)}</div>
//                   <p className="text-gray-700 mt-1">{r.comment}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//         <aside className="bg-white rounded-lg shadow p-6">
//           <h4 className="font-semibold mb-3">🛍️ Sản phẩm tương tự</h4>
//           {renderSimilarProducts()}
//         </aside>
//       </div>

//       {/* Zoom ảnh */}
//       <AnimatePresence>
//         {isZoomed && (
//           <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsZoomed(false)}>
//             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
//             <motion.div className="relative z-10 max-h-[90vh] max-w-[90vw] flex items-center justify-center" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.18 }} onClick={(e) => e.stopPropagation()}>
//               <div className="relative rounded overflow-hidden" style={{ width: "min(90vw, 1200px)", height: "min(90vh, 900px)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", backgroundColor: "#111" }}>
//                 <div style={{ width: "100%", height: "100%", backgroundImage: `url(${watermarkedImage || image})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }} className="select-none" />
//                 <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }} style={{ pointerEvents: "auto" }}>
//                   <img src={logoWatermark} alt="watermark" className="absolute opacity-60 bottom-6 right-6 w-28 pointer-events-none select-none" onDragStart={(e) => e.preventDefault()} draggable={false} />
//                   <button onClick={() => setIsZoomed(false)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2" aria-label="Close">✕</button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Mobile sticky bar */}
//       <div className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-white border-t p-3 flex gap-3">
//         <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold">🛒 Giỏ</button>
//         <button onClick={handleBuyNow} className="flex-1 bg-amber-400 text-white py-3 rounded-md font-semibold">⚡ Mua ngay</button>
//       </div>

//       {/* Back link */}
//       <div className="max-w-7xl mx-auto text-center mt-10">
//         <Link to="/do-luu-niem" className="text-orange-600 hover:underline">← Quay lại cửa hàng</Link>
//       </div>
//     </div>
//   );
// }

// src/pages/ChiTietTranh.jsx - UPDATED VERSION
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useArts } from "../../context/ArtContext";
import { UserContext } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";
import logoWatermark from "../../assets/logo-watermark.png";

// Component sản phẩm tương tự
function SimilarProductItem({ item, logoWatermark, addWatermark }) {
  const [simWatermarked, setSimWatermarked] = useState(null);
  const defaultImage = item.images ? item.images[Object.keys(item.images)[0]] : "";
  
  useEffect(() => {
    if (defaultImage) {
      addWatermark(defaultImage, logoWatermark, setSimWatermarked);
    }
  }, [item, logoWatermark, addWatermark, defaultImage]);

  return (
    <Link to={`/chi-tiet/${item.id}`} className="group bg-gray-50 rounded-md shadow hover:shadow-md overflow-hidden transition">
      <div className="relative">
        <img 
          src={simWatermarked || defaultImage} 
          alt={item.title} 
          className="h-32 w-full object-cover group-hover:scale-105 transition-transform" 
        />
        {item.type === "souvenir" && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
            🎁 Đồ lưu niệm
          </div>
        )}
      </div>
      <div className="p-2">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
        <p className="text-orange-600 text-sm font-bold">
          {item.price[Object.keys(item.price)[0]].toLocaleString()}₫
        </p>
      </div>
    </Link>
  );
}

export default function ChiTietTranh() {
  // Context & state
  const user = useContext(UserContext);
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const { arts: allArts } = useArts();
  
  // Tìm sản phẩm (bao gồm cả đồ lưu niệm nếu có trong context)
  const art = allArts.find((a) => a.id === parseInt(id));
  
  const [selectedType, setSelectedType] = useState("");
  const [prevIndex, setPrevIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [watermarkedImage, setWatermarkedImage] = useState(null);

  // Khởi tạo selectedType khi component mount hoặc art thay đổi
  useEffect(() => {
    if (art && art.price) {
      const firstType = Object.keys(art.price)[0];
      setSelectedType(firstType);
    }
  }, [art]);

  // Load đánh giá từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`reviews_${id}`);
    if (saved) setReviews(JSON.parse(saved));
  }, [id]);

  // Loại, giá, ảnh (an toàn khi art chưa sẵn sàng)
  const types = art && art.images ? Object.keys(art.images) : [];
  const selectedIndex = types.indexOf(selectedType);
  const price = art && selectedType ? (art.price[selectedType] || 0) : 0;
  const image = art && selectedType ? art.images[selectedType] : undefined;

  // Chuyển loại
  const changeType = (type) => {
    setPrevIndex(selectedIndex);
    setSelectedType(type);
  };

  const direction = (() => {
    const newIndex = types.indexOf(selectedType);
    if (prevIndex === newIndex) return 0;
    return newIndex > prevIndex ? 1 : -1;
  })();

  const variants = {
    enter: (dir) => ({ x: dir * 200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: -dir * 200, opacity: 0 }),
  };

  // Thêm watermark vào ảnh
  const addWatermark = (imageSrc, logoSrc, callback) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const logo = new window.Image();
      logo.src = logoSrc;
      logo.onload = () => {
        const logoWidth = img.width * 0.25;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        const x = (img.width - logoWidth) / 2;
        const y = (img.height - logoHeight) / 2;
        ctx.globalAlpha = 0.35;
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        callback(dataUrl);
      };
    };
  };

  // Khi ảnh thay đổi, thêm watermark
  useEffect(() => {
    if (image) {
      addWatermark(image, logoWatermark, setWatermarkedImage);
    }
  }, [image]);

  // Nếu không tìm thấy sản phẩm (đặt SAU tất cả hooks)
  if (!art)
    return <div className="p-10 text-center text-red-600 font-bold text-xl">Không tìm thấy sản phẩm!</div>;

  // Kiểm tra loại sản phẩm
  const isSouvenir = art.type === "souvenir";

  // Toast
  const toastAddCart = () => toast.success("Đã thêm vào giỏ hàng");
  const toastReview = () => toast.success("Đánh giá của bạn đã được lưu!");

  // ═════════════════════════════════════════════════════════════
  // LOGIC MỚI: Nếu là đồ lưu niệm → redirect Shopee
  // ═════════════════════════════════════════════════════════════
  const handleAddToCart = () => {
    if (isSouvenir) {
      // Kiểm tra link Shopee
      if (!art.shopeeLink || art.shopeeLink.trim() === "") {
        toast.error("❌ Sản phẩm chưa có link mua hàng!");
        return;
      }
      
      toast.success("🛍️ Đang chuyển đến cửa hàng...");
      setTimeout(() => {
        window.open(art.shopeeLink, '_blank');
      }, 500);
    } else {
      // Logic cũ cho tranh in
      if (typeof addToCart === "function") {
        addToCart(art, selectedType, quantity);
        toastAddCart();
      } else {
        toast.error("❌ Lỗi: Chưa có hàm addToCart!");
      }
    }
  };

  const handleBuyNow = () => {
    if (isSouvenir) {
      // Kiểm tra link Shopee
      if (!art.shopeeLink || art.shopeeLink.trim() === "") {
        toast.error("❌ Sản phẩm chưa có link mua hàng!");
        return;
      }
      
      toast.success("🛍️ Đang chuyển đến cửa hàng...");
      setTimeout(() => {
        window.open(art.shopeeLink, '_blank');
      }, 500);
    } else {
      // Logic cũ cho tranh in
      if (typeof addToCart === "function") {
        addToCart(art, selectedType, quantity);
        toast.success("🧾 Đang chuyển đến trang thanh toán...");
        navigate("/checkout");
      } else {
        toast.error("❌ Lỗi: Chưa có hàm addToCart!");
      }
    }
  };

  // Thêm đánh giá
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    const r = { ...newReview, date: new Date().toLocaleString() };
    const updated = [r, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setNewReview({ name: "", rating: 5, comment: "" });
    toastReview();
  };

  // Sản phẩm tương tự
  const similarItems = allArts?.filter((a) => a.category === art?.category && a.id !== art?.id) || [];
  
  const renderSimilarProducts = () => {
    if (similarItems.length === 0) return <p className="text-gray-500">Không có sản phẩm tương tự.</p>;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {similarItems.map((item) => (
          <SimilarProductItem key={item.id} item={item} logoWatermark={logoWatermark} addWatermark={addWatermark} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 grid md:grid-cols-2 gap-8">
        {/* Ảnh chính */}
        <div>
          <motion.div className="overflow-hidden rounded-lg shadow-md relative cursor-zoom-in select-none" onClick={() => setIsZoomed(true)}>
            <AnimatePresence custom={direction} mode="wait">
              <motion.img
                key={selectedType}
                src={watermarkedImage || image}
                alt={`${art.title} - ${selectedType}`}
                className="w-full h-[460px] object-cover rounded-lg pointer-events-none"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45 }}
              />
            </AnimatePresence>
            <div className="absolute bottom-3 left-3 bg-black/40 text-white text-sm px-3 py-1 rounded">{selectedType}</div>
            {isSouvenir && (
              <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                🎁 Đồ lưu niệm
              </div>
            )}
          </motion.div>
          
          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {types.map((type) => (
              <motion.button
                key={type}
                onClick={() => changeType(type)}
                whileHover={{ scale: 1.05 }}
                className={`flex-none border rounded-lg overflow-hidden ${
                  selectedType === type 
                    ? isSouvenir ? "ring-2 ring-purple-400" : "ring-2 ring-orange-400"
                    : "border-gray-200"
                }`}
              >
                <img src={art.images[type]} alt={type} className="w-20 h-20 object-cover" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Thông tin */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800">{art.title}</h1>
          <p className="text-sm text-gray-500 mb-2">
            {isSouvenir ? `Loại: ${art.souvenirType || "Đồ lưu niệm"}` : `Chủ đề: ${art.category}`}
          </p>
          
          <div className="flex items-center gap-3 my-2">
            <div className="text-yellow-400">{"★".repeat(reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 5)}</div>
            <div className="text-sm text-gray-600">({reviews.length} đánh giá)</div>
          </div>
          
          {/* <div className={`text-3xl font-extrabold mb-4 ${isSouvenir ? "text-purple-600" : "text-orange-600"}`}>
            {price.toLocaleString()}₫
          </div> */}
          
          {/* Chọn loại
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">
              {isSouvenir ? "Chọn tùy chọn:" : "Chọn loại:"}
            </div>
            <div className="flex flex-wrap gap-3">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => changeType(type)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedType === type 
                      ? isSouvenir 
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div> */}
          
          {/* Số lượng - Ẩn cho đồ lưu niệm */}
          {!isSouvenir && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Số lượng</div>
              <div className="inline-flex items-center border rounded-md">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2">−</button>
                <div className="px-6">{quantity}</div>
                <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2">+</button>
              </div>
            </div>
          )}
          
          {/* Nút hành động */}
          <div className="flex gap-3 mt-2">
            {isSouvenir ? (
              // Nút cho đồ lưu niệm
              <button 
                onClick={handleBuyNow} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-md font-semibold hover:from-purple-600 hover:to-pink-600 transition"
              >
                🛍️ Mua trên Shopee
              </button>
            ) : (
              // Nút cho tranh in
              <>
                <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold hover:bg-orange-600 transition">
                  🛒 Thêm vào giỏ
                </button>
                <button onClick={handleBuyNow} className="flex-1 bg-amber-400 text-white py-3 rounded-md font-semibold hover:bg-amber-500 transition">
                  Mua ngay
                </button>
              </>
            )}
          </div>

          {/* Thông tin affiliate cho đồ lưu niệm */}
          {isSouvenir && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">ℹ️ Lưu ý:</span> Sản phẩm được bán qua đối tác Shopee. 
                Bạn sẽ được chuyển đến trang Shopee để hoàn tất đơn hàng.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-indigo-600">📖</span> Mô tả chi tiết
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{art.description}</p>
      </div>

      {/* Đánh giá + sản phẩm tương tự */}
      <div className="max-w-7xl mx-auto mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Đánh giá của người dùng</h3>
          <form onSubmit={handleAddReview} className="space-y-3 mb-6">
            <input type="text" placeholder="Tên của bạn" className="w-full border rounded p-2" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} required />
            <div className="flex gap-3 items-center">
              <label className="text-sm">Chấm sao:</label>
              <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })} className="border rounded p-2">
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} sao</option>
                ))}
              </select>
            </div>
            <textarea placeholder="Viết nhận xét..." className="w-full border rounded p-2 h-28" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} required />
            <button type="submit" className={`px-4 py-2 rounded text-white ${isSouvenir ? "bg-purple-500 hover:bg-purple-600" : "bg-orange-500 hover:bg-orange-600"}`}>
              Gửi đánh giá
            </button>
          </form>
          <div>
            {reviews.length === 0 ? (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="border-t py-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-sm text-gray-400">{r.date}</div>
                  </div>
                  <div className="text-yellow-500">{"⭐".repeat(r.rating)}</div>
                  <p className="text-gray-700 mt-1">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <aside className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-3">🛍️ Sản phẩm tương tự</h4>
          {renderSimilarProducts()}
        </aside>
      </div>

      {/* Zoom ảnh */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsZoomed(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <motion.div className="relative z-10 max-h-[90vh] max-w-[90vw] flex items-center justify-center" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.18 }} onClick={(e) => e.stopPropagation()}>
              <div className="relative rounded overflow-hidden" style={{ width: "min(90vw, 1200px)", height: "min(90vh, 900px)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)", backgroundColor: "#111" }}>
                <div style={{ width: "100%", height: "100%", backgroundImage: `url(${watermarkedImage || image})`, backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat" }} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }} className="select-none" />
                <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} onMouseDown={(e) => { if (e.button === 2) e.preventDefault(); }} style={{ pointerEvents: "auto" }}>
                  <img src={logoWatermark} alt="watermark" className="absolute opacity-60 bottom-6 right-6 w-28 pointer-events-none select-none" onDragStart={(e) => e.preventDefault()} draggable={false} />
                  <button onClick={() => setIsZoomed(false)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2" aria-label="Close">✕</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-white border-t p-3 flex gap-3">
        {isSouvenir ? (
          <button onClick={handleBuyNow} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-md font-semibold">
            🛍️ Mua trên Shopee
          </button>
        ) : (
          <>
            <button onClick={handleAddToCart} className="flex-1 bg-orange-500 text-white py-3 rounded-md font-semibold">🛒 Giỏ</button>
            <button onClick={handleBuyNow} className="flex-1 bg-amber-400 text-white py-3 rounded-md font-semibold">⚡ Mua ngay</button>
          </>
        )}
      </div>

      {/* Back link */}
      <div className="max-w-7xl mx-auto text-center mt-10">
        <Link 
          to={isSouvenir ? "/do-luu-niem" : "/mua-tranh-in"} 
          className={`${isSouvenir ? "text-purple-600" : "text-orange-600"} hover:underline`}
        >
          ← Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
}