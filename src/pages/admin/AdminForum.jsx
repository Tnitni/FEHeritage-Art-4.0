import React, { useState, useCallback, useEffect } from "react";
import forumService from "../../services/forumService";
import { toast } from "react-hot-toast";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Eye,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ImageIcon,
  Film,
  Clock,
  ThumbsDown,
  Check,
  Tag,
  Loader2,
} from "lucide-react";

// Danh sách dữ liệu mẫu diễn đàn
// const initialThreads = [
//   {
//     id: "F-201",
//     title: "Làm sao bảo tồn kiến trúc đình làng?",
//     author: "Thanh Tùng",
//     topic: "Kiến trúc",
//     status: "approved",
//     createdAt: "2025-01-11",
//   },
//   {
//     id: "F-202",
//     title: "Ảnh tư liệu phố cổ Hội An",
//     author: "Mai Hương",
//     topic: "Tư liệu",
//     status: "approved",
//     createdAt: "2025-01-08",
//   },
//   {
//     id: "F-203",
//     title: "Góp ý trải nghiệm 3D",
//     author: "Nhật Linh",
//     topic: "Công nghệ",
//     status: "hidden",
//     createdAt: "2024-12-30",
//   },
// ];

// Icon chỉnh sửa dùng cho nút edit
const EditIcon = ({ className }) => (
  <svg
    className={`w-5 h-5 text-yellow-600 ${className || ""}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
    style={{ display: "inline-block" }}
  >
    <path
      d="M15.232 5.232l3.536 3.536M9 13l6.207-6.207c.39-.39 1.024-.39 1.414 0l2.586 2.586c.39.39.39 1.024 0 1.414L13 17H9v-4z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Form mặc định rỗng cho modal edit
const emptyForm = {
  id: "",
  title: "",
  author: "",
  topic: "",
  status: "",
  createdAt: "",
};

const getCategoryStyles = (categoryName) => {
  const styles = {
    "Công nghệ":
      "from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200",
    "Du lịch":
      "from-green-500/10 to-emerald-500/10 text-green-700 border-green-200",
    "Thảo luận":
      "from-purple-500/10 to-violet-500/10 text-purple-700 border-purple-200",
    "Giáo dục": "from-pink-500/10 to-rose-500/10 text-pink-700 border-pink-200",
    "Di sản":
      "from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200",
    default: "from-gray-500/10 to-slate-500/10 text-gray-700 border-gray-200",
  };
  return styles[categoryName] || styles["default"];
};

const AdminForum = () => {
  const [threads, setThreads] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  // const [query, setQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayPage, setDisplayPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    postId: null,
    type: "", // 'approve' hoặc 'hide'
    title: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await forumService.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        toast.error("Không thể tải danh sách danh mục");
      }
    };
    loadCategories();
  }, []);

  const fetchAdminPosts = useCallback(
    async (isSilent = false) => {
      let loadId;
      if (!isSilent) loadId = toast.loading("Đang lọc dữ liệu...");
      try {
        setIsLoading(true);
        const response = await forumService.getAllPostsForAdmin({
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: statusFilter,
          category_id: selectedCategoryId,
        });

        if (response.success) {
          setThreads(response.data);
          setPagination(response.pagination);
          setDisplayPage(response.pagination.page);
        }
        if (!isSilent) toast.success("Đã cập nhật danh sách", { id: loadId });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Lỗi kết nối máy chủ", { id: loadId });
      } finally {
        setIsLoading(false);
      }
    },
    [
      pagination.page,
      pagination.limit,
      searchTerm,
      statusFilter,
      selectedCategoryId,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminPosts(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAdminPosts]);

  // Hàm mở modal xác nhận
  const openConfirmModal = (postId, type) => {
    setConfirmModal({
      isOpen: true,
      postId,
      type,
      title:
        type === "hide" ? "Xác nhận ẩn bài viết?" : "Xác nhận duyệt bài viết?",
    });
  };

  // Hàm đóng modal
  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Hàm THỰC THI (Đây là nơi cập nhật UI liền)
  const handleConfirmAction = async () => {
    const { postId, type } = confirmModal;

    try {
      setIsSubmitting(true);
      if (type === "hide") {
        await forumService.deletePost(postId);
        // Cập nhật state cục bộ để UI thay đổi ngay lập tức
        setThreads((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, status: "Deleted" } : item,
          ),
        );
        toast.success("Đã ẩn bài viết");
      } else {
        await forumService.activePost(postId);
        // Cập nhật state cục bộ
        setThreads((prev) =>
          prev.map((item) =>
            item.id === postId ? { ...item, status: "Active" } : item,
          ),
        );
        toast.success("Đã duyệt bài viết");
      }
      closeConfirmModal();
    } catch (error) {
      toast.error("Thao tác thất bại, vui lòng thử lại");
      fetchAdminPosts(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleToggleStatus = async (post) => {
  //   const newStatus = post.status === "Active" ? "Deleted" : "Active";
  //   const formData = new FormData();
  //   formData.append("status", newStatus);

  //   try {
  //     const res = await forumService.updatePostById(post.id, formData);
  //     if (res.status === 200 || res.success) {
  //       toast.success(`Đã chuyển trạng thái sang ${newStatus}`);
  //       fetchAdminPosts();
  //     }
  //   } catch (error) {
  //     toast.error("Lỗi khi cập nhật trạng thái");
  //   }
  // };

  // const updateThreadState = (postId, newStatus) => {
  //   setThreads((prev) =>
  //     prev.map((item) =>
  //       item.id === postId ? { ...item, status: newStatus } : item,
  //     ),
  //   );
  // };

  // const handleHidePost = async (postId) => {
  //   if (!window.confirm("Bạn có chắc chắn muốn ẩn bài viết này?")) return;

  //   try {
  //     // Cập nhật UI trước (Optimistic Update)
  //     updateThreadState(postId, "Deleted");

  //     await forumService.deletePost(postId);
  //     toast.success("Đã ẩn bài viết");
  //   } catch (error) {
  //     // Nếu lỗi thì fetch lại để đồng bộ dữ liệu thật
  //     fetchAdminPosts(true);
  //     toast.error("Không thể ẩn bài viết");
  //   }
  // };

  // const handleApprovePost = async (postId) => {
  //   const formData = new FormData();
  //   formData.append("status", "Active");

  //   try {
  //     // Cập nhật UI trước
  //     updateThreadState(postId, "Active");

  //     const res = await forumService.updatePostById(postId, formData);
  //     if (res.success || res.status === 200) {
  //       toast.success("Đã duyệt bài viết");
  //     }
  //   } catch (error) {
  //     fetchAdminPosts(true);
  //     toast.error("Lỗi khi duyệt bài viết");
  //   }
  // };

  const handleViewDetail = async (postId) => {
    try {
      setIsDetailLoading(true);
      setIsViewing(true);
      const response = await forumService.getPostById(postId);
      if (response.success) {
        setSelectedPost(response.data);
      } else {
        toast.error("Không thể lấy chi tiết bài viết");
        setIsViewing(false);
      }
    } catch (error) {
      toast.error("Lỗi khi tải thông tin bài viết");
      setIsViewing(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await forumService.deletePost(postId);
        toast.success("Đã xóa bài viết");
        fetchAdminPosts();
      } catch (error) {
        toast.error("Xóa thất bại");
      }
    }
  };

  // Mở modal sửa bài
  const startEdit = (index) => {
    setEditingIndex(index);
    setForm(threads[index]);
    setIsAdding(true);
  };

  // Đóng modal và reset form
  const handleModalClose = () => {
    setIsAdding(false);
    setIsViewing(false);
    setSelectedPost(null);
    setEditingIndex(null);
    setForm(emptyForm);
  };

  // Cập nhật dữ liệu form khi thay đổi
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Lưu thay đổi vào danh sách threads
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      setThreads((prev) =>
        prev.map((item, idx) =>
          idx === editingIndex ? { ...item, ...form } : item,
        ),
      );
    }
    setIsAdding(false);
    setEditingIndex(null);
    setForm(emptyForm);
  };

  // Lọc danh sách bài viết theo từ khoá
  // const filteredThreads = threads.filter((item) =>
  //   item.title.toLowerCase().includes(query.trim().toLowerCase()),
  // );

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 gap-2">
          <span className="inline-block bg-gradient-to-tr from-blue-600 to-green-400 text-white px-3 py-[2px] rounded-lg text-lg font-bold shadow">
            Quản lý Diễn đàn
          </span>
        </div>

        <div className="relative">
          {/* Bảng danh sách bài viết */}
          <div className="w-full bg-white rounded-2xl shadow border border-blue-100 overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-blue-200 bg-gradient-to-tr from-blue-100 to-green-100 rounded-t-2xl">
              <div className="relative flex-1 max-w-2xl">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none select-none text-lg">
                  <Search size={20} />
                </span>
                <input
                  placeholder="Tìm theo tiêu đề, nội dung"
                  className="max-w-xs w-full pl-10 pr-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 bg-blue-50"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  autoComplete="off"
                />
              </div>
              {/* Lọc Category_id */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 ml-1">
                  DANH MỤC
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="px-3 py-2 border border-blue-200 rounded-lg text-sm font-medium bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 ml-1">
                  TRẠNG THÁI
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Pending" className="text-blue-600 font-bold">
                    Chờ duyệt
                  </option>
                  <option value="Active" className="text-green-600 font-bold">
                    Hiển thị
                  </option>
                  <option value="Deleted" className="text-red-600 font-bold">
                    Đã ẩn
                  </option>
                </select>
              </div>
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-1 rounded-full shrink-0 ml-auto">
                {pagination.total} bài
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[650px] w-full divide-y divide-emerald-50 text-sm">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-800">
                    <th className="py-2 px-3 font-bold text-center">STT</th>
                    <th className="py-2 px-3 font-bold text-center w-44">
                      Tiêu đề
                    </th>
                    <th className="py-2 px-3 font-bold text-center">Tác giả</th>
                    <th className="py-4 px-4">Ngày giờ đăng</th>
                    <th className="py-2 px-3 font-bold text-center">
                      Danh mục
                    </th>
                    <th className="py-2 px-3 font-bold text-center">
                      Trạng thái
                    </th>
                    <th className="py-2 px-3 font-bold text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-400"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : (
                    threads.map((item, index) => {
                      const contentOpacity =
                        item.status === "Deleted"
                          ? "opacity-60"
                          : "opacity-100";
                      const displayIndex =
                        (displayPage - 1) * pagination.limit + (index + 1);
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 transition-colors ${
                            item.status === "Deleted"
                              ? "bg-red-100/70 hover:bg-red-200/60" // Nền đỏ rất nhạt cho bài bị ẩn
                              : "hover:bg-green-200/40"
                          }`}
                        >
                          <td
                            className={`py-2 px-3 text-center font-mono font-bold ${contentOpacity}`}
                          >
                            <span className="inline-block px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-700 rounded-md tracking-wide">
                              {displayIndex}
                            </span>
                          </td>
                          <td className={`py-2 px-3 ${contentOpacity}`}>
                            {item.title}
                          </td>
                          <td className={`py-2 px-3 ${contentOpacity}`}>
                            <div className="flex items-center gap-2">
                              {item.author?.avatar ? (
                                <img
                                  src={item.author.avatar}
                                  className="h-8 w-8 rounded-full object-cover shadow-sm"
                                  alt="Avatar"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                  <User size={14} />
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                {item.author?.name}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-4 ${contentOpacity}`}>
                            <div className="flex flex-col text-[13px] text-gray-500">
                              <span className="flex items-center gap-1 font-bold text-gray-700">
                                <Calendar size={12} className="text-blue-500" />
                                {new Date(item.created_date).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                {new Date(item.created_date).toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: false,
                                  },
                                )}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`py-2 px-3 text-center ${contentOpacity}`}
                          >
                            <span
                              className={`px-3 py-1 rounded-full text-[12px] font-bold border bg-gradient-to-r ${getCategoryStyles(item.post_category?.name)}`}
                            >
                              {item.post_category?.name}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.status === "Deleted" && (
                              <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                Đã ẩn
                              </span>
                            )}
                            {item.status === "Active" && (
                              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Hiển thị
                              </span>
                            )}
                            {item.status === "Pending" && (
                              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                Chờ duyệt
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center flex gap-2 justify-center">
                            <button
                              onClick={() => handleViewDetail(item.id)}
                              className="flex items-center justify-center rounded-full border-2 border-blue-100 shadow bg-blue-50 hover:bg-blue-200 transition w-10 h-10"
                              title="Xem chi tiết"
                            >
                              <Eye size={18} className="text-blue-600" />
                            </button>
                            {/* <button
                            type="button"
                            className="flex items-center justify-center rounded-full border-2 border-red-100 shadow hover:shadow-lg hover:bg-red-50 focus:outline-none active:scale-95 transition"
                            style={{
                              width: "40px",
                              height: "40px",
                              background: "#FEF2F2",
                            }}
                            onClick={() => handleToggleStatus(item)}
                            title="Ẩn/Hiện bài viết"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button> */}
                            {/* Nút Duyệt: Hiện khi Pending hoặc Deleted */}
                            {(item.status === "Pending" ||
                              item.status === "Deleted") && (
                              <button
                                onClick={() =>
                                  openConfirmModal(item.id, "approve")
                                }
                                className="flex items-center justify-center rounded-full border-2 border-green-100 shadow bg-green-50 hover:bg-green-200 transition w-10 h-10"
                                title="Duyệt bài viết"
                              >
                                <Check size={18} className="text-green-600" />
                              </button>
                            )}

                            {/* Nút Ẩn: Hiện khi Pending hoặc Active */}
                            {(item.status === "Pending" ||
                              item.status === "Active") && (
                              <button
                                onClick={() =>
                                  openConfirmModal(item.id, "hide")
                                }
                                className="flex items-center justify-center rounded-full border-2 border-red-100 shadow bg-red-50 hover:bg-red-200 transition w-10 h-10"
                                title="Ẩn bài viết"
                              >
                                <Trash2 size={18} className="text-red-500" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  {!isLoading && threads.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-400 py-8"
                      >
                        Chưa có bài viết
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-blue-100">
                <span className="text-gray-500 text-xs">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    className="p-1 border rounded disabled:opacity-30 hover:bg-white transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                    className="p-1 border rounded disabled:opacity-30 hover:bg-white transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal chỉnh sửa bài viết */}
          {/* {isAdding && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div
                className="bg-[#f7fcfe] rounded-[20px] shadow-lg border-2 border-[#27bae7] max-w-xl w-full mx-4 relative"
                style={{
                  boxShadow: "0 8px 38px 0 #96eefa52",
                  minWidth: 350,
                  maxWidth: 480,
                }}
              >
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="absolute top-4 right-5 w-8 h-8 flex justify-center items-center rounded-full hover:bg-[#ccf3ff] transition border border-[#b4eef7]"
                  title="Đóng"
                >
                  <svg
                    stroke="#27bae7"
                    fill="none"
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    strokeWidth={2}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="11"
                      fill="#f7fcfe"
                      stroke="#b4eef7"
                      strokeWidth={2}
                    />
                    <line
                      x1="8"
                      y1="8"
                      x2="16"
                      y2="16"
                      stroke="#25b0e6"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <line
                      x1="16"
                      y1="8"
                      x2="8"
                      y2="16"
                      stroke="#25b0e6"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                  <h4
                    className="text-2xl font-bold text-sky-700 mb-2"
                    style={{ fontFamily: "inherit" }}
                  >
                    Cập nhật bài diễn đàn
                  </h4>
                  <label className="flex flex-col gap-1 font-bold text-sky-700 text-base">
                    Tiêu đề bài viết *
                    <input
                      className="px-3 py-2 border-2 border-[#27bae7] bg-[#f0fafd] rounded-lg text-base font-normal focus:ring-1 focus:ring-[#32c7fa] focus:outline-none"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                      autoFocus
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-bold text-sky-700 text-base">
                    Tác giả *
                    <input
                      name="author"
                      value={form.author}
                      onChange={handleFormChange}
                      className="px-3 py-2 border-2 border-[#27bae7] bg-[#f0fafd] rounded-lg text-base font-normal focus:ring-1 focus:ring-[#32c7fa] focus:outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-bold text-sky-700 text-base">
                    Chủ đề *
                    <input
                      name="topic"
                      value={form.topic}
                      onChange={handleFormChange}
                      className="px-3 py-2 border-2 border-[#27bae7] bg-[#f0fafd] rounded-lg text-base font-normal focus:ring-1 focus:ring-[#32c7fa] focus:outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-bold text-sky-700 text-base">
                    Ngày tạo *
                    <input
                      name="createdAt"
                      value={form.createdAt}
                      onChange={handleFormChange}
                      className="px-3 py-2 border-2 border-[#27bae7] bg-[#f0fafd] rounded-lg text-base font-normal focus:ring-1 focus:ring-[#32c7fa] focus:outline-none"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 font-bold text-sky-700 text-base">
                    Trạng thái *
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      className="px-3 py-2 border-2 border-[#27bae7] bg-[#f0fafd] rounded-lg text-base font-normal focus:ring-1 focus:ring-[#32c7fa] focus:outline-none"
                      required
                    >
                      <option value="approved">Hiển thị</option>
                      <option value="disabled">Đã ẩn</option>
                    </select>
                  </label>
                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg font-extrabold text-white bg-gradient-to-r from-cyan-500 to-sky-400 border-2 border-sky-300 shadow hover:from-cyan-400 hover:to-sky-300 focus:outline-none active:scale-95 transition"
                      style={{ fontSize: "1rem" }}
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-6 py-2 rounded-lg font-bold border-2 border-gray-200 bg-white text-gray-700 hover:bg-sky-100 transition"
                      style={{ fontSize: "1rem" }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )} */}
          {/* Modal Xem chi tiết (Đã cập nhật theo logic mới) */}
          {isViewing && (
            <div
              onClick={handleModalClose}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[24px] shadow-2xl border-2 border-sky-400 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200"
              >
                {/* Header Modal */}
                <div className="p-6 border-b bg-sky-50 flex justify-between items-center">
                  <h4 className="text-xl font-bold text-sky-800 flex items-center gap-2">
                    <Eye size={24} /> Chi tiết bài viết
                  </h4>
                  <button
                    onClick={handleModalClose}
                    className="w-8 h-8 flex justify-center items-center rounded-full bg-white border border-sky-200 hover:bg-red-50 hover:border-red-200 transition text-sky-500 hover:text-red-500 font-bold"
                    title="Đóng bài viết"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  {isDetailLoading ? (
                    <div className="flex flex-col items-center py-10 gap-4">
                      <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
                      <p className="text-sky-600 font-medium">
                        Đang tải dữ liệu...
                      </p>
                    </div>
                  ) : (
                    selectedPost && (
                      <div className="space-y-6">
                        {/* Tác giả & Thông tin chung */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedPost.author?.avatar}
                              className="w-12 h-12 rounded-full border-2 border-sky-200 object-cover"
                              alt="Author"
                            />
                            <div>
                              <p className="font-bold text-gray-800">
                                {selectedPost.author?.name}
                              </p>
                              <div className="flex items-center gap-4">
                                {" "}
                                {/* Container bọc 2 icon */}
                                {/* Phần NGÀY */}
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar
                                    size={14}
                                    className="text-blue-500"
                                  />
                                  {new Date(
                                    selectedPost.created_date,
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                                {/* Phần GIỜ */}
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock
                                    size={14}
                                    className="text-orange-500"
                                  />
                                  {new Date(
                                    selectedPost.created_date,
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border bg-gradient-to-r shadow-sm ${getCategoryStyles(selectedPost.post_category?.name)}`}
                            >
                              {selectedPost.post_category?.name}
                            </span>
                          </div>
                        </div>

                        {/* Tiêu đề & Nội dung */}
                        <div className="space-y-3">
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                            {selectedPost.title}
                          </h2>
                          <div className="p-4 bg-gray-200/80 rounded-xl border border-gray-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedPost.content}
                          </div>
                          {selectedPost.tags &&
                            selectedPost.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {selectedPost.tags.map((tag, idx) => (
                                  <span
                                    key={tag.id || idx}
                                    className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-full text-sm font-semibold hover:bg-sky-100 transition-colors cursor-default"
                                  >
                                    <Tag size={12} />
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* --- PHẦN HIỂN THỊ HÌNH ĐÃ SỬA --- */}
                        {selectedPost.images &&
                          selectedPost.images.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                <ImageIcon
                                  size={18}
                                  className="text-blue-500"
                                />{" "}
                                Hình ảnh bài viết
                              </h5>
                              <div
                                className={`grid gap-3 ${selectedPost.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                              >
                                {selectedPost.images.map((imgObj, idx) => (
                                  <div
                                    key={imgObj.id || idx}
                                    className="rounded-2xl overflow-hidden border shadow-sm bg-gray-50"
                                  >
                                    <img
                                      src={imgObj.image_url}
                                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                                      alt="Post content"
                                      onClick={() =>
                                        window.open(imgObj.image_url, "_blank")
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* --- PHẦN HIỂN THỊ VIDEO (Dành cho sau này nếu có) --- */}
                        {selectedPost.videos &&
                          selectedPost.videos.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="font-bold text-gray-800 flex items-center gap-2">
                                <Film size={18} className="text-red-500" />{" "}
                                Video bài viết
                              </h5>
                              <div className="space-y-4">
                                {selectedPost.videos.map((videoObj, idx) => (
                                  <div
                                    key={videoObj.id || idx}
                                    className="rounded-2xl overflow-hidden bg-black aspect-video border shadow-lg"
                                  >
                                    <video controls className="w-full h-full">
                                      {/* Nếu video cũng là Object, hãy dùng videoObj.video_url hoặc tương tự */}
                                      <source
                                        src={
                                          typeof videoObj === "string"
                                            ? videoObj
                                            : videoObj.video_url
                                        }
                                        type="video/mp4"
                                      />
                                    </video>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Tương tác */}
                        <div className="flex gap-6 border-y py-4 border-gray-100 bg-gray-50/50 px-4 rounded-xl">
                          <div className="flex items-center gap-2 group">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                              <ThumbsUp size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Yêu thích
                              </p>
                              <p className="text-lg font-semibold text-blue-700 leading-none">
                                {selectedPost.likes || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 group">
                            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition">
                              <ThumbsDown size={20} className="text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Không thích
                              </p>
                              <p className="text-lg font-semibold text-red-700 leading-none">
                                {selectedPost.dislikes || 0}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 group">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                              <MessageSquare
                                size={20}
                                className="text-green-600"
                              />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Bình luận
                              </p>
                              <p className="text-lg font-semibold text-green-700 leading-none">
                                {selectedPost.comment_count || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Danh sách bình luận */}
                        <div className="space-y-4">
                          <h5 className="font-bold text-gray-800 flex items-center gap-2 underline decoration-sky-300 underline-offset-4">
                            Bình luận ({selectedPost.comments?.length})
                          </h5>
                          <div className="space-y-3">
                            {selectedPost.comments?.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-3 bg-white p-3 rounded-lg border border-gray-50 shadow-sm"
                              >
                                <img
                                  src={comment.author?.avatar}
                                  className="w-8 h-8 rounded-full border border-gray-200"
                                  alt="Cmt"
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm text-sky-700">
                                      {comment.author?.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(
                                        comment.created_date,
                                      ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Footer Modal */}
                {/* <div className="p-4 border-t bg-gray-50 text-right">
                  <button
                    onClick={handleModalClose}
                    className="px-6 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Đóng
                  </button>
                </div> */}
              </div>
            </div>
          )}
          {confirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-100 transform animate-in zoom-in duration-200">
                <div
                  className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${confirmModal.type === "hide" ? "bg-red-100" : "bg-green-100"}`}
                >
                  {confirmModal.type === "hide" ? (
                    <Trash2 className="text-red-600" size={24} />
                  ) : (
                    <Check className="text-green-600" size={24} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {confirmModal.type === "hide"
                    ? "Bài viết này sẽ không còn hiển thị với cộng đồng."
                    : "Bài viết sẽ được hiển thị công khai trên diễn đàn."}
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={isSubmitting}
                    onClick={closeConfirmModal}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleConfirmAction}
                    className={`flex-1 px-4 py-2 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${confirmModal.type === "hide" ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"} disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForum;
