// src/components/ImageModal.jsx

import { useEffect, useState } from "react";

import baotangmithuat from "../assets/Bảo tàng Mỹ thuật Thành phố Hồ Chí Minh.png";
import chuagiaclam from "../assets/Chùa Giác Lâm.png";
import caumong from "../assets/Cầu Mống.png";
import DinhDocLap from "../assets/Dinh Độc Lập.png";
import hoiquantuethanh from "../assets/Hội quán Tuệ Thành (Chùa Bà).png";
import langlevanduyet from "../assets/Lăng Lê Văn Duyệt.png";
import toadaisuquan from "../assets/Tòa Đại sứ quán Mỹ (nay là Tổng Lãnh sự quán Hợp chủng quốc Hoa Kỳ tại TP. Hồ Chí Minh).png";
import diadaocuchi from "../assets/địa đạo Củ Chi.png";

const authorList = [
  {
    name: "Nguyễn Vân Anh",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Trần Minh Khôi",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Lê Ngọc Hân",
    avatar: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    name: "Bùi Lan Hương",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    name: "Sài Gòn Ký Sự",
    avatar: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
  },
];

const relatedImages = [
  {
    index: 0,
    src: DinhDocLap,
    caption: "Dinh Độc Lập – nơi xe tăng 843 húc đổ cổng...",
  },
  {
    index: 1,
    src: diadaocuchi,
    caption: "Địa đạo Củ Chi – kỳ quan lòng đất...",
  },
  {
    index: 3,
    src: chuagiaclam,
    caption: "Chùa Giác Lâm – chùa cổ nhất Sài Gòn",
  },
  {
    index: 7,
    src: langlevanduyet,
    caption: "Lăng Lê Văn Duyệt – Lăng Ông Bà Chiểu",
  },
  {
    index: 4,
    src: baotangmithuat,
    caption: "Bảo tàng Mỹ thuật – kiến trúc Đông Dương",
  },
  { index: 9, src: hoiquantuethanh, caption: "Chùa Bà Thiên Hậu Chợ Lớn" },
  {
    index: 16,
    src: toadaisuquan,
    caption: "Nơi trực thăng Mỹ rời Sài Gòn 30/4/1975",
  },
  {
    index: 33,
    src: caumong,
    caption: "Cầu Mống – thiết kế của Gustave Eiffel",
  },
];

const relatedTags = [
  "Sài Gòn xưa",
  "Di tích lịch sử",
  "Chùa cổ",
  "30/4/1975",
  "Kiến trúc Pháp",
];

const mockComments = [
  {
    id: 1,
    author: "Nguyễn Văn Minh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "Tuyệt vời! Một di tích lịch sử quan trọng của dân tộc.",
    timestamp: "2 giờ trước",
    likes: 24,
    isLiked: false,
  },
  {
    id: 2,
    author: "Trần Thị Hương",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Kiến trúc rất đẹp và đặc sắc.",
    timestamp: "5 giờ trước",
    likes: 18,
    isLiked: true,
  },
  {
    id: 3,
    author: "Lê Hoàng Nam",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    content:
      "Mỗi lần nhìn những bức ảnh này lại thấy tự hào về lịch sử dân tộc 🇻🇳",
    timestamp: "1 ngày trước",
    likes: 45,
    isLiked: false,
  },
  {
    id: 4,
    author: "Phạm Thùy Linh",
    avatar: "https://randomuser.me/api/portraits/women/89.jpg",
    content: "Ảnh chụp rất đẹp, góc máy tuyệt vời!",
    timestamp: "2 ngày trước",
    likes: 12,
    isLiked: false,
  },
  {
    id: 5,
    author: "Đỗ Quang Huy",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    content: "Cảm ơn bạn đã chia sẻ!",
    timestamp: "3 ngày trước",
    likes: 8,
    isLiked: true,
  },
  {
    id: 6,
    author: "Võ Ngọc Trâm",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
    content: "Thật tự hào khi Việt Nam có những di sản văn hóa tuyệt đẹp ❤️",
    timestamp: "4 ngày trước",
    likes: 32,
    isLiked: false,
  },
];

