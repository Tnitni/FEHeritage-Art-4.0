import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { dynastyData as dynastyDataRaw } from "../../data/mockData";
import EventImageSlider from "./EventImageSlider";
import nhangoImg from "../../assets/nhango.jpg";
import nhathoImg from "../../assets/nhatho.png";
import nhathoDucbaImg from "../../assets/nhathoducba.jpg";
import nhathoDucbaAiImg from "../../assets/nhathoducbaai.png";
import hueImg from "../../assets/hue.jpg";
import diadaoImg from "../../assets/diadao.png";

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

export default function HeroesList() {
  const location = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [heroDetailModal, setHeroDetailModal] = useState(null);

  useEffect(() => {
    // Get period from URL params
    const params = new URLSearchParams(location.search);
    const period = params.get("period");
    if (period) {
      setSelectedPeriod(period);
    }
  }, [location]);

  // Get all periods with heroes
  const periods = Object.entries(dynastyData)
    .filter(([, dynasty]) => dynasty.figures && dynasty.figures.length > 0)
    .map(([key, dynasty]) => ({
      key,
      title: dynasty.title,
      count: dynasty.figures.length,
    }));

  // Get current period data
  const getCurrentPeriodData = () => {
    if (!selectedPeriod) {
      // If no period selected, return all heroes from all periods
      const allHeroes = [];
      Object.entries(dynastyData).forEach(([key, dynasty]) => {
        if (dynasty.figures && dynasty.figures.length > 0) {
          dynasty.figures.forEach((figure) => {
            allHeroes.push({
              ...figure,
              period: dynasty.title,
              periodKey: key,
            });
          });
        }
      });
      return { title: "Tất cả thời kỳ", heroes: allHeroes };
    }

    // Find the dynasty that matches selected period
    for (const [key, dynasty] of Object.entries(dynastyData)) {
      if (dynasty.title === selectedPeriod) {
        return {
          title: dynasty.title,
          heroes: dynasty.figures.map((f) => ({
            ...f,
            period: dynasty.title,
            periodKey: key,
          })),
        };
      }
    }
    return { title: "Tất cả thời kỳ", heroes: [] };
  };

  const currentData = getCurrentPeriodData();

  const openHeroDetail = (hero) => {
    setHeroDetailModal(hero);
    document.body.style.overflow = "hidden";
  };

  const closeHeroDetail = () => {
    setHeroDetailModal(null);
    document.body.style.overflow = "";
  };

  return (
    <div className="min-h-screen bg-[#f6eadf] text-gray-800 py-7">
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Header */}
        <header className="relative grid gap-5 p-8 rounded-[24px] bg-gradient-to-br from-amber-900 via-amber-700 to-amber-600 overflow-hidden shadow-xl mb-8">
          <div className="relative z-10">
            <h1 className="text-4xl text-white font-bold drop-shadow-lg mb-2">
              ⭐ Danh nhân Việt Nam
            </h1>
            <p className="text-lg text-white/95 max-w-[90%] drop-shadow">
              Khám phá những con người kiệt xuất đã tạo nên dòng chảy lịch sử
              dân tộc
            </p>
          </div>
        </header>

        {/* Period Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Chọn thời kỳ
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedPeriod("")}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                selectedPeriod === ""
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              Tất cả
            </button>
            {periods.map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.title)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  selectedPeriod === period.title
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                <span>{period.title}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {period.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Heroes Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-amber-900">
              {currentData.title}
            </h2>
            <span className="flex items-center justify-center text-center text-sm text-gray-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
              {currentData.heroes.length} danh nhân
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentData.heroes.map((hero, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-br from-white to-amber-50/50 rounded-xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openHeroDetail(hero)}
              >
                {/* Hero Image */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-50 to-gray-100">
                  <img
                    src={hero.img}
                    alt={hero.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = nhangoImg;
                    }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Period badge */}
                  {selectedPeriod === "" && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                      <span className="text-xs font-bold text-amber-700">
                        {hero.period}
                      </span>
                    </div>
                  )}

                  {/* Star decoration */}
                  <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-sm text-white p-2 rounded-lg shadow-md">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>

                {/* Hero Info */}
                <div className="p-4">
                  <h3 className="font-bold text-amber-900 text-lg mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {hero.name}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {hero.bio}
                  </p>
                </div>

                {/* Decorative gradient bar */}
                {/* <div className="h-1.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div> */}
              </div>
            ))}
          </div>

          {currentData.heroes.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Không tìm thấy danh nhân
              </h3>
              <p className="text-gray-600">
                Thử chọn thời kỳ khác để xem danh nhân
              </p>
            </div>
          )}
        </div>

        {/* Hero Detail Modal */}
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
                className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-gray-700 hover:text-amber-700 text-2xl transition-all hover:rotate-90 duration-300 shadow-lg"
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

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-700 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-2 border-amber-200 hover:border-amber-400"
          >
            <svg
              className="w-5 h-5"
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
            <span>Quay lại</span>
          </button>
        </div>

        <footer className="text-center text-gray-600 mt-8">
          © 2025 MT4 — Nghệ Thuật Ký Ức 4.0 • Liên hệ: hello@mt4.vn
        </footer>
      </div>
    </div>
  );
}
