import { AnimatePresence, motion } from "framer-motion";
import { Tag, Hash, X, Loader2 } from "lucide-react";

export default function FeaturedTopics({
  isLoading,
  tags,
  selectedTag,
  onTagClick,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-amber-900">Chủ đề nổi bật</h3>
        </div>
        {selectedTag && (
          <button
            onClick={() => onTagClick(null)}
            className="text-sm text-amber-600 hover:text-amber-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Bỏ lọc
          </button>
        )}
      </div>

      <div className="relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            // TRẠNG THÁI LOADING
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-row items-center justify-center py-4 gap-2"
            >
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-sm text-amber-700 font-medium italic animate-pulse">
                Đang tải chủ đề...
              </p>
            </motion.div>
          ) : tags.length > 0 ? (
            // TRẠNG THÁI CÓ DỮ LIỆU
            <motion.div
              key="tags-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-3 w-full"
            >
              {tags.map(({ tag, count }, index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => onTagClick(tag)}
                  className={`group relative px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? "bg-amber-500 text-zinc-100 shadow-md"
                      : "bg-amber-100/60 text-amber-800 hover:bg-amber-200/50 hover:shadow-md"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {tag}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedTag === tag
                          ? "bg-white/30"
                          : "bg-amber-300/70 text-amber-800"
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            // TRẠNG THÁI TRỐNG
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-amber-600 py-4 w-full"
            >
              Chưa có chủ đề nổi bật
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
