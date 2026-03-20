import AOS from "aos";
import "aos/dist/aos.css";
import { useCallback, useEffect, useState } from "react";
import ImageModal from "../../components/ImageModal";
import {
  createPostComment,
  deleteComment,
  getCommentsByPost,
  getPosts,
  likeComment,
  unlikeComment,
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
        const all = res.data;
        const rootComments = all
          .filter(c => c.parent_comment_id === null)
          .map(root => ({
            ...root,
            likeCount: root.like_count || 0,
            // Ép buộc tìm reply nếu mảng replies của server bị rỗng
            replies: all.filter(child => child.parent_comment_id === root.id)
          }));

        setGalleryItems(prev => prev.map(item => 
          item.id === postId ? { ...item, comments: rootComments } : item
        ));
      }
    } catch (err) { console.error(err); }
  }, []);
  const handleCommentSubmit = useCallback(async (postId, data) => {
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
              ? {
                  ...item,
                  comments: item.comments.filter((c) => c.id !== commentId),
                }
              : item,
          ),
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
  
      if (res?.success) {
        // Gọi lại hàm load phía trên để đồng bộ dữ liệu mới nhất từ server
        await handleLoadComments(postId);
        return res; // Trả về res để Modal biết đã gửi xong và xóa text trong ô nhập
      }
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
    }
  };
  // ─── Like/Unlike Comment ───────────────────────────────────────────────────
  const handleLikeComment = async (commentId, postId) => {
    try {
      await likeComment(commentId);
  
      setGalleryItems((prevItems) => {
        return prevItems.map((item) => {
          // Nếu không đúng Post, bỏ qua để tối ưu hiệu năng
          if (item.id !== postId) return item;
  
          const updatedComments = item.comments.map((comment) => {
            // 1. Kiểm tra Like cho Comment cha
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: true,
                // Đảm bảo cập nhật cả 2 kiểu đặt tên nếu bạn chưa chắc chắn
                likeCount: (comment.likeCount || 0) + 1,
                like_count: (comment.like_count || 0) + 1, 
              };
            }
  
            // 2. Kiểm tra Like cho Replies
            if (comment.replies && comment.replies.length > 0) {
              const updatedReplies = comment.replies.map((reply) => {
                if (reply.id === commentId) {
                  return {
                    ...reply,
                    isLiked: true,
                    likeCount: (reply.likeCount || 0) + 1,
                    like_count: (reply.like_count || 0) + 1,
                  };
                }
                return reply;
              });
  
              return { ...comment, replies: updatedReplies };
            }
  
            return comment;
          });
  
          return { ...item, comments: updatedComments };
        });
      });
    } catch (err) {
      console.error("Lỗi cập nhật Like:", err);
    }
  };
  const handleUnlikeComment = async (commentId, postId) => {
    try {
      await unlikeComment(commentId);

      setGalleryItems((prev) =>
        prev.map((item) => {
          // Chỉ xử lý nếu đúng bài viết (Post) chứa bình luận đó
          if (item.id !== postId) return item;
  
          return {
            ...item,
            comments: item.comments.map((comment) => {
              // Trường hợp 1: Unlike bình luận cha
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: false,
                  // Trừ đi 1 và đảm bảo không nhỏ hơn 0
                  likeCount: Math.max((comment.likeCount || 0) - 1, 0),
                  like_count: Math.max((comment.like_count || 0) - 1, 0),
                };
              }
  
              // Trường hợp 2: Tìm và Unlike trong các phản hồi (replies)
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          isLiked: false,
                          likeCount: Math.max((reply.likeCount || 0) - 1, 0),
                          like_count: Math.max((reply.like_count || 0) - 1, 0),
                        }
                      : reply
                  ),
                };
              }
  
              return comment;
            }),
          };
        })
      );
    } catch (err) {
      console.error("Lỗi khi bỏ thích:", err);
    }
  };
  // 4. Logic lọc Gallery
  const filteredGalleryItems = galleryItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesPeriod = galleryFilters.periods.has(item.period);
    const matchesRegion = galleryFilters.regions.has(item.region);
    return (
      matchesTab &&
      matchesPeriod &&
      matchesRegion &&
      item.year <= galleryFilters.year
    );
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );

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
        isFilterPanelVisible={isFilterPanelVisible}
        setFilterPanelVisible={setFilterPanelVisible}
      />

      {selectedImageIndex !== null && filteredItems[selectedImageIndex] && (
        <ImageModal
          imageData={filteredItems[selectedImageIndex]}
          currentIndex={selectedImageIndex}
          totalImages={filteredItems.length}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() =>
            setSelectedImageIndex((i) =>
              i === filteredItems.length - 1 ? 0 : i + 1,
            )
          }
          onPrev={() =>
            setSelectedImageIndex((i) =>
              i === 0 ? filteredItems.length - 1 : i - 1,
            )
          }
          onLoadComments={() =>
            handleLoadComments(filteredItems[selectedImageIndex].id)
          }
          onCommentSubmit={(data) =>
            handleCommentSubmit(filteredItems[selectedImageIndex].id, data)
          }
          onCommentDelete={(cId) =>
            handleCommentDelete(cId, filteredItems[selectedImageIndex].id)
          }
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
