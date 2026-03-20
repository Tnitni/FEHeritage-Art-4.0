import { useRef, useState } from "react";
import filterIcon from "../../assets/filter.png";

const CustomCheckbox = ({ label, value, checked, onChange }) => (
  <label className="filter-button relative flex cursor-pointer select-none items-center gap-2 transition-all duration-200 hover:scale-105">
    <input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={onChange}
      className="peer absolute h-full w-full opacity-0"
    />
    <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-[#dc8154] transition-all duration-200 peer-checked:border-[#2e1e10] peer-checked:bg-[#2e1e10]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3 text-white transition-opacity opacity-0 peer-checked:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    <span className="text-sm font-medium text-[#2e1e10]">{label}</span>
  </label>
);

const TABS = [
  { id: "all", label: "Tất cả", icon: "✨" },
  { id: "image", label: "Hình ảnh", icon: "🖼️" },
  { id: "video", label: "Video", icon: "🎬" },
  { id: "bxh", label: "BXH", icon: "🏆" },
];

const ExperienceGallery = ({
  periods,
  regions,
  activeTab,
  setActiveTab,
  isFilterPanelVisible,
  setFilterPanelVisible,
  galleryFilters,
  setGalleryFilters,
  handleFilterChange,
  handleYearChange,
  filteredGalleryItems,
  openModal,
}) => {
  const filterPanelRef = useRef(null);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const resetFilters = () => {
    setGalleryFilters({
      periods: new Set(periods),
      regions: new Set(regions),
      year: 2026,
    });
  };

  const handleSelectAll = (type) => {
    if (type === "periods") {
      setGalleryFilters((prev) => ({
        ...prev,
        periods: new Set(periods),
      }));
    }
    if (type === "regions") {
      setGalleryFilters((prev) => ({
        ...prev,
        regions: new Set(regions),
      }));
    }
  };

  const handleClearAll = (type) => {
    setGalleryFilters((prev) => ({
      ...prev,
      [type]: new Set(),
    }));
  };

  const activePeriodsCount = galleryFilters.periods.size;
  const activeRegionsCount = galleryFilters.regions.size;

  return (
    <>
      <section
        className="relative mx-auto pt-20 max-w-6xl text-center overflow-hidden"
        data-aos="zoom-in"
        data-aos-delay="200"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc8154' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px",
            }}
          ></div>
        </div>

        <div className="inline-block p-6 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 shadow-inner mb-6 animate-pulse-slow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20 text-amber-700"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.4z" />
          </svg>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-[#2e1e10] mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-700 to-[#2e1e10]">
            Thư Viện Dòng Chảy
          </span>
          <br />
          <span className="text-4xl md:text-5xl text-amber-600">
            Lịch Sử Việt Nam
          </span>
        </h2>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-600"></div>
          <span className="text-amber-700 font-medium tracking-widest">
            NGÀN NĂM VĂN HIẾN
          </span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-600"></div>
        </div>

        <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Mỗi bức ảnh là một chương sử. Mỗi chi tiết là một câu chuyện.{" "}
          <span className="text-amber-600 font-semibold">
            Hãy để hình ảnh dẫn lối bạn qua dòng chảy thời gian.
          </span>
        </p>

        <div
          className="mt-10 mb-4 w-full overflow-x-auto pb-2"
          data-aos="fade-up"
          data-aos-delay="400"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#dc8154 transparent",
          }}
        >
          <div className="flex justify-start md:justify-center gap-2 md:gap-4 px-4 md:px-0 min-w-max md:min-w-0">
            <div className="inline-flex rounded-full bg-white/70 shadow-inner p-1 border border-amber-100">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full px-4 md:px-6 py-2 text-sm md:text-base whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-300/50 scale-105"
                        : "bg-transparent text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative z-10 mx-auto mb-8 max-w-7xl px-6"
        data-aos="fade-right"
        data-aos-delay="300"
      >
        <div className="rounded-2xl bg-white/95 border border-amber-100 shadow-2xl backdrop-blur-md p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.382a1 1 0 01-.293.707l-5.414 5.414A2 2 0 0015 13.828V19l-3.5-2-3.5 2v-5.172a2 2 0 00-.293-1.035L2.293 7.089A1 1 0 012 6.382V4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-[#2e1e10]">
                  Bộ lọc triển lãm
                </p>
                <p className="text-xs text-stone-500">
                  Lọc theo thời kỳ, vùng miền và mốc thời gian bạn quan tâm.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                Đang hiển thị
                <span className="font-semibold">
                  {filteredGalleryItems.length}
                </span>
                <span>tác phẩm</span>
              </span>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v6h6M20 20v-6h-6M5 19l5-5M19 5l-5 5"
                  />
                </svg>
                <span>Đặt lại</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterPanelVisible((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-[#dc8154] px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#2e1e10] md:hidden"
              >
                <img
                  src={filterIcon}
                  width="18"
                  height="18"
                  alt="Filter Icon"
                  className="invert brightness-0"
                />
                <span>
                  {isFilterPanelVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </span>
              </button>
            </div>
          </div>

          <div
            ref={filterPanelRef}
            className={`mt-4 grid gap-4 md:gap-6 transition-all duration-300 overflow-hidden md:overflow-visible ${
              isFilterPanelVisible
                ? "max-h-[650px] opacity-100"
                : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
            }`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#dc8154 #f5f5f4",
            }}
          >
            {/* THỜI KỲ LỊCH SỬ */}
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-5">
              {/* 1. Label (Bên trái) */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <strong className="text-base md:text-lg font-bold text-[#2e1e10]">
                  Thời kỳ:
                </strong>
                {/* Đếm số lượng trên mobile */}
                <div className="flex items-center gap-2 md:hidden">
                  <span className="text-[11px] text-stone-500">
                    Đã chọn {activePeriodsCount}
                  </span>
                </div>
              </div>

              {/* 2. Nút Dropdown (Nằm giữa, độ rộng vừa phải w-56) */}
              <div className="flex-1 relative z-[60]">
                <div className="relative inline-block w-full md:w-56">
                  {/* Nút bấm hiển thị Dropdown */}
                  <button
                    type="button"
                    onClick={() =>
                      setIsPeriodDropdownOpen(!isPeriodDropdownOpen)
                    }
                    className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-[#2e1e10] shadow-sm hover:bg-amber-50 focus:outline-none"
                  >
                    <span className="truncate">
                      {activePeriodsCount === 0
                        ? "Chọn thời kỳ..."
                        : activePeriodsCount === periods.length
                          ? "Tất cả thời kỳ"
                          : `Đã chọn (${activePeriodsCount})`}
                    </span>
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform duration-200 ${isPeriodDropdownOpen ? "rotate-180 text-amber-500" : "text-gray-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Bảng Dropdown xổ xuống */}
                  {isPeriodDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsPeriodDropdownOpen(false)}
                      ></div>
                      <div className="absolute left-0 mt-1 w-full md:w-64 z-50 rounded-xl border border-amber-100 bg-white p-2 shadow-xl animate-fadein-fast max-h-60 overflow-y-auto">
                        {periods.map((period) => {
                          const isActive = galleryFilters.periods.has(period);
                          return (
                            <label
                              key={period}
                              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-amber-50"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={isActive}
                                  onChange={() =>
                                    handleFilterChange(
                                      setGalleryFilters,
                                      "periods",
                                      period,
                                    )
                                  }
                                />
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${isActive ? "border-[#dc8154] bg-[#dc8154]" : "border-gray-300"}`}
                                >
                                  {isActive && (
                                    <svg
                                      className="h-3 w-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`text-sm font-medium ${isActive ? "text-[#2e1e10]" : "text-gray-600"}`}
                                >
                                  {period}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 3. Cụm nút chức năng (Bên phải - Phục hồi lại như cũ) */}
              <div className="flex items-center gap-2 text-[11px] md:text-xs text-stone-500 mt-2 md:mt-0">
                <button
                  type="button"
                  onClick={() => handleSelectAll("periods")}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-700 hover:bg-amber-100"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAll("periods")}
                  className="rounded-full border border-gray-200 bg-white px-2 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Bỏ chọn
                </button>
                <span className="hidden md:inline-block">
                  Đã chọn {activePeriodsCount}
                </span>
              </div>
            </div>

            {/* Đường gạch ngang phân cách mobile */}
            <div className="h-px w-full bg-amber-100 md:hidden" />

            <div className="h-px w-full bg-amber-100 md:hidden" />

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-5">
              <div className="flex items-center justify-between w-full md:w-auto">
                <strong className="text-base md:text-lg font-bold text-[#2e1e10]">
                  Vùng miền:
                </strong>
                <div className="flex items-center gap-2 md:hidden">
                  <span className="text-[11px] text-stone-500">
                    Đã chọn {activeRegionsCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-4 flex-1">
                {regions.map((region) => (
                  <CustomCheckbox
                    key={region}
                    label={region}
                    value={region}
                    checked={galleryFilters.regions.has(region)}
                    onChange={() =>
                      handleFilterChange(setGalleryFilters, "regions", region)
                    }
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] md:text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => handleSelectAll("regions")}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-700 hover:bg-amber-100"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAll("regions")}
                  className="rounded-full border border-gray-200 bg-white px-2 py-1 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Bỏ chọn
                </button>
                <span className="hidden md:inline-block">
                  Đã chọn {activeRegionsCount}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-amber-100 md:hidden" />

            <div className="flex flex-col md:flex-row min-w-0 md:min-w-[300px] flex-grow gap-3 md:gap-4 md:items-center">
              <div className="flex flex-col gap-1">
                <strong className="whitespace-nowrap text-base md:text-lg font-bold text-[#2e1e10]">
                  Năm ≤{" "}
                  <span className="font-extrabold text-[#dc8154]">
                    {galleryFilters.year}
                  </span>
                </strong>
                <span className="text-[11px] text-stone-500">
                  Kéo thanh trượt để xem các tác phẩm trước mốc năm bạn chọn.
                </span>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <span className="text-[11px] text-stone-400">700</span>
                <input
                  type="range"
                  min="700"
                  max="2026"
                  value={galleryFilters.year}
                  step="1"
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#2e1e10]/20 outline-none transition-all duration-200"
                  onChange={(e) => handleYearChange(setGalleryFilters, e)}
                />
                <span className="text-[11px] text-stone-400">2026</span>
              </div>
            </div>

            <div className="md:hidden mt-1 text-center text-[11px] text-amber-600">
              ↕ Kéo lên/xuống để xem thêm bộ lọc
            </div>
          </div>
        </div>
      </section>

      <section className="p-6 columns-1 md:columns-2 lg:columns-3 gap-6">
        {filteredGalleryItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openModal(index)}
            className="group relative mb-6 break-inside-avoid rounded-3xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.03] cursor-pointer border border-amber-100/20"
            data-aos="fade-up"
            data-aos-delay={(index % 3) * 100}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="block h-auto w-full transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:brightness-90"
              loading="lazy"
            />
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4 flex flex-col justify-between">
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex justify-between items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-black/50 px-4 py-2 text-white text-sm font-semibold transition-all duration-300 hover:bg-black/70 focus:outline-none"
                  title="Chỉnh sửa ảnh"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 003-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="rounded-full bg-black/50 p-2 text-white transition-all duration-300 hover:bg-black/70 focus:outline-none"
                    title="Thêm vào yêu thích"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="rounded-full bg-black/50 p-2 text-white transition-all duration-300 hover:bg-black/70 focus:outline-none"
                    title="Dislike"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.682 17.682a4.5 4.5 0 01-6.364 0L12 16.364l-1.318 1.318a4.5 4.5 0 01-6.364-6.364l7.682-7.682 7.682 7.682a4.5 4.5 0 010 6.364z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  <img
                    src={
                      item.authorAvatar ||
                      "https://cdn-icons-png.flaticon.com/512/1995/1995515.png"
                    }
                    alt={item.authorName || "Người dùng"}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span>{item.authorName || "Người đăng"}</span>
                </div>
                <a
                  href={item.src}
                  download
                  title="Tải xuống ảnh"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 rounded-lg bg-black/50 px-4 py-2 text-white text-sm font-semibold transition-all duration-300 hover:bg-black/70 hover:scale-105 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default ExperienceGallery;
