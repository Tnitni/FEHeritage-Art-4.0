// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { artSamples } from "../data/artSamples";
import { souvenirSamples } from "../data/souvenirs";

const ArtContext = createContext();

// 🔹 VERSION CONTROL - Tăng số này mỗi khi cập nhật data trong file
const DATA_VERSION = "1.8"; // Tăng version để đồng bộ lại dữ liệu mới từ file

const buildSouvenirMap = (items) => {
  const byId = new Map();
  const byTitle = new Map();

  items.forEach((item) => {
    byId.set(item.id, item);
    byTitle.set(item.title, item);
  });

  return { byId, byTitle };
};

const normalizeSouvenirs = (items) => {
  const { byId, byTitle } = buildSouvenirMap(souvenirSamples);
  let repairedCount = 0;

  const normalizedIncoming = (items || []).map((item) => {
    const source = byId.get(item.id) || byTitle.get(item.title);
    const resolvedLink = item?.shopeeLink || item?.link || item?.url || source?.shopeeLink || "";
    const resolvedImages = item?.images || source?.images || {};

    const repaired = {
      ...item,
      shopeeLink: resolvedLink,
      images: resolvedImages,
    };

    const hadNoLink = !item?.shopeeLink && !item?.link && !item?.url;
    if (hadNoLink && repaired.shopeeLink) repairedCount += 1;

    return repaired;
  });

  // Luôn lấy đủ toàn bộ sản phẩm từ file data gốc
  const mergedWithSource = souvenirSamples.map((sourceItem) => {
    const incomingItem = normalizedIncoming.find(
      (item) => item.id === sourceItem.id || item.title === sourceItem.title
    );

    if (!incomingItem) return sourceItem;

    return {
      ...sourceItem,
      ...incomingItem,
      shopeeLink: incomingItem.shopeeLink || sourceItem.shopeeLink,
      images: incomingItem.images || sourceItem.images,
    };
  });

  // Nếu có sản phẩm custom do admin thêm mà không có trong file gốc thì vẫn giữ lại
  const customExtras = normalizedIncoming.filter(
    (item) => !souvenirSamples.some((sourceItem) => sourceItem.id === item.id || sourceItem.title === item.title)
  );

  const normalized = [...mergedWithSource, ...customExtras];

  if (repairedCount > 0) {
    console.warn("[ArtContext] Repaired missing souvenir links:", repairedCount);
  }

  if (normalized.length !== souvenirSamples.length) {
    console.log("[ArtContext] Souvenir list merged. Source:", souvenirSamples.length, "Final:", normalized.length);
  }

  return normalized;
};

export function ArtProvider({ children }) {
  const [arts, setArts] = useState([]);
  const [souvenirs, setSouvenirs] = useState([]);

  // 🔹 Lấy dữ liệu tranh từ localStorage hoặc artSamples
  useEffect(() => {
    const savedVersion = localStorage.getItem("artworks_version");
    const saved = localStorage.getItem("artworks");
    
    // Nếu version khác hoặc chưa có data → load từ file
    if (savedVersion !== DATA_VERSION || !saved) {
      console.log("🔄 Loading artworks from file (version:", DATA_VERSION, ")");
      setArts(artSamples);
      localStorage.setItem("artworks_version", DATA_VERSION);
    } else {
      try {
        console.log("📦 Loading artworks from localStorage");
        setArts(JSON.parse(saved));
      } catch {
        setArts(artSamples);
      }
    }
  }, []);

  // 🔹 Lấy dữ liệu đồ lưu niệm từ localStorage hoặc souvenirSamples
  useEffect(() => {
    const savedVersion = localStorage.getItem("souvenirs_version");
    const saved = localStorage.getItem("souvenirs");
    
    // Nếu version khác hoặc chưa có data → load từ file
    if (savedVersion !== DATA_VERSION || !saved) {
      console.log("🔄 Loading souvenirs from file (version:", DATA_VERSION, ")");
      setSouvenirs(normalizeSouvenirs(souvenirSamples));
      localStorage.setItem("souvenirs_version", DATA_VERSION);
    } else {
      try {
        console.log("📦 Loading souvenirs from localStorage");
        setSouvenirs(normalizeSouvenirs(JSON.parse(saved)));
      } catch {
        setSouvenirs(normalizeSouvenirs(souvenirSamples));
      }
    }
  }, []);

  // 🔹 Lưu tranh vào localStorage khi có thay đổi
  useEffect(() => {
    if (arts && arts.length > 0) {
      localStorage.setItem("artworks", JSON.stringify(arts));
      localStorage.setItem("artworks_version", DATA_VERSION);
    }
  }, [arts]);

  // 🔹 Lưu đồ lưu niệm vào localStorage khi có thay đổi
  useEffect(() => {
    if (souvenirs && souvenirs.length > 0) {
      localStorage.setItem("souvenirs", JSON.stringify(souvenirs));
      localStorage.setItem("souvenirs_version", DATA_VERSION);
    }
  }, [souvenirs]);

  // 🔹 Kết hợp tất cả sản phẩm (tranh + đồ lưu niệm)
  const allProducts = [...arts, ...souvenirs];

  return (
    <ArtContext.Provider value={{ 
      arts: allProducts,       // Tất cả sản phẩm
      artsOnly: arts,          // Chỉ tranh
      souvenirs: souvenirs,    // Chỉ đồ lưu niệm
      setArts,                 // Hàm update tranh
      setSouvenirs             // Hàm update đồ lưu niệm
    }}>
      {children}
    </ArtContext.Provider>
  );
}

export const useArts = () => useContext(ArtContext);