const ImageModal = ({
  imageData,
  onClose,
  onNext,
  onPrev,
  onImageSelect,
  currentIndex,
  totalImages,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");

  const [author, setAuthor] = useState(authorList[0]);
  const [postAction, setPostAction] = useState({ like: false, dislike: false });

  useEffect(() => {
    setAuthor(authorList[Math.floor(Math.random() * authorList.length)]);
    setPostAction({ like: false, dislike: false });
    setComments(mockComments);
  }, [imageData]);

  const handleLikeComment = (commentId) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );
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
    setComments((prev) => [newCommentObj, ...prev]);
    setNewComment("");
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => {
      onNext?.()
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => {
      onPrev?.()
      setIsTransitioning(false);
    }, 200);
  };

  const handleRelatedClick = (index) => {
    onImageSelect(index);
    onClose();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = () => {
    setDownloading(true);
    const a = document.createElement("a");
    a.href = imageData.src;
    a.download = `${imageData.alt || "heritage"}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(false), 1000);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext(e);
      if (e.key === "ArrowLeft") handlePrev(e);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  if (!imageData) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Nút điều hướng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white hover:scale-110 transition"
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
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 rounded-full backdrop-blur hover:bg-white/30 transition hidden md:block"
      >
        <svg
          className="w-9 h-9 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-white/10 rounded-full backdrop-blur hover:bg-white/30 transition hidden md:block"
      >
        <svg
          className="w-9 h-9 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Modal chính */}
      <div
        className="bg-amber-50 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[94vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 md:p-6 border-b border-amber-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Author info */}
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-shrink">
              <img
                src={author.avatar}
                alt=""
                className="w-10 h-10 md:w-14 md:h-14 rounded-full ring-2 md:ring-4 ring-amber-200 shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold text-amber-900 text-base md:text-xl truncate">
                  {author.name}
                </p>
                <p className="text-amber-700 text-sm md:text-base truncate">
                  Đồng hành cùng dòng chảy lịch sử
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end items-center">
              <button
                onClick={() =>
                  setPostAction((prev) => ({
                    like: !prev.like,
                    dislike: false,
                  }))
                }
                className={`group relative p-3 rounded-xl transition-all duration-300 shadow-sm border ${postAction.like ? "bg-amber-500 text-white border-amber-600 shadow-md transform scale-105" : "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={postAction.like ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Like
                </span>
              </button>
              <button
                onClick={() =>
                  setPostAction((prev) => ({
                    like: false,
                    dislike: !prev.dislike,
                  }))
                }
                className={`group relative p-3 rounded-xl transition-all duration-300 shadow-sm border ${postAction.dislike ? "bg-gray-600 text-white border-gray-700 shadow-md transform scale-105" : "bg-amber-200 text-amber-900 hover:bg-amber-300 border-transparent"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={postAction.dislike ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 14V2" />
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Dislike
                </span>
              </button>
              <button
                onClick={handleDownload}
                className="px-5 md:px-7 py-2 md:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm md:text-base ml-2"
              >
                {downloading ? "Đang tải..." : "Tải xuống"}
              </button>
            </div>
          </div>
        </div>

        {/* --- NỘI DUNG CHÍNH --- */}
        <div className="flex-1 overflow-y-auto  bg-[#F9F7F2]">
          <div className="flex flex-col lg:flex-row h-full">
            {/* --- CỘT TRÁI: HÌNH ẢNH --- */}
            <div className="lg:w-[60%] p-8 flex flex-col justify-center items-center bg-[#EDE8DE] border-r border-amber-200/50">
              {/* Khung ảnh */}
              <div
                className={`transition-all duration-500 ease-in-out ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"} flex-1 flex items-center justify-center`}
              >
                <img
                  src={imageData.src}
                  alt={imageData.alt}
                  className="max-w-full max-h-[55vh] object-contain shadow-2xl border-[6px] border-white rounded-sm transform rotate-1 hover:rotate-0 transition-transform duration-500"
                />
              </div>

              {/* Caption */}
              <div className="mt-6 text-center max-w-lg">
                <p className="text-amber-900/90 font-medium text-lg leading-relaxed font-serif italic">
                  "{imageData.caption}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {relatedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 border bg-amber-100 border-amber-400/30 text-amber-800/80 rounded-full text-xs font-semibold hover:bg-white hover:border-amber-400 transition cursor-pointer tracking-wide uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* --- CỘT PHẢI: BÌNH LUẬN --- */}
            <div className="lg:w-[40%] bg-white/50 flex flex-col h-full">
              {/* 1. Header Bình Luận */}
              <div className="p-4 border-b border-amber-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 font-serif">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  Bình luận
                  <span className="text-amber-600/60 font-sans text-base">
                    ({comments.length})
                  </span>
                </h3>
              </div>

              {/* 2. Danh sách Comment */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar max-h-[66vh] scrollbar-hide">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full border border-amber-200 p-0.5 object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      {/* Bong bóng chat: Màu kem sáng, bo góc mềm mại */}
                      <div className="bg-white border border-stone-100 shadow-sm p-3 rounded-2xl rounded-tl-none hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="font-bold text-sm text-gray-900">
                            {comment.author}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-4 mt-1.5 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`text-xs font-semibold flex items-center gap-1 transition ${
                            comment.isLiked
                              ? "text-red-500"
                              : "text-gray-500 hover:text-amber-600"
                          }`}
                        >
                          {/* Icon tim nhỏ */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill={comment.isLiked ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                          </svg>
                          Thích {comment.likes > 0 && `(${comment.likes})`}
                        </button>
                        <button className="text-xs font-semibold text-gray-500 hover:text-amber-600">
                          Phản hồi
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. Ô Nhập Comment */}
              <div className="p-4 border-t border-amber-100 bg-white sticky bottom-0 z-10">
                <form
                  onSubmit={handleSubmitComment}
                  className="relative flex gap-3 items-center"
                >
                  <img
                    src="https://randomuser.me/api/portraits/lego/1.jpg"
                    className="w-8 h-8 rounded-full border border-amber-200"
                    alt="me"
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="w-full pl-4 pr-10 py-2.5 bg-stone-50 border border-amber-200/50 rounded-full text-sm focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* --- KHÁM PHÁ THÊM --- */}
          <div className="p-6 border-t border-amber-200 bg-amber-50/50">
            <h3 className="text-2xl font-bold text-amber-900 text-center mb-6 font-serif">
              Khám phá thêm
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedImages.map((item) => (
                <div
                  key={item.index}
                  onClick={() => handleRelatedClick(item.index)}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-amber-200"
                >
                  <img
                    src={item.src}
                    alt=""
                    className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity flex items-end p-3">
                    <p className="text-amber-50 font-medium text-xs line-clamp-2 tracking-wide font-serif">
                      {item.caption}
                    </p>
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
