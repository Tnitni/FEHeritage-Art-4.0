import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getNewsById as fetchNewsById, getNews } from '../../services/api'
import { mapNewsFromApi } from '../../utils/eventsNewsMappers'

const NewsDetail = () => {
  const { newsId } = useParams()
  const [article, setArticle] = useState(null)
  const [otherNews, setOtherNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!newsId) return
    let cancelled = false
    Promise.all([
      fetchNewsById(newsId),
      getNews({ limit: 20 }),
    ])
      .then(([detailRes, listRes]) => {
        if (cancelled) return
        const raw = detailRes?.data ?? detailRes
        setArticle(raw ? mapNewsFromApi(raw) : null)
        const list = Array.isArray(listRes?.data) ? listRes.data : []
        const others = list
          .map(mapNewsFromApi)
          .filter((n) => n && n.id !== newsId)
          .slice(0, 3)
        setOtherNews(others)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Tải tin tức thất bại')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [newsId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6eadf] flex items-center justify-center">
        <div className="text-gray-600 font-medium">Đang tải...</div>
      </div>
    )
  }

  if (error || !article) {
    return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:px-6">
      <div className="rounded-[40px] bg-[#f6eadf] p-10 text-center shadow-[0_32px_60px_rgba(83,48,33,0.12)] sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-brown-400">Lỗi 404</p>
        <h1 className="mt-4 text-3xl font-serif font-semibold text-brand-brown-900 sm:text-4xl">
          Không tìm thấy bài viết
        </h1>
        <p className="mt-4 text-sm text-brand-brown-600 sm:text-base">
          {error || 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
        </p>
        <Link
          to="/news"
          className="mt-8 inline-block rounded-full bg-gradient-to-br from-[#3b2412] to-[#2e1e10] px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(83,48,33,0.3)] transition hover:scale-105 hover:shadow-[0_18px_40px_rgba(83,48,33,0.4)]"
        >
          Trở về tin tức
        </Link>
      </div>
    </div>
    )
  }

return (
<div className="min-h-screen bg-[#f6eadf]">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
    

    {/* Main Grid Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Article Detail */}
        <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        {/* Breadcrumb */}
        <div className="mb-6">
            <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
                <span className="text-gray-500">Trang chủ</span>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600">Tin tức</span>
            </Link>
        </div>
        {/* Article Header */}
        <div className="mb-8">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {article.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm pb-5 mb-5 border-b border-gray-200">
                <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-blue-600 font-semibold">{article.category || 'Nổi bật'}</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1.5 text-gray-600">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {article.date}
                </span>
            </div>
        </div>

        {/* Article Content */}
        <div className="mb-10">
        {/* Lead Paragraph */}
        <p className="text-gray-800 leading-relaxed mb-3">
            {article.description}
        </p>

        {/* Main Image */}
        {article.imageUrl && (
            <figure className="mb-8">
            <div className="overflow-hidden rounded-xl">
                <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                />
            </div>
            <figcaption className="text-center text-sm text-gray-500 italic mt-3">
                Hình ảnh minh họa
            </figcaption>
            </figure>
        )}

        {/* Article Content */}
        {article.content && (
            <div className="prose prose-lg max-w-none">
            <div
                className="text-base leading-relaxed text-gray-700 space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />
            </div>
        )}
        </div>

        {/* Footer Section */}
        <div className="pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Social Share */}
            <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-gray-700">Chia sẻ bài viết</span>
            <div className="flex items-center gap-2">
                <button 
                className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                aria-label="Facebook"
                >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
                </button>
                <button 
                className="p-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-500 transition-colors"
                aria-label="Twitter"
                >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
                </button>
                <button 
                className="p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Copy Link"
                >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                </button>
            </div>
            </div>
            
            {/* Back Button */}
            <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg"
            >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Trở về danh sách</span>
            </Link>
        </div>
        </div>
        </div>
        </div>

        {/* Sidebar - Suggestions */}
        <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-6">
        {/* Other News */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Tin tức khác
            </h3>
            <div className="space-y-4">
            {otherNews.map((article) => (
                <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="group block"
                >
                <div className="flex gap-3">
                    {article.imageUrl && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    )}
                    <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                        </svg>
                        <span>{article.date}</span>
                    </div>
                    </div>
                </div>
                </Link>
            ))}
            </div>
            <Link
            to="/news"
            className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
            Xem tất cả tin tức →
            </Link>
        </div>
        </div>
        </aside>
    </div>
    </div>
</div>
)
}

export default NewsDetail
