// src/components/ImageModal.jsx

import React, { useState, useEffect } from 'react';

import DinhDocLap from "../assets/Dinh Độc Lập.png";
import diadaocuchi from "../assets/địa đạo Củ Chi.png";
import chuagiaclam from "../assets/Chùa Giác Lâm.png";
import langlevanduyet from "../assets/Lăng Lê Văn Duyệt.png";
import baotangmithuat from "../assets/Bảo tàng Mỹ thuật Thành phố Hồ Chí Minh.png";
import hoiquantuethanh from "../assets/Hội quán Tuệ Thành (Chùa Bà).png";
import toadaisuquan from "../assets/Tòa Đại sứ quán Mỹ (nay là Tổng Lãnh sự quán Hợp chủng quốc Hoa Kỳ tại TP. Hồ Chí Minh).png";
import caumong from "../assets/Cầu Mống.png";

const authorList = [
  { name: "Nguyễn Vân Anh", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Trần Minh Khôi", avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Lê Ngọc Hân", avatar: "https://randomuser.me/api/portraits/women/21.jpg" },
  { name: "Bùi Lan Hương", avatar: "https://randomuser.me/api/portraits/women/90.jpg" },
  { name: "Sài Gòn Ký Sự", avatar: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png" },
];

// QUAN TRỌNG: Dùng đúng index trong mảng galleryData của bạn!
const relatedImages = [
  { index: 0, src: DinhDocLap, caption: "Dinh Độc Lập – nơi xe tăng 843 húc đổ cổng..." },
  { index: 1, src: diadaocuchi, caption: "Địa đạo Củ Chi – kỳ quan lòng đất..." },
  { index: 3, src: chuagiaclam, caption: "Chùa Giác Lâm – chùa cổ nhất Sài Gòn" },
  { index: 7, src: langlevanduyet, caption: "Lăng Lê Văn Duyệt – Lăng Ông Bà Chiểu" },
  { index: 4, src: baotangmithuat, caption: "Bảo tàng Mỹ thuật – kiến trúc Đông Dương" },
  { index: 9, src: hoiquantuethanh, caption: "Chùa Bà Thiên Hậu Chợ Lớn" },
  { index: 16, src: toadaisuquan, caption: "Nơi trực thăng Mỹ rời Sài Gòn 30/4/1975" },
  { index: 33, src: caumong, caption: "Cầu Mống – thiết kế của Gustave Eiffel" },
];

const relatedTags = ["Sài Gòn xưa", "Di tích lịch sử", "Chùa cổ", "30/4/1975", "Kiến trúc Pháp"];

// Mock data cho comments
const mockComments = [
  {
    id: 1,
    author: "Nguyễn Văn Minh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "Tuyệt vời! Một di tích lịch sử quan trọng của dân tộc. Mình đã có dịp tham quan và cảm nhận được sự thiêng liêng nơi đây.",
    timestamp: "2 giờ trước",
    likes: 24,
    isLiked: false,
  },
  {
    id: 2,
    author: "Trần Thị Hương",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Kiến trúc rất đẹp và đặc sắc. Cần được bảo tồn và phát huy giá trị văn hóa!",
    timestamp: "5 giờ trước",
    likes: 18,
    isLiked: true,
  },
  {
    id: 3,
    author: "Lê Hoàng Nam",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    content: "Mỗi lần nhìn những bức ảnh này lại thấy tự hào về lịch sử dân tộc 🇻🇳",
    timestamp: "1 ngày trước",
    likes: 45,
    isLiked: false,
  },
  {
    id: 4,
    author: "Phạm Thùy Linh",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    content: "Ảnh chụp rất đẹp, góc máy tuyệt vời! Bạn dùng máy ảnh gì vậy?",
    timestamp: "2 ngày trước",
    likes: 12,
    isLiked: false,
  },
  {
    id: 5,
    author: "Đỗ Quang Huy",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    content: "Đây là một trong những địa điểm mình muốn ghé thăm nhất. Cảm ơn bạn đã chia sẻ!",
    timestamp: "3 ngày trước",
    likes: 8,
    isLiked: true,
  },
  {
    id: 6,
    author: "Võ Ngọc Trâm",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    content: "Thật tự hào khi Việt Nam có những di sản văn hóa tuyệt đẹp như thế này ❤️",
    timestamp: "4 ngày trước",
    likes: 32,
    isLiked: false,
  },
];

const ImageModal = ({ imageData, onClose, onNext, onPrev, onImageSelect, currentIndex, totalImages }) => {
  const [downloading, setDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");

  const author = authorList[Math.floor(Math.random() * authorList.length)];

  const handleLikeComment = (commentId) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        }
        : comment
    ));
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      author: "Bạn",
      avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      content: newComment,
      timestamp: "Vừa xong",
      likes: 0,
      isLiked: false,
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => { onNext(); setIsTransitioning(false); }, 200);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => { onPrev(); setIsTransitioning(false); }, 200);
  };

  // ĐÃ SỬA: Dùng đúng index thay vì id - 1
  const handleRelatedClick = (index) => {
    onImageSelect(index);        // ← Truyền đúng index
    onClose();                   // ← Đóng modal hiện tại
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ← Cuộn lên đầu
  };

  const handleDownload = () => {
    setDownloading(true);
    const a = document.createElement('a');
    a.href = imageData.src;
    a.download = `${imageData.alt || 'heritage'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext(e);
      if (e.key === 'ArrowLeft') handlePrev(e);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext, onPrev, onClose]);

  if (!imageData) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      {/* Nút điều hướng */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white hover:scale-110 transition">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 rounded-full backdrop-blur hover:bg-white/30 transition hidden md:block">
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 rounded-full backdrop-blur hover:bg-white/30 transition hidden md:block">
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Modal chính - RỘNG + ĐẸP */}
      <div
        className="bg-amber-50 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[94vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive layout */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 md:p-6 border-b border-amber-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Author info */}
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-shrink">
              <img src={author.avatar} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-full ring-2 md:ring-4 ring-amber-200 shadow-md flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-amber-900 text-base md:text-xl truncate">{author.name}</p>
                <p className="text-amber-700 text-sm md:text-base truncate">Đồng hành cùng dòng chảy lịch sử</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end">
              <button className="px-4 md:px-6 py-2 md:py-3 bg-amber-200 text-amber-900 rounded-xl font-semibold hover:bg-amber-300 transition shadow text-sm md:text-base">
                Like
              </button>
              <button className="px-4 md:px-6 py-2 md:py-3 bg-amber-200 text-amber-900 rounded-xl font-semibold hover:bg-amber-300 transition shadow text-sm md:text-base">
                Dislike
              </button>
              <button
                onClick={handleDownload}
                className="px-5 md:px-7 py-2 md:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm md:text-base"
              >
                {downloading ? "Đang tải..." : "Tải xuống"}
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung - Layout 2 cột: Hình bên trái, Comment bên phải */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Cột trái: Hình ảnh */}
            <div className="lg:w-[60%] p-6 flex flex-col">
              <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'} flex-1 flex items-center justify-center`}>
                <img
                  src={imageData.src}
                  alt={imageData.alt}
                  className="w-full max-h-[55vh] object-contain rounded-2xl shadow-2xl"
                />
              </div>

              <p className="text-center text-amber-900 font-medium text-lg leading-relaxed mt-4">
                {imageData.caption}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {relatedTags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 transition cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Cột phải: Comments */}
            <div className="lg:w-[40%] bg-gradient-to-b from-amber-50 to-white border-l border-amber-200 flex flex-col">
              {/* Header comment section */}
              <div className="p-4 border-b border-amber-200 bg-amber-100/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Bình luận ({comments.length})
                  </h3>
                </div>
              </div>

              {/* Form thêm comment */}
              <form onSubmit={handleSubmitComment} className="p-4 border-b border-amber-100 bg-white">
                <div className="flex gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                    alt="Your avatar"
                    className="w-10 h-10 rounded-full ring-2 ring-amber-200"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-amber-900 placeholder-amber-400 bg-amber-50/50"
                      rows="2"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2">
                        <button type="button" className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button type="button" className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Danh sách comments */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-amber-100">
                    <div className="flex gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full ring-2 ring-amber-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-amber-900 truncate">{comment.author}</p>
                          <span className="text-xs text-amber-500 flex-shrink-0">{comment.timestamp}</span>
                        </div>
                        <p className="text-amber-800 text-sm mt-1 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition ${comment.isLiked
                              ? 'text-red-500'
                              : 'text-amber-600 hover:text-red-500'
                              }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill={comment.isLiked ? "currentColor" : "none"}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{comment.likes}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-800 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span>Trả lời</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Khám phá thêm - Moved below the main content */}
          <div className="p-6 border-t border-amber-200 bg-amber-50/50">
            <h3 className="text-2xl font-bold text-amber-900 text-center mb-6">Khám phá thêm</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedImages.map(item => (
                <div
                  key={item.index}
                  onClick={() => handleRelatedClick(item.index)}
                  className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  <img src={item.src} alt="" className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white font-medium text-xs line-clamp-2">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center py-4 bg-amber-100 text-amber-800 font-semibold border-t border-amber-200">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;