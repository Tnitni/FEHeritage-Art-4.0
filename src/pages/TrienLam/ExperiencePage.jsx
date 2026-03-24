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
  getPeriods,
  getRegions,
} from "../../services/api";

const REGIONS = ["Bắc", "Trung", "Nam"];
const DEFAULT_PERIODS = ["Lý", "Trần", "Lê", "Nguyễn", "Hiện đại"];

// ─── Trich xuat mang tu bat ky cau truc response nao ─────────────────────────
// Ho tro: { data:[...] }, { data:{ data:[...] } }, { data:{ items:[...] } },
//         { items:[...] }, { result:[...] }, [...] (mang thang), { success, data }
const extractArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data.items)) return res.data.items;
  if (res.data && Array.isArray(res.data.results)) return res.data.results;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.results)) return res.results;
  if (Array.isArray(res.result)) return res.result;
  // Last resort: check every key for an array
  for (const key of Object.keys(res)) {
    if (Array.isArray(res[key]) && res[key].length > 0) return res[key];
  }
  return [];
};

// Lay id va name tu object voi nhieu ten field khac nhau
const extractId = (obj) =>
  obj?.period_id ?? obj?.region_id ?? obj?.id ?? obj?.value ?? obj?.code ?? obj?.key ?? null;

const extractName = (obj) =>
  obj?.name ?? obj?.period_name ?? obj?.region_name ??
  obj?.title ?? obj?.label ?? obj?.display_name ??
  obj?.periodName ?? obj?.regionName ?? null;

const ExperiencePage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [regions, setRegions] = useState(REGIONS);
  const [periodMap, setPeriodMap] = useState({});
  const [regionMap, setRegionMap] = useState({});
  const [metaLoaded, setMetaLoaded] = useState(false);

  const [galleryFilters, setGalleryFilters] = useState({
    periods: new Set(DEFAULT_PERIODS),
    regions: new Set(REGIONS),
    year: 2026,
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [resPeriods, resRegions] = await Promise.all([getPeriods(), getRegions()]);
        if (resPeriods?.success) {
          const periodList = extractArray(resPeriods);
          setPeriods(periodList.map(p => extractName(p)));
          const map = {};
          periodList.forEach(p => {
            const id = extractId(p);
            const name = extractName(p);
            if (id && name) map[id] = name;
          });
          setPeriodMap(map);
        }
        if (resRegions?.success) {
          const regionList = extractArray(resRegions);
          setRegions(regionList.map(r => extractName(r)));
          const map = {};
          regionList.forEach(r => {
            const id = extractId(r);
            const name = extractName(r);
            if (id && name) map[id] = name;
          });
          setRegionMap(map);
        }
      } catch (err) {
        console.error("Lỗi lấy periods/regions:", err);      } finally {
        setMetaLoaded(true);      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resPosts = await getPosts();

        if (resPosts?.success && Array.isArray(resPosts.data)) {
          const visiblePosts = resPosts.data.filter((post) => {
            if (!post || post.status == null) return true;
            return post.status === "published" || post.status === "approved";
          });

          const formatted = visiblePosts.map((post) => ({
            id: post.id,
            src: post.thumbnail_url || post.cloudinary_url || "https://via.placeholder.com/400",
            alt: post.caption || "Bài viết",
            caption: post.caption || "",
            type: post.type || "image",
            year: post.year || new Date(post.created_at).getFullYear(),
            id_period: post.historical_period?.name || periodMap[post.historical_period_id] || "Hiện đại",
            id_periodregion: regionMap[post.region] || post.region || "Bắc",
            authorName: post.author?.display_name || "Người dùng",
            authorAvatar: post.author?.avatar_url || null,
            comments: post.comments || [],
            likeCount: post.like_count || 0,
            isLiked: post.is_liked || false,
          }));

          setGalleryItems(formatted);

          const serverPeriods = [...new Set(formatted.map((i) => i.id_period))];
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
      }
    };

    fetchData();
  }, [metaLoaded]);

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

   const itemYear = parseInt(item.year) || 0;
  const matchesYear = itemYear <= galleryFilters.year;

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