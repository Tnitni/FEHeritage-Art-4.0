import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Upload, VideoIcon, Loader2 } from "lucide-react";
import forumService from "../../services/forumService";
import { toast } from "react-hot-toast";

export default function EditPostModal({ post, onClose, onSubmit }) {
  const [title, setTitle] = useState(post?.title || "");
  const [categoryId, setCategoryId] = useState(post?.category_id || "");
  const [apiCategories, setApiCategories] = useState([]);
  const [content, setContent] = useState(post?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tags
  const [tags, setTags] = useState(post?.displayTags || []);
  const [currentTag, setCurrentTag] = useState("");

  // Media State
  const [imagesState, setImagesState] = useState(
    post?.displayImages?.map((url, index) => ({
      id: post.images?.[index]?._id || post.images?.[index]?.id || null,
      url: url,
      file: null,
    })) || [],
  );

  const [videosState, setVideosState] = useState(
    post?.displayVideos?.map((url, index) => ({
      id: post.videos?.[index]?._id || post.videos?.[index]?.id || null,
      url: url,
      file: null,
    })) || [],
  );

  // Tải danh mục
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await forumService.getCategories();
        if (res && res.success) {
          setApiCategories(res.data);
          if (!categoryId && res.data.length > 0)
            setCategoryId(res.data[0].category_id);
        }
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      }
    };
    fetchCats();
  }, [categoryId]);

  // Xử lý Media
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);

    if (files.length > validFiles.length)
      toast.error("Mỗi hình ảnh tối đa 5 MB");

    // Kiểm tra dựa trên imagesState
    if (validFiles.length + imagesState.length > 4) {
      toast.error("Tổng cộng tối đa 4 ảnh!");
      const spaceLeft = 4 - imagesState.length;
      if (spaceLeft <= 0) return;

      const newItems = validFiles.slice(0, spaceLeft).map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file: file,
      }));
      setImagesState([...imagesState, ...newItems]);
    } else {
      const newItems = validFiles.map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file: file,
      }));
      setImagesState([...imagesState, ...newItems]);
    }
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 50 * 1024 * 1024);

    if (files.length > validFiles.length) toast.error("Mỗi video tối đa 50 MB");

    if (validFiles.length + videosState.length > 4) {
      toast.error("Tổng cộng tối đa 4 video!");
      const spaceLeft = 4 - videosState.length;
      if (spaceLeft <= 0) return;

      const newItems = validFiles.slice(0, spaceLeft).map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file: file,
      }));
      setVideosState([...videosState, ...newItems]);
    } else {
      const newItems = validFiles.map((file) => ({
        id: null,
        url: URL.createObjectURL(file),
        file: file,
      }));
      setVideosState([...videosState, ...newItems]);
    }
  };

  const addTag = () => {
    if (tags.length >= 5) {
      toast.error("Tối đa 5 thẻ tag");
      return;
    }
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  // --- 3. Submit API ---
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      return toast.error("Vui lòng điền đầy đủ thông tin!");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("category_id", categoryId);

      // Gửi mảng Tag
      tags.forEach((t) => formData.append("tag", t));

      // Gửi Files mới
      imagesState
        .filter((img) => img.file)
        .forEach((img) => formData.append("images", img.file));
      videosState
        .filter((vid) => vid.file)
        .forEach((vid) => formData.append("videos", vid.file));

      // Lọc riêng ID của ảnh cũ được giữ lại
      const imagesToKeep = imagesState
        .filter((img) => img.id) // Chỉ lấy những item đã có ID từ server
        .map((img) => img.id);

      // Lọc riêng ID của video cũ được giữ lại
      const videosToKeep = videosState
        .filter((vid) => vid.id)
        .map((vid) => vid.id);

      /// Gộp tất cả vào một mảng duy nhất
      const keepMediaIds = [...imagesToKeep, ...videosToKeep];

      // Append vào formData với key chung: keepMediaIds
      keepMediaIds.forEach((id) => formData.append("keepMediaIds", id));

      const postId = post.post_id || post.id;
      const response = await forumService.updatePostById(postId, formData);

      if (response && response.success) {
        // const serverData = response.data || response;
        // const updatedData = {
        //   ...post, // giữ các stats cũ
        //   ...serverData.data, // đè nội dung mới từ server
        //   displayImages:
        //     serverData.data.images?.map((img) => img.image_url) || [],
        //   displayVideos:
        //     serverData.data.videos?.map((vid) => vid.video_url) || [],
        //   tags:
        //     serverData.data.tags?.map((t) =>
        //       typeof t === "string" ? t : t.name,
        //     ) || [],
        // };

        // Gọi callback onSubmit của Forum truyền xuống
        onSubmit(response);

        toast.success("Cập nhật bài viết thành công!");
        onClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-amber-600 p-4 sm:p-6 text-white flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">
              Chỉnh sửa bài viết
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/40 rounded-full transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Tiêu đề <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Danh mục <span className="text-red-600">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-orange-400 focus:outline-none bg-white"
              >
                {apiCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nội dung */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Nội dung <span className="text-red-600">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-orange-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Ảnh */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Hình ảnh (Tối đa 4 ảnh, mỗi hình ảnh tối đa 5 MB, để xóa nhấn
                vào ảnh cần xóa)
              </label>
              <label className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-orange-50 transition-all group">
                <Upload className="w-6 h-6 text-amber-600 group-hover:text-orange-600" />
                <span className="text-amber-700 group-hover:text-orange-700">
                  Thêm ảnh mới
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {imagesState.map((img, index) => (
                  <div key={index} className="relative group h-24">
                    <img
                      src={img.url}
                      className="w-full h-full object-cover rounded-lg border-2 border-amber-100"
                    />
                    <button
                      onClick={() =>
                        setImagesState((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-amber-900">
                Video (Tối đa 4 video, mỗi video tối đa 50 MB, để xóa nhấn vào
                video cần xóa)
              </label>
              <label className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-all group">
                <VideoIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                <span className="text-blue-700 group-hover:text-blue-800 font-medium">
                  Thêm video mới
                </span>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {videosState.map((vid, index) => (
                  <div key={index} className="relative group h-24">
                    <video
                      src={vid.url}
                      className="w-full h-full object-cover rounded-lg border-2 border-blue-100 bg-black"
                    />
                    <button
                      onClick={() =>
                        setVideosState((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Thẻ tag (Tối đa 5 tag)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Nhập tag..."
                  disabled={tags.length >= 6}
                  className="flex-1 px-4 py-2 border-2 border-amber-300 rounded-lg focus:border-orange-400 outline-none transition-colors"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-2 border border-amber-200"
                  >
                    <Hash className="w-3 h-3" /> {tag}
                    <button
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                    >
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-amber-200 p-6 flex gap-3 justify-end bg-zinc-50">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-lg font-medium flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
