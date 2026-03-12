import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import ImageModal from "../../components/ImageModal";
import {
  createPostComment,
  deleteComment,
  getCommentsByPost,
  getPosts,
} from "../../services/api";
import ExperienceGallery from "./ExperienceGallery";

const DEFAULT_PERIODS = ["Lý", "Trần", "Lê", "Nguyễn", "Hiện đại"];
const REGIONS = ["Bắc", "Trung", "Nam"];

const TrienLam = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [isFilterPanelVisible, setFilterPanelVisible] = useState(false);

  const [galleryFilters, setGalleryFilters] = useState({
    periods: new Set(DEFAULT_PERIODS),
    regions: new Set(REGIONS),
    year: 2026,
  });

  // ─── Fetch posts ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        const res = await getPosts();

        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((post) => ({
            id: post.id,
            src: post.cloudinary_url || "https://via.placeholder.com/400",
            alt: post.caption || "Bài viết",
            caption: post.caption || "",
            type: post.type || "image", // "image" | "video"
            year: post.year || new Date(post.created_at).getFullYear(),
            period: post.historical_period?.name || "Hiện đại",
            region: post.region || "Bắc",
            authorName: post.author?.display_name || "Người dùng",
            authorAvatar: post.author?.avatar_url || null,
            comments: post.comments || [],
            likeCount: post.like_count || 0,
          }));

          setGalleryItems(formatted);

          // Merge periods từ server vào danh sách mặc định
          const serverPeriods = [...new Set(formatted.map((i) => i.period))];
          const mergedPeriods = [
            ...new Set([...DEFAULT_PERIODS, ...serverPeriods]),
          ];
          setPeriods(mergedPeriods);
          setGalleryFilters((prev) => ({
            ...prev,
            periods: new Set(mergedPeriods),
          }));
        }
      } catch (err) {
        console.error("Lỗi tải triển lãm:", err);
      } finally {
        setLoading(false);
        AOS.init({ duration: 800, once: true });
      }
    };

    loadGalleryData();
  }, []);

  // ─── Load comments cho một post (lazy) ─────────────────────────────────────
  const handleLoadComments = async (postId) => {
    try {
      const res = await getCommentsByPost(postId);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, comments: res.data } : item,
          ),
        );
      }
    } catch (err) {
      console.error("Lỗi tải comments:", err);
    }
  };

  // ─── Thêm comment ──────────────────────────────────────────────────────────
  const handleCommentSubmit = async (postId, data) => {
    try {
      const res = await createPostComment(postId, data);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? { ...item, comments: [res.data, ...item.comments] }
              : item,
          ),
        );
        return true;
      }
    } catch (err) {
      console.error("Lỗi gửi comment:", err);
    }
    return false;
  };

  // ─── Xóa comment ───────────────────────────────────────────────────────────
  const handleCommentDelete = async (commentId, postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? {
                  ...item,
                  comments: item.comments.filter((c) => c.id !== commentId),
                }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Lỗi xóa comment:", err);
    }
  };

  // ─── Toggle filter (period / region) ───────────────────────────────────────
  const handleFilterChange = (setter, type, value) => {
    setter((prev) => {
      const next = new Set(prev[type]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [type]: next };
    });
  };

  // ─── Đổi năm filter ────────────────────────────────────────────────────────
  const handleYearChange = (setter, e) => {
    setter((prev) => ({
      ...prev,
      year: parseInt(e.target.value) || 2026,
    }));
  };

  // ─── Filtered items ─────────────────────────────────────────────────────────
  const filteredItems = galleryItems.filter(
    (item) =>
      galleryFilters.periods.has(item.period) &&
      galleryFilters.regions.has(item.region) &&
      item.year <= galleryFilters.year,
  );

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdfaf3]">
        <p className="text-lg font-serif text-amber-800 animate-pulse">
          Đang tải triển lãm...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#fdfaf3] min-h-screen p-8">
      <ExperienceGallery
        periods={periods}
        regions={REGIONS}
        galleryFilters={galleryFilters}
        setGalleryFilters={setGalleryFilters}
        filteredGalleryItems={filteredItems}
        openModal={(index) => setSelectedImageIndex(index)}
        handleLoadComments={handleLoadComments}
        handleCommentSubmit={handleCommentSubmit}
        handleCommentDelete={handleCommentDelete}
        handleFilterChange={handleFilterChange}
        handleYearChange={handleYearChange}
        isFilterPanelVisible={isFilterPanelVisible}
        setFilterPanelVisible={setFilterPanelVisible}
      />

      {selectedImageIndex !== null && filteredItems[selectedImageIndex] && (
        <ImageModal
          imageData={filteredItems[selectedImageIndex]}
          onClose={() => setSelectedImageIndex(null)}
          onPrev={() =>
            setSelectedImageIndex((prev) =>
              prev === 0 ? filteredItems.length - 1 : prev - 1,
            )
          }
          onNext={() =>
            setSelectedImageIndex((prev) =>
              prev === filteredItems.length - 1 ? 0 : prev + 1,
            )
          }
          onCommentSubmit={(data) =>
            handleCommentSubmit(filteredItems[selectedImageIndex].id, data)
          }
          onCommentDelete={(commentId) =>
            handleCommentDelete(commentId, filteredItems[selectedImageIndex].id)
          }
          onLoadComments={() =>
            handleLoadComments(filteredItems[selectedImageIndex].id)
          }
        />
      )}
    </div>
  );
};

export default TrienLam;
