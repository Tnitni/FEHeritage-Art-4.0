import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  FileText,
  Award,
  MessageCircle,
  Mail,
  User,
} from "lucide-react";
// import { format } from "date-fns";
// import { vi } from "date-fns/locale";

export default function UserProfileModal({
  user,
  posts,
  totalPosts,
  onClose,
  onSendMessage,
  onPostClick,
}) {
  // const joinedDate = format(new Date(user.joinedDate), "dd MMMM yyyy", {
  //   locale: vi,
  // });
  if (!user) return null;

  let joinedDate = "Đang cập nhật...";
  if (!user.isLoading && (user.joinedDate || user.create_at)) {
    try {
      const dateObj = new Date(user.joinedDate || user.create_at);

      if (!isNaN(dateObj.getTime())) {
        joinedDate = new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(dateObj);
      }
    } catch (e) {
      console.error("Lỗi format ngày:", e);
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {user.isLoading ? (
            /* --- GIAO DIỆN LOADING --- */
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-100 border-t-orange-500 rounded-full animate-spin" />
                <User className="absolute inset-0 m-auto w-6 h-6 text-amber-200" />
              </div>
              <p className="text-amber-700 font-medium animate-pulse">
                Đang tải hồ sơ...
              </p>
            </div>
          ) : (
            /* --- GIAO DIỆN CHÍNH --- */
            <>
              {/* Header with Cover */}
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-orange-300 via-amber-500 to-orange-400" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/40 hover:bg-white/30 rounded-full transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Avatar */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500/20 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-20 px-6 pb-6">
                {/* User Info */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-amber-900 mb-2">
                    {user.name}
                  </h2>
                  <p className="text-amber-700 max-w-md mx-auto">{user.bio}</p>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-3 gap-4 mb-6"
                >
                  {/* Cột 1: Thành tích */}
                  <motion.div
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center cursor-default shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Mail className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-amber-900 mb-1">
                      Email
                    </div>
                    <div className="text-sm text-amber-700">{user.email}</div>
                  </motion.div>

                  {/* Cột 2: Tham gia */}
                  <motion.div
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center cursor-default shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-amber-900 mb-1">
                      Tham gia
                    </div>
                    <div className="text-sm text-amber-700">{joinedDate}</div>
                  </motion.div>

                  {/* Cột 3: Bài viết */}
                  <motion.div
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center cursor-default shadow-sm hover:shadow-md transition-shadow"
                  >
                    <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-amber-900">
                      {totalPosts}
                    </div>
                    <div className="text-sm text-amber-700">Bài viết</div>
                  </motion.div>
                </motion.div>

                {/* Achievements */}
                {/* <div className="mb-6">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                Thành tích
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 4px 10px rgba(251, 146, 60, 0.2)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-200/70 to-amber-200/80 text-orange-700 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Award className="w-4 h-4" />
                    {achievement}
                  </motion.div>
                ))}
              </div>
            </div> */}

                {/* Recent Posts */}
                <div className="mb-6">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Bài viết gần đây
                  </h3>
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id || post.post_id}
                        className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                        onClick={() => onPostClick(post.id || post.post_id)}
                      >
                        <h4 className="font-semibold text-amber-900 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-amber-700 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <p className="text-center text-amber-600 py-4">
                        Chưa có bài viết nào
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {/* <div className="flex justify-center pb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSendMessage}
                className="px-8 py-3 bg-amber-500 text-zinc-100 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg font-medium flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Gửi tin nhắn
              </motion.button>
            </div> */}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// export default function UserProfileModal({ user, onClose }) {
//   return (
//     <div
//       className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
//       onClick={onClose}
//     >
//       <div
//         className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500 overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header with gradient background */}
//         <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-8 text-white">
//           {/* Close button */}
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:rotate-90"
//           >
//             <i className="fa-solid fa-times text-xl" />
//           </button>

//           {/* Profile Avatar */}
//           <div className="flex flex-col items-center">
//             <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-4xl shadow-2xl mb-4 ring-4 ring-white/30">
//               {user.avatar}
//             </div>
//             <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
//             <p className="text-purple-100 flex items-center gap-2">
//               <i className="fa-solid fa-briefcase text-sm" />
//               {user.role}
//             </p>
//           </div>

//           {/* Decorative circles */}
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
//           <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-purple-50 to-white">
//           <div className="bg-white rounded-xl p-4 text-center shadow-md border border-purple-100">
//             <div className="text-3xl font-bold text-purple-600 mb-1">{user.posts}</div>
//             <div className="text-sm text-gray-600 font-medium">Bài viết</div>
//           </div>
//           <div className="bg-white rounded-xl p-4 text-center shadow-md border border-purple-100">
//             <div className="text-3xl font-bold text-purple-600 mb-1">
//               <i className="fa-solid fa-clock text-2xl" />
//             </div>
//             <div className="text-sm text-gray-600 font-medium">{user.joined}</div>
//           </div>
//         </div>

//         {/* Bio */}
//         <div className="p-6">
//           <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
//             <i className="fa-solid fa-user text-purple-600" />
//             Giới thiệu
//           </h3>
//           <p className="text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
//             {user.bio}
//           </p>
//         </div>

//         {/* Badges */}
//         <div className="px-6 pb-6">
//           <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
//             <i className="fa-solid fa-award text-purple-600" />
//             Thành tích
//           </h3>
//           <div className="flex flex-wrap gap-2">
//             <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
//               <i className="fa-solid fa-star" />
//               Thành viên tích cực
//             </span>
//             <span className="px-3 py-1.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
//               <i className="fa-solid fa-fire" />
//               Người đóng góp
//             </span>
//             <span className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
//               <i className="fa-solid fa-heart" />
//               Người hỗ trợ
//             </span>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="p-6 bg-gray-50 border-t border-gray-200">
//           <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
//             <i className="fa-solid fa-envelope" />
//             Gửi tin nhắn
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }
