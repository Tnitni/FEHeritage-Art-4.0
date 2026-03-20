import React, { useState, useEffect, useCallback } from "react";
import CKEditorField from "../../components/common/CKEditorField";
import {
  getPosts,
  deletePost,
  createPost,
  updatePost,
} from "../../services/api";

/**
 * Danh sách mẫu bài viết Góc Nhìn, dùng làm dữ liệu fallback khi load API thất bại.
 */
const initialGocNhinPosts = [
  {
    id: "G-001",
    title: "Chuyện đời sống quanh Hồ Gươm",
    summary: "Các chiều nhìn đa dạng về văn hóa phố cổ Hà Nội từ những người trẻ.",
    content:
      "<p>Khám phá nhiều góc nhìn khác nhau để thấy giá trị văn hóa phố cổ...</p>",
    thumbnail: "",
  },
  {
    id: "G-002",
    title: "Góc nhìn di sản đô thị hiện đại",
    summary: "Bảo tồn giá trị cũ trong sự phát triển hiện đại ở Hà Nội.",
    content:
      "<p>Không gian văn hóa cũ hòa quyện cùng nhịp sống đô thị...</p>",
    thumbnail: "",
  },
];

const ITEMS_PER_PAGE = 5;

/**
 * Cập nhật bài viết Góc Nhìn.
 * Sử dụng FormData để hỗ trợ upload file và gửi lên API Laravel (giao thức _method spoofing).
 * @param {string} id - ID bài viết cần cập nhật
 * @param {Object} form - Dữ liệu bài viết (form state)
 * @returns {Promise<boolean>} - Kết quả thành công/thất bại
 */
const handleUpdate = async (id, form) => {
  try {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("caption", form.title);
    formData.append("summary", form.summary);
    formData.append("content", form.content);

    // Dùng _method để backend Laravel nhận diện PUT qua POST (nếu RESTful không chấp nhận upload image qua PUT)
    formData.append("_method", "PUT");

    if (form.thumbnail instanceof File) {
      formData.append("image", form.thumbnail); // Trường hợp upload ảnh mới
    } else if (typeof form.thumbnail === "string" && form.thumbnail) {
      // Nếu không đổi ảnh, gửi lại URL cũ để backend không báo thiếu ảnh
      formData.append("image_url", form.thumbnail); 
    }

    const response = await updatePost(id, formData);
    console.log("DỮ LIỆU SERVER TRẢ VỀ:", response);

    // Kiểm tra thành công dựa trên trường 'success'
    return response?.success === true;
  } catch (error) {
    console.error("Lỗi cập nhật chi tiết:", error?.response?.data || error?.message);
    return false;
  }
};

/**
 * Tạo mới bài viết Góc Nhìn.
 * Kiểm tra validate và sử dụng FormData để upload ảnh.
 * @param {Event} e - Sự kiện submit form
 * @param {Object} form - Dữ liệu bài viết
 * @param {Function} resetForm - Hàm reset form sau khi thành công
 * @param {Function} loadData - Hàm reload danh sách bài viết
 */
