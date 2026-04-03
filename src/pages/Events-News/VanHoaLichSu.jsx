import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dynastyData as dynastyDataRaw } from "../../data/mockData";
import nhangoImg from "../../assets/nhango.jpg";
import nhathoImg from "../../assets/nhatho.png";
import nhathoDucbaImg from "../../assets/nhathoducba.jpg";
import nhathoDucbaAiImg from "../../assets/nhathoducbaai.png";
import hueImg from "../../assets/hue.jpg";
import diadaoImg from "../../assets/diadao.png";
import EventImageSlider from "./EventImageSlider";
import ImageViewerModal from "./ImageViewerModal";

// Map images to dynasty data
const imageMap = {
  "/src/assets/nhango.jpg": nhangoImg,
  "/src/assets/nhatho.png": nhathoImg,
  "/src/assets/nhathoducba.jpg": nhathoDucbaImg,
  "/src/assets/nhathoducbaai.png": nhathoDucbaAiImg,
  "/src/assets/hue.jpg": hueImg,
  "/src/assets/diadao.png": diadaoImg,
};

// Replace string paths with actual imported images
const dynastyData = Object.keys(dynastyDataRaw).reduce((acc, key) => {
  const dynasty = dynastyDataRaw[key];
  acc[key] = {
    ...dynasty,
    img: imageMap[dynasty.img] || dynasty.img,
    figures: dynasty.figures.map((f) => ({
      ...f,
      img: imageMap[f.img] || f.img,
    })),
  };
  return acc;
}, {});

