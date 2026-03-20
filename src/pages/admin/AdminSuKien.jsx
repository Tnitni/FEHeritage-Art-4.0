import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import CKEditorField from "../../components/common/CKEditorField";
import { getEvents, createEvent, updateEvent, deleteEvent as apiDeleteEvent } from "../../services/api";

const ITEMS_PER_PAGE = 5;

const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent?.trim() || "";
};

const mapEventToItem = (raw) => ({
  id: raw.id,
  title: raw.title || "Sự kiện",
  summary: stripHtml(raw.content).slice(0, 150) || "",
  content: raw.content || "",
  thumbnail: raw.thumbnail_url || "",
  duration: raw.duration,
  location: raw.location,
  tag: raw.tag,
  start_date: raw.start_date,
  end_date: raw.end_date,
  status: raw.status,
});

const AdminSuKien = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    id: "",
    title: "",
    summary: "",
    content: "",
    thumbnail: "",
    duration: "1 ngày",
    location: "",
    tag: "",
    start_date: "",
    end_date: "",
  });

  // State preview ảnh sự kiện
  const [, setThumbnailPreview] = useState("");

  // Index sự kiện đang chỉnh sửa (null nếu đang thêm mới)
  const [editingIdx, setEditingIdx] = useState(null);

  // State hiển thị form modal
  const [showForm, setShowForm] = useState(false);

  // Sự kiện được chọn để xem chi tiết
  const [detailEvent, setDetailEvent] = useState(null);

  // State cho giá trị tìm kiếm
  const [searchValue, setSearchValue] = useState("");

  // State phân trang
  const [page, setPage] = useState(1);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Backend giới hạn limit trong khoảng 1-100, nên dùng 100
      const res = await getEvents({ page: 1, limit: 100 });
      if (res?.success && Array.isArray(res.data)) {
        setEvents(res.data.map(mapEventToItem));
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Lỗi tải sự kiện:", err);
      toast.error(err?.message || "Không tải được danh sách sự kiện.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const emptyForm = {
    id: "", title: "", summary: "", content: "", thumbnail: "",
    duration: "1 ngày", location: "", tag: "", start_date: "", end_date: "",
  };

  const resetAll = () => {
    setForm(emptyForm);
    setThumbnailPreview("");
    setEditingIdx(null);
    setShowForm(false);
    const input = document.getElementById("su-kien-image-upload");
    if (input) input.value = "";
  };

  // Hiển thị modal thêm mới sự kiện
  const doAdd = () => {
    resetAll();
    setShowForm(true);
  };

  const toDateInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const doEdit = (idx) => {
    const ev = events[idx];
    setEditingIdx(idx);
    setForm({
      ...ev,
      start_date: toDateInput(ev.start_date),
      end_date: toDateInput(ev.end_date),
    });
    setThumbnailPreview(ev.thumbnail || "");
    setShowForm(true);
  };

  // Icon đóng (close)
  const XIcon = (props) => (
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

  const submitEvent = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề sự kiện.");
      return;
    }
    if (!form.content?.trim()) {
      toast.error("Vui lòng nhập nội dung sự kiện.");
      return;
    }
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      duration: form.duration?.trim() || "1 ngày",
      location: form.location?.trim() || "",
      tag: form.tag?.trim() || "",
      start_date: form.start_date || new Date().toISOString().slice(0, 10),
      end_date: form.end_date || new Date().toISOString().slice(0, 10),
    };
    try {
      if (editingIdx !== null && events[editingIdx]?.id) {
        const id = events[editingIdx].id;
        const res = await updateEvent(id, payload);
        if (res?.success !== false && res?.data) {
          const next = [...events];
          next[editingIdx] = mapEventToItem(res.data);
          setEvents(next);
          toast.success("Đã cập nhật sự kiện.");
          resetAll();
        } else {
          toast.error(res?.message || "Cập nhật thất bại.");
        }
      } else {
        const res = await createEvent(payload);
        if (res?.success !== false && res?.data) {
          setEvents((prev) => [...prev, mapEventToItem(res.data)]);
          toast.success("Đã thêm sự kiện mới.");
          resetAll();
        } else {
          toast.error(res?.message || "Tạo mới thất bại.");
        }
      }
    } catch (err) {
      toast.error(err?.message || "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (idx) => {
    if (!window.confirm("Xóa sự kiện này?")) return;
    const id = events[idx]?.id;
    if (!id) return;
    try {
      const res = await apiDeleteEvent(id);
      if (res?.success !== false) {
        const remained = events.filter((_, i) => i !== idx);
        setEvents(remained);
        const lastPage = Math.ceil(remained.length / ITEMS_PER_PAGE) || 1;
        if (remained.length && page > lastPage) setPage(lastPage);
        if (editingIdx === idx) resetAll();
        if (detailEvent?.id === id) setDetailEvent(null);
        toast.success("Đã xóa sự kiện.");
      } else {
        toast.error(res?.message || "Xóa thất bại.");
      }
    } catch (err) {
      toast.error(err?.message || "Không xóa được sự kiện.");
    }
  };

  // Xóa ảnh đại diện sự kiện trong form
  const removePic = () => {
    setForm(f => ({ ...f, thumbnail: "" }));
    setThumbnailPreview("");
    const input = document.getElementById("su-kien-image-upload");
    if (input) input.value = "";
  };

  // Xử lý upload ảnh đại diện
  const onThumbUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh tối đa 5MB!");
        return;
      }
      const reader = new window.FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, thumbnail: ev.target.result }));
        setThumbnailPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Vui lòng chọn file hình ảnh hợp lệ!");
    }
  };

  // Lọc sự kiện theo từ khóa tìm kiếm
  const filterList = () => {
    return events.filter(
      ev =>
        (ev.title || "").toLowerCase().includes(searchValue.toLowerCase()) ||
        (ev.summary || "").toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const filteredList = filterList();
  const totalPage = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const firstIdx = (page - 1) * ITEMS_PER_PAGE;
  const showList = filteredList.slice(firstIdx, firstIdx + ITEMS_PER_PAGE);

  // Tạo mảng phân trang
  const paging = () => {
    if (totalPage <= 8) return Array.from({ length: totalPage }, (_, i) => i + 1);
    const arr = [];
    if (page <= 4) {
      for (let i = 1; i <= 5; i++) arr.push(i);
      arr.push("...", totalPage);
    } else if (page >= totalPage - 3) {
      arr.push(1, "...");
      for (let i = totalPage - 4; i <= totalPage; i++) arr.push(i);
    } else {
      arr.push(1, "...");
      for (let i = page - 1; i <= page + 1; i++) arr.push(i);
      arr.push("...", totalPage);
    }
    return arr;
  };

  // Render UI
  return (
    <div>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 gap-2">
          <span className="inline-block bg-gradient-to-tr from-blue-600 to-green-400 text-white px-3 py-[2px] rounded-lg text-lg font-bold shadow">
            Sự kiện nổi bật
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-7 rounded-t-2xl border-b border-emerald-100 shadow">
          {/* Thanh tìm kiếm */}
          <div className="flex items-center w-full md:max-w-md relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 w-5 h-5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={e => {
                setSearchValue(e.target.value);
                setPage(1);
              }}
              placeholder="🔎 Tìm kiếm tên sự kiện hoặc miêu tả..."
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 bg-blue-50 transition"
            />
          </div>
          {/* Đếm và nút thêm mới */}
          <div className="flex flex-row gap-3 items-center mt-2 md:mt-0">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-extrabold px-4 py-1 rounded-full">
              {filteredList.length} sự kiện
            </span>
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-br from-sky-600 to-emerald-400 text-white shadow hover:shadow-lg transition-all"
              onClick={doAdd}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Thêm sự kiện mới
            </button>
          </div>
        </div>
        {/* Danh sách sự kiện */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden w-full overflow-x-auto pt-1 pb-4">
          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <div className="inline-block w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p>Đang tải sự kiện...</p>
            </div>
          ) : (
          <>
          <div className="min-w-[800px] grid grid-cols-12 items-center bg-gradient-to-tr from-blue-100 to-green-100 border-b border-blue-200 px-6 py-4 text-xs font-bold text-blue-600 tracking-wider uppercase">
            <div className="col-span-1 text-center">STT</div>
            <div className="col-span-2 text-center">Ảnh</div>
            <div className="col-span-4 text-center">Sự kiện</div>
            <div className="col-span-3 text-center">Miêu tả</div>
            <div className="col-span-2 flex justify-end">Hành động</div>
          </div>
          {/* Dữ liệu sự kiện */}
          {showList.length > 0 ? (
            showList.map((item, idx) => {
              const globalIdx = events.findIndex(ev => ev.id === item.id);
              return (
                <div
                  key={item.id}
                  className="group min-w-[800px] grid grid-cols-12 items-center border-b last:border-0 border-cyan-50 px-6 py-3 text-base transition hover:bg-emerald-50"
                >
                  {/* Số thứ tự */}
                  <div className="col-span-1 text-center">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold bg-teal-100 text-teal-700 rounded-md tracking-wide">
                      {firstIdx + idx + 1}
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
                        <div className="w-full h-full flex items-center justify-center flex-col text-cyan-200">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                            <rect x="4" y="4" width="16" height="16" rx="4" />
                            <path d="M8 16l2.822-3.494a1.5 1.5 0 0 1 2.357-.088L16 16" />
                            <circle cx="9.5" cy="9.5" r="1" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Tên sự kiện */}
                  <div className="col-span-4 flex flex-col gap-1 min-w-0">
                    <span className="text-emerald-900 font-bold truncate">{item.title}</span>
                  </div>
                  {/* Miêu tả */}
                  <div className="col-span-3">
                    <div className="text-gray-700 text-sm line-clamp-2">{item.summary}</div>
                  </div>
                  {/* Hành động */}
                  <div className="col-span-2 flex flex-row gap-2 justify-end items-center pr-2">
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-full shadow-md hover:bg-emerald-100 group/action transition"
                      onClick={() => setDetailEvent(item)}
                      title="Xem"
                      type="button"
                    >
                      <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3.5" />
                        <path d="M2 12C4 7.5 8.5 5 12 5s8 2.5 10 7c-2 4.5-6.5 7-10 7s-8-2.5-10-7z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-full shadow-md hover:bg-yellow-100 group/action transition"
                      onClick={() => doEdit(globalIdx)}
                      title="Sửa"
                      type="button"
                    >
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 13l6.207-6.207c.39-.39 1.024-.39 1.414 0l2.586 2.586c.39.39.39 1.024 0 1.414L13 17H9v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-red-50 border border-red-200 rounded-full shadow-md hover:bg-red-100 group/action transition"
                      onClick={() => deleteEvent(globalIdx)}
                      title="Xóa"
                      type="button"
                    >
                      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
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
              Không có sự kiện nào
            </div>
          )}
          {/* Phân trang */}
          {totalPage > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-5 bg-gradient-to-r from-emerald-50 to-sky-50 border-t border-emerald-100 mt-2 rounded-b-2xl">
              <div className="text-sm text-gray-700 mb-3 md:mb-0 font-semibold">
                Hiển thị{" "}
                <span className="font-bold">
                  {filteredList.length === 0 ? 0 : firstIdx + 1}
                </span>
                {" - "}
                <span className="font-bold">
                  {filteredList.length === 0
                    ? 0
                    : Math.min(firstIdx + ITEMS_PER_PAGE, filteredList.length)}
                </span>
                {" trên "}
                <span className="font-bold">{filteredList.length}</span>{" "}sự kiện
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {paging().map((num, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof num === "number" && setPage(num)}
                    disabled={num === "..."}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow ${
                      num === page
                        ? "bg-gradient-to-tr from-sky-600 to-emerald-500 text-white"
                        : num === "..."
                        ? "cursor-default text-gray-400 bg-transparent"
                        : "hover:bg-emerald-100 text-gray-700"
                    }`}
                    type="button"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPage))}
                  disabled={page === totalPage}
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
        {/* Modal form thêm/sửa sự kiện */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[1.5px] transition animate-fadein-fast">
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border border-cyan-200">
              {/* Header modal form */}
              <div className="flex justify-between items-center p-6 border-b border-cyan-100 sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-extrabold bg-gradient-to-tr from-sky-600 to-emerald-400 bg-clip-text text-transparent select-none">
                  {editingIdx !== null ? "Cập nhật sự kiện" : "Thêm sự kiện mới"}
                </h2>
                <button
                  onClick={resetAll}
                  className="text-gray-400 hover:text-red-500 transition p-2 rounded-full"
                  type="button"
                >
                  <XIcon className="w-7 h-7" />
                </button>
              </div>
              {/* Body modal form */}
              <form className="p-6 space-y-6" onSubmit={submitEvent}>
                {/* Nhập tên sự kiện */}
                <div>
                  <label className="block text-sm font-bold text-teal-700 mb-2">
                    Tên sự kiện <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-emerald-900 bg-cyan-50 font-semibold transition shadow-sm"
                    placeholder="Nhập tên sự kiện"
                    autoFocus
                  />
                </div>
                {/* Miêu tả sự kiện */}
                <div>
                  <label className="block text-sm font-bold text-teal-700 mb-2">
                    Miêu tả <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    className="w-full px-4 py-3 border border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-emerald-900 bg-cyan-50 font-semibold transition shadow-sm"
                    placeholder="Viết miêu tả vắn tắt sự kiện"
                  />
                </div>
                {/* Nội dung chi tiết sự kiện */}
                <div>
                  <label className="block text-sm font-bold text-teal-700 mb-2">
                    Nội dung sự kiện <span className="text-pink-500">*</span>
                  </label>
                  <CKEditorField
                    value={form.content}
                    onChange={text => setForm(f => ({ ...f, content: text }))}
                    placeholder="Chi tiết thông tin sự kiện..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-teal-700 mb-2">Thời lượng</label>
                    <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" placeholder="VD: 1 ngày" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-teal-700 mb-2">Địa điểm</label>
                    <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" placeholder="VD: Hà Nội" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-teal-700 mb-2">Ngày bắt đầu</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-teal-700 mb-2">Ngày kết thúc</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-teal-700 mb-2">Tag (tùy chọn)</label>
                  <input type="text" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} className="w-full px-4 py-2 border border-cyan-200 rounded-lg" placeholder="VD: van-hoa, lich-su" />
                </div>
                {/* Upload ảnh đại diện sự kiện */}
                <div>
                  <label className="block text-sm font-bold text-teal-700 mb-2">
                    Ảnh đại diện <span className="text-pink-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-cyan-200 rounded-lg p-6 text-center bg-cyan-50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onThumbUpload}
                      className="hidden"
                      id="su-kien-image-upload"
                    />
                    <label
                      htmlFor="su-kien-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <svg
                        className="w-10 h-10 text-teal-400"
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
                        {form.thumbnail ? "Đổi ảnh đại diện" : "Thêm ảnh đại diện"}
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
                        className="max-w-xs max-h-44 object-contain rounded-xl border border-cyan-100 shadow-lg bg-white"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full p-2 shadow transition"
                        onClick={removePic}
                        tabIndex={-1}
                        title="Xóa ảnh"
                      >
                        <XIcon />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2 justify-end">
                  <button
                    className="flex items-center gap-2 bg-gradient-to-tr from-sky-600 to-cyan-400 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Đang xử lý..." : editingIdx !== null ? "Cập nhật" : "Tạo sự kiện"}
                  </button>
                  <button
                    className="px-6 py-3 rounded-2xl font-semibold border border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-50 transition"
                    type="button"
                    onClick={resetAll}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal chi tiết sự kiện */}
        {detailEvent && (
          <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center min-h-screen overflow-y-auto animate-fadein-fast p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-0 relative border border-cyan-200 flex flex-col max-h-[96vh] overflow-y-auto">
              <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-emerald-50 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-extrabold text-teal-700">{detailEvent.title}</h3>
                <button
                  className="bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full transition"
                  onClick={() => setDetailEvent(null)}
                  type="button"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="px-8 pb-8 pt-4 flex flex-col gap-3">
                {detailEvent.thumbnail && (
                  <img
                    src={detailEvent.thumbnail}
                    alt={detailEvent.title}
                    className="w-full max-h-64 object-cover rounded-xl border border-cyan-100 mb-2"
                  />
                )}
                <div className="text-teal-800 text-base mb-1 font-semibold">
                  {detailEvent.summary}
                </div>
                <div
                  className="ck-content prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: detailEvent.content }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuKien;
