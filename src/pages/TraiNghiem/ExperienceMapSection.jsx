import { useEffect, useMemo, useRef, useState } from "react";
import { mapData } from "../../data/historicalSitesData";

const ExperienceMapSection = ({
  periods,
  regions,
  isFilterPanelVisible,
  setFilterPanelVisible,
}) => {
  const PERIOD_COLORS = {
    "Hùng Vương": "#8b5cf6",
    Lý: "#3b82f6",
    Trần: "#22c55e",
    Hồ: "#f97316",
    "Pháp thuộc": "#facc15",
    Nguyễn: "#06b6d4",
    "Hiện đại": "#e11d48",
  };

  const LOCATION_TYPE_ICONS = {
    relic: "🏛️",
    temple: "⛩️",
    hall: "🏯",
    museum: "🏛️",
    theatre: "🎭",
    palace: "🏯",
    pagoda: "🛕",
    tomb: "🪦",
    institute: "🏫",
    school: "🎓",
    cafe: "☕",
    food: "🍲",
    hotel: "🏨",
    heritage: "🏺",
  };

  const markerIconCacheRef = useRef({});

  const getMarkerIcon = (period, locationType) => {
    const color = PERIOD_COLORS[period] || "#dc8154";
    const type = locationType || "heritage";
    const iconChar = LOCATION_TYPE_ICONS[type] || "📍";

    // Danh sách các loại chỉ hiện Icon (không nền)
    const isServiceType = ["food", "cafe", "hotel"].includes(type);

    // Thêm kích thước vào cache key để tránh lỗi khi đổi size
    const cacheKey = `${color}-${type}-${isServiceType ? "nobg-30" : "bg-28"}`;

    if (!markerIconCacheRef.current[cacheKey]) {
      let html = "";
      let iconSize = [24, 24];
      let iconAnchor = [12, 12];

      if (isServiceType) {
        // --- TRƯỜNG HỢP 1: ẨM THỰC & KHÁCH SẠN (Giữ nguyên như vừa làm) ---
        iconSize = [30, 30];
        iconAnchor = [15, 15];
        html = `
          <div style="
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            background: transparent;
            font-size: 26px;
            filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
            line-height: 1;
          ">
            ${iconChar}
          </div>
        `;
      } else {
        // --- TRƯỜNG HỢP 2: DI TÍCH LỊCH SỬ ---
        iconSize = [28, 28];
        iconAnchor = [14, 14];
        html = `
          <div style="
            width: 28px; height: 28px;
            border-radius: 999px;
            background: ${color}B3;
            /* filter: saturate(0.85) brightness(1.1); */
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex; align-items: center; justify-content: center;
            color: #fff;
            font-size: 18px;
          ">
            <span style="
              display:flex; align-items:center; justify-content:center;
              filter: drop-shadow(0 1px 1px rgba(0,0,0,0.25));
            ">
              ${iconChar}
            </span>
          </div>
        `;
      }

      markerIconCacheRef.current[cacheKey] = window.L.divIcon({
        html,
        className: "",
        iconSize: iconSize,
        iconAnchor: iconAnchor,
        popupAnchor: [0, -iconAnchor[1] - 4],
      });
    }

    return markerIconCacheRef.current[cacheKey];
  };

  const PROVINCES = useMemo(
    () =>
      Array.from(new Set(mapData.map((d) => d.province).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "vi"),
      ),
    [],
  );

  const [mapFilters, setMapFilters] = useState({
    periods: new Set(periods),
    regions: new Set(regions),
    provinces: new Set(PROVINCES),
    year: 2026,
    locationType: "all",
  });

  const [visibleCount, setVisibleCount] = useState(mapData.length);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [detailPlace, setDetailPlace] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const [periodCounts, setPeriodCounts] = useState(() => {
    const counts = {};
    mapData.forEach((d) => {
      if (!d.period) return;
      counts[d.period] = (counts[d.period] || 0) + 1;
    });
    return counts;
  });

  const [regionCounts, setRegionCounts] = useState(() => {
    const counts = {};
    mapData.forEach((d) => {
      if (!d.region) return;
      counts[d.region] = (counts[d.region] || 0) + 1;
    });
    return counts;
  });

  useEffect(() => {
    if (
      !detailPlace ||
      !Array.isArray(detailPlace.images) ||
      detailPlace.images.length <= 1
    )
      return;

    const timer = setInterval(() => {
      setDetailImageIndex((prev) => (prev + 1) % detailPlace.images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [detailPlace]);

  const openDetailModal = (place) => {
    setDetailPlace(place);
    setDetailImageIndex(0);
  };

  const closeDetailModal = () => {
    setDetailPlace(null);
  };

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const markerLayerRef = useRef(null);

  const flyToWithPopupOffset = (lat, lng, minZoom = 14) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    const currentZoom = map.getZoom();
    const zoom = Math.max(currentZoom, minZoom);

    const targetLatLng = window.L.latLng(lat, lng);
    const targetPoint = map.project(targetLatLng, zoom);

    const popupOffsetPx = 160;
    const newPoint = window.L.point(
      targetPoint.x,
      targetPoint.y - popupOffsetPx,
    );
    const newLatLng = map.unproject(newPoint, zoom);

    map.flyTo(newLatLng, zoom, { duration: 0.6 });
  };

  const locatingRef = useRef({
    watchId: null,
    marker: null,
    accuracy: null,
    following: false,
  });

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

    const map = window.L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomAnimation: true,
      markerZoomAnimation: true,
      fadeAnimation: true,
      maxZoom: 19,
    }).setView([10.78, 106.7], 12);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    window.L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    markerLayerRef.current = window.L.layerGroup().addTo(map);

    markersRef.current = mapData.map((e) => {
      const lat = typeof e.lat === "string" ? parseFloat(e.lat) : e.lat;
      const lng = typeof e.lng === "string" ? parseFloat(e.lng) : e.lng;

      const marker = window.L.marker([lat, lng], {
        icon: getMarkerIcon(e.period, e.locationType),
      }).addTo(markerLayerRef.current);

      marker.bindPopup(createPopupCardHtml(e), {
        className: "gm-like-popup",
        closeButton: true,
        autoPan: true,
        maxWidth: 400,
      });

      marker.on("popupopen", (popupEvent) => {
        const rootEl = popupEvent.popup.getElement();
        if (!rootEl) return;

        const imgEl = rootEl.querySelector(".popup-main-img");
        const prevBtn = rootEl.querySelector(".popup-prev-btn");
        const nextBtn = rootEl.querySelector(".popup-next-btn");
        const counterEl = rootEl.querySelector(".popup-image-counter");
        const detailBtn = rootEl.querySelector(".popup-detail-btn");
        const bookingBtn = rootEl.querySelector(".popup-booking-btn");

        const images = Array.isArray(e.images) ? e.images : [];

        detailBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          openDetailModal(e);
        });

        bookingBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          // const q = encodeURIComponent(`${e.name} booking`);
          // window.open(
          //   `https://www.google.com/search?q=${q}`,
          //   "_blank",
          //   "noopener,noreferrer",
          // );
        });

        if (!imgEl || images.length <= 1) return;

        let currentIndex = 0;
        let autoTimer = null;

        const triggerAnimation = () => {
          imgEl.classList.remove("animate-slide-in");
          void imgEl.offsetWidth;
          imgEl.classList.add("animate-slide-in");
        };

        const updateSlide = (delta) => {
          if (images.length <= 1) return;

          const nextIndex =
            (currentIndex + delta + images.length) % images.length;
          const nextSrc = images[nextIndex];

          imgEl.style.opacity = "0";

          const preloadImg = new Image();
          preloadImg.onload = () => {
            currentIndex = nextIndex;
            imgEl.src = nextSrc;

            if (counterEl) {
              counterEl.textContent = `${currentIndex + 1}/${images.length}`;
            }

            triggerAnimation();
            imgEl.style.opacity = "1";
          };

          preloadImg.onerror = () => {
            currentIndex = nextIndex;
            imgEl.src = nextSrc;

            if (counterEl) {
              counterEl.textContent = `${currentIndex + 1}/${images.length}`;
            }

            triggerAnimation();
            imgEl.style.opacity = "1";
          };

          preloadImg.src = nextSrc;
        };

        const startAuto = () => {
          if (images.length <= 1 || autoTimer) return;
          autoTimer = setInterval(() => {
            updateSlide(1);
          }, 3000);
        };

        const stopAuto = () => {
          if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
          }
        };

        startAuto();

        marker.once("popupclose", () => {
          stopAuto();
        });

        prevBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          stopAuto();
          updateSlide(-1);
          startAuto();
        });

        nextBtn?.addEventListener("click", (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          stopAuto();
          updateSlide(1);
          startAuto();
        });
      });

      return { marker, data: e };
    });

    injectMapCssOnce();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markerLayerRef.current) return;

    const {
      periods: pSet,
      regions: rSet,
      provinces,
      year,
      locationType,
    } = mapFilters;
    let count = 0;

    const nextPeriodCounts = {};
    const nextRegionCounts = {};

    markersRef.current.forEach(({ marker, data }) => {
      const dataYear = data.year || 2026;
      const dataLocationType = data.locationType || "heritage";

      let matchesLocationType = true;
      if (locationType && locationType !== "all") {
        const foodTypes = new Set(["food", "cafe"]);
        if (locationType === "food") {
          matchesLocationType = foodTypes.has(dataLocationType);
        } else if (locationType === "hotel") {
          matchesLocationType = dataLocationType === "hotel";
        } else if (locationType === "heritage") {
          matchesLocationType =
            !foodTypes.has(dataLocationType) && dataLocationType !== "hotel";
        }
      }

      const ok =
        pSet.has(data.period) &&
        rSet.has(data.region) &&
        provinces.has(data.province) &&
        dataYear <= year &&
        matchesLocationType;

      if (ok) {
        if (!markerLayerRef.current.hasLayer(marker)) {
          marker.addTo(markerLayerRef.current);
        }
        count += 1;

        if (data.period) {
          nextPeriodCounts[data.period] =
            (nextPeriodCounts[data.period] || 0) + 1;
        }
        if (data.region) {
          nextRegionCounts[data.region] =
            (nextRegionCounts[data.region] || 0) + 1;
        }
      } else {
        if (markerLayerRef.current.hasLayer(marker)) {
          markerLayerRef.current.removeLayer(marker);
        }
      }
    });

    setVisibleCount(count);
    setPeriodCounts(nextPeriodCounts);
    setRegionCounts(nextRegionCounts);
  }, [mapFilters]);

  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }
    const q = searchText.toLowerCase().normalize("NFC");
    const results = mapData
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.province && e.province.toLowerCase().includes(q)),
      )
      .slice(0, 8);
    setSuggestions(results);
  }, [searchText]);

  const focusPlace = (place) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setMapFilters((prev) => ({
      ...prev,
      provinces: new Set([...prev.provinces, place.province]),
      regions: new Set([...prev.regions, place.region]),
      periods: new Set([...prev.periods, place.period]),
    }));

    const lat =
      typeof place.lat === "string" ? parseFloat(place.lat) : place.lat;
    const lng =
      typeof place.lng === "string" ? parseFloat(place.lng) : place.lng;

    flyToWithPopupOffset(lat, lng, 14);

    const found = markersRef.current.find(
      (m) =>
        m.data.name === place.name &&
        Number(m.data.lat) === Number(place.lat) &&
        Number(m.data.lng) === Number(place.lng),
    );
    if (found) {
      map.once("moveend", () => {
        found.marker.openPopup();
      });
    }
    setShowSuggest(false);
    setSearchText(place.name);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      focusPlace(suggestions[0]);
    }
  };

  const toggleLocate = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (locatingRef.current.following) {
      if (locatingRef.current.watchId !== null) {
        navigator.geolocation.clearWatch(locatingRef.current.watchId);
      }
      if (locatingRef.current.marker) {
        map.removeLayer(locatingRef.current.marker);
      }
      if (locatingRef.current.accuracy) {
        map.removeLayer(locatingRef.current.accuracy);
      }
      locatingRef.current = {
        watchId: null,
        marker: null,
        accuracy: null,
        following: false,
      };
      return;
    }

    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation.");
      return;
    }
    locatingRef.current.following = true;

    const ensureLayers = (lat, lng, acc) => {
      const icon = window.L.divIcon({
        html: `<div style="
          width:12px;height:12px;border-radius:50%;background:#1d4ed8;border:2px solid #fff;box-shadow:0 0 0 2px rgba(29,78,216,.35);
        "></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      if (!locatingRef.current.marker) {
        locatingRef.current.marker = window.L.marker([lat, lng], {
          icon,
        }).addTo(map);
      }
      if (!locatingRef.current.accuracy) {
        locatingRef.current.accuracy = window.L.circleMarker([lat, lng], {
          radius: 30,
          color: "#1d4ed8",
          fillColor: "#3b82f6",
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);
      }
    };

    const updatePos = (lat, lng, acc = 30, fly = false) => {
      ensureLayers(lat, lng, acc);
      locatingRef.current.marker.setLatLng([lat, lng]);
      locatingRef.current.accuracy.setLatLng([lat, lng]);
      if (fly) {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        updatePos(latitude, longitude, accuracy, true);
      },
      (err) => {
        console.warn(err);
        alert("Không lấy được vị trí. Hãy kiểm tra quyền truy cập vị trí.");
        locatingRef.current.following = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        updatePos(latitude, longitude, accuracy, false);
      },
      (err) => {
        console.warn(err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
    locatingRef.current.watchId = watchId;
  };

  const handleMapFilterChange = (type, value) => {
    setMapFilters((prev) => {
      const newSet = new Set(prev[type]);
      newSet.has(value) ? newSet.delete(value) : newSet.add(value);
      return { ...prev, [type]: newSet };
    });
  };

  const handleLocationTypeChange = (value) => {
    setMapFilters((prev) => ({
      ...prev,
      locationType: value,
    }));
  };

  const handleMapYearChange = (e) => {
    const year = parseInt(e.target.value, 10);
    setMapFilters((prev) => ({ ...prev, year }));
  };

  const resetMapFilters = () => {
    setMapFilters({
      periods: new Set(periods),
      regions: new Set(regions),
      provinces: new Set(PROVINCES),
      year: 2026,
      locationType: "all",
    });
  };

  return (
    <>
      <section
        data-aos="fade-up"
        data-aos-delay="100"
        id="experience-map-section"
      >
        <div className="relative z-[1000] mx-auto mb-6 max-w-7xl rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-100 p-5 md:p-6 shadow-2xl backdrop-blur-lg">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Bộ lọc bản đồ di tích
              </p>
              <p className="text-xs text-stone-600">
                Lọc địa danh theo thời kỳ lịch sử, vùng miền và mốc thời gian
                bạn quan tâm.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm">
                Đang hiển thị
                <span className="ml-1 font-semibold text-[#dc8154]">
                  {visibleCount}
                </span>
                <span>địa danh</span>
              </span>
              <button
                type="button"
                onClick={resetMapFilters}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm hover:bg-amber-50 cursor-pointer"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v6h6M20 20v-6h-6M5 19l5-5M19 5l-5 5"
                  />
                </svg>
                Đặt lại
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 mr-2">
              Loại địa điểm
            </span>
            {[
              { id: "all", label: "Tất cả" },
              { id: "heritage", label: "Di tích - Văn hóa" },
              { id: "food", label: "Ẩm thực" },
              { id: "hotel", label: "Khách sạn" },
            ].map((cat) => {
              const active = mapFilters.locationType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleLocationTypeChange(cat.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                    active
                      ? "bg-amber-500 border-amber-500 text-white shadow-md"
                      : "bg-white/90 border-amber-200 text-[#2e1e10] hover:bg-amber-50"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* THỜI KỲ LỊCH SỬ (Dạng Dropdown Multi-select) */}
            <div className="flex-1 min-w-[260px] relative z-[50]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Thời kỳ lịch sử
                </span>
                {/* Nút bấm để chọn/bỏ chọn tất cả cho nhanh (Tùy chọn) */}
                <button
                  type="button"
                  onClick={() => {
                    setMapFilters((prev) => ({
                      ...prev,
                      periods:
                        prev.periods.size === periods.length
                          ? new Set()
                          : new Set(periods),
                    }));
                  }}
                  className="text-[10px] font-bold text-[#dc8154] cursor-pointer hover:underline"
                >
                  {mapFilters.periods.size === periods.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              </div>

              {/* Nút bấm hiển thị Dropdown */}
              <button
                type="button"
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-[#2e1e10] shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              >
                <span className="truncate">
                  {mapFilters.periods.size === 0
                    ? "Chưa chọn thời kỳ nào"
                    : mapFilters.periods.size === periods.length
                      ? "Tất cả thời kỳ"
                      : `Đã chọn (${mapFilters.periods.size}) thời kỳ`}
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
                  {/* Một lớp phủ tàng hình để click ra ngoài thì đóng Dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPeriodDropdownOpen(false)}
                  ></div>

                  <div className="absolute left-0 mt-2 w-full z-50 rounded-xl border border-amber-100 bg-white p-2 shadow-xl animate-fadein-fast max-h-64 overflow-y-auto">
                    {periods.map((period) => {
                      const color = PERIOD_COLORS[period] || "#dc8154";
                      const isActive = mapFilters.periods.has(period);

                      return (
                        <label
                          key={period}
                          className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-amber-50"
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox ẩn */}
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={isActive}
                              onChange={() =>
                                handleMapFilterChange("periods", period)
                              }
                            />
                            {/* Chấm màu đặc trưng cho từng thời kỳ */}
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${isActive ? "border-transparent" : "border-gray-300"}`}
                              style={{
                                backgroundColor: isActive
                                  ? color
                                  : "transparent",
                              }}
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

                          {/* Con số đếm địa danh */}
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            {periodCounts[period] ?? 0}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Vùng miền
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <label
                    key={region}
                    className="relative inline-flex cursor-pointer select-none items-center"
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={mapFilters.regions.has(region)}
                      onChange={() => handleMapFilterChange("regions", region)}
                    />
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs md:text-sm transition-all duration-150 shadow-sm
                        ${
                          mapFilters.regions.has(region)
                            ? "bg-amber-500 text-white border-amber-500 shadow-md"
                            : "bg-white/80 border-amber-200 text-[#2e1e10] hover:bg-amber-50"
                        }`}
                    >
                      <span className="whitespace-nowrap">{region}</span>
                      <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                        {regionCounts[region] ?? 0}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Mốc thời gian
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
                  Năm ≤{" "}
                  <span className="text-sm font-bold text-[#dc8154]">
                    {mapFilters.year}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-[11px] text-stone-500">500</span>
                <input
                  type="range"
                  min="500"
                  max="2026"
                  value={mapFilters.year}
                  step="1"
                  className="h-2 w-full cursor-pointer rounded-full bg-[#2e1e10]/10 accent-[#dc8154]"
                  onChange={handleMapYearChange}
                />
                <span className="text-[11px] text-stone-500">2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mb-4 max-w-7xl relative">
          <form onSubmit={onSearchSubmit} className="relative">
            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              placeholder="Tìm địa danh (ví dụ: Chợ Bến Thành, Cố đô Huế, Văn Miếu...)"
              className="w-full rounded-xl border border-amber-200 bg-white/90 px-4 py-3 pr-[100px] shadow-sm outline-none focus:ring-2 focus:ring-amber-400 text-[#2e1e10]"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#2e1e10] px-4 py-2 text-white font-semibold"
            >
              Tìm
            </button>

            {showSuggest && suggestions.length > 0 && (
              <div
                className="absolute z-[999] mt-2 w-full max-h-72 overflow-auto rounded-lg border border-amber-200 bg-white shadow-lg"
                onMouseLeave={() => setShowSuggest(false)}
              >
                {suggestions.map((s) => (
                  <div
                    key={`${s.name}-${s.lat}`}
                    className="cursor-pointer px-4 py-2 hover:bg-amber-50"
                    onClick={() => focusPlace(s)}
                  >
                    <div className="font-semibold text-[#2e1e10]">{s.name}</div>
                    <div className="text-sm text-gray-500">
                      {s.province} · {s.region} Bộ · {s.period}· {s.address}
                    </div>

                    {s.address && (
                      <div className="text-xs text-gray-400 mt-1 italic truncate">
                        Địa chỉ: {s.address}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="relative mx-auto max-w-7xl mb-8 overflow-hidden rounded-2xl shadow-2xl">
          <div
            className={`sidebar-mask ${isFilterPanelVisible ? "open" : ""}`}
            onClick={() => setFilterPanelVisible(false)}
          />
          <aside
            className={`absolute left-0 top-0 z-[999] h-[700px] w-[320px] overflow-auto rounded-xl bg-white/95 p-4 shadow-2xl transition-transform ${
              isFilterPanelVisible ? "translate-x-0" : "-translate-x-[110%]"
            }`}
            style={{ backdropFilter: "blur(6px)" }}
          >
            <button
              onClick={() => setFilterPanelVisible(false)}
              aria-label="Đóng bộ lọc"
              className="absolute right-3 top-3 rounded-full bg-white p-2 border border-gray-200 shadow-md hover:shadow-lg"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>
            <div className="mr-10 mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2e1e10]">
                Lọc theo Tỉnh/TP
              </h3>
              <button
                onClick={() =>
                  setMapFilters((prev) => ({
                    ...prev,
                    provinces: new Set(PROVINCES),
                  }))
                }
                className="text-sm font-semibold text-[#dc8154]"
              >
                Chọn tất cả
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Lọc danh sách tỉnh…"
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 text-[#2e1e10]"
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  const items = Array.from(
                    document.querySelectorAll(".province-item"),
                  );
                  items.forEach((el) => {
                    const name = el.getAttribute("data-name");
                    el.style.display = name?.toLowerCase().includes(val)
                      ? "flex"
                      : "none";
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              {PROVINCES.map((p) => (
                <label
                  key={p}
                  data-name={p}
                  className="province-item flex items-center justify-between gap-3 rounded-lg border border-amber-100 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#dc8154]"
                      checked={mapFilters.provinces.has(p)}
                      onChange={() => handleMapFilterChange("provinces", p)}
                    />
                    <span className="truncate text-sm text-[#2e1e10]">{p}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {mapData.filter((d) => d.province === p).length} địa danh
                  </span>
                </label>
              ))}
            </div>
          </aside>

          <div className="absolute left-3 top-3 z-900 flex flex-col gap-2">
            <button
              onClick={() => setFilterPanelVisible(true)}
              title="Mở bộ lọc địa danh"
              className="rounded-lg bg-white p-3 shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>

          <div className="absolute right-3 bottom-8 z-[900]">
            {" "}
            {/* bottom-8 để đẩy lên cao xíu cho thoáng */}
            <button
              onClick={toggleLocate}
              title="Hiển thị vị trí của bạn"
              className="flex h-10 w-10 items-center justify-center rounded bg-white shadow-md transition-all hover:bg-[#f1f1f1] hover:shadow-lg active:bg-[#e5e5e5] border border-gray-200"
            >
              {/* Icon Tâm ngắm (Target) */}
              <svg
                className="h-6 w-6 text-[#666] transition-colors hover:text-black"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Vòng tròn bên ngoài */}
                <path
                  d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 4 cái vạch ngắm 4 hướng */}
                <path
                  d="M12 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 12H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 12H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Chấm tròn ở giữa */}
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div
            ref={mapContainerRef}
            className="map-container h-[700px] w-full"
          />
        </div>
      </section>

      {detailPlace && (
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeDetailModal}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-gray-100"
              aria-label="Đóng"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
              >
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative bg-black overflow-hidden">
                {Array.isArray(detailPlace.images) &&
                detailPlace.images.length > 0 ? (
                  <>
                    <img
                      key={detailImageIndex}
                      src={detailPlace.images[detailImageIndex]}
                      alt={detailPlace.name}
                      className="w-full h-full object-fill animate-slide-in transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

                    <button
                      onClick={() =>
                        setDetailImageIndex(
                          (prev) =>
                            (prev - 1 + detailPlace.images.length) %
                            detailPlace.images.length,
                        )
                      }
                      disabled={detailPlace.images.length <= 1}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition ${
                        detailPlace.images.length <= 1
                          ? "opacity-40 cursor-default"
                          : ""
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M15 19l-7-7 7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() =>
                        setDetailImageIndex(
                          (prev) => (prev + 1) % detailPlace.images.length,
                        )
                      }
                      disabled={detailPlace.images.length <= 1}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition ${
                        detailPlace.images.length <= 1
                          ? "opacity-40 cursor-default"
                          : ""
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M9 5l7 7-7 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {detailPlace.images.length > 1 && (
                      <div className="absolute bottom-3 right-4 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        {detailImageIndex + 1}/{detailPlace.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm text-gray-400 bg-black/5">
                    Không có hình ảnh
                  </span>
                )}
              </div>

              <div className="flex flex-col h-full p-6">
                <div className="space-y-3 flex-1">
                  <h2 className="text-2xl font-bold text-[#2e1e10] pr-12 md:pr-16">
                    {detailPlace.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {detailPlace.period} · {detailPlace.region} Bộ ·{" "}
                    {detailPlace.province}
                  </p>
                  {detailPlace.address && (
                    <p className="text-xs text-gray-400 italic truncate">
                      Địa chỉ: {detailPlace.address}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-gray-700">
                    {detailPlace.detail || detailPlace.description}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${detailPlace.lat},${detailPlace.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2e1e10] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b2614] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-sm hover:shadow-lg"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Mở trên Google Maps
                  </a>

                  <button
                    type="button"
                    // onClick={() => {
                    //   const q = encodeURIComponent(
                    //     `${detailPlace.name} booking`,
                    //   );
                    //   window.open(
                    //     `https://www.google.com/search?q=${q}`,
                    //     "_blank",
                    //     "noopener,noreferrer",
                    //   );
                    // }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#dc8154] px-4 py-2 text-sm font-semibold text-[#dc8154] bg-white hover:bg-[#fff3e8] hover:border-[#c86a33] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all shadow-sm hover:shadow-md"
                  >
                    <span>🏨</span>
                    <span>Booking</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const createPopupCardHtml = (event) => `
  <div style="
    width: 360px; max-width: 90vw;
    background:#fff; border-radius:16px; overflow:hidden;
    box-shadow:0 8px 24px rgba(0,0,0,0.15); border:1px solid #eee;
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  ">
    <div style="position:relative;height:180px;background:#f7f7f7;overflow:hidden;">
      <img class="popup-main-img animate-slide-in" src="${event.images?.[0] || ""}" alt="${event.name}" style="width:100%;height:100%;object-fit:cover;transition:opacity .3s ease;" />
      <div style="position:absolute;bottom:8px;left:12px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;">
        ${event.period} · ${event.region} Bộ · ${event.province ?? ""}
      </div>
      ${
        Array.isArray(event.images) && event.images.length > 1
          ? `
        <button
          type="button"
          class="popup-prev-btn"
          style="position:absolute;left:8px;top:50%;transform:translateY(-50%);border:none;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;font-size:14px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;"
        >
          ◀
        </button>
        <button
          type="button"
          class="popup-next-btn"
          style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;font-size:14px;width:28px;height:28px;cursor:pointer;display:flex;align-items:center;justify-content:center;"
        >
          ▶
        </button>
        <div
          class="popup-image-counter"
          style="position:absolute;bottom:8px;right:12px;padding:4px 8px;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;"
        >
          1/${event.images.length}
        </div>
      `
          : ""
      }
    </div>
    <div style="padding:12px 14px 14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <h3 style="margin:0;font-size:18px;line-height:1.3;color:#1f2937;font-weight:700;">${event.name}</h3>
        <div style="display:flex;gap:8px;">
          <button title="Yêu thích" style="background:rgba(0,0,0,0.08);border:none;border-radius:50%;padding:6px;cursor:pointer;transition:background .2s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#dc8154" strokeWidth="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button title="Dislike" style="background:rgba(0,0,0,0.08);border:none;border-radius:50%;padding:6px;cursor:pointer;transition:background .2s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#888" strokeWidth="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.682 17.682a4.5 4.5 0 01-6.364 0L12 16.364l-1.318 1.318a4.5 4.5 0 01-6.364-6.364l7.682-7.682 7.682 7.682a4.5 4.5 0 010 6.364z"/>
            </svg>
          </button>
        </div>
      </div>
      ${
        event.address
          ? `<p style="margin:4px 0 6px;font-size:12px;color:#757575;font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              Địa chỉ: ${event.address}
            </p>`
          : ""
      }
      <p style="
        margin:8px 0 12px;
        color:#4b5563;
        font-size:14px;
        line-height:1.5;
        overflow:hidden;
        display:-webkit-box;
        -webkit-line-clamp:3;
        -webkit-box-orient:vertical;
      ">
        ${event.description}
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px;">

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}"
          target="_blank" rel="noopener noreferrer"
          class="popup-primary-btn"
          style="
            display:flex; align-items:center; justify-content:center; gap:6px;
            height: 38px; /* Cố định chiều cao */
            border-radius:8px; background:#2e1e10; color:#fff;
            font-weight:600; text-decoration:none; font-size:13px;
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
          Chỉ đường
        </a>

        <button
          type="button"
          class="popup-booking-btn"
          style="
            display:flex; align-items:center; justify-content:center; gap:6px;
            height: 38px; /* Cố định chiều cao */
            border-radius:8px; border:1px solid #dc8154; background:#fff7ed; color:#c2410c;
            font-weight:600; cursor:pointer; font-size:13px; white-space:nowrap;
          "
        >
          <span>📅</span> Booking
        </button>

        <button
          type="button"
          class="popup-detail-btn popup-secondary-btn"
          style="
            display:flex; align-items:center; justify-content:center;
            height: 38px; /* Cố định chiều cao */
            border-radius:8px; border:1px solid #e5e7eb; background:#fff; color:#374151;
            font-weight:600; cursor:pointer; font-size:13px; white-space:nowrap;
          "
        >
          Chi tiết
        </button>

      </div>
    </div>
  </div>
`;

const injectMapCssOnce = () => {
  if (document.getElementById("gm-like-popup-css")) return;
  const style = document.createElement("style");
  style.id = "gm-like-popup-css";
  style.innerHTML = `
    .gm-like-popup .leaflet-popup-content-wrapper{
      background:transparent; box-shadow:none; padding:0; border-radius:0;
    }
    .gm-like-popup .leaflet-popup-content{ margin:0!important; }
    .gm-like-popup .leaflet-popup-tip{ background:#fff; }
    .sidebar-mask{
      position:absolute; inset:0; background:rgba(0,0,0,.15);
      opacity:0; pointer-events:none; transition:opacity .2s; border-radius:16px; z-index: 998;
    }
    .sidebar-mask.open{ opacity:1; pointer-events:auto; }

    .gm-like-popup .popup-primary-btn,
    .gm-like-popup .popup-secondary-btn,
    .gm-like-popup .popup-booking-btn{
      transition: transform .16s ease, box-shadow .16s ease, background-color .16s ease, border-color .16s ease;
    }
    .gm-like-popup .popup-primary-btn:hover,
    .gm-like-popup .popup-secondary-btn:hover,
    .gm-like-popup .popup-booking-btn:hover{
      transform: translateY(-1px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.18);
    }
    .gm-like-popup .popup-primary-btn:active,
    .gm-like-popup .popup-secondary-btn:active,
    .gm-like-popup .popup-booking-btn:active{
      transform: translateY(0);
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    }
  `;
  document.head.appendChild(style);
};

export default ExperienceMapSection;