export default function VanHoaLichSu() {
  const [modalData, setModalData] = useState(null);
  const [eventModalData, setEventModalData] = useState(null);
  // const [slideshowIndex, setSlideshowIndex] = useState(0)
  const [openDynasty, setOpenDynasty] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [heroDetailModal, setHeroDetailModal] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const navigate = useNavigate();

  const [lightboxConfig, setLightboxConfig] = useState({
    isOpen: false,
    images: [],
    index: 0,
  });

  const openLightbox = (images, index) => {
    setLightboxConfig({ isOpen: true, images, index });
    document.body.style.overflow = "hidden"; // Chống cuộn trang khi đang xem ảnh
  };

  const closeLightbox = () => {
    setLightboxConfig({ ...lightboxConfig, isOpen: false });
    document.body.style.overflow = "";
  };

  useEffect(() => {
    // Inject responsive styles for event content modal and hide scrollbar
    const style = document.createElement("style");
    style.id = "event-modal-styles";
    style.textContent = `
        .event-content {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @media (max-width: 768px) {
            .event-content > div {
                padding: 1rem !important;
            }
            .event-content h2 {
                font-size: 1.5rem !important;
            }
            .event-content h3 {
                font-size: 1.2rem !important;
            }
            .event-content section > div {
                padding: 1rem !important;
            }
        }
    `;
    if (!document.getElementById("event-modal-styles")) {
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById("event-modal-styles");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const openHeroDetail = (hero) => {
    setHeroDetailModal(hero);
    document.body.style.overflow = "hidden";
  };

  const closeHeroDetail = () => {
    setHeroDetailModal(null);
    document.body.style.overflow = "";
  };

  function closeModal() {
    setModalData(null);
    document.body.style.overflow = "";
  }

  function openEventModal(event) {
    setEventModalData(event);
    document.body.style.overflow = "hidden";
  }
  function closeEventModal() {
    setEventModalData(null);
    document.body.style.overflow = "";
  }

  function toggleDynasty(key) {
    setOpenDynasty((prev) => (prev === key ? null : key));
  }

  // Hàm xử lý khi đóng Modal
  const handleCloseModal = () => {
    setCurrentImgIndex(0); // Reset về ảnh đầu tiên
    closeEventModal();
  };

  // Hàm chuyển ảnh tiếp theo
  const nextImage = (images) => {
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  // Hàm quay lại ảnh trước
  const prevImage = (images) => {
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Hook tự động chuyển ảnh (Auto-play)
  useEffect(() => {
    if (
      eventModalData &&
      Array.isArray(eventModalData.images) &&
      eventModalData.images.length > 1
    ) {
      const timer = setInterval(() => {
        nextImage(eventModalData.images);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [eventModalData, currentImgIndex]);

  // Component to render dynasty content (figures + events)
  const DynastyContent = ({ dynasty, isOpen, onEventClick, navigate }) => {
    const [scrollPosition, setScrollPosition] = React.useState(0);
    const scrollContainerRef = React.useRef(null);

    const hasMultipleFigures = dynasty.figures && dynasty.figures.length > 2;

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setScrollPosition(scrollContainerRef.current.scrollLeft);
      }
    };

    // Cập nhật lại vị trí cuộn khi mở hoặc thay đổi dynasty
    React.useEffect(() => {
      if (isOpen) {
        // Đợi một nhịp để DOM render xong
        setTimeout(handleScroll, 100);
      }
    }, [isOpen, dynasty]);

    const scroll = (direction) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = direction === "left" ? -320 : 320;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    const canScrollLeft = scrollPosition > 5;
    const canScrollRight = scrollContainerRef.current
      ? scrollPosition + scrollContainerRef.current.clientWidth <
        scrollContainerRef.current.scrollWidth - 5
      : hasMultipleFigures;

    return (
      <>
        <div
          className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-none opacity-100 mt-3" : "max-h-0 opacity-0"}`}
        >
          <div className="ml-4 md:ml-16 space-y-6">
            {/* Heroes/Figures Section */}
            {dynasty.figures && dynasty.figures.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-amber-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <h4 className="text-sm md:text-base font-bold text-amber-900">
                      Danh nhân tiêu biểu
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/heroes?period=${encodeURIComponent(dynasty.title)}`,
                        );
                      }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                    >
                      <span>Xem thêm</span>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Navigation Buttons - Only show if more than 2 figures */}
                  {hasMultipleFigures && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          canScrollLeft
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-700 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        aria-label="Scroll left"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          canScrollRight
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-700 hover:shadow-md"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        aria-label="Scroll right"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cards Container - Conditional layout */}
                <div className="relative group/container">
                  <div
                    ref={hasMultipleFigures ? scrollContainerRef : null}
                    onScroll={hasMultipleFigures ? handleScroll : undefined}
                    className={
                      hasMultipleFigures
                        ? "flex gap-3 md:gap-4 overflow-x-auto scroll-smooth hide-scrollbar pb-2"
                        : "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    }
                  >
                    {dynasty.figures.map((figure, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          openHeroDetail({
                            ...figure,
                            period: dynasty.title,
                            per: figure.per || dynasty.title,
                          })
                        }
                        className={`group relative bg-gradient-to-br from-white to-amber-50/50 rounded-xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 ${
                          hasMultipleFigures
                            ? "flex-shrink-0 w-[230px] md:w-[300px]"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3 p-3">
                          <div className="relative w-17 h-17 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-amber-300 shadow-md flex-shrink-0 bg-amber-100">
                            <img
                              src={figure.img}
                              alt={figure.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = nhangoImg;
                              }}
                            />
                            {/* Decorative corner */}
                            {/* <div className="absolute top-0 right-0 w-6 h-6 bg-amber-500/20 backdrop-blur-sm"></div> */}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1">
                              <span className="text-amber-600">⭐</span>
                              {figure.name}
                            </h5>
                            <p className="text-[11px] md:text-xs text-gray-700 leading-relaxed line-clamp-3">
                              {figure.bio}
                            </p>
                          </div>
                        </div>
                        {/* Decorative gradient bar */}
                        {/* <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div> */}
                      </div>
                    ))}
                  </div>

                  {/* Gradient fade edges - Only show if more than 2 figures */}
                  {hasMultipleFigures && (
                    <>
                      {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
                      )}
                      {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Events Section */}
            <div className="border-l-2 border-amber-300 pl-6 space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-amber-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="text-sm font-bold text-amber-900">
                  Sự kiện lịch sử
                </h4>
              </div>
              {dynasty.events.map((event, idx) => (
                <div
                  key={idx}
                  className="relative p-3.5 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => onEventClick(event)}
                >
                  <div className="absolute -left-[31px] top-5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"></div>

                  <div className="font-medium text-amber-900 text-xs md:text-sm group-hover:text-amber-700">
                    {event.name}
                  </div>
                  <div className="text-[10px] md:text-xs text-amber-700 mt-1.5 bg-amber-50 inline-block px-2 py-0.5 rounded">
                    📅 {event.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6eadf] text-gray-800 py-7">
      <div className="max-w-[1200px] mx-auto px-5">
        <header
          className="relative grid gap-5 p-8 rounded-[24px] bg-cover overflow-hidden shadow-xl"
          style={{ backgroundImage: `url(${nhathoDucbaImg})` }}
          role="banner"
        >
          {/* darker overlay for legible white text on image */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"
            aria-hidden="true"
          />
          <div className="relative z-10 backdrop-blur-sm bg-black/30 p-5 rounded-xl">
            <h1 className="text-3xl text-white font-bold drop-shadow-lg">
              📜 Văn hóa & Lịch sử — Nghệ Thuật Ký Ức 4.0
            </h1>
            <p className="text-base text-white/95 max-w-[90%] mt-2 drop-shadow">
              Hành trình lịch sử Việt Nam được kể lại bằng hình ảnh, tri thức và
              công nghệ — nơi ký ức gặp gỡ tương lai.
            </p>
          </div>
        </header>

        <main className="mt-6" role="main">
          <section className="bg-white p-6 rounded-xl shadow-xl border border-amber-200 max-w-5xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="text-2xl text-amber-800 font-bold flex items-center gap-2">
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Hành trình lịch sử Việt Nam
              </h2>
              <div className="text-sm text-gray-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                💡 Click vào triều đại để xem các sự kiện
              </div>
            </div>

            <nav className="mt-6" aria-label="Timeline tree">
              <ul className="relative">
                <li className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-amber-400 before:via-amber-500 before:to-amber-600 before:rounded-full before:shadow-sm">
                  <div className="flex flex-col gap-4">
                    {/* Thời Tiền Sử - Hồng Bàng */}
                    {dynastyData.prehistory && (
                      <div className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("prehistory")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.prehistory.img}
                              alt="Tiền Sử"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.prehistory.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-3 leading-relaxed">
                              {dynastyData.prehistory.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.prehistory.events.length} sự kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "prehistory" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.prehistory}
                          isOpen={openDynasty === "prehistory"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* Nước Âu Lạc*/}
                    {dynastyData.aulac && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("aulac")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.aulac.img}
                              alt="Âu Lạc"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.aulac.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-3 leading-relaxed">
                              {dynastyData.aulac.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.aulac.events.length} sự kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "aulac" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.aulac}
                          isOpen={openDynasty === "aulac"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* Phong Kiến Tự Chủ */}
                    {dynastyData.phongkientuchu && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("phongkientuchu")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.phongkientuchu.img}
                              alt="Phong Kiến Tự Chủ"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.phongkientuchu.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-2 leading-relaxed">
                              {dynastyData.phongkientuchu.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.phongkientuchu.events.length} sự kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "phongkientuchu" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.phongkientuchu}
                          isOpen={openDynasty === "phongkientuchu"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* Thời kỳ Pháp đô hộ */}
                    {dynastyData.phapdoho && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("phapdoho")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.phapdoho.img}
                              alt="Thời kỳ Pháp đô hộ"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.phapdoho.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-2 leading-relaxed">
                              {dynastyData.phapdoho.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.phapdoho.events.length} sự kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "phapdoho" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.phapdoho}
                          isOpen={openDynasty === "phapdoho"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* Khang chien chong phap */}
                    {dynastyData.khangchienchongphap && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("khangchienchongphap")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.khangchienchongphap.img}
                              alt="Khang chien chong phap"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.khangchienchongphap.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-2 leading-relaxed">
                              {dynastyData.khangchienchongphap.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.khangchienchongphap.events.length} sự
                              kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "khangchienchongphap" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.khangchienchongphap}
                          isOpen={openDynasty === "khangchienchongphap"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* khang chien chong my */}
                    {dynastyData.khangchienchongmy && (
                      <div className="relative">
                        <div className="absolute -left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("khangchienchongmy")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.khangchienchongmy.img}
                              alt="Trần"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.khangchienchongmy.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-2 leading-relaxed">
                              {dynastyData.khangchienchongmy.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.khangchienchongmy.events.length} sự
                              kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "khangchienchongmy" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.khangchienchongmy}
                          isOpen={openDynasty === "khangchienchongmy"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}

                    {/* Hiện đại */}
                    {dynastyData.modern && (
                      <div className="relative mb-6 last:mb-0">
                        <div className="absolute -left-[28px] md:-left-[30px] top-4 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-md z-10"></div>

                        <div
                          className="group flex flex-col md:flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl cursor-pointer bg-white border border-amber-100 hover:border-amber-400 hover:shadow-2xl transition-all duration-500"
                          onClick={() => toggleDynasty("modern")}
                        >
                          <div className="w-full md:w-20 h-32 md:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-white">
                            <img
                              loading="lazy"
                              src={dynastyData.modern.img}
                              alt="Hiện đại"
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-amber-900 text-base mb-1">
                              {dynastyData.modern.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-none md:line-clamp-2 leading-relaxed">
                              {dynastyData.modern.desc}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                              {dynastyData.modern.events.length} sự kiện
                            </span>
                            <svg
                              className={`w-6 h-6 text-amber-600 transition-transform duration-300 ${openDynasty === "modern" ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        <DynastyContent
                          dynasty={dynastyData.modern}
                          isOpen={openDynasty === "modern"}
                          onEventClick={openEventModal}
                          navigate={navigate}
                        />
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </nav>
          </section>
        </main>

        {/* Modal */}
        <div
          className={`${modalData ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm p-6`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {modalData && (
            <div className="max-w-[920px] w-full bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-2xl relative border-2 border-amber-300 animate-in fade-in zoom-in duration-300">
              <button
                className="absolute right-4 top-3 text-gray-600 text-2xl hover:text-amber-700 transition"
                onClick={closeModal}
                aria-label="Đóng"
              >
                &times;
              </button>
              <div className="flex gap-5 flex-col sm:flex-row">
                <img
                  className="w-full sm:w-[260px] h-[200px] sm:h-[160px] object-cover rounded-lg flex-shrink-0 border-2 border-amber-300 shadow-lg"
                  src={modalData.img}
                  alt={modalData.title}
                />
                <div>
                  <h3 className="text-amber-800 text-2xl font-bold">
                    {modalData.title}
                  </h3>
                  <p className="text-gray-700 mt-3 leading-relaxed">
                    {modalData.desc}
                  </p>
                </div>
              </div>
              <h4 className="text-amber-800 font-semibold mt-6 mb-3 text-lg">
                Danh nhân tiêu biểu
              </h4>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {modalData.figures.map((f, idx) => (
                  <div
                    className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center hover:bg-amber-100 hover:shadow-md transition"
                    key={idx}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      className="w-full h-[120px] object-cover rounded-md mb-3 border border-amber-200"
                    />
                    <h4 className="text-amber-800 font-semibold text-base">
                      {f.name}
                    </h4>
                    <p className="text-gray-600 text-sm mt-2">{f.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        <div
          className={`${eventModalData ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm p-6`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEventModal();
          }}
        >
          {eventModalData && (
            <div className="max-w-[920px] w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl relative border-2 border-amber-300">
              {/* Hero Image Section with Title Overlay */}
              <div className="relative h-[300px] sm:h-[350px] md:h-[450px] rounded-t-2xl overflow-hidden">
                {/* Background Image */}
                {/* <img
                  src={eventModalData.image || nhangoImg}
                  alt={eventModalData.name}
                  className="w-full h-full object-cover"
                /> */}
                {eventModalData && (
                  <EventImageSlider
                    images={eventModalData.images}
                    onImageClick={openLightbox} // Truyền hàm mở lightbox vào đây
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60 pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h2 className="text-2xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                    {eventModalData.name}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 text-sm md:text-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">
                        {eventModalData.year}
                      </span>
                    </div>
                    {(() => {
                      let dynastyName = "";
                      for (const [_key, dynasty] of Object.entries(
                        dynastyData,
                      )) {
                        const eventIndex = dynasty.events.findIndex(
                          (e) => e.name === eventModalData.name,
                        );
                        if (eventIndex !== -1) {
                          dynastyName = dynasty.title;
                          break;
                        }
                      }
                      return (
                        dynastyName && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            <span>
                              Thời kỳ:{" "}
                              <span className="font-semibold">
                                {dynastyName}
                              </span>
                            </span>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-2xl transition-all hover:rotate-90 duration-300"
                  onClick={closeEventModal}
                  aria-label="Đóng"
                >
                  &times;
                </button>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Render HTML content */}
                <div
                  className="event-content"
                  dangerouslySetInnerHTML={{ __html: eventModalData.content }}
                />

                {/* Related Events Section */}
                {(() => {
                  // Find which dynasty this event belongs to
                  let relatedEvents = [];

                  for (const [_key, dynasty] of Object.entries(dynastyData)) {
                    const eventIndex = dynasty.events.findIndex(
                      (e) => e.name === eventModalData.name,
                    );
                    if (eventIndex !== -1) {
                      // Get 1 event before and 2 events after current event
                      const beforeEvent =
                        eventIndex > 0 ? [dynasty.events[eventIndex - 1]] : [];
                      const afterEvents = dynasty.events.slice(
                        eventIndex + 1,
                        eventIndex + 3,
                      );
                      relatedEvents = [...beforeEvent, ...afterEvents];
                      break;
                    }
                  }

                  if (relatedEvents.length > 0) {
                    return (
                      <div className="mt-8 pt-6 border-t-2 border-amber-200">
                        <h3 className="text-lg md:text-xl font-bold text-[#dc2626] mb-6">
                          Các sự kiện liên quan
                        </h3>
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {relatedEvents.map((event, idx) => (
                            <div
                              key={idx}
                              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
                              onClick={() => {
                                setEventModalData(event);
                                // Scroll to top of modal
                                document
                                  .querySelector(".max-h-\\[90vh\\]")
                                  ?.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {/* Event Image */}
                              <div className="relative h-[180px] overflow-hidden">
                                <img
                                  src={event.images?.[0] || nhangoImg}
                                  alt={event.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                {/* Year badge */}
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-md">
                                  <span className="text-sm font-bold text-gray-800">
                                    {event.year}
                                  </span>
                                </div>
                              </div>

                              {/* Event Info */}
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-[#dc2626] transition-colors min-h-[40px]">
                                  {event.name}
                                </h4>
                                {event.tomtat && (
                                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                    {event.tomtat}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
          {lightboxConfig.isOpen && (
            <ImageViewerModal
              images={lightboxConfig.images}
              startIndex={lightboxConfig.index}
              onClose={closeLightbox}
            />
          )}
        </div>

        <footer className="text-center text-gray-600 mt-8">
          © 2025 MT4 — Nghệ Thuật Ký Ức 4.0 • Liên hệ: hello@mt4.vn
        </footer>
      </div>
      {heroDetailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeHeroDetail();
          }}
        >
          <div className="max-w-[800px] w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl relative border-2 border-amber-300">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 md:top-4 md:right-4 z-30 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-gray-700 hover:text-amber-700 text-2xl transition-all hover:rotate-90 duration-300 shadow-lg"
              onClick={closeHeroDetail}
              aria-label="Đóng"
            >
              &times;
            </button>

            {/* Hero Image Section */}
            <div className="relative h-[250px] sm:h-[300px] md:h-[400px] rounded-t-2xl overflow-hidden">
              <img
                src={heroDetailModal.img}
                alt={heroDetailModal.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = nhangoImg;
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl md:text-4xl">⭐</span>
                  <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
                    {heroDetailModal.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm md:text-lg">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="font-semibold">
                    {heroDetailModal.period}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Tiểu sử
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {heroDetailModal.bio}
                </p>
              </div>

              {/* Decorative divider */}
              <div className="h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full my-6"></div>

              {/* Additional info can be added here */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thông tin thời kỳ
                </h4>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-amber-800">
                    {heroDetailModal.name}
                  </span>{" "}
                  là một trong những danh nhân tiêu biểu của giai đoạn{" "}
                  <span className="font-semibold text-amber-800">
                    {heroDetailModal.per}
                  </span>{" "}
                  thuộc thời kỳ{" "}
                  <span className="font-semibold text-amber-800">
                    {heroDetailModal.period}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