const handlePost = async (e, form, resetForm, loadData) => {
  e.preventDefault();

  // Kiểm tra đầu vào bắt buộc
  if (!form.title.trim() || !form.content.trim() || !form.thumbnail) {
    alert("Vui lòng nhập tiêu đề, nội dung và chọn ảnh đại diện!");
    return;
  }

  const formData = new FormData(); 

  formData.append("title", form.title);
  formData.append("caption", form.title);
  formData.append("summary", form.summary);
  formData.append("content", form.content);
  formData.append("type", "gocnhin");

  if (form.thumbnail instanceof File) {
    formData.append("image", form.thumbnail);
  }

  // Debug nội dung formData
  console.log("--- DEBUG PAYLOAD ---");
  for (var pair of formData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }
  try {
    const response = await createPost(formData);
    console.log("Server Response:", response);
    
    if (response.status === 200 || response.status === 201 || response.success) { 
      alert("Đăng bài thành công!");
      await loadData();
      resetForm();
    }
  } catch (error) {
    // Xử lý lỗi trả về từ server hoặc mạng
    console.error("LỖI PHÁT SINH TỪ SERVER:");
    if (error.response) {
      // Lỗi API trả về
      console.log("Data lỗi:", error.response.data); 
      console.log("Status code:", error.response.status);
      alert(`Server báo lỗi (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else {
      // Lỗi mạng hoặc không có response
      console.log("Message:", error.message);
    }
  }
};

const AdminGocnhin = () => {
  // State quản lý danh sách bài viết, trạng thái form, modal, tìm kiếm, phân trang,...
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: "",
    title: "",
    summary: "",
    content: "",
    caption: "",
    thumbnail: "",
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch danh sách bài viết Góc Nhìn từ API, fallback sang initial data nếu lỗi.
   * Áp dụng useCallback để hạn chế re-create function khi dependencies không đổi.
   */
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // API lấy danh sách bài viết loại "gocnhin"
      const res = await getPosts({ type: "gocnhin" });
      if (res?.success && Array.isArray(res.data)) {
        const normalized = res.data.map((post) => ({
          id: post.id,
          title: post.caption || post.title || "Không có tiêu đề", 
          caption: post.caption || post.title || "",
          summary: post.summary || post.caption || "",              
          content: post.content || "",
          thumbnail: post.cloudinary_url || "",
        }));
        setItems(normalized);
      }
    } catch (err) {
      // Nếu fetch lỗi, dùng dữ liệu mẫu cho trải nghiệm offline
      console.error("Failed to fetch:", err);
      setItems(initialGocNhinPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Đặt lại dữ liệu form và các trạng thái liên quan về mặc định (đóng modal,...)
   */
  const resetForm = () => {
    setForm({ id: "", title: "", summary: "", content: "", thumbnail: "", caption: "" });
    setThumbnailPreview("");
    setEditingIndex(null);
    setEditingId(null);
    setIsAdding(false);
    // Clear input file nếu có
    const input = document.getElementById("gocnhin-image-upload");
    if (input) input.value = "";
  };

  /**
   * Bắt đầu quá trình thêm mới một bài viết.
   */
  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  /**
   * Vào chế độ chỉnh sửa một bài viết.
   * @param {number} index - Index trong mảng items
   */
  const startEdit = (index) => {
    const item = items[index];
    setEditingIndex(index);
    setEditingId(item.id);

    setForm({
      id: item.id,
      title: item.title,      // Đồng bộ với caption từ normalize
      summary: item.summary,  
      content: item.content,
      caption: item.title,    // Caption = title cho thống nhất
      thumbnail: item.thumbnail 
    });

    setThumbnailPreview(item.thumbnail || "");
    setIsAdding(true);
  };

  /**
   * SVG Icon dấu X, dùng cho nút đóng/hủy/loại bỏ.
   */
  const X = (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className || ""}
      width={props.width || "1em"}
      height={props.height || "1em"}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  /**
   * Xử lý submit tạo mới hoặc cập nhật bài viết Góc Nhìn.
   * Nếu có editingId sẽ update, ngược lại sẽ tạo mới.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.content || !form.thumbnail) {
      alert("Vui lòng điền đầy đủ tiêu đề, nội dung và ảnh!");
      return;
    }

    if (editingId) {
      const success = await handleUpdate(editingId, form);
      if (success) {
        alert("Cập nhật thành công!");
        await loadData(); // Reload danh sách bài viết sau khi update
        resetForm();     // Đóng modal, làm sạch dữ liệu form
      } else {
        alert("Cập nhật thất bại. Vui lòng kiểm tra lại dữ liệu hoặc Console.");
      }
    } else {
      await handlePost(e, form, resetForm, loadData);
    }
  };

  /**
   * Xóa một bài viết Góc Nhìn, có xác nhận người dùng trước khi thực hiện.
   * @param {number} index - Index mục cần xóa trong mảng items
   */
  const handleDelete = async (index) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này không?")) return;
    const id = items[index]?.id;
    try {
      if (id) await deletePost(id);
      // Cập nhật lại danh sách đã xóa
      const filtered = items.filter((_, i) => i !== index);
      setItems(filtered);

      // Điều chỉnh trang hiện tại nếu có thay đổi về số lượng trang
      const filteredTotalPages =
        Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
      if (filtered.length && currentPage > filteredTotalPages) {
        setCurrentPage(filteredTotalPages);
      }
      if (editingIndex === index) resetForm();
      if (viewItem && items[index] && items[index].id === viewItem.id)
        setViewItem(null);
    } catch (err) {
      alert("Xóa thất bại. Vui lòng thử lại!");
    }
  };

  /**
   * Xóa/hủy ảnh đại diện khỏi form.
   */
  const removeThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: "" }));
    setThumbnailPreview("");
    const input = document.getElementById("gocnhin-image-upload");
    if (input) input.value = "";
  };

  /**
   * Xử lý upload ảnh thumbnail cho bài viết Góc Nhìn.
   * @param {Event} e - Sự kiện thay đổi input file
   */
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Giải phóng URL cũ nếu có để tránh memory leak
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setForm((prev) => ({
      ...prev,
      thumbnail: file, // Lưu file, sẽ gửi qua API khi submit
    }));

    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
  };

  /**
   * Lọc danh sách bài viết dựa trên tiêu đề hoặc mô tả ngắn theo từ khóa tìm kiếm.
   */
  const getFilteredData = () => {
    return items.filter(
      (item) =>
        (item.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.summary || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  };
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  /**
   * Sinh ra mảng số trang phục vụ hiển thị phân trang, tối ưu tránh quá nhiều nút nếu danh sách dài.
   */
  const getPageNumbers = () => {
    if (totalPages <= 8)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, "...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...", totalPages);
    }
    return pages;
  };

  // JSX phần giao diện chính
  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 gap-2">
          <span className="inline-block bg-gradient-to-tr from-blue-600 to-green-400 text-white px-3 py-[2px] rounded-lg text-lg font-bold shadow">
            Góc Nhìn
          </span>
        </div>
        {/* Toolbar: Filter + Tìm kiếm + Thông tin tổng + Nút Thêm mới */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-7 rounded-t-2xl border-b border-emerald-100 shadow">
          {/* Ô tìm kiếm */}
          <div className="flex items-center w-full md:max-w-md relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path
                d="M21 21l-4.35-4.35"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="🔎 Tìm kiếm tiêu đề hoặc mô tả ngắn..."
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 bg-blue-50 transition"
            />
          </div>
          {/* Số lượng bài viết và nút Thêm mới */}
          <div className="flex flex-row gap-3 items-center mt-2 md:mt-0">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-extrabold px-4 py-1 rounded-full">
              {filteredData.length} bài viết
            </span>
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-br from-sky-600 to-emerald-400 text-white shadow hover:shadow-lg transition-all"
              onClick={startAdd}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Thêm mới góc nhìn
            </button>
          </div>
        </div>
        {/* Danh sách bài viết dạng table responsive */}
        {loading ? (
          // Skeleton loading UI
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden w-full overflow-x-auto pt-1 pb-4">
            {/* Header các cột thông tin */}
            <div className="min-w-[800px] grid grid-cols-12 items-center bg-gradient-to-tr from-blue-100 to-green-100 border-b border-blue-200 px-6 py-4 text-xs font-bold text-blue-600 tracking-wider uppercase">
              <div className="col-span-1 text-center">STT</div>
              <div className="col-span-2 text-center">Ảnh</div>
              <div className="col-span-4 text-center">Tiêu đề</div>
              <div className="col-span-3 text-center">Mô tả ngắn</div>
              <div className="col-span-2 flex justify-end">Hành động</div>
            </div>
            {/* Dữ liệu từng dòng */}
            {currentData.length > 0 ? (
              currentData.map((item, idx) => {
                const globalIndex = items.findIndex((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="group min-w-[800px] grid grid-cols-12 items-center border-b last:border-0 border-emerald-50 px-6 py-3 text-base transition hover:bg-emerald-50"
                  >
                    {/* Số thứ tự (STT) */}
                    <div className="col-span-1 text-center">
                      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-md tracking-wide">
                        {startIndex + idx + 1}
                      </span>
                    </div>
                    {/* Ảnh đại diện hoặc placeholder nếu chưa có ảnh */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="h-12 w-20 flex items-center justify-center rounded-xl overflow-hidden bg-white border border-emerald-100">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Không có ảnh</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Tiêu đề bài viết */}
                    <div className="col-span-4 flex flex-col gap-1 min-w-0">
                      <span className="text-emerald-900 font-bold truncate">
                        {item.title}
                      </span>
                    </div>
                    {/* Mô tả ngắn, giới hạn dòng */}
                    <div className="col-span-3">
                      <div className="text-gray-700 text-sm line-clamp-2">{item.summary}</div>
                    </div>
                    {/* Nhóm nút hành động thao tác */}
                    <div className="col-span-2 flex flex-row gap-2 justify-end items-center pr-2">
                      {/* Nút xem chi tiết */}
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-full shadow-md hover:bg-emerald-100 group/action transition"
                        onClick={() => setViewItem(item)}
                        title="Xem chi tiết"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3.5" />
                          <path d="M2 12C4 7.5 8.5 5 12 5s8 2.5 10 7c-2 4.5-6.5 7-10 7s-8-2.5-10-7z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Nút chỉnh sửa bài viết */}
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-full shadow-md hover:bg-yellow-100 group/action transition"
                        onClick={() => startEdit(globalIndex)}
                        title="Chỉnh sửa"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536M9 13l6.207-6.207c.39-.39 1.024-.39 1.414 0l2.586 2.586c.39.39.39 1.024 0 1.414L13 17H9v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Nút xóa bài viết */}
                      <button
                        className="w-9 h-9 flex items-center justify-center bg-red-50 border border-red-200 rounded-full shadow-md hover:bg-red-100 group/action transition"
                        onClick={() => handleDelete(globalIndex)}
                        title="Xóa"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-gray-400 col-span-12">
                Chưa có bài viết
              </div>
            )}
            {/* Hiện thanh phân trang nếu dữ liệu có nhiều trang */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between px-4 py-5 bg-gradient-to-r from-emerald-50 to-sky-50 border-t border-emerald-100 mt-2 rounded-b-2xl">
                <div className="text-sm text-gray-700 mb-3 md:mb-0 font-semibold">
                  Hiển thị{" "}
                  <span className="font-bold">
                    {filteredData.length === 0 ? 0 : startIndex + 1}
                  </span>
                  {" - "}
                  <span className="font-bold">
                    {filteredData.length === 0
                      ? 0
                      : Math.min(
                          startIndex + ITEMS_PER_PAGE,
                          filteredData.length
                        )}
                  </span>
                  {" trên "}
                  <span className="font-bold">
                    {filteredData.length}
                  </span>{" "}
                  bài viết
                </div>
                {/* Các nút số trang */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  {getPageNumbers().map((page, i) => (
                    <button
                      key={i}
                      onClick={() => typeof page === "number" && setCurrentPage(page)}
                      disabled={page === "..."}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow ${
                        page === currentPage
                          ? "bg-gradient-to-tr from-sky-600 to-emerald-500 text-white"
                          : page === "..."
                          ? "cursor-default text-gray-400 bg-transparent"
                          : "hover:bg-emerald-100 text-gray-700"
                      }`}
                      type="button"
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Modal: Thêm/Sửa bài viết */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[1.5px] transition animate-fadein-fast">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border border-emerald-200">
              {/* Header modal */}
              <div className="flex justify-between items-center p-6 border-b border-emerald-100 sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-tr from-sky-600 to-emerald-400 bg-clip-text text-transparent select-none">
                  {editingIndex !== null
                    ? "Chỉnh sửa góc nhìn"
                    : "Thêm góc nhìn mới"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-red-500 transition p-2 rounded-full"
                  type="button"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              {/* Body modal: Form nhập liệu */}
              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                {/* Tiêu đề bài viết */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition shadow-sm"
                    placeholder="Nhập tiêu đề bài viết"
                    autoFocus
                  />
                </div>
                {/* Tóm tắt/Mô tả ngắn bài viết */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Mô tả ngắn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition shadow-sm"
                    placeholder="Tóm tắt nội dung"
                  />
                </div>
                {/* Nội dung đầy đủ của bài viết (CKEditor) */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <CKEditorField
                    value={form.content}
                    onChange={(content) => setForm({ ...form, content })}
                    placeholder="Nhập nội dung góc nhìn..."
                  />
                </div>
                {/* Trường upload và hiển thị ảnh đại diện */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Ảnh đại diện <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center bg-emerald-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="gocnhin-image-upload"
                    />
                    <label
                      htmlFor="gocnhin-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <svg
                        className="w-10 h-10 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 font-medium">
                        {form.thumbnail
                          ? "Đổi ảnh đại diện"
                          : "Chọn ảnh đại diện"}
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG, GIF (tối đa 5MB)
                      </span>
                    </label>
                  </div>
                  {form.thumbnail && (
                    <div className="relative w-fit mt-3 mx-auto">
                      <img
                        src={thumbnailPreview || form.thumbnail}
                        alt="preview"
                        className="max-w-xs max-h-44 object-contain rounded-xl border border-emerald-100 shadow-lg bg-white"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full p-2 shadow transition"
                        onClick={removeThumbnail}
                        tabIndex={-1}
                        title="Xóa ảnh"
                      >
                        <X />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2 justify-end">
                  <button
                    className="flex items-center gap-2 bg-gradient-to-tr from-sky-600 to-emerald-400 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition"
                    type="submit"
                  >
                    {editingIndex !== null ? "Lưu thay đổi" : "Tạo mới"}
                  </button>
                  <button
                    className="px-6 py-3 rounded-2xl font-semibold border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 transition"
                    type="button"
                    onClick={resetForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Modal xem chi tiết bài viết */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center min-h-screen overflow-y-auto animate-fadein-fast p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-0 relative border border-emerald-200 flex flex-col max-h-[96vh] overflow-y-auto">
            {/* Header modal chi tiết */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-emerald-50 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-extrabold text-emerald-700">
                {viewItem.title}
              </h3>
              <button
                className="bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full transition"
                onClick={() => setViewItem(null)}
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Nội dung chi tiết bài viết */}
            <div className="px-8 pb-8 pt-4 flex flex-col gap-3">
              {viewItem.thumbnail && (
                <img
                  src={viewItem.thumbnail}
                  alt={viewItem.title}
                  className="w-full max-h-64 object-cover rounded-xl border border-emerald-100 mb-2"
                />
              )}
              <div className="text-emerald-800 text-base mb-1 font-semibold">
                {viewItem.summary}
              </div>
              <div
                className="ck-content prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: viewItem.content,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGocnhin;
