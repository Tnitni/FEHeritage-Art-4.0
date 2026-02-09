// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { artSamples } from "../data/artSamples";
import { souvenirSamples } from "../data/souvenirs";

const ArtContext = createContext();

// 🔹 VERSION CONTROL - Tăng số này mỗi khi cập nhật data trong file
const DATA_VERSION = "1.2"; // Thay đổi thành "1.2", "1.3" khi update data

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
      setSouvenirs(souvenirSamples);
      localStorage.setItem("souvenirs_version", DATA_VERSION);
    } else {
      try {
        console.log("📦 Loading souvenirs from localStorage");
        setSouvenirs(JSON.parse(saved));
      } catch {
        setSouvenirs(souvenirSamples);
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