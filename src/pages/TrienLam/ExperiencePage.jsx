import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ExperienceGallery from "./ExperienceGallery";
import {
  getPosts,
  getCommentsByPost,
  createPostComment,
  deleteComment,
} from "../../services/api";

const REGIONS = ["Bắc", "Trung", "Nam"];
const DEFAULT_PERIODS = ["Lý", "Trần", "Lê", "Nguyễn", "Hiện đại"];

const ExperiencePage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);

  const [galleryFilters, setGalleryFilters] = useState({
    periods: new Set(DEFAULT_PERIODS),
    regions: new Set(REGIONS),
    year: 2026,
  });

  // ─── Fetch posts ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resPosts = await getPosts();

        if (resPosts?.success && Array.isArray(resPosts.data)) {
         
          const formatted = resPosts.data.map((post) => ({
            id: post.id,
            src: post.cloudinary_url || "https://via.placeholder.com/400",
            alt: post.caption || "Bài viết",
            caption: post.caption || "",
            type: post.type || "image",                        // "image" | "video"
            year: post.year || new Date(post.created_at).getFullYear(),
            period: post.historical_period?.name || "Hiện đại",
            region: post.region || "Bắc",
            authorName: post.author?.display_name || "Người dùng",
            authorAvatar: post.author?.avatar_url || null,
            comments: post.comments || [],
            likeCount: post.like_count || 0,
          }));

          setGalleryItems(formatted);

          // Cập nhật danh sách periods từ dữ liệu thực
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
        console.error("Lỗi lấy dữ liệu bài viết:", err);
      } finally {
        setLoading(false);
        AOS.init({ duration: 800, once: true });
      }
    };

    fetchData();
  }, []);

  // Load comments cho một post 
  const handleLoadComments = async (postId) => {
    try {
      const res = await getCommentsByPost(postId);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? { ...item, comments: res.data }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Lỗi tải comments:", err);
    }
  };

  //  Thêm comment 
 
  const handleCommentSubmit = async (postId, data) => {
    try {
      const res = await createPostComment(postId, data);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? { ...item, comments: [res.data, ...item.comments] }
              : item
          )
        );
        return true;
      }
    } catch (err) {
      console.error("Lỗi gửi comment:", err);
    }
    return false;
  };

  //Xóa comment 
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
              : item
          )
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
  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesPeriod = galleryFilters.periods.has(item.period);
    const matchesRegion = galleryFilters.regions.has(item.region);
    const matchesYear = item.year <= galleryFilters.year;
    return matchesTab && matchesPeriod && matchesRegion && matchesYear;
  });

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-serif text-amber-800 animate-pulse">
          Đang tải di sản văn hóa...
        </p>
      </div>
    );
  }

  return (
    <ExperienceGallery
      periods={periods}
      regions={REGIONS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      galleryFilters={galleryFilters}
      setGalleryFilters={setGalleryFilters}
      filteredGalleryItems={filteredGalleryItems}
      handleLoadComments={handleLoadComments}
      handleCommentSubmit={handleCommentSubmit}
      handleCommentDelete={handleCommentDelete}
      handleFilterChange={handleFilterChange}
      handleYearChange={handleYearChange}
    />
  );
};

export default ExperiencePage;