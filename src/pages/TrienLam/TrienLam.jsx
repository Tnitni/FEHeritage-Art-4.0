import AOS from "aos";
import "aos/dist/aos.css";
import { useCallback, useEffect, useState } from "react";
import CKEditorField from "../../components/common/CKEditorField";
import ImageModal from "../../components/ImageModal";
import {
  createPostComment,
  createPost,
  deleteComment,
  getCommentsByPost,
  getPeriods,
  getPosts,
  getRegions,
  likeComment,
  unlikeComment,
} from "../../services/api";
import ExperienceGallery from "./ExperienceGallery";

const REGIONS = ["Miền Bắc", "Miền Trung", "Miền Nam"];
const DEFAULT_PERIODS = ["Triều đại Lý", "Triều đại Trần", "Triều đại Lê", "Triều đại Nguyễn", "Thời kỳ Pháp thuộc"];

const TrienLam = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  // periods/regions stored as {id, name} objects (fallback to string for DEFAULT_PERIODS)
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [regions, setRegions] = useState(REGIONS);
  // separate ID maps for form submission
  const [periodMap, setPeriodMap] = useState({}); // name -> id
  const [regionMap, setRegionMap] = useState({}); // name -> id

  const [isFilterPanelVisible, setFilterPanelVisible] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [galleryFilters, setGalleryFilters] = useState({
    periods: new Set(DEFAULT_PERIODS),
    regions: new Set(REGIONS),
    year: 2026,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // --- UI mới: State cho Góc Nhìn ---
  const [createForm, setCreateForm] = useState({
    title: "",
    summary: "",
    content: "",
    thumbnail: null,
    region: "Miền Bắc",
    rregion_id: "2389ce8d-bbad-468a-ad65-fc715ab911d5",
    period: "Triều đại Lý",
    period_id: "b6e4bd0d-7be0-45e2-a494-b8c3a1c3a270",
    year: 2026,
    type: "image",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Upload ảnh đại diện
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCreateForm({ ...createForm, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setCreateForm({ ...createForm, thumbnail: null });
    setThumbnailPreview(null);
  };

  const resetForm = () => {
    setCreateForm({
      title: "",
      summary: "",
      content: "",
      thumbnail: null,
      region: regions[0]?.name || regions[0] || "Bắc",
      region_id: regions[0]?.id || "",
      period: periods[0]?.name || periods[0] || "Hiện đại",
      period_id: periods[0]?.id || "",
      year: 2026,
      type: "image",
    });
    setThumbnailPreview(null);
    setIsCreateOpen(false);
  };

  // 1. Chỉ khởi tạo AOS một lần duy nhất
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // 1.5. Lấy danh sách Periods/Regions để hiển thị dropdown & lọc
  useEffect(() => {
    const loadPeriodsRegions = async () => {
      try {
        const [periodRes, regionRes] = await Promise.all([
          getPeriods(),
          getRegions(),
        ]);

        // Support multiple response shapes
        const toArr = (res) =>
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.data?.data) ? res.data.data :
          Array.isArray(res) ? res : [];

        const pArr = toArr(periodRes);
        const rArr = toArr(regionRes);

        const periodNames = pArr
          .map((p) => p?.name ?? p?.period_name ?? p?.title ?? p?.label)
          .filter(Boolean);

        const regionNames = rArr
          .map((r) => r?.name ?? r?.region_name ?? r?.title ?? r?.label)
          .filter(Boolean);

        // Build id maps: name -> id (UUID)
        const newPeriodMap = {};
        pArr.forEach((p) => {
          const name = p?.name ?? p?.period_name ?? p?.title ?? p?.label;
          const id = p?.period_id ?? p?.id ?? p?.value;
          if (name && id != null) newPeriodMap[name] = id;
        });
        const newRegionMap = {};
        rArr.forEach((r) => {
          const name = r?.name ?? r?.region_name ?? r?.title ?? r?.label;
          const id = r?.region_id ?? r?.id ?? r?.value;
          if (name && id != null) newRegionMap[name] = id;
        });
        setPeriodMap(newPeriodMap);
        setRegionMap(newRegionMap);

        if (periodNames.length) {
          setPeriods(periodNames);
          setGalleryFilters((prev) => ({
            ...prev,
            periods: new Set(periodNames),
          }));
          const defaultPeriod = periodNames.includes(createForm.period)
            ? createForm.period
            : periodNames[0];
          setCreateForm((prev) => ({
            ...prev,
            period: defaultPeriod,
            period_id: newPeriodMap[defaultPeriod] || "",
          }));
        }

        if (regionNames.length) {
          setRegions(regionNames);
          setGalleryFilters((prev) => ({
            ...prev,
            regions: new Set(regionNames),
          }));
          const defaultRegion = regionNames.includes(createForm.region)
            ? createForm.region
            : regionNames[0];
          setCreateForm((prev) => ({
            ...prev,
            region: defaultRegion,
            region_id: newRegionMap[defaultRegion] || "",
          }));
        }
      
      } catch (err) {
        // Fallback: dùng danh sách hardcode khi backend chưa trả meta
        console.error("Lỗi tải periods/regions:", err);
        
      }
    };

    loadPeriodsRegions();
  }, []);

 const loadGalleryData = useCallback(async () => {
  try {
    setLoading(true);
    const res = await getPosts();
    
    if (res?.success && Array.isArray(res.data)) {
      const formatted = res.data
        // CHỈ lấy những bài đã được duyệt (approved)
        .filter(post => post.status === "approved") 
        .map((post) => {
          // Tìm tên Period từ Map dựa trên period_id của post
          const periodName = Object.keys(periodMap).find(
            key => periodMap[key] === post.period_id
          ) || "Khác";

          // Tìm tên Region từ Map dựa trên region_id của post
          const regionName = Object.keys(regionMap).find(
            key => regionMap[key] === post.region_id
          ) || "Khác";

          return {
            id: post.id,
            // Tối ưu ảnh Cloudinary ngay tại đây: thêm w_800,q_auto
            src: post.cloudinary_url?.replace("/upload/", "/upload/w_800,f_auto,q_auto/") || "/assets/fallback.jpg",
            caption: post.caption || "Không có tiêu đề",
            type: post.type || "image",
            year: post.year || new Date(post.created_at).getFullYear(),
            period: periodName, 
            region: regionName,
            authorName: post.author?.display_name || "Người dùng",
            authorAvatar: post.author?.avatar_url || "",
            // Các dữ liệu khác
            likeCount: post.like_count || 0,
            isLiked: post.is_liked || false,
            comments: post.comments || []
          };
        });
        
      setGalleryItems(formatted);
    }
  } catch (err) {
    console.error("Lỗi mapping dữ liệu:", err);
  } finally {
    setLoading(false);
  }
}, [periodMap, regionMap]); // Thêm dependency để mapping chính xác khi metadata tải xong

  // 2. Fetch data bài viết
  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

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
  // 1. Sửa mediaType thành type cho khớp với dữ liệu đã map
  const matchesTab = activeTab === "all" || item.type === activeTab;

  // 2. Kiểm tra Thời kỳ (Set.has so sánh chính xác từng chữ)
  const matchesPeriod = galleryFilters.periods.has(item.period);

  // 3. Kiểm tra Vùng miền
  const matchesRegion = galleryFilters.regions.has(item.region);

  // 4. Kiểm tra Năm
  const itemYear = parseInt(item.year) || 0;
  const matchesYear = itemYear <= galleryFilters.year;

  // Chỉ khi thoả mãn TẤT CẢ các điều kiện trên thì mới hiện
  return matchesTab && matchesPeriod && matchesRegion && matchesYear;
});
console.log("Dữ liệu bài viết đầu tiên:", {
    caption: galleryItems[0]?.caption,
    period: galleryItems[0]?.period, // Kỳ vọng là "Triều đại Lý" chứ không phải ID UUID
    region: galleryItems[0]?.region  // Kỳ vọng là "Miền Bắc" chứ không phải ID UUID
  });
  console.log("Bộ lọc hiện tại (Periods):", Array.from(galleryFilters.periods));
  console.log("Bộ lọc hiện tại (Regions):", Array.from(galleryFilters.regions));

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );

  const filteredItems = filteredGalleryItems;

  return (
    <div className="bg-[#fdfaf3] min-h-screen">

      {/* Nút bấm mở Modal */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl bg-white/90 border border-amber-100 shadow p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#2e1e10]">
              Bạn muốn đóng góp triển lãm?
            </p>
            <p className="text-xs text-stone-600">
              Bài viết sẽ được duyệt bởi quản trị viên trước khi hiển thị.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
          >
            + Thêm bài viết 
          </button>
        </div>
      </div>

     
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm transition animate-fadein-fast">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border border-emerald-200">
            {/* Header modal */}
            <div className="flex justify-between items-center p-6 border-b border-emerald-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-extrabold bg-gradient-to-tr from-sky-600 to-emerald-400 bg-clip-text text-transparent select-none">
                Gửi tác phẩm Triển lãm
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-red-500 transition p-2 rounded-full"
              >
                <span className="sr-only">Đóng</span>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body modal: Form nhập liệu */}
            <form
              className="p-6 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                
                // Chỉ kiểm tra tiêu đề và ảnh
                if (!createForm.title || !createForm.thumbnail) {
                  alert("Vui lòng nhập mô tả ngắn và chọn ảnh!");
                  return;
                }
              
                setCreateSubmitting(true);
                try {
                  const formData = new FormData();
                  
                  // API fields (per Postman): caption, type, period_id (UUID), region_id (UUID), image
                  formData.append("caption", createForm.title);
                  formData.append("type", createForm.type || "image");
                  formData.append("image", createForm.thumbnail);
                  formData.append("year", String(createForm.year));

                  // Send IDs (UUID) — required by server
                  const pid = createForm.period_id || periodMap[createForm.period] || "";
                  const rid = createForm.region_id || regionMap[createForm.region] || "";
                  if (pid) formData.append("period_id", pid);
                  if (rid) formData.append("region_id", rid);
              
                  const res = await createPost(formData);
              
                  // Dựa vào log: Backend trả về { success: true, ... }
                  if (res?.success) {
                    alert("Gửi bài thành công! Vui lòng chờ admin duyệt.");
                    resetForm();
                    if (loadGalleryData) await loadGalleryData();
                  }
                } catch (err) {
                  console.error("Lỗi gửi bài:", err);
                  alert("Có lỗi xảy ra, hãy kiểm tra lại kết nối.");
                } finally {
                  setCreateSubmitting(false);
                }
              }}
            >
              {/* Tiêu đề */}
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition"
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Mô tả ngắn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.summary}
                  onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition"
                  placeholder="Tóm tắt nội dung"
                />
              </div>

              {/* CKEditor - Nội dung chi tiết */}
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Nội dung chi tiết
                </label>
                <CKEditorField
                  value={createForm.content}
                  onChange={(val) => setCreateForm({ ...createForm, content: val })}
                />
              </div>

              {/* Thuộc tính Triển lãm: Thời kỳ / Vùng / Năm */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Vùng
                  </label>
                  <select
                    value={createForm.region}
                    onChange={(e) => setCreateForm({ ...createForm, region: e.target.value, region_id: regionMap[e.target.value] || "" })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50 font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Thời kỳ
                  </label>
                  <select
                    value={createForm.period}
                    onChange={(e) => setCreateForm({ ...createForm, period: e.target.value, period_id: periodMap[e.target.value] || "" })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50 font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Năm
                  </label>
                  <input
                    type="number"
                    value={createForm.year}
                    min={700}
                    max={2026}
                    onChange={(e) => setCreateForm({ ...createForm, year: Number(e.target.value || 0) })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg bg-emerald-50 font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload ảnh đại diện */}
              <div>
                <label className="block text-sm font-bold text-emerald-700 mb-2">
                  Ảnh đại diện <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="upload-thumb"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-sm text-gray-700 font-medium">
                      {createForm.thumbnail ? "Thay đổi ảnh" : "Chọn ảnh từ thiết bị"}
                    </span>
                  </div>
                </div>
                {thumbnailPreview && (
                  <div className="relative w-fit mt-4 mx-auto">
                    <img src={thumbnailPreview} alt="preview" className="max-w-xs max-h-44 object-contain rounded-xl border border-emerald-100 shadow-md" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                    >
                      <span className="sr-only">Xóa ảnh</span>
                      <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Nút thao tác */}
              <div className="flex gap-3 justify-end sticky bottom-0 bg-white py-4 border-t border-emerald-50">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-2xl font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="bg-gradient-to-tr from-sky-600 to-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-xl transition disabled:opacity-50"
                >
                  {createSubmitting ? "Đang xử lý..." : "Gửi bài Triển lãm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery & Modal xem chi tiết giữ nguyên */}
      <ExperienceGallery
        periods={periods}
        regions={regions}
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