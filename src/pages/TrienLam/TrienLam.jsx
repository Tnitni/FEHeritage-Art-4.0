import { useState, useEffect, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ExperienceGallery from "./ExperienceGallery";
import ImageModal from "../../components/ImageModal";
import {
  getPosts,
  getCommentsByPost,
  createPostComment,
  deleteComment,
  likeComment,
  unlikeComment,
  
} from "../../services/api";

const DEFAULT_PERIODS = ["Lý", "Trần", "Lê", "Nguyễn", "Hiện đại"];
const REGIONS = ["Bắc", "Trung", "Nam"];

const TrienLam = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [activeTab, setActiveTab] = useState("all");
  const [galleryFilters, setGalleryFilters] = useState({
    periods: new Set(DEFAULT_PERIODS),
    regions: new Set(REGIONS),
    year: 2026,
  });

  // 1. Chỉ khởi tạo AOS một lần duy nhất
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // 2. Fetch data bài viết
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        const res = await getPosts();
        if (res?.success && Array.isArray(res.data)) {
          const formatted = res.data.map((post) => ({
            id: post.id,
            src: post.cloudinary_url || "/assets/fallback-image.jpg",
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
          const mergedPeriods = [...new Set([...DEFAULT_PERIODS, ...serverPeriods])];
          setPeriods(mergedPeriods);
          setGalleryFilters(prev => ({ ...prev, periods: new Set(mergedPeriods) }));
        }
      } catch (err) {
        console.error("Lỗi tải triển lãm:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGalleryData();
  }, []);

  // 3. Sử dụng useCallback cho các hàm truyền xuống Modal để tránh vòng lặp request
  const handleLoadComments = useCallback(async (postId) => {
    if (!postId) return;
  
    try {
      const res = await getCommentsByPost(postId);
  
      if (res?.success) {
        const formattedComments = res.data.map((comment) => ({
          ...comment,
          likeCount: comment.like_count || 0, // convert đúng field
          isLiked: false, // backend không trả
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
  }, []);
  const handleCommentSubmit = useCallback(async (postId, data) => {
    try {
      const res = await createPostComment(postId, data);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, comments: [res.data, ...item.comments] } : item
          )
        );
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  }, []);

  const handleCommentDelete = useCallback(async (commentId, postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      const res = await deleteComment(commentId);
      if (res?.success) {
        setGalleryItems((prev) =>
          prev.map((item) =>
            item.id === postId 
              ? { ...item, comments: item.comments.filter((c) => c.id !== commentId) }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Thêm handleReplyComment
  const handleReplyComment = async (postId, parentCommentId, content) => {
    try {
      const res = await createPostComment(postId, {
        content,
        parent_comment_id: parentCommentId,
      });
  
      const newReply = res.data;
  
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                comments: item.comments.map((comment) =>
                  comment.id === parentCommentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), newReply],
                      }
                    : comment
                ),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Lỗi reply:", err);
    }
  };
  // ─── Like/Unlike Comment ───────────────────────────────────────────────────
  const handleLikeComment = async (commentId, postId) => {
    try {
      await likeComment(commentId);
  
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                comments: item.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: true,
                        likeCount: (comment.likeCount || 0) + 1,
                      }
                    : comment
                ),
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  const handleUnlikeComment = async (commentId, postId) => {
    try {
      await unlikeComment(commentId);
  
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? {
                ...item,
                comments: item.comments.map((comment) =>
                  comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: false,
                        likeCount: Math.max((comment.likeCount || 1) - 1, 0),
                      }
                    : comment
                ),
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }
  };
  
  // 4. Logic lọc Gallery
  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesPeriod = galleryFilters.periods.has(item.period);
    const matchesRegion = galleryFilters.regions.has(item.region);
    return matchesTab && matchesPeriod && matchesRegion && (item.year <= galleryFilters.year);
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;

  // For clarity with variable name, use filteredItems as in your sample
  const filteredItems = filteredGalleryItems;

  return (
    <div className="bg-[#fdfaf3] min-h-screen">
      <ExperienceGallery
        periods={periods}
        regions={REGIONS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        galleryFilters={galleryFilters}
        setGalleryFilters={setGalleryFilters}
        filteredGalleryItems={filteredItems}
        openModal={setSelectedImageIndex}
      />

      {selectedImageIndex !== null && filteredItems[selectedImageIndex] && (
        <ImageModal
          imageData={filteredItems[selectedImageIndex]}
          currentIndex={selectedImageIndex}
          totalImages={filteredItems.length}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() =>
            setSelectedImageIndex(i =>
              i === filteredItems.length - 1 ? 0 : i + 1
            )
          }
          onPrev={() =>
            setSelectedImageIndex(i =>
              i === 0 ? filteredItems.length - 1 : i - 1
            )
          }
          onLoadComments={() => handleLoadComments(filteredItems[selectedImageIndex].id)}
          onCommentSubmit={(data) => handleCommentSubmit(filteredItems[selectedImageIndex].id, data)}
          onCommentDelete={(cId) => handleCommentDelete(cId, filteredItems[selectedImageIndex].id)}
          onLikeComment={handleLikeComment}
          onUnlikeComment={handleUnlikeComment}
          onImageSelect={setSelectedImageIndex}
          relatedImages={filteredItems}
          onReplyComment={handleReplyComment}
        />
      )}
    </div>
  );
};

export default TrienLam;