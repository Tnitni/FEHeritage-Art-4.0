import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  X,
  Heart,
  ThumbsUp,
  Share2,
  Eye,
  MessageSquare,
  Send,
  Hash,
  ThumbsDown,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Edit,
  Play,
  Loader2,
  FileText,
} from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
// import { vi } from "date-fns/locale";

function getRelativeTimeVi(date) {
  if (!date) return "";
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return "vừa xong";

  const units = [
    { name: "năm", seconds: 31536000 },
    { name: "tháng", seconds: 2592000 },
    { name: "tuần", seconds: 604800 },
    { name: "ngày", seconds: 86400 },
    { name: "giờ", seconds: 3600 },
    { name: "phút", seconds: 60 },
  ];

  for (const unit of units) {
    const interval = Math.floor(diffInSeconds / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.name} trước`;
    }
  }
  return "vừa xong";
}

// const categoryLabels = {
//   technology: "Công nghệ",
//   travel: "Du lịch",
//   discussion: "Thảo luận",
//   education: "Giáo dục",
//   heritage: "Di sản",
// };

// const categoryColors = {
//   technology: "from-blue-100 to-cyan-100 text-blue-700",
//   travel: "from-green-100 to-emerald-100 text-green-700",
//   discussion: "from-purple-100 to-violet-100 text-purple-700",
//   education: "from-pink-100 to-rose-100 text-pink-700",
//   heritage: "from-yellow-100 to-amber-100 text-yellow-800",
// };
const getCategoryStyles = (categoryName) => {
  const styles = {
    "Công nghệ":
      "from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200",
    "Du lịch":
      "from-green-500/10 to-emerald-500/10 text-green-700 border-green-200",
    "Thảo luận":
      "from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200",
    "Giáo dục": "from-pink-500/10 to-rose-500/10 text-pink-700 border-pink-200",
    "Di sản":
      "from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200",
    default: "from-gray-500/10 to-slate-500/10 text-gray-700 border-gray-200",
  };
  return styles[categoryName] || styles["default"];
};

export default function PostDetailModal({
  post,
  // author,
  onClose,
  onLike,
  onDislike,
  onShare,
  onAddComment,
  onDeleteComment,
  currentUser,
  onAvatarClick,
  onEdit,
  onDelete,
}) {
  console.log("Dữ liệu post trong modal:", post);
  console.log("Toàn bộ currentUser:", currentUser);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [liked, setLiked] = useState(false);
  // const [disliked, setDisliked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isLiked = post.liked;
  const isDisliked = post.disliked;

  const allMedia = [
    ...(post.displayImages || []).map((url) => ({ type: "image", url })),
    ...(post.displayVideos || []).map((url) => ({ type: "video", url })),
  ];

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(
      (prev) => (prev - 1 + post.images.length) % post.images.length,
    );
  };

  // const handleLike = () => {
  //   onLike();
  // };

  // const handleDislike = () => {
  //   onDislike();
  // };

  const handleShare = () => {
    onShare();
  };

  const handleSubmitComment = async () => {
    if (comment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddComment(comment);
        setComment("");
        toast.success("Đã gửi bình luận!");
      } catch (error) {
        toast.error("Không thể gửi bình luận");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // const timeAgo = formatDistanceToNow(new Date(post.created_date), {
  //   addSuffix: true,
  //   locale: vi,
  // });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Chờ component cha thực hiện xóa xong qua API
      await onDelete();
    } catch (error) {
      setIsDeleting(false);
      toast.error("Không thể xóa lúc này");
    }
  };

  const displayAuthor = post.author;
  const timeAgo = getRelativeTimeVi(post.created_date);

  // Kiểm tra xem user hiện tại có phải là tác giả không
  const isAuthor =
    currentUser && post && String(currentUser.id) === String(post.user_id);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-zinc-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {post.isLoadingDetail ? (
            /* --- GIAO DIỆN LOADING  --- */
            <div className="p-20 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-amber-100 border-t-orange-500 rounded-full animate-spin" />

                <FileText className="absolute inset-0 m-auto w-8 h-8 text-amber-300" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-amber-900 animate-pulse">
                  Đang tải nội dung...
                </p>
                <p className="text-amber-600/80 text-sm">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            </div>
          ) : (
            /* --- GIAO DIỆN NỘI DUNG CHÍNH --- */ <>
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-400 to-amber-600 p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onAvatarClick(post.author.id)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={displayAuthor?.avatar}
                        alt={displayAuthor?.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white cursor-pointer"
                      />
                    </button>
                    <div>
                      <h3 className="font-semibold">{displayAuthor?.name}</h3>
                      <p className="text-sm opacity-90">{timeAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAuthor && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={onEdit}
                          className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 bg-gradient-to-r ${getCategoryStyles(post.categoryName)} text-sm rounded-full font-medium shadow-sm`}
                  >
                    {post.categoryName}
                  </span>
                </div>
                {/* Title */}
                <h1 className="text-3xl font-bold text-amber-900">
                  {post.title}
                </h1>

                {/* Content */}
                <div className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                <div
                  className={`grid gap-4 ${allMedia.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {allMedia.map((item, idx) => (
                    <div
                      key={idx}
                      className={`relative overflow-hidden rounded-xl cursor-pointer group bg-zinc-200 
                  ${
                    allMedia.length === 1
                      ? "h-auto min-h-[300px] max-h-[500px]"
                      : "h-64"
                  }`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-12 h-12 text-white opacity-80" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => {
                      const tagName = typeof tag === "object" ? tag.name : tag;
                      const tagKey = typeof tag === "object" ? tag.id : index;

                      return (
                        <motion.span
                          key={tagKey}
                          whileHover={{ scale: 1.1 }}
                          className="px-3 py-1 bg-amber-100/60 hover:bg-amber-200/50 text-amber-700 text-sm rounded-full flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Hash className="w-3 h-3" />
                          {tagName}
                        </motion.span>
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-6 border-t border-amber-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isLiked
                        ? "bg-blue-100 text-blue-600"
                        : "bg-amber-100/60 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    <ThumbsUp
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span className="font-medium">{post.likes}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onDislike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isDisliked
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100/60 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    <ThumbsDown
                      className={`w-5 h-5 ${isDisliked ? "fill-current" : ""}`}
                    />
                    <span className="font-medium">{post.dislikes || 0}</span>
                  </motion.button>

                  {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100/60 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">{post.shares}</span>
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 text-amber-600"
              >
                <Eye className="w-5 h-5" />
                <span className="font-medium">{post.views}</span>
              </motion.div> */}
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-6 border-t border-amber-200">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-amber-900">
                      Bình luận ({post.comments?.length || 0})
                    </h3>
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <img
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSubmitComment()
                        }
                        placeholder="Viết bình luận..."
                        className="flex-1 px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                      />
                      <motion.button
                        whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                        onClick={handleSubmitComment}
                        disabled={!comment.trim() || isSubmitting}
                        className="px-4 py-2 bg-amber-500 text-zinc-50 rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {post.comments?.map((comment) => {
                      const displayCommentAuthor = comment.author || {
                        name: "Người dùng",
                        avatar: null,
                      };
                      const isCommentOwner =
                        currentUser &&
                        String(currentUser.id) === String(comment.user_id);
                      const commentTimeAgo = getRelativeTimeVi(
                        comment.created_date,
                      );
                      // const commentTimeAgo = formatDistanceToNow(
                      //   new Date(comment.created_date),
                      //   {
                      //     addSuffix: true,
                      //     locale: vi,
                      //   },
                      // );

                      return (
                        <motion.div
                          key={comment.id || comment.post_comment_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ backgroundColor: "#fef3c7" }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-3 p-4 bg-amber-50 group rounded-lg relative"
                        >
                          <img
                            src={displayCommentAuthor.avatar}
                            alt={displayCommentAuthor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-amber-900">
                                {displayCommentAuthor.name}
                              </span>
                              <span className="text-sm text-amber-600">
                                {commentTimeAgo}
                              </span>
                            </div>
                            <p className="text-amber-800">{comment.content}</p>
                          </div>
                          {isCommentOwner && (
                            <button
                              onClick={() =>
                                onDeleteComment(
                                  comment.id || comment.post_comment_id,
                                )
                              }
                              className="opacity-0 group-hover:opacity-100 p-2 h-fit self-center text-red-500 hover:bg-red-100 rounded-md aspect-square flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}

                    {(!post.comments || post.comments.length === 0) && (
                      <p className="text-center text-amber-600 py-8">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">
                  Xác nhận xóa
                </h3>
                <p className="text-sm text-amber-600">
                  Bạn có chắc chắn muốn xóa bài viết này?
                </p>
              </div>
            </div>
            <p className="text-amber-700 mb-6">
              Hành động này không thể hoàn tác. Tất cả bình luận và tương tác sẽ
              bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !isDeleting && setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
              >
                Hủy
              </motion.button>
              <motion.button
                whileHover={{ scale: isDeleting ? 1 : 1.05 }}
                whileTap={{ scale: isDeleting ? 1 : 0.95 }}
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-medium flex items-center justify-center min-w-[120px]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang xóa...
                  </>
                ) : (
                  "Xóa bài viết"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
          >
            {/* Nút đóng */}
            <button
              className="absolute top-6 right-6 text-white hover:text-gray-300 z-[110] p-2"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X className="w-10 h-10" />
            </button>

            {/* Nút Điều hướng */}
            {allMedia.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-[110]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? allMedia.length - 1 : prev - 1,
                    );
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-[110]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) =>
                      prev === allMedia.length - 1 ? 0 : prev + 1,
                    );
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Hiển thị nội dung (Ảnh hoặc Video) */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={() => setSelectedImageIndex(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh]"
              >
                {allMedia[selectedImageIndex].type === "image" ? (
                  <motion.img
                    key={`media-${selectedImageIndex}`}
                    src={allMedia[selectedImageIndex].url}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                  />
                ) : (
                  <motion.video
                    key={`media-${selectedImageIndex}`}
                    src={allMedia[selectedImageIndex].url}
                    controls
                    autoPlay
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-full max-h-[90vh] object-contain shadow-2xl"
                  />
                )}
              </div>
            </div>

            {/* Chỉ số */}
            <div className="absolute bottom-9 text-white/80 font-medium bg-black/40 px-4 py-1 rounded-full">
              {selectedImageIndex + 1} / {allMedia.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// import { useState } from 'react'

// export default function PostDetailModal({ post, onClose, onLike, onDislike, onAddComment, onViewProfile }) {
//   const [comment, setComment] = useState('')
//   const [selectedImage, setSelectedImage] = useState(null) // State cho ảnh được chọn

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     if (comment.trim()) {
//       onAddComment(post.id, comment)
//       setComment('')
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
//       onClick={onClose}
//     >
//       <div
//         className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-t-2xl z-10">
//           <div className="flex items-center justify-between">
//             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
//               <i className="fa-solid fa-newspaper" />
//               Chi tiết bài viết
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:rotate-90"
//             >
//               <i className="fa-solid fa-times text-xl" />
//             </button>
//           </div>
//         </div>

//         {/* Content - Scrollable */}
//         <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
//           {/* Post Header */}
//           <div className="p-6 border-b border-gray-200">
//             <div
//               className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity mb-4"
//               onClick={() => onViewProfile(post.author)}
//             >
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
//                 {post.author.avatar}
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800 hover:text-amber-600 transition-colors text-lg">
//                   {post.author.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 flex items-center gap-2">
//                   <span>{post.author.role}</span>
//                   <span>•</span>
//                   <span>{post.timestamp}</span>
//                 </p>
//               </div>
//             </div>

//             {/* Category Badge */}
//             <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
//               <i className="fa-solid fa-tag" />
//               {post.category}
//             </span>

//             {/* Title */}
//             <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
//               {post.title}
//             </h1>

//             {/* Content */}
//             <p className="text-gray-700 leading-relaxed text-lg mb-4 whitespace-pre-wrap">
//               {post.content}
//             </p>

//             {/* Images Gallery */}
//             {post.images && post.images.length > 0 && (
//               <div className="mb-4">
//                 <div className={`grid gap-3 ${
//                   post.images.length === 1 ? 'grid-cols-1' :
//                   post.images.length === 2 ? 'grid-cols-2' :
//                   'grid-cols-2 md:grid-cols-3'
//                 }`}>
//                   {post.images.map((image, index) => (
//                     <div
//                       key={index}
//                       className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-amber-400 transition-all cursor-pointer"
//                       onClick={() => setSelectedImage(image)}
//                     >
//                       <img
//                         src={image}
//                         alt={`Post image ${index + 1}`}
//                         className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
//                       />
//                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
//                         <i className="fa-solid fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Tags */}
//             <div className="flex flex-wrap gap-2">
//               {post.tags.map((tag, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
//                 >
//                   #{tag}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Interactions Bar */}
//           <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-4 flex-wrap">
//             <button
//               onClick={() => onLike(post.id)}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-105 group"
//             >
//               <i className="fa-solid fa-thumbs-up group-hover:animate-bounce" />
//               <span className="font-semibold">{post.likes}</span>
//             </button>

//             <button
//               onClick={() => onDislike(post.id)}
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-105 group"
//             >
//               <i className="fa-solid fa-thumbs-down group-hover:animate-bounce" />
//               <span className="font-semibold">{post.dislikes}</span>
//             </button>

//             <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 group">
//               <i className="fa-solid fa-share group-hover:animate-bounce" />
//               <span className="font-semibold">Chia sẻ</span>
//             </button>
//           </div>

//           {/* Comments Section */}
//           <div className="p-6">
//             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <i className="fa-solid fa-comments text-indigo-600" />
//               Bình luận ({post.comments.length})
//             </h3>

//             {/* Comments List */}
//             {post.comments.length === 0 ? (
//               <div className="text-center py-12 bg-gray-50 rounded-xl">
//                 <i className="fa-solid fa-comment-slash text-5xl text-gray-300 mb-3" />
//                 <p className="text-gray-500">Chưa có bình luận nào</p>
//                 <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên bình luận!</p>
//               </div>
//             ) : (
//               <div className="space-y-4 mb-6">
//                 {post.comments.map(comment => (
//                   <div key={comment.id} className="flex gap-3 group">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                       {comment.author.substring(0, 2).toUpperCase()}
//                     </div>
//                     <div className="flex-1">
//                       <div className="bg-gray-100 group-hover:bg-gray-200 rounded-2xl rounded-tl-none p-4 transition-colors duration-300">
//                         <p className="font-semibold text-gray-800 mb-1">{comment.author}</p>
//                         <p className="text-gray-700">{comment.content}</p>
//                       </div>
//                       <div className="flex items-center gap-4 mt-2 ml-2">
//                         <span className="text-xs text-gray-500">{comment.timestamp}</span>
//                         <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors">
//                           <i className="fa-solid fa-thumbs-up mr-1" />
//                           Thích
//                         </button>
//                         <button className="text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors">
//                           <i className="fa-solid fa-reply mr-1" />
//                           Trả lời
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Comment Input */}
//             <form onSubmit={handleSubmit} className="mt-6 space-y-3">
//               <div className="flex gap-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
//                   ND
//                 </div>
//                 <textarea
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   placeholder="Viết bình luận của bạn..."
//                   rows="3"
//                   className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 outline-none transition-all text-gray-800 resize-none"
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={!comment.trim()}
//                   className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:scale-100"
//                 >
//                   <i className="fa-solid fa-paper-plane mr-2" />
//                   Gửi bình luận
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       {/* Image Lightbox Modal */}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
//           onClick={() => setSelectedImage(null)}
//         >
//           <button
//             onClick={() => setSelectedImage(null)}
//             className="absolute top-4 right-4 text-white hover:bg-white/20 p-3 rounded-full transition-all duration-300 hover:rotate-90 z-10"
//           >
//             <i className="fa-solid fa-times text-2xl" />
//           </button>

//           <div
//             className="relative max-w-6xl max-h-[90vh] animate-in zoom-in slide-in-from-bottom-4 duration-500"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <img
//               src={selectedImage}
//               alt="Full size"
//               className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
//             />

//             {/* Image controls */}
//             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
//               <button
//                 onClick={() => setSelectedImage(null)}
//                 className="text-white hover:text-amber-400 transition-colors px-3 py-1"
//                 title="Đóng (ESC)"
//               >
//                 <i className="fa-solid fa-times mr-2" />
//                 Đóng
//               </button>
//               <span className="text-white/40">|</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   const link = document.createElement('a')
//                   link.href = selectedImage
//                   link.download = 'image.jpg'
//                   link.click()
//                 }}
//                 className="text-white hover:text-amber-400 transition-colors px-3 py-1"
//                 title="Tải xuống"
//               >
//                 <i className="fa-solid fa-download mr-2" />
//                 Tải xuống
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
