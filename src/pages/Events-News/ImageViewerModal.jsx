import React, { useState, useEffect } from "react";

const ImageViewerModal = ({ images, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);

  // Reset zoom khi đổi ảnh
  useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  const next = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const zoomIn = (e) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.2, 3));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.2, 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      // onClick={onClose}
    >
      {/* Nút đóng */}
      <div
        className="absolute top-2 right-2 md:top-6 md:right-6 p-4 z-[1001] cursor-pointer"
        onClick={onClose}
      >
        <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white border border-white/10 transition-all">
          <span className="text-2xl md:text-3xl font-light leading-none">
            &times;
          </span>
        </div>
      </div>

      {/* Nút trái */}
      {images.length > 1 && (
        <button
          className="/* Vị trí */
      absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-[1001] 
      
      /* KÍCH THƯỚC: w-9 trên mobile, w-12 trên desktop */
      w-9 h-9 md:w-12 md:h-12 
      
      /* GIAO DIỆN: Nền mờ, bo tròn, đồng bộ với nút đóng */
      bg-black/40 hover:bg-white/20 backdrop-blur-md border border-white/10
      flex items-center justify-center rounded-full text-white/70 hover:text-white 
      transition-all active:scale-90 shadow-lg"
          onClick={prev}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Ảnh */}
      <div
        className="flex items-center justify-center max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt="Xem chi tiết"
          className="max-w-full max-h-[80vh] object-contain select-none transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          onWheel={(e) => {
            e.preventDefault();
            setScale((s) => Math.min(3, Math.max(1, s - e.deltaY * 0.001)));
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setScale((s) => (s === 1 ? 2 : 1));
          }}
        />
      </div>

      {/* Nút phải */}
      {images.length > 1 && (
        <button
          className="/* Vị trí */
      absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-[1001] 
      
      /* KÍCH THƯỚC: w-9 trên mobile, w-12 trên desktop */
      w-9 h-9 md:w-12 md:h-12 
      
      /* GIAO DIỆN */
      bg-black/40 hover:bg-white/20 backdrop-blur-md border border-white/10
      flex items-center justify-center rounded-full text-white/70 hover:text-white 
      transition-all active:scale-90 shadow-lg"
          onClick={next}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Zoom controls */}
      <div className="hidden md:flex absolute bottom-6 right-6 z-[1001] gap-3">
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-black/50 hover:bg-white/20 text-white rounded"
        >
          −
        </button>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-black/50 hover:bg-white/20 text-white rounded"
        >
          +
        </button>
      </div>

      {/* ✅ CHỈ SỐ ẢNH – CỐ ĐỊNH CUỐI MÀN HÌNH */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1001]">
        <span className="px-4 py-1 bg-black/50 backdrop-blur-sm text-white/70 text-xs tracking-widest uppercase rounded-full">
          {currentIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
};

export default ImageViewerModal;
