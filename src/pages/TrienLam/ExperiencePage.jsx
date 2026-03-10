import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ExperienceGallery from "./ExperienceGallery";
import {
  getPosts,
  getCommentsByPost,
  createPostComment,
  deleteComment,
  toggleLikePost,
  toggleLikeComment,
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
            type: post.type || "image",
            year: post.year || new Date(post.created_at).getFullYear(),
            period: post.historical_period?.name || "Hiện đại",
            region: post.region || "Bắc",
            authorName: post.author?.display_name || "Người dùng",
            authorAvatar: post.author?.avatar_url || null,
            comments: post.comments || [],
            likeCount: post.like_count || 0,
            isLiked: post.is_liked || false,
          }));

          setGalleryItems(formatted);

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

  const handleLoadComments = async (postId) => {
    try {
      const res = await getCommentsByPost(postId);
  
      if (res?.success) {
        const formattedComments = res.data.map((comment) => ({
          ...comment,
          likeCount: comment.like_count || 0, // convert đúng field
          isLiked: false, // vì backend không trả
        }));
  
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId
              ? { ...item, comments: formattedComments }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Lỗi tải comments:", err);
    }
  };

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

  // Toggle like for Post
  const handleToggleLikePost = async (postId) => {
    try {
      await toggleLikePost(postId);

      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                isLiked: !item.isLiked,
                likeCount: item.isLiked
                  ? Math.max(0, (item.likeCount || 0) - 1)
                  : (item.likeCount || 0) + 1,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Lỗi toggle like post:", err);
    }
  };

  // Toggle like for Comment
  const handleToggleLikeComment = async (commentId, postId) => {
    try {
      await toggleLikeComment(commentId);
  
      // Sau khi toggle xong → reload lại từ server
      await handleLoadComments(postId);
  
    } catch (err) {
      console.error("Lỗi toggle like comment:", err);
    }
  };

  const handleFilterChange = (setter, type, value) => {
    setter((prev) => {
      const next = new Set(prev[type]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [type]: next };
    });
  };

  const handleYearChange = (setter, e) => {
    setter((prev) => ({
      ...prev,
      year: parseInt(e.target.value) || 2026,
    }));
  };

  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesPeriod = galleryFilters.periods.has(item.period);
    const matchesRegion = galleryFilters.regions.has(item.region);
    const matchesYear = item.year <= galleryFilters.year;
    return matchesTab && matchesPeriod && matchesRegion && matchesYear;
  });

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
      handleToggleLikePost={handleToggleLikePost}
      handleToggleLikeComment={handleToggleLikeComment}
      handleFilterChange={handleFilterChange}
      handleYearChange={handleYearChange}
    />
  );
};

export default ExperiencePage;