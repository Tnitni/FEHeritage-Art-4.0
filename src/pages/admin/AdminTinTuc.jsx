import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import CKEditorField from "../../components/common/CKEditorField";
import { getNews, createNews, updateNews, deleteNews } from "../../services/api";

const ITEMS_PER_PAGE = 5;

const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent?.trim() || "";
};

const mapNewsToItem = (raw) => ({
  id: raw.id,
  title: raw.tag || stripHtml(raw.content).slice(0, 50) || "Tin tức",
  summary: stripHtml(raw.content).slice(0, 150) || "",
  content: raw.content || "",
  thumbnail: raw.thumbnail_url || "",
  status: raw.status,
  created_date: raw.created_date,
});

const AdminTinTuc = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: "",
    title: "",
    summary: "",
    content: "",
    thumbnail: "",
  });
  const [, setThumbnailPreview] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      // Backend giới hạn limit trong khoảng 1-100, nên dùng 100
      const res = await getNews({ page: 1, limit: 100 });
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data.map(mapNewsToItem));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Lỗi tải tin tức:", err);
      toast.error(err?.message || "Không tải được danh sách tin tức.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Đặt lại form nhập tin
  const resetForm = () => {
    setForm({ id: "", title: "", summary: "", content: "", thumbnail: "" });
    setThumbnailPreview("");
    setEditingIndex(null);
    setIsAdding(false);
    const input = document.getElementById("tintuc-image-upload");
    if (input) input.value = "";
  };

  // Mở modal thêm mới tin tức
  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  // Mở modal chỉnh sửa
  const startEdit = (index) => {
    const item = items[index];
    setEditingIndex(index);
    setForm(item);
    setThumbnailPreview(item.thumbnail || "");
    setIsAdding(true);
  };

  // Icon đóng modal (SVG X)
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

  // Xử lý thêm hoặc chỉnh sửa tin (gọi API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content?.trim()) {
      toast.error("Vui lòng nhập nội dung bài viết (tối thiểu 10 ký tự).");
      return;
    }
    if (stripHtml(form.content).length < 10) {
      toast.error("Nội dung phải ít nhất 10 ký tự.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        content: form.content.trim(),
        tag: (form.title || form.summary || "Tin tức").trim().slice(0, 200),
      };
      if (editingIndex !== null && items[editingIndex]?.id) {
        const id = items[editingIndex].id;
        const updatePayload = { ...payload };
        if (form.thumbnail && form.thumbnail.startsWith("http")) {
          updatePayload.thumbnail_url = form.thumbnail;
        }
        const res = await updateNews(id, updatePayload);
        if (res?.success !== false) {
          const updated = [...items];
          updated[editingIndex] = mapNewsToItem(res?.data || { ...items[editingIndex], ...payload, thumbnail_url: form.thumbnail });
          setItems(updated);
          toast.success("Đã cập nhật tin tức.");
          resetForm();
        } else {
          toast.error(res?.message || "Cập nhật thất bại.");
        }
      } else {
        const res = await createNews(payload);
        if (res?.success !== false && res?.data) {
          setItems((prev) => [...prev, mapNewsToItem(res.data)]);
          toast.success("Đã thêm tin tức mới.");
          resetForm();
        } else {
          toast.error(res?.message || "Tạo mới thất bại.");
        }
      }
    } catch (err) {
      const msg = err?.message || err?.errors?.map((e) => e.message).join(", ") || "Có lỗi xảy ra.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa tin (gọi API)
  const handleDelete = async (index) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này không?")) return;
    const item = items[index];
    const id = item?.id;
    if (!id) return;
    try {
      const res = await deleteNews(id);
      if (res?.success !== false) {
        const filtered = items.filter((_, i) => i !== index);
        setItems(filtered);
        const filteredTotalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
        if (filtered.length && currentPage > filteredTotalPages) setCurrentPage(filteredTotalPages);
        if (editingIndex === index) resetForm();
        if (viewItem?.id === id) setViewItem(null);
        toast.success("Đã xóa tin tức.");
      } else {
        toast.error(res?.message || "Xóa thất bại.");
      }
    } catch (err) {
      toast.error(err?.message || "Không xóa được tin tức.");
    }
  };

  // Xóa thumbnail
  const removeThumbnail = () => {
    setForm((prev) => ({ ...prev, thumbnail: "" }));
    setThumbnailPreview("");
    const input = document.getElementById("tintuc-image-upload");
    if (input) input.value = "";
  };

  // Xử lý upload và preview ảnh đại diện
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh tối đa 5MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, thumbnail: ev.target.result }));
        setThumbnailPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Vui lòng chọn file hình ảnh hợp lệ!");
    }
  };

  // Lấy dữ liệu đã lọc (search) cho bảng
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

  // Tính toán danh sách số trang cho phân trang
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
      for (let i = currentPage - 1; i <= currentPage + 1; i++)
        pages.push(i);
      pages.push("...", totalPages);
    }
    return pages;
  };

  // Render UI trang quản trị tin tức
  return (
    <div>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 gap-2">
          <span className="inline-block bg-gradient-to-tr from-blue-600 to-green-400 text-white px-3 py-[2px] rounded-lg text-lg font-bold shadow">
            Tin Tức
          </span>
        </div>

        {/* Thanh công cụ tìm kiếm và thêm mới */}
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
          {/* Đếm số lượng và nút thêm mới */}
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
              Thêm mới tin tức
            </button>
          </div>
        </div>

        {/* Danh sách tin tức dạng bảng */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden w-full overflow-x-auto pt-1 pb-4">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <div className="inline-block w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Đang tải tin tức...</p>
            </div>
          ) : (
          <>
          {/* Header bảng */}
          <div className="min-w-[800px] grid grid-cols-12 items-center bg-gradient-to-tr from-blue-100 to-green-100 border-b border-blue-200 px-6 py-4 text-xs font-bold text-blue-600 tracking-wider uppercase">
            <div className="col-span-1 text-center">STT</div>
            <div className="col-span-2 text-center">Ảnh</div>
            <div className="col-span-4 text-center">Tiêu đề</div>
            <div className="col-span-3 text-center">Mô tả ngắn</div>
            <div className="col-span-2 flex justify-end">Hành động</div>
          </div>
          {/* Dòng dữ liệu bảng */}
          {currentData.length > 0 ? (
            currentData.map((item, idx) => {
              const globalIndex = items.findIndex((i) => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className="group min-w-[800px] grid grid-cols-12 items-center border-b last:border-0 border-emerald-50 px-6 py-3 text-base transition hover:bg-emerald-50"
                >
                  {/* Số thứ tự */}
                  <div className="col-span-1 text-center">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-md tracking-wide">
                      {startIndex + idx + 1}
                    </span>
                  </div>
                  {/* Ảnh đại diện */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="h-12 w-20 flex items-center justify-center rounded-xl overflow-hidden bg-white border border-emerald-100">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center flex-col text-emerald-200">
                          <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.2}
                            viewBox="0 0 24 24"
                          >
                            <rect x="4" y="4" width="16" height="16" rx="4" />
                            <path d="M8 16l2.822-3.494a1.5 1.5 0 0 1 2.357-.088L16 16" />
                            <circle cx="9.5" cy="9.5" r="1" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Tiêu đề tin */}
                  <div className="col-span-4 flex flex-col gap-1 min-w-0">
                    <span className="text-emerald-900 font-bold truncate">
                      {item.title}
                    </span>
                  </div>
                  {/* Mô tả ngắn */}
                  <div className="col-span-3">
                    <div className="text-gray-700 text-sm line-clamp-2">{item.summary}</div>
                  </div>
                  {/* Hành động */}
                  <div className="col-span-2 flex flex-row gap-2 justify-end items-center pr-2">
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
          {/* Phân trang */}
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
          </>
          )}
        </div>

        {/* Modal form thêm/sửa tin */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[1.5px] transition animate-fadein-fast">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border border-emerald-200">
              {/* Header modal */}
              <div className="flex justify-between items-center p-6 border-b border-emerald-100 sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-tr from-sky-600 to-emerald-400 bg-clip-text text-transparent select-none">
                  {editingIndex !== null ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-red-500 transition p-2 rounded-full"
                  type="button"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>
              {/* Body modal */}
              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                {/* Tiêu đề */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition shadow-sm"
                    placeholder="Nhập tiêu đề bài viết"
                    autoFocus
                  />
                </div>
                {/* Mô tả ngắn */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Mô tả ngắn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={(e) =>
                      setForm({ ...form, summary: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-900 bg-emerald-50 font-semibold transition shadow-sm"
                    placeholder="Tóm tắt nội dung"
                  />
                </div>
                {/* Nội dung bài viết */}
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <CKEditorField
                    value={form.content}
                    onChange={content =>
                      setForm({ ...form, content })
                    }
                    placeholder="Nhập nội dung tin tức..."
                  />
                </div>
                {/* Ảnh đại diện */}
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
                      id="tintuc-image-upload"
                    />
                    <label
                      htmlFor="tintuc-image-upload"
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
                        src={form.thumbnail}
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
                    className="flex items-center gap-2 bg-gradient-to-tr from-sky-600 to-emerald-400 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition disabled:opacity-50"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Đang xử lý..." : editingIndex !== null ? "Lưu thay đổi" : "Tạo mới"}
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

      {/* Modal xem chi tiết */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center min-h-screen overflow-y-auto animate-fadein-fast p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-0 relative border border-emerald-200 flex flex-col max-h-[96vh] overflow-y-auto">
            {/* Header modal */}
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
            {/* Nội dung modal */}
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

export default AdminTinTuc;
