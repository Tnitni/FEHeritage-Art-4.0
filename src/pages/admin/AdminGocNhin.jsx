import React, { useState, useEffect, useCallback } from "react";
import CKEditorField from "../../components/common/CKEditorField";
import {
  getPosts,
  deletePost,
  createPost,
  updatePost,
  getPeriods,
  getRegions,
  updateExperiencePostStatus,
} from "../../services/api";

const ITEMS_PER_PAGE = 5;

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

// ─── API helpers ──────────────────────────────────────────────────────────────
const buildPostFormData = (form, isUpdate = false) => {
  const fd = new FormData();
  fd.append("caption", form.title);
  if (!isUpdate) fd.append("type", "gocnhin");
  if (form.period_id) fd.append("period_id", form.period_id);
  if (form.region_id) fd.append("region_id", form.region_id);
  if (isUpdate) fd.append("_method", "PUT");
  if (form.thumbnail instanceof File) {
    fd.append("image", form.thumbnail);
  } else if (typeof form.thumbnail === "string" && form.thumbnail) {
    fd.append("cloudinary_url", form.thumbnail);
  }
  return fd;
};

const handlePost = async (e, form, resetForm, loadData) => {
  e.preventDefault();
  if (!form.title.trim()) { alert("Vui long dien tieu de!"); return; }
  if (!form.thumbnail) { alert("Vui long chon anh dai dien!"); return; }
  try {
    const res = await createPost(buildPostFormData(form, false));
    if (res.status === 200 || res.status === 201 || res.success) {
      alert("Dang bai thanh cong!");
      await loadData();
      resetForm();
    }
  } catch (err) {
    console.error("LOI SERVER:", err);
    alert(err.response
      ? `Loi ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : "Loi: " + err.message);
  }
};

const handleUpdate = async (id, form) => {
  try {
    const res = await updatePost(id, buildPostFormData(form, true));
    return res?.success === true;
  } catch (err) {
    console.error("Loi cap nhat:", err?.response?.data || err?.message);
    return false;
  }
};

// ─── Icon X ───────────────────────────────────────────────────────────────────
const X = ({ className = "", width = "1em", height = "1em", ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} width={width} height={height} {...rest}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex justify-center py-14">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
  </div>
);

// ════════════════════════════════════════════════════════════════════════════════
const AdminGocnhin = () => {
  const [activeTab, setActiveTab] = useState("gocnhin");

  // periods & regions: [{id, name}]
  const [periodOptions, setPeriodOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [metaLoaded, setMetaLoaded] = useState(false);

  // Goc Nhin list
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const emptyForm = { id:"", title:"", summary:"", content:"", caption:"", thumbnail:"", period_id:"", region_id:"", year:"" };
  const [form, setForm] = useState(emptyForm);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Goc Nhin filters
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [gnPeriodFilter, setGnPeriodFilter] = useState("all");
  const [gnRegionFilter, setGnRegionFilter] = useState("all");
  const [gnYearFilter, setGnYearFilter] = useState("");

  // Moderation
  const [exhibitionPosts, setExhibitionPosts] = useState([]);
  const [loadingMod, setLoadingMod] = useState(false);
  const [modStatus, setModStatus] = useState("pending");
  const [moderatingId, setModeratingId] = useState(null);
  const [viewExhibitionPost, setViewExhibitionPost] = useState(null);
  const [modPeriod, setModPeriod] = useState("all");
  const [modRegion, setModRegion] = useState("all");
  const [modYear, setModYear] = useState("");
  const [modSearch, setModSearch] = useState("");

  // ── Load periods & regions ───────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [pRes, rRes] = await Promise.all([getPeriods(), getRegions()]);

        // Log de debug — xem trong Console trinh duyet
        console.log("[HA4 DEBUG] getPeriods raw response:", JSON.stringify(pRes));
        console.log("[HA4 DEBUG] getRegions raw response:", JSON.stringify(rRes));

        const pArr = extractArray(pRes);
        const rArr = extractArray(rRes);

        console.log("[HA4 DEBUG] period array length:", pArr.length, "| sample:", pArr[0]);
        console.log("[HA4 DEBUG] region array length:", rArr.length, "| sample:", rArr[0]);

        const periods = pArr
          .map((p) => ({ id: extractId(p), name: extractName(p) }))
          .filter((p) => p.id != null && p.name);

        const regions = rArr
          .map((r) => ({ id: extractId(r), name: extractName(r) }))
          .filter((r) => r.id != null && r.name);

        console.log("[HA4 DEBUG] periods parsed:", periods);
        console.log("[HA4 DEBUG] regions parsed:", regions);

        setPeriodOptions(periods);
        setRegionOptions(regions);
      } catch (err) {
        console.error("[HA4 DEBUG] loadMeta FAILED:", err);
      } finally {
        setMetaLoaded(true);
      }
    })();
  }, []);

  // ── Load Goc Nhin ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPosts({ type: "gocnhin" });
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data.map((p) => ({
          id: p.id,
          title: p.caption || p.title || "Khong co tieu de",
          summary: p.summary || "",
          content: p.content || "",
          thumbnail: p.cloudinary_url || "",
          createdAt: p.created_at || null,
          period: p.historical_period?.name || "",
          period_id: p.historical_period?.id || p.period_id || "",
          region: p.region_name || p.region || "",
          region_id: p.region_id || "",
          year: p.year || "",
        })));
      }
    } catch (err) { console.error("Fetch posts:", err); setItems([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  // ── Load Exhibition ──────────────────────────────────────────────────────
  const loadExhibitionPosts = useCallback(async () => {
    setLoadingMod(true);
    try {
      const res = await getPosts();
      if (res?.success && Array.isArray(res.data)) {
        setExhibitionPosts(
          res.data.filter((p) => (p?.type || "") !== "gocnhin").map((p) => ({
            id: p.id,
            caption: p.caption || p.title || "—",
            mediaUrl: p.cloudinary_url || "",
            mediaType: p.type || "image",
            status: p.status || "pending",
            authorName: p.author?.display_name || "An danh",
            period: p.historical_period?.name 
            || p.period_name 
            || (p.historical_period && typeof p.historical_period === 'object' ? p.historical_period.name : p.historical_period) 
            || "—",
    
    region: p.region?.name 
            || p.region_name 
            || (typeof p.region === 'string' ? p.region : null) 
            || "—",
            year: p.year || null,
            createdAt: p.created_at || null,
          }))
        );
      } else { setExhibitionPosts([]); }
    } catch (err) { console.error("Fetch exhibition:", err); setExhibitionPosts([]); }
    finally { setLoadingMod(false); }
  }, []);
  useEffect(() => { loadExhibitionPosts(); }, [loadExhibitionPosts]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("vi-VN", { day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit" }); }
    catch { return "—"; }
  };

  const getPeriodName = (id) => periodOptions.find((p) => String(p.id) === String(id))?.name || "";
  const getRegionName = (id) => regionOptions.find((r) => String(r.id) === String(id))?.name || "";

  // ── Filtered data ────────────────────────────────────────────────────────
  const filteredGN = items.filter((item) => {
    const txt = (item.title+" "+item.summary).toLowerCase().includes(searchTerm.toLowerCase());
    const per = gnPeriodFilter === "all" || item.period === gnPeriodFilter || getPeriodName(item.period_id) === gnPeriodFilter;
    const reg = gnRegionFilter === "all" || item.region === gnRegionFilter || getRegionName(item.region_id) === gnRegionFilter;
    const yr  = !gnYearFilter || String(item.year) === String(gnYearFilter);
    return txt && per && reg && yr;
  });
  const totalPages = Math.ceil(filteredGN.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filteredGN.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const filteredMod = exhibitionPosts.filter((p) => {
    const st  = modStatus === "all" || p.status === modStatus;
    const per = modPeriod === "all" || p.period === modPeriod;
    const reg = modRegion === "all" || p.region === modRegion;
    const yr  = !modYear || String(p.year) === String(modYear);
    const txt = !modSearch || (p.caption+" "+p.authorName).toLowerCase().includes(modSearch.toLowerCase());
    return st && per && reg && yr && txt;
  });

  // ── Form actions ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(emptyForm); setThumbnailPreview("");
    setEditingIndex(null); setEditingId(null); setIsAdding(false);
    const inp = document.getElementById("gn-img"); if (inp) inp.value = "";
  };
  const startAdd = () => { resetForm(); setIsAdding(true); };
  const startEdit = (idx) => {
    const it = items[idx];
    setEditingIndex(idx); setEditingId(it.id);
    setForm({ id:it.id, title:it.title, summary:it.summary, content:it.content, caption:it.title,
              thumbnail:it.thumbnail, period_id:it.period_id||"", region_id:it.region_id||"", year:it.year||"" });
    setThumbnailPreview(it.thumbnail||""); setIsAdding(true);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const ok = await handleUpdate(editingId, form);
      if (ok) { alert("Cap nhat thanh cong!"); await loadData(); resetForm(); }
      else alert("Cap nhat that bai!");
    } else {
      await handlePost(e, form, resetForm, loadData);
    }
  };
  const onDelete = async (idx) => {
    if (!window.confirm("Xac nhan xoa?")) return;
    try {
      if (items[idx]?.id) await deletePost(items[idx].id);
      const next = items.filter((_,i) => i!==idx);
      setItems(next);
      const np = Math.ceil(next.length/ITEMS_PER_PAGE)||1;
      if (currentPage>np) setCurrentPage(np);
      if (editingIndex===idx) resetForm();
      if (viewItem?.id===items[idx]?.id) setViewItem(null);
    } catch { alert("Xoa that bai!"); }
  };
  const removeThumbnail = () => {
    setForm((f)=>({...f,thumbnail:""})); setThumbnailPreview("");
    const inp=document.getElementById("gn-img"); if(inp) inp.value="";
  };
  const onThumb = (e) => {
    const file=e.target.files[0]; if(!file) return;
    if(thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setForm((f)=>({...f,thumbnail:file})); setThumbnailPreview(URL.createObjectURL(file));
  };

  const getPageNums = () => {
    if(totalPages<=8) return Array.from({length:totalPages},(_,i)=>i+1);
    const p=[];
    if(currentPage<=4){for(let i=1;i<=5;i++)p.push(i);p.push("...",totalPages);}
    else if(currentPage>=totalPages-3){p.push(1,"...");for(let i=totalPages-4;i<=totalPages;i++)p.push(i);}
    else{p.push(1,"...",currentPage-1,currentPage,currentPage+1,"...",totalPages);}
    return p;
  };

  // ── Moderation ────────────────────────────────────────────────────────────
  // API: "approved" | "rejected" (NOT "published" | "hidden")
  const applyStatus = (postId, uiStatus) => {
    const apiStatus = uiStatus==="published" ? "approved" : "rejected";
    setModeratingId(postId);
    const post = exhibitionPosts.find(p => p.id === postId) || viewExhibitionPost;
    const data = { status: apiStatus };
    data.period_id = post?.period_id || periodOptions[0]?.id || "";
    data.region_id = post?.region_id || regionOptions[0]?.id || "";
    updateExperiencePostStatus(postId, data)
      .then((res) => {
        if(res?.success===false){ alert(res?.message||"That bai."); return; }
        setExhibitionPosts((prev)=>prev.map((p)=>p.id===postId?{...p,status:uiStatus}:p));
        setViewExhibitionPost((prev)=>prev?.id===postId?{...prev,status:uiStatus}:prev);
      })
      .catch((err)=>alert(err?.message||"Loi!"))
      .finally(()=>setModeratingId(null));
  };

  const pendingCount = exhibitionPosts.filter((p)=>p.status==="pending").length;

  // ── Shared filter row ────────────────────────────────────────────────────
  const FilterSelect = ({ label, value, onChange, options, allLabel }) => (
    <div>
      <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">{label}</label>
      <select value={value} onChange={(e)=>onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
        <option value="all">{allLabel}</option>
        {options.map((o)=><option key={o.id} value={o.name}>{o.name}</option>)}
      </select>
    </div>
  );

  // ── Shared toolbar ────────────────────────────────────────────────────────
  const Toolbar = ({ searchVal, onSearch, count, rightSlot, extraFilters }) => (
    <div className="flex flex-col gap-4 px-6 py-5 border-b border-blue-100 bg-gradient-to-tr from-blue-50 to-green-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input type="text" value={searchVal} onChange={(e)=>onSearch(e.target.value)}
            placeholder="Tim kiem..."
            className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 bg-blue-50 transition"/>
        </div>
        <div className="flex gap-3 items-center">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-extrabold px-4 py-1 rounded-full whitespace-nowrap">{count} bai viet</span>
          {rightSlot}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FilterSelect label="THỜI KỲ" value={extraFilters.period} onChange={extraFilters.onPeriod} options={periodOptions} allLabel="TẤT CẢ THỜI KỲ"/>
        <FilterSelect label="VÙNG" value={extraFilters.region} onChange={extraFilters.onRegion} options={regionOptions} allLabel="TẤT CẢ VÙNG "/>
        <div>
          <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">Năm</label>
          <input type="number" value={extraFilters.year} onChange={(e)=>extraFilters.onYear(e.target.value)}
            className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="VD: 2020"/>
        </div>
        {extraFilters.statusSlot || <div/>}
      </div>
    </div>
  );

  // ── Status badge ─────────────────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const cfg = status==="published" ? { bg:"bg-green-100 border-green-300 text-green-700", dot:"bg-green-500", label:"Đã duyệt " }
              : status==="pending"   ? { bg:"bg-yellow-100 border-yellow-300 text-yellow-800", dot:"bg-yellow-400", label:"Chờ duyệt " }
              :                        { bg:"bg-gray-200 border-gray-400 text-gray-600", dot:"bg-gray-400", label:"Đã ẩn " };
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border ${cfg.bg}`}>
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`}/>
        {cfg.label}
      </span>
    );
  };

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto">

      {/* Tabs */}
      <div className="flex gap-3">
        {[["gocnhin","Góc Nhìn"],["moderation","Duyệt Bài"]].map(([key,label])=>(
          <button key={key} type="button" onClick={()=>setActiveTab(key)}
            className={`relative px-6 py-2 rounded-t-xl font-semibold text-lg shadow transition ${
              activeTab===key ? "bg-gradient-to-r from-blue-500 to-green-400 text-white"
                             : "bg-white text-blue-500 border-b-2 border-blue-300 hover:bg-blue-50"}`}>
            {label}
            {key==="moderation" && pendingCount>0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[10px] font-extrabold rounded-full px-1 shadow-md animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Goc Nhin ────────────────────────────────────────────────── */}
      {activeTab==="gocnhin" && (
        <div className="bg-white rounded-b-2xl shadow-md border border-blue-100 overflow-hidden">
          <Toolbar
            searchVal={searchTerm}
            onSearch={(v)=>{setSearchTerm(v);setCurrentPage(1);}}
            count={filteredGN.length}
            rightSlot={
              <button type="button" onClick={startAdd}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-br from-sky-600 to-emerald-400 text-white shadow hover:shadow-lg transition-all whitespace-nowrap">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                THÊM MỚI
              </button>
            }
            extraFilters={{
              period:gnPeriodFilter, onPeriod:(v)=>{setGnPeriodFilter(v);setCurrentPage(1);},
              region:gnRegionFilter, onRegion:(v)=>{setGnRegionFilter(v);setCurrentPage(1);},
              year:gnYearFilter,     onYear:(v)=>{setGnYearFilter(v);setCurrentPage(1);},
            }}
          />

          {loading ? <Spinner/> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead className="bg-white border-b border-blue-100">
                  <tr>
                    {["STT","Ảnh","TIÊU ĐỀ","MÔ TẢ","THỜI KỲ / VÙNG","NGÀY TẠO",""].map((h,i)=>(
                      <th key={i} className={`py-3 px-4 text-xs font-bold text-blue-600 uppercase ${i===6?"text-right":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.length>0 ? pageData.map((item,idx)=>{
                    const gi=items.findIndex((x)=>x.id===item.id);
                    const pName = item.period || getPeriodName(item.period_id);
                    const rName = item.region || getRegionName(item.region_id);
                    return (
                      <tr key={item.id} className="border-b border-blue-50 hover:bg-blue-50/50 align-top">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">{startIdx+idx+1}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {item.thumbnail
                              ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover"/>
                              : <span className="text-gray-400 text-[10px]">No img</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[240px]">
                          <button className="text-left font-bold text-blue-800 hover:underline line-clamp-2"
                            onClick={()=>setViewItem(item)} type="button">{item.title}</button>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] line-clamp-2">{item.summary||"—"}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="font-medium text-gray-700">{pName||"—"}</div>
                          <div className="text-xs text-gray-400">{rName||"—"}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(item.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button className="w-9 h-9 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition"
                              onClick={()=>setViewItem(item)} type="button">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3.5"/><path d="M2 12C4 7.5 8.5 5 12 5s8 2.5 10 7c-2 4.5-6.5 7-10 7s-8-2.5-10-7z" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center bg-yellow-50 border border-yellow-200 rounded-full hover:bg-yellow-100 transition"
                              onClick={()=>startEdit(gi)} type="button">
                              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536M9 13l6.207-6.207c.39-.39 1.024-.39 1.414 0l2.586 2.586c.39.39.39 1.024 0 1.414L13 17H9v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button className="w-9 h-9 flex items-center justify-center bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition"
                              onClick={()=>onDelete(gi)} type="button">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={7} className="py-10 text-center text-gray-400">Chua co bai viet</td></tr>
                  )}
                </tbody>
              </table>

              {totalPages>1 && (
                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-5 bg-gradient-to-r from-blue-50 to-green-50 border-t border-blue-100 rounded-b-2xl">
                  <div className="text-sm font-semibold text-gray-700 mb-3 md:mb-0">
                    Hien thi <b>{filteredGN.length===0?0:startIdx+1}</b>–<b>{Math.min(startIdx+ITEMS_PER_PAGE,filteredGN.length)}</b> tren <b>{filteredGN.length}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setCurrentPage((p)=>Math.max(p-1,1))} disabled={currentPage===1}
                      className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50" type="button">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {getPageNums().map((pg,i)=>(
                      <button key={i} type="button" onClick={()=>typeof pg==="number"&&setCurrentPage(pg)} disabled={pg==="..."}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                          pg===currentPage?"bg-gradient-to-tr from-blue-600 to-green-500 text-white":
                          pg==="..."?"cursor-default text-gray-400":"hover:bg-blue-100 text-gray-700"}`}>
                        {pg}
                      </button>
                    ))}
                    <button onClick={()=>setCurrentPage((p)=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages}
                      className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50" type="button">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Moderation ──────────────────────────────────────────────── */}
      {activeTab==="moderation" && (
        <div className="bg-white rounded-b-2xl shadow-md border border-blue-100 overflow-hidden">
          <Toolbar
            searchVal={modSearch} onSearch={setModSearch}
            count={filteredMod.length}
            rightSlot={
              <button type="button" onClick={loadExhibitionPosts}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gradient-to-br from-sky-600 to-emerald-400 text-white shadow hover:shadow-lg transition-all whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Tai lai
              </button>
            }
            extraFilters={{
              period:modPeriod, onPeriod:setModPeriod,
              region:modRegion, onRegion:setModRegion,
              year:modYear,     onYear:setModYear,
              statusSlot:(
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-1.5">Trạng Thái</label>
                  <select value={modStatus} onChange={(e)=>setModStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-blue-200 rounded-lg bg-white text-sm font-semibold text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="pending">Chờ duyệt</option>
                    <option value="published">Đã duyệt</option>
                    <option value="hidden">Đã ẩn</option>
                    <option value="all">Tất cả </option>
                  </select>
                </div>
              ),
            }}
          />

          {loadingMod ? <Spinner/> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-white border-b border-blue-100">
                  <tr>
                   
                    {["STT","Media","Nội dung","Tác giả","Thời kỳ / Vùng","Ngày đăng","Trạng thái",""].map((h,i)=>(
                      <th key={i} className={`py-3 px-4 text-xs font-bold text-blue-600 uppercase ${i===7?"text-right":"text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMod.map((post,idx)=>(
                    <tr key={post.id} className="border-b border-blue-50 hover:bg-blue-50/50">
                      <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">{idx+1}</span></td>
                      <td className="py-3 px-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {post.mediaType==="video"
                            ? <video src={post.mediaUrl} className="w-full h-full object-cover" muted playsInline/>
                            : <img src={post.mediaUrl||"https://via.placeholder.com/80"} alt="" className="w-full h-full object-cover"/>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <button type="button" onClick={()=>setViewExhibitionPost(post)}
                          className="text-left hover:underline line-clamp-2 max-w-[360px]">{post.caption}</button>
                      </td>
                      <td className="py-3 px-4 text-sm">{post.authorName}</td>
                      <td className="py-3 px-4 text-sm">
                    <div className="text-gray-700 font-medium">
                      {post.period || getPeriodName(post.period_id) || "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {post.region || getRegionName(post.region_id) || "—"}
                    </div>
                  </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{fmtDate(post.createdAt)}</td>
                      <td className="py-3 px-4"><StatusBadge status={post.status}/></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={()=>applyStatus(post.id,"published")} disabled={moderatingId===post.id}
                            className="px-3 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 text-sm font-bold">Duyệt</button>
                          <button type="button" onClick={()=>applyStatus(post.id,"hidden")} disabled={moderatingId===post.id}
                            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 text-sm font-bold">Ẩn </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMod.length===0 && <div className="py-10 text-center text-gray-400">Không có bài viết nào</div>}
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Them / Sua ─────────────────────────────────────────────── */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-[1.5px]">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[96vh] overflow-y-auto border border-blue-200">
            <div className="flex justify-between items-center p-6 border-b border-blue-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-green-400 bg-clip-text text-transparent">
                {editingIndex!==null ? "Chỉnh sửa góc nhìn" : "Thêm mới góc nhìn"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition" type="button">
                <X className="w-7 h-7"/>
              </button>
            </div>

            <form className="p-6 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} autoFocus
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 bg-blue-50 font-semibold"
                  placeholder="Nhap tieu de"/>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Mô tả ngắn</label>
                <input type="text" value={form.summary} onChange={(e)=>setForm({...form,summary:e.target.value})}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 bg-blue-50 font-semibold"
                  placeholder="Tom tat noi dung"/>
              </div>

              {/* Thoi ky / Vung / Nam */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2">Thời kỳ</label>
                  <select value={form.period_id} onChange={(e)=>setForm({...form,period_id:e.target.value})}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">--  Chọn thời kỳ --</option>
                    {!metaLoaded
                      ? <option disabled>Đang tải ...</option>
                      : periodOptions.length===0
                        ? <option disabled>Không có dữ liệu (xem console)</option>
                        : periodOptions.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2">Vùng</label>
                  <select value={form.region_id} onChange={(e)=>setForm({...form,region_id:e.target.value})}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- Chọn vùng --</option>
                    {!metaLoaded
                      ? <option disabled>Đang tảii...</option>
                      : regionOptions.length===0
                        ? <option disabled>Không có dữ liệu (xem console)</option>
                        : regionOptions.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-700 mb-2">Năm</label>
                  <input type="number" value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="VD: 2020"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Nội dung</label>
                <CKEditorField value={form.content} onChange={(c)=>setForm({...form,content:c})} placeholder="Nhap noi dung..."/>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Ảnh đại diện<span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50">
                  <input type="file" accept="image/*" onChange={onThumb} className="hidden" id="gn-img"/>
                  <label htmlFor="gn-img" className="cursor-pointer flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">{form.thumbnail?"đổi ảnh":"chọn ảnh"}</span>
                    <span className="text-xs text-gray-500">JPG, PNG, GIF (toi da 5MB)</span>
                  </label>
                </div>
                {form.thumbnail && (
                  <div className="relative w-fit mt-3 mx-auto">
                    <img src={thumbnailPreview||(typeof form.thumbnail==="string"?form.thumbnail:"")} alt="preview"
                      className="max-w-xs max-h-44 object-contain rounded-xl border border-blue-100 shadow-lg bg-white"/>
                    <button type="button" onClick={removeThumbnail} tabIndex={-1}
                      className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full p-2 shadow">
                      <X/>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button type="submit"
                  className="flex items-center gap-2 bg-gradient-to-tr from-blue-600 to-green-400 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl transition">
                  {editingIndex!==null ? "Lưu thay đổi" : "Tạo mới"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 rounded-2xl font-semibold border border-blue-300 bg-white text-blue-700 hover:bg-blue-50">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Xem Goc Nhin ───────────────────────────────────────────── */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/30 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-blue-200 flex flex-col max-h-[96vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-blue-50 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-extrabold text-blue-700 line-clamp-2">{viewItem.title}</h3>
              <button className="bg-red-100 text-red-500 hover:bg-red-200 p-2 rounded-full transition ml-4 flex-shrink-0"
                onClick={()=>setViewItem(null)} type="button"><X className="w-6 h-6"/></button>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col gap-3">
              {viewItem.thumbnail && <img src={viewItem.thumbnail} alt="" className="w-full max-h-64 object-cover rounded-xl border border-blue-100 mb-2"/>}
              {viewItem.summary && <div className="text-blue-800 text-base font-semibold">{viewItem.summary}</div>}
              <div className="flex flex-wrap gap-2">
                {(viewItem.period||getPeriodName(viewItem.period_id)) && <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">{viewItem.period||getPeriodName(viewItem.period_id)}</span>}
                {(viewItem.region||getRegionName(viewItem.region_id)) && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{viewItem.region||getRegionName(viewItem.region_id)}</span>}
                {viewItem.year && <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">{viewItem.year}</span>}
              </div>
              {viewItem.content && <div className="ck-content prose max-w-none text-gray-700" dangerouslySetInnerHTML={{__html:viewItem.content}}/>}
              <div className="text-xs text-gray-500 mt-2">Ngay tao: {fmtDate(viewItem.createdAt)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Xem Trien lam ─────────────────────────────────────────── */}
      {viewExhibitionPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-blue-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-blue-800">Chi tiet bai Trien lam</h3>
              <button type="button" onClick={()=>setViewExhibitionPost(null)} className="p-2 rounded-lg hover:bg-blue-50">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {viewExhibitionPost.mediaType==="video"
                ? <video src={viewExhibitionPost.mediaUrl} controls className="w-full rounded-lg bg-black max-h-80"/>
                : <img src={viewExhibitionPost.mediaUrl} alt="" className="w-full rounded-lg object-contain max-h-80 bg-gray-100"/>}
              <p className="text-gray-800">{viewExhibitionPost.caption||"không có nội dung."}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Tac gia: <b>{viewExhibitionPost.authorName}</b></span>
                <span>Thoi ky: <b>{viewExhibitionPost.period}</b></span>
                <span>Vung: <b>{viewExhibitionPost.region}</b></span>
                {viewExhibitionPost.year && <span>Nam: <b>{viewExhibitionPost.year}</b></span>}
                <span>Loai: <b>{viewExhibitionPost.mediaType==="video"?"Video":"Hình ảnh"}</b></span>
                <span>Dang luc: {fmtDate(viewExhibitionPost.createdAt)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={()=>applyStatus(viewExhibitionPost.id,"published")} disabled={moderatingId===viewExhibitionPost.id}
                  className="px-4 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 font-bold">Duyệt </button>
                <button type="button" onClick={()=>applyStatus(viewExhibitionPost.id,"hidden")} disabled={moderatingId===viewExhibitionPost.id}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 font-bold">Ẩn </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminGocnhin;