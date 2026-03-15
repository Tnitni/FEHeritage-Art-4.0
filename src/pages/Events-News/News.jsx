import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNews } from '../../services/api'
import { mapNewsFromApi } from '../../utils/eventsNewsMappers'

const News = () => {
  const [query, setQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getNews({ limit: 50 })
      .then((res) => {
        if (cancelled) return
        const data = Array.isArray(res?.data) ? res.data : []
        setNewsList(data.map(mapNewsFromApi).filter(Boolean))
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Tải danh sách tin tức thất bại')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filteredNews = useMemo(() => {
    if (!query.trim()) return newsList
    const lowercaseQuery = query.toLowerCase()
    return newsList.filter((article) => {
      const fields = [article.title, article.description, article.content, article.category, article.tag]
      return fields.some((field) => String(field || '').toLowerCase().includes(lowercaseQuery))
    })
  }, [query, newsList])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6eadf] flex items-center justify-center">
        <div className="text-gray-600 font-medium">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6eadf] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6eadf]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Tin Tức</h1>
            <p className="text-gray-600">Tìm kiếm và theo dõi những câu chuyện di sản mới nhất từ khắp ba miền đất nước</p>
          </div>
          
          {/* Search Button/Bar - Absolute positioned */}
          <div className="absolute top-0 right-0">
            {!isSearchOpen ? (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-100 hover:border-blue-300"
                title="Tìm kiếm tin tức"
              >
                <svg className="h-5 w-5 text-blue-600 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            ) : (
              <div className="w-80 animate-in slide-in-from-right-3 fade-in duration-300">
                <div className="rounded-2xl bg-white p-4 shadow-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      id="news-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Tìm kiếm..."
                      autoFocus
                      className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                    />
                    <button
                      onClick={() => {
                        setIsSearchOpen(false)
                        setQuery('')
                      }}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Đóng"
                    >
                      <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-xs">
                      {filteredNews.length} kết quả
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* News Grid */}
        <div className="mt-8">
          {filteredNews.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-lg">
              <p className="text-gray-600">Không tìm thấy tin tức phù hợp với từ khóa. Vui lòng thử lại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {filteredNews.map((article, index) => {
                const categories = ['Công nghệ', 'Du lịch', 'Kinh doanh', 'Văn hóa', 'Giáo dục']
                const category = article.category || categories[index % categories.length]
                
                return (
                  <Link
                    key={article.id}
                    to={`/news/${article.id}`}
                    className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-200">
                      <img
                        src={article.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=450&fit=crop'}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                        {category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-blue-600 leading-tight line-clamp-2 min-h-[3.5rem] transition-colors">
                        {article.title}
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">{article.date}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                          Đọc thêm
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default News
