// src/pages/Store/DoLuuNiem.jsx
import React, { useState, useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useArts } from "../../context/ArtContext";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../../context/UserContext";

export default function DoLuuNiem() {
  const { user } = useContext(UserContext);
  const { souvenirs } = useArts(); // Lấy data từ context
  const navigate = useNavigate();
  
  const [selectedTypes, setSelectedTypes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tất cả"); // Loại sản phẩm
  const [filterTopic, setFilterTopic] = useState("Tất cả"); // Chủ đề
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sortOrder, setSortOrder] = useState("none");

  useEffect(() => {
    const invalidLinkProducts = souvenirs.filter((product) => {
      const productLink = product?.shopeeLink || product?.link || product?.url;
      return !productLink || productLink.trim() === "";
    });

    console.log("[DoLuuNiem] Total souvenirs:", souvenirs.length);
    if (invalidLinkProducts.length > 0) {
      console.warn(
        "[DoLuuNiem] Products missing link:",
        invalidLinkProducts.map((p) => ({
          id: p.id,
          title: p.title,
          shopeeLink: p.shopeeLink,
          link: p.link,
          url: p.url,
        }))
      );
    }
  }, [souvenirs]);

  // Danh sách loại sản phẩm lấy động từ data để luôn hiển thị đủ
  const PRODUCT_CATEGORIES = useMemo(() => {
    const types = new Set(
      souvenirs
        .map((item) => item?.souvenirType)
        .filter(Boolean)
    );
    return ["Tất cả", ...Array.from(types)];
  }, [souvenirs]);

  // Danh sách chủ đề lấy động từ data
  const TOPICS = useMemo(() => {
    const topics = new Set(
      souvenirs
        .map((item) => item?.category)
        .filter(Boolean)
    );
    return ["Tất cả", ...Array.from(topics)];
  }, [souvenirs]);

  // Lọc sản phẩm
  const filteredProducts = souvenirs
    .filter((product) =>
      (product?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => {
      if (filterCategory === "Tất cả") return true;
      return (product?.souvenirType || "") === filterCategory;
    })
    .filter((product) => {
      if (filterTopic === "Tất cả") return true;
      return (product?.category || "") === filterTopic;
    })
    .filter((product) => {
      const priceObj = product?.price || {};
      const firstType = Object.keys(priceObj)[0];
      if (!firstType) return true;

      const type = selectedTypes[product.id] || firstType;
      const price = Number(priceObj[type] || 0);
      return price >= minPrice && price <= maxPrice;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        const typeA = selectedTypes[a.id] || Object.keys(a?.price || {})[0];
        const typeB = selectedTypes[b.id] || Object.keys(b?.price || {})[0];
        const priceA = Number((a?.price || {})[typeA] || 0);
        const priceB = Number((b?.price || {})[typeB] || 0);
        return priceA - priceB;
      }
      if (sortOrder === "desc") {
        const typeA = selectedTypes[a.id] || Object.keys(a?.price || {})[0];
        const typeB = selectedTypes[b.id] || Object.keys(b?.price || {})[0];
        const priceA = Number((a?.price || {})[typeA] || 0);
        const priceB = Number((b?.price || {})[typeB] || 0);
        return priceB - priceA;
      }
      return 0;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("Tất cả");
    setFilterTopic("Tất cả");
    setMinPrice(0);
    setMaxPrice(5000000);
    setSortOrder("none");
    setSelectedTypes({});
  };

  const handleTypeChange = (productId, type) => {
    setSelectedTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleViewDetail = (product) => {
    navigate(`/chi-tiet/${product.id}`);
  };

  // Redirect sang Shopee affiliate link
  const handleBuyNow = (product) => {
    const productLink = product.shopeeLink || product.link || product.url;

    console.log("[DoLuuNiem] Buy click:", {
      id: product?.id,
      title: product?.title,
      shopeeLink: product?.shopeeLink,
      link: product?.link,
      url: product?.url,
      resolvedLink: productLink,
    });

    // Kiểm tra xem sản phẩm có link Shopee không
    if (!productLink || productLink.trim() === "") {
      console.warn("[DoLuuNiem] Missing link for product:", {
        id: product?.id,
        title: product?.title,
      });
      toast.error("❌ Sản phẩm chưa có link mua hàng!");
      return;
    }
    
    toast.success("🛍️ Đang chuyển đến cửa hàng...");
    
    // Mở tab mới đến Shopee
    setTimeout(() => {
      window.open(productLink, '_blank');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="w-full" style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-md p-6 border-r hidden md:block sticky top-0 h-screen overflow-y-auto">

          {/* Tìm kiếm */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">🔍 Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Loại sản phẩm */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">📦 Loại sản phẩm</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Chủ đề */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">🎨 Chủ đề</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Khoảng giá */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">💰 Khoảng giá</label>
            <div className="mb-2 text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-purple-600">{parseInt(minPrice).toLocaleString()}₫</span>
              <span className="text-purple-600">{parseInt(maxPrice).toLocaleString()}₫</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full mb-2"
            />
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Sắp xếp */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">↕️ Sắp xếp</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="none">Mặc định</option>
              <option value="asc">Giá: Thấp → Cao</option>
              <option value="desc">Giá: Cao → Thấp</option>
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            🔄 Reset bộ lọc
          </button>
        </aside>

        {/* Main content */}
        <main className="p-6 md:p-10" style={{ flex: 1 }}>
          {/* Banner */}
          <div className="mb-10 text-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              🎁 Bộ sưu tập Đồ Lưu Niệm Heritage Art
            </h2>
            <p className="text-lg text-gray-800">
              Mỗi sản phẩm đều mang <span className="text-purple-600 font-bold">dấu ấn văn hóa Việt Nam</span> - 
              Sản phẩm chính hãng, giao hàng toàn quốc
            </p>
          </div>

          {/* Grid sản phẩm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const selectedType = selectedTypes[product.id] || Object.keys(product.price || {})[0];
                const imageUrl =
                  product.images?.[selectedType] ||
                  product.image ||
                  product.thumbnail ||
                  "https://via.placeholder.com/600x600?text=No+Image";

                return (
                  <motion.div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <div className="absolute top-3 left-3 z-10 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        🎁 Đồ lưu niệm
                      </div>
                      <div
                        onClick={() => handleViewDetail(product)}
                        className="cursor-pointer overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                          style={{ aspectRatio: '1/1' }}
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <div
                        onClick={() => handleViewDetail(product)}
                        className="text-base font-semibold mb-2 text-gray-800 hover:text-purple-600 cursor-pointer truncate"
                      >
                        {product.title}
                      </div>
                      
                      <div className="mb-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {product.souvenirType}
                        </span>
                      </div>

                      
                      
                      <button
                        onClick={() => handleBuyNow(product)}
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        🛍️ Mua ngay
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg mb-4">
                  Không tìm thấy sản phẩm phù hợp
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  🔄 Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>

          
        </main>
      </div>
    </div>
  );
}