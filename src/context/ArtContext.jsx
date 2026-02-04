// src/context/ArtContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { artSamples } from "../data/artSamples";
import { souvenirSamples } from "../data/souvenirs";

const ArtContext = createContext();

export function ArtProvider({ children }) {
  const [arts, setArts] = useState([]);
  const [souvenirs, setSouvenirs] = useState([]);

  // 🔹 Lấy dữ liệu tranh từ localStorage hoặc artSamples khi mở trang
  useEffect(() => {
    const saved = localStorage.getItem("artworks");
    if (saved) {
      try {
        setArts(JSON.parse(saved));
      } catch {
        setArts(artSamples);
      }
    } else {
      setArts(artSamples);
    }
  }, []);

  // 🔹 Lấy dữ liệu đồ lưu niệm từ localStorage hoặc souvenirSamples
  useEffect(() => {
    const saved = localStorage.getItem("souvenirs");
    if (saved) {
      try {
        setSouvenirs(JSON.parse(saved));
      } catch {
        setSouvenirs(souvenirSamples);
      }
    } else {
      setSouvenirs(souvenirSamples);
    }
  }, []);

  // 🔹 Lưu tranh vào localStorage khi có thay đổi
  useEffect(() => {
    if (arts && arts.length > 0)
      localStorage.setItem("artworks", JSON.stringify(arts));
  }, [arts]);

  // 🔹 Lưu đồ lưu niệm vào localStorage khi có thay đổi
  useEffect(() => {
    if (souvenirs && souvenirs.length > 0)
      localStorage.setItem("souvenirs", JSON.stringify(souvenirs));
  }, [souvenirs]);

  // 🔹 Kết hợp tất cả sản phẩm (tranh + đồ lưu niệm)
  const allProducts = [...arts, ...souvenirs];

  return (
    <ArtContext.Provider value={{ 
      arts: allProducts,       
      artsOnly: arts,           
      souvenirs: souvenirs,      
      setArts,                   
      setSouvenirs               
    }}>
      {children}
    </ArtContext.Provider>
  );
}

export const useArts = () => useContext(ArtContext);