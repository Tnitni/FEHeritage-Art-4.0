import { useEffect, useState, useRef } from "react";

/**
 * Modal hiển thị chi tiết ảnh và các bình luận
 * @param {Object} imageData - Dữ liệu ảnh và tác giả
 * @param {Function} onClose - Đóng modal
 * @param {Function} onNext - Chuyển ảnh tiếp theo
 * @param {Function} onPrev - Ảnh trước đó
 * @param {Function} onImageSelect - Chọn ảnh theo chỉ số
 * @param {number} currentIndex - Vị trí hiện tại trong gallery
 * @param {number} totalImages - Tổng số ảnh
 * @param {Function} onCommentSubmit - Gửi bình luận mới
 * @param {Function} onCommentDelete - Xóa bình luận
 * @param {Function} onLoadComments - Load list bình luận ảnh
 * @param {Function} onLikeComment - Like bình luận
 * @param {Function} onUnlikeComment - Unlike bình luận
 * @param {Function} onReplyComment - Gửi phản hồi cho bình luận
 * @param {Array} relatedImages - Danh sách ảnh liên quan
 */
const ImageModal = ({
  imageData,
  onClose,
  onNext,
  onPrev,
  onImageSelect,
  currentIndex,
  totalImages,
  onCommentSubmit,
  onCommentDelete,
  onLoadComments,
  onLikeComment,
  onUnlikeComment,
  onReplyComment,
  relatedImages = [],
}) => {
  const [downloading, setDownloading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const hasLoadedRef = useRef(false);

  // Trạng thái cho phản hồi bình luận
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCommentsCount = imageData.comments?.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0), 
    0
  ) || 0;
  // Hàm chèn tag tên người dùng vào replyText khi reply (theo yêu cầu prompt)
  const handleReplyClick = (commentId, userName) => {
    setReplyingTo(commentId);
    setReplyText(`@${userName || "Người dùng"} `);
  };

  // Format content để highlight các tag @name
  const formatCommentContent = (content) => {
    if (!content) return "";
    // Tìm các chuỗi bắt đầu bằng @ và kết thúc bằng khoảng trắng (hoặc kết chuỗi)
    const parts = content.split(/(@\S+\s)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="text-blue-600 font-semibold">{part}</span>
        );
      }
      return part;
    });
  };

  // Chỉ load bình luận 1 lần khi đổi ảnh
  useEffect(() => {
    if (imageData?.id && onLoadComments) {
      setLoadingComments(true);
      onLoadComments(imageData.id).finally(() => {
        setLoadingComments(false);
        hasLoadedRef.current = true;
      });
    }
    // Reset reply khi đổi ảnh
    return () => {
      hasLoadedRef.current = false;
      setReplyingTo(null);
      setReplyText("");
    };
  }, [imageData?.id]);

  // Đồng bộ comments với parent
  useEffect(() => {
    if (imageData?.comments) {
      setComments(imageData.comments);
    }
  }, [imageData?.comments]);

  // Thích hoặc bỏ thích bình luận
  const handleLikeComment = async (commentId, isLiked) => {
    try {
      if (isLiked) {
        await onUnlikeComment?.(commentId, imageData.id);
      } else {
        await onLikeComment?.(commentId, imageData.id);
      }

      // Cập nhật like đệ quy với nested comments
      const updateLikeRecursively = (commentsList) => {
        return commentsList.map((comment) => {
          if (comment.id === commentId) {
            const currentCount = comment.like_count ?? comment.likeCount ?? 0;
            const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
            return {
              ...comment,
              isLiked: !isLiked,
              likeCount: newCount, // Cập nhật cả 2 để đồng bộ UI
              like_count: newCount,
            };
          }
          if (comment.replies?.length) {
            return {
              ...comment,
              replies: updateLikeRecursively(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments((prev) => updateLikeRecursively(prev));
    } catch (error) {
      console.error("Lỗi like/unlike:", error);
    }
  };

  // Gửi bình luận mới
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    const commentData = {
      content: newComment,
    };
    const success = await onCommentSubmit?.(commentData);
    if (success) {
      setNewComment("");
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (commentId) => {
    await onCommentDelete?.(commentId);
  };

  // Chuyển ảnh tiếp theo/cũ
  const handleNext = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => {
      onNext?.();
      setIsTransitioning(false);
    }, 200);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => {
      onPrev?.();
      setIsTransitioning(false);
    }, 200);
  };

  // Xử lý click ảnh liên quan
  const handleRelatedClick = (index) => {
    onImageSelect?.(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Download ảnh
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

  // Lắng nghe phím tắt cho modal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  // Gửi phản hồi bình luận, reload lại comments từ backend
  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim() || isSubmitting) return;
  
    try {
      setIsSubmitting(true);
      // Phải có await và nhận giá trị trả về
      const res = await onReplyComment(imageData.id, parentId, replyText);
  
      // Kiểm tra nếu thực sự thành công mới xóa text
      if (res) { 
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  /**
   * Render các phản hồi (hỗ trợ lồng nhau)
   */
  const renderReplies = (replies, parentId, depth = 0) => {
    if (!replies || replies.length === 0) return null;
    const isExpanded = expandedReplies[parentId];
    const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
    const hiddenCount = replies.length - visibleReplies.length;
    const marginLeft = Math.min(depth * 32, 64);

    return (
      <div className="mt-3 space-y-3" style={{ marginLeft: `${marginLeft}px` }}>
        {visibleReplies.map((reply) => (
          <div key={reply.id} className="relative">
            <div
              className="absolute w-[24px] h-[20px] border-l-2 border-b-2 border-gray-300 rounded-bl-xl"
              style={{ left: '-32px', top: '4px' }}
            />
            <div className="flex gap-2">
              <img
                src={reply.user?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg"}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                alt="avatar"
              />
              <div className="flex-1 min-w-0">
                <div className="relative inline-flex items-center">
                  <div className="bg-[#F0F2F5] px-3 py-2 rounded-[18px]">
                    <p className="text-[13px] font-bold text-gray-900">
                      {reply.user?.display_name || "Người dùng"}
                    </p>
                    <p className="text-[14px] leading-snug text-gray-800 break-words">
                      {formatCommentContent(reply.content)}
                    </p>
                  </div>
                  {(reply.like_count > 0 || reply.likeCount > 0) && (
               
                    <div className="absolute right-0 -bottom-3 flex items-center gap-1 bg-white shadow-md rounded-full px-1.5 py-0.5 border border-gray-100 z-10 scale-95" style={{ transform: 'translateX(30%)' }}>
                      <div className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 leading-none">
                        {reply.like_count ?? reply.likeCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-bold text-gray-500">
                  <button
                    onClick={() => handleLikeComment(reply.id, reply.isLiked)}
                    className={"flex items-center gap-1 " + (reply.isLiked ? "text-blue-600" : "hover:underline")}
                  >
                   
                    Thích
                  </button>
                  <button
                    onClick={() => handleReplyClick(reply.id, reply.user?.display_name || "Người dùng")}
                    className="hover:underline"
                  >
                    Phản hồi
                  </button>
                </div>
                {replyingTo === reply.id && (
                  <div className="mt-2 flex gap-2 items-start relative">
                    <div
                      className="absolute w-[24px] h-[16px] border-l-2 border-b-2 border-gray-300 rounded-bl-xl"
                      style={{ left: '-32px', top: '8px' }}
                    />
                    <img
                      src="https://randomuser.me/api/portraits/lego/1.jpg"
                      className="w-7 h-7 rounded-full border border-gray-200 mt-1"
                      alt="me"
                    />
                    <div className="flex-1 bg-gray-100 rounded-full pl-3 pr-2 py-2 flex items-center relative">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] w-full"
                        placeholder={`Phản hồi ${reply.user?.display_name || "người dùng"}...`}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReplySubmit(parentId);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleReplySubmit(parentId)}
                        disabled={!replyText.trim() || isSubmitting}
                        className="ml-1 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shrink-0 flex items-center justify-center"
                        tabIndex={-1}
                        type="button"
                        aria-label="Gửi phản hồi"
                        style={{ minWidth: 32, minHeight: 32 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {reply.replies && reply.replies.length > 0 && (
                  renderReplies(reply.replies, reply.id, depth + 1)
                )}
              </div>
            </div>
          </div>
        ))}
        {!isExpanded && hiddenCount > 0 && (
          <div className="flex gap-2 relative">
            <div
              className="absolute w-[24px] h-[12px] border-l-2 border-b-2 border-gray-300 rounded-bl-xl"
              style={{ left: '-32px', top: '8px' }}
            />
            <div className="w-8"></div>
            <button
              onClick={() => setExpandedReplies(prev => ({ ...prev, [parentId]: true }))}
              className="text-gray-600 text-[12px] font-bold hover:underline"
            >
              Xem thêm {hiddenCount} phản hồi...
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!imageData) return null;

  const author = {
    name: imageData.authorName || "Người dùng",
    avatar: imageData.authorAvatar || "https://randomuser.me/api/portraits/lego/1.jpg",
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Nút đóng modal */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 text-white hover:scale-110 transition">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Nút chuyển ảnh */}
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

      <div className="bg-amber-50 rounded-3xl shadow-2xl w-full max-w-7xl max-h-[94vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header tác giả và nút tải ảnh */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 md:p-6 border-b border-amber-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-shrink">
              <img src={author.avatar} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-full ring-2 md:ring-4 ring-amber-200 shadow-md flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-amber-900 text-base md:text-xl truncate">{author.name}</p>
                <p className="text-amber-700 text-sm md:text-base truncate">Đồng hành cùng dòng chảy lịch sử</p>
              </div>
            </div>
            <button onClick={handleDownload} className="px-5 md:px-7 py-2 md:py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm md:text-base">
              {downloading ? "Đang tải..." : "Tải xuống"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9F7F2]">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Hiển thị hình ảnh chính và thông tin chú thích */}
            <div className="lg:w-[60%] p-8 flex flex-col justify-center items-center bg-[#EDE8DE] border-r border-amber-200/50">
              <div className={`transition-all duration-500 ease-in-out ${isTransitioning ? "opacity-50 scale-95" : "opacity-100 scale-100"} flex-1 flex items-center justify-center`}>
                <img src={imageData.src} alt={imageData.alt} className="max-w-full max-h-[55vh] object-contain shadow-2xl border-[6px] border-white rounded-sm transform rotate-1 hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="mt-6 text-center max-w-lg">
                <p className="text-amber-900/90 font-medium text-lg leading-relaxed font-serif italic">"{imageData.caption}"</p>
                {imageData.period && imageData.region && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="px-3 py-1 border bg-amber-100 border-amber-400/30 text-amber-800/80 rounded-full text-xs font-semibold hover:bg-white hover:border-amber-400 transition cursor-pointer tracking-wide uppercase">{imageData.period}</span>
                    <span className="px-3 py-1 border bg-amber-100 border-amber-400/30 text-amber-800/80 rounded-full text-xs font-semibold hover:bg-white hover:border-amber-400 transition cursor-pointer tracking-wide uppercase">{imageData.region}</span>
                    {imageData.year && <span className="px-3 py-1 border bg-amber-100 border-amber-400/30 text-amber-800/80 rounded-full text-xs font-semibold hover:bg-white hover:border-amber-400 transition cursor-pointer tracking-wide uppercase">{imageData.year}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách bình luận và form nhập */}
            <div className="lg:w-[40%] bg-white/50 flex flex-col h-full">
              <div className="p-4 border-b border-amber-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2 font-serif">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </span>
                  Bình luận ({totalCommentsCount})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar max-h-[66vh] scrollbar-hide">
                {loadingComments ? (
                  <div className="text-center py-8">
                    <p className="text-amber-700 animate-pulse">Đang tải bình luận...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-amber-700">Chưa có bình luận nào</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="mb-6">
                      <div className="flex gap-3 relative">
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="absolute left-[18px] top-[40px] bottom-0 w-[2px] bg-gray-300"></div>
                        )}
                        <img src={comment.user?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg"} className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex-shrink-0 object-cover" alt="avatar" />
                        <div className="flex-1 min-w-0">
                          <div className="inline-flex flex-col items-start max-w-full">
                            {/* Nội dung chính bình luận */}
                            <div className="bg-[#F0F2F5] px-4 py-2 rounded-[18px] shadow-sm">
                              <p className="font-bold text-[13px] text-gray-900">
                                {comment.user?.display_name || "Người dùng"}
                              </p>
                              <p className="text-[15px] leading-snug text-gray-800 break-words whitespace-pre-wrap">
                                {formatCommentContent(comment.content)}
                              </p>
                            </div>
                            {/* Hiển thị số lượt thích */}
                            {(comment.like_count > 0 || comment.likeCount > 0) && (
                              <div className="flex justify-end w-full -mt-2.5 pr-1">
                                <div className="flex items-center gap-1 bg-white shadow-sm rounded-full px-1.5 py-0.5 border border-gray-100 z-10">
                                  <div className="bg-blue-500 rounded-full p-0.5 flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                  </div>
                                  <span className="text-[11px] font-bold text-gray-600 leading-none">
                                  {comment.like_count ?? comment.likeCount}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Nút thao tác bình luận */}
                          <div className="flex items-center gap-4 mt-1 ml-2 text-[12px] font-bold text-gray-500">
                            <button
                              onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                              className={comment.isLiked ? "text-blue-600" : "hover:underline"}
                            >
                              Thích
                            </button>
                            <button
                              onClick={() => handleReplyClick(comment.id, comment.user?.display_name || "Người dùng")}
                              className="hover:underline"
                            >
                              Phản hồi
                            </button>
                          </div>
                          {replyingTo === comment.id && (
                            <div className="mt-3 ml-8 flex gap-2 items-start relative">
                              <div className="absolute -left-[32px] top-[8px] w-[24px] h-[16px] border-l-2 border-b-2 border-gray-300 rounded-bl-xl"></div>
                              <img src="https://randomuser.me/api/portraits/lego/1.jpg" className="w-7 h-7 rounded-full border border-gray-200 mt-1" alt="me" />
                              <div className="flex-1 bg-gray-100 rounded-full pl-3 pr-2 py-2 flex items-center relative">
                                <input
                                  autoFocus
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  className="bg-transparent border-none outline-none text-[13px] w-full"
                                  placeholder={`Phản hồi ${comment.user?.display_name || "người dùng"}...`}
                                  onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleReplySubmit(comment.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleReplySubmit(comment.id)}
                                  disabled={!replyText.trim() || isSubmitting}
                                  className="ml-1 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shrink-0 flex items-center justify-center"
                                  tabIndex={-1}
                                  type="button"
                                  aria-label="Gửi phản hồi"
                                  style={{ minWidth: 32, minHeight: 32 }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8">{renderReplies(comment.replies, comment.id, 0)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Khối nhập bình luận mới */}
              <div className="p-4 border-t border-amber-100 bg-white sticky bottom-0 z-10">
                <div className="relative flex gap-3 items-center">
                  <img src="https://randomuser.me/api/portraits/lego/1.jpg" className="w-8 h-8 rounded-full border border-amber-200" alt="me" />
                  <div className="relative flex-1">
                    <div className="flex items-center bg-stone-50 border border-amber-200/50 rounded-full w-full pl-4 pr-2 py-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSubmitComment();
                          }
                        }}
                        placeholder="Viết bình luận..."
                        className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                      />
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className="ml-2 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shrink-0 flex items-center justify-center"
                        style={{ minWidth: 34, minHeight: 34 }}
                        type="button"
                        aria-label="Gửi bình luận"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách ảnh liên quan bên dưới modal */}
          {relatedImages && relatedImages.length > 0 && (
            <div className="p-6 border-t border-amber-200 bg-amber-50/50">
              <h3 className="text-2xl font-bold text-amber-900 text-center mb-6 font-serif">Khám phá thêm</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedImages.slice(0, 8).map((item, idx) => (
                  <div key={item.id || idx} onClick={() => handleRelatedClick(idx)} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-300 border border-amber-200">
                    <img src={item.src} alt="" className="w-full h-40 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity flex items-end p-3">
                      <p className="text-amber-50 font-medium text-xs line-clamp-2 tracking-wide font-serif">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer chỉ số số trang */}
        <div className="text-center py-4 bg-amber-100 text-amber-800 font-semibold border-t border-amber-200">
          {currentIndex + 1} / {totalImages}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;