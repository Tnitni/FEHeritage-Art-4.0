// src/pages/Store/MuaTranhIn.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useArts } from "../../context/ArtContext";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../../context/UserContext";
import { useCart } from "../../context/CartContext";

export default function MuaTranhIn() {
  const { user } = useContext(UserContext);
  const {
    addToCart,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  // 🔹 LẤY SOUVENIRS TỪ CONTEXT (không phải arts)
  const { souvenirs } = useArts();

  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tất cả");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sortOrder, setSortOrder] = useState("none");
  const [showCart, setShowCart] = useState(false);

  // 🔹 LỌC SẢN PHẨM TỪ SOUVENIRS
  const filteredProducts = souvenirs
    .filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((product) =>
      filterCategory === "Tất cả" ? true : product.category === filterCategory,
    )
    .filter((product) => {
      const type = selectedTypes[product.id] || Object.keys(product.price)[0];
      const price = product.price[type];
      return price >= minPrice && price <= maxPrice;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        const typeA = selectedTypes[a.id] || Object.keys(a.price)[0];
        const typeB = selectedTypes[b.id] || Object.keys(b.price)[0];
        return a.price[typeA] - b.price[typeB];
      }
      if (sortOrder === "desc") {
        const typeA = selectedTypes[a.id] || Object.keys(a.price)[0];
        const typeB = selectedTypes[b.id] || Object.keys(b.price)[0];
        return b.price[typeB] - a.price[typeA];
      }
      return 0;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setFilterCategory("Tất cả");
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

  const handleAddToCart = (product) => {
    const type = selectedTypes[product.id] || Object.keys(product.price)[0];
    addToCart(product, type);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full" style={{ display: 'flex' }}>
        {/* Nút giỏ hàng */}
        <button
          className="fixed bottom-8 right-8 z-40 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg px-6 py-3 text-lg"
          onClick={() => setShowCart(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🛒 Giỏ hàng ({getTotalItems()})
        </button>

        {/* Cart Modal */}
        {showCart && (
          <div
            className="fixed inset-0 z-50 p-4"
            onClick={() => setShowCart(false)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div className="bg-orange-500 px-6 py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-3xl">🛒</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">Giỏ hàng của bạn</h2>
                    <p className="text-sm text-orange-100">{getTotalItems()} sản phẩm</p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-full text-white text-2xl font-bold hover:bg-white hover:bg-opacity-20"
                  onClick={() => setShowCart(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6" style={{ flex: 1 }}>
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
                    <button
                      onClick={() => setShowCart(false)}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedType}`}
                        className="bg-gray-50 rounded-xl p-4"
                        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div style={{ flex: 1 }}>
                          <h3 className="font-semibold text-gray-800">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            <span>📦 {item.selectedType}</span>
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="text-xs text-gray-500">Số lượng:</span>
                            <div className="bg-white rounded-lg border" style={{ display: 'flex' }}>
                              <button
                                className="px-3 py-1 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, item.selectedType, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="px-3 py-1 font-medium text-orange-600 border-x">{item.quantity}</span>
                              <button
                                className="px-3 py-1 hover:bg-gray-100"
                                onClick={() => updateQuantity(item.id, item.selectedType, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div className="font-bold text-orange-600 text-lg">
                            {(item.price * item.quantity).toLocaleString()}₫
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => removeFromCart(item.id, item.selectedType)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t px-6 py-4">
                  <div className="mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p className="text-sm text-gray-500">Tổng cộng</p>
                      <p className="text-2xl font-bold text-orange-600">{getTotalPrice().toLocaleString()}₫</p>
                    </div>
                    <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">
                      Xóa tất cả
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setShowCart(false)}
                      className="py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                      style={{ flex: 1 }}
                    >
                      Tiếp tục mua
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
                      style={{ flex: 1 }}
                    >
                      Thanh toán →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <Toaster position="top-right" />

        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-md p-6 border-r hidden md:block sticky top-0 h-screen overflow-y-auto">
      

          {/* Tìm kiếm */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">🔍 Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Chủ đề */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">Chủ đề</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Di tích lịch sử">Di tích lịch sử</option>
              <option value="Văn hóa">Văn hóa</option>
              <option value="Phố cổ">Phố cổ</option>
              <option value="Thiên nhiên">Thiên nhiên</option>
            </select>
          </div>

          {/* Giá */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">Khoảng giá</label>
            <div className="mb-2 text-sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-orange-600">{parseInt(minPrice).toLocaleString()}₫</span>
              <span className="text-orange-600">{parseInt(maxPrice).toLocaleString()}₫</span>
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
            <label className="block mb-2 font-medium text-gray-700">Sắp xếp</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          <div className="mb-10 text-center bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-700 mb-2">
              ❤️ Chung tay vì dự án Heritage Art 4.0
            </h2>
            <p className="text-lg text-gray-800">
              Khi bạn mua sản phẩm, <span className="text-orange-600 font-bold">5% tổng số tiền</span> sẽ được tặng cho 
              Mẹ Việt Nam anh hùng và Anh hùng lực lượng vũ trang.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const selectedType = selectedTypes[product.id] || Object.keys(product.price)[0];
                const price = product.price[selectedType];
                const imageUrl = product.images[selectedType];

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
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
                        className="text-base font-semibold mb-2 text-gray-800 hover:text-orange-600 cursor-pointer truncate"
                      >
                        {product.title}
                      </div>
                      <label className="block mb-1 text-xs font-medium text-gray-600">
                        Tùy chọn:
                      </label>
                      <select
                        className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={selectedType}
                        onChange={(e) => handleTypeChange(product.id, e.target.value)}
                      >
                        {Object.keys(product.price).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <p className="text-lg font-bold text-orange-600 mb-3">
                        {price.toLocaleString()}₫
                      </p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
                      >
                        🛒 Thêm vào giỏ
                      </button>
                    </div>
                  </div>
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
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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