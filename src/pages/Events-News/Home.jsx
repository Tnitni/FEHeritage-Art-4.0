import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { speakers } from '../../data/mockData'
import { getEvents, getNews } from '../../services/api'
import { mapEventFromApi, mapNewsFromApi } from '../../utils/eventsNewsMappers'

const Home = () => {
  const [eventsList, setEventsList] = useState([])
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [eventsRes, newsRes] = await Promise.all([
          getEvents().catch((e) => ({ success: false, data: [] })),
          getNews({ limit: 20 }).catch((e) => ({ success: false, data: [] })),
        ])
        if (cancelled) return
        const eventsData = Array.isArray(eventsRes?.data) ? eventsRes.data : []
        const newsData = Array.isArray(newsRes?.data) ? newsRes.data : []
        setEventsList(eventsData.map(mapEventFromApi).filter(Boolean))
        setNewsList(newsData.map(mapNewsFromApi).filter(Boolean))
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Tải dữ liệu thất bại')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const allContent = useMemo(() => {
    const newsWithType = newsList.map(item => ({ ...item, type: 'news' }))
    const eventsWithType = eventsList.map(item => ({ ...item, type: 'event' }))
    return [...newsWithType, ...eventsWithType].sort((a, b) => {
      const dateA = a.created_date || a.start_date || a.date || a.id
      const dateB = b.created_date || b.start_date || b.date || b.id
      return String(dateB).localeCompare(String(dateA))
    })
  }, [eventsList, newsList])

  const sidebarNews = useMemo(() => allContent.slice(0, 5), [allContent])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredArticle, setHoveredArticle] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  const defaultFeatured = sidebarNews[currentIndex] || sidebarNews[0]
  const featuredArticle = hoveredArticle || defaultFeatured
  const otherNews = useMemo(() => newsList.slice(0, 3), [newsList])
  const hasContent = allContent.length > 0
  const upcomingEvents = useMemo(() => eventsList.slice(0, 3), [eventsList])
  const featuredSpeakers = useMemo(() => speakers.slice(0, 4), [])

  // Auto-rotate through sidebar items
  useEffect(() => {
    if (isPaused || hoveredArticle) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sidebarNews.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [isPaused, hoveredArticle, sidebarNews.length])

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
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6eadf]">
      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Small News Items */}
          <aside className="lg:col-span-3">
            <div className="space-y-3">
              {sidebarNews.map((article, index) => {
                const isActive = !hoveredArticle && index === currentIndex
                
                return (
                  <Link
                    key={article.id}
                    to={`/${article.type === 'event' ? 'events' : 'news'}/${article.id}`}
                    className={`group flex gap-3 rounded-xl bg-white p-3 shadow-sm transition-all duration-300 border-2 ${
                      isActive 
                        ? 'border-amber-400 shadow-lg scale-[1.02]' 
                        : 'border-transparent hover:shadow-md hover:border-gray-200'
                    }`}
                    onMouseEnter={() => {
                      setHoveredArticle(article)
                      setIsPaused(true)
                    }}
                    onMouseLeave={() => {
                      setHoveredArticle(null)
                      setIsPaused(false)
                    }}
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={article.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=200&h=200&fit=crop'}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block mb-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        article.type === 'event' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {article.type === 'event' ? 'Sự kiện' : 'Tin tức'}
                      </span>
                      <h3 className={`line-clamp-2 text-sm font-bold mb-1 transition-colors leading-tight ${
                        isActive ? 'text-amber-600' : 'text-gray-900 group-hover:text-blue-600'
                      }`}>
                        {article.title}
                      </h3>
                      <p className="line-clamp-1 text-xs text-gray-500 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* Main Featured Article */}
          <main className="lg:col-span-9">
            <article className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 h-full">
              <div className="relative aspect-[16/7] overflow-hidden bg-gray-200">
                <img
                  src={featuredArticle?.imageUrl || 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=600&fit=crop'}
                  alt={featuredArticle?.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold shadow-lg bg-blue-600 text-white">
                    {featuredArticle?.type === 'event' ? 'Sự kiện' : 'Tin tức'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h1 className="mb-2 text-2xl font-bold text-gray-900 transition-all duration-300 leading-tight line-clamp-2 hover:text-blue-600">
                  {featuredArticle?.title ?? 'Tin tức & Sự kiện'}
                </h1>
                <p className="mb-4 text-sm text-gray-600 leading-relaxed transition-all duration-300 line-clamp-2">
                  {featuredArticle?.description ?? ''}
                </p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{featuredArticle?.date ?? ''}</span>
                    <span>•</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{featuredArticle?.author || featuredArticle?.location || 'Chính thức'}</span>
                  </div>
                  {featuredArticle && (
                  <Link
                    to={`/${featuredArticle.type === 'event' ? 'events' : 'news'}/${featuredArticle.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:scale-105"
                  >
                    Xem chi tiết
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  )}
                </div>
              </div>
            </article>
          </main>
        </div>

        {/* Other News Section */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Các Tin Tức Khác</h2>
              <p className="text-sm text-gray-500">Khám phá thêm nhiều tin tức thú vị</p>
            </div>
            <Link
              to="/news"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Xem tất cả
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {otherNews.map((article, index) => {
              const categories = ['Công nghệ', 'Du lịch', 'Kinh doanh', 'Văn hóa', 'Giáo dục']
              const category = article.category || categories[index % categories.length]
              
              return (
                <Link
                  key={article.id}
                  to={`/news/${article.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={article.imageUrl}
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
        </section>

        {/* Upcoming Events Section */}
        <section className="mt-16 mb-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Sự Kiện Sắp Tới</h2>
              <p className="text-sm text-gray-500">Đừng bỏ lỡ những sự kiện đặc sắc</p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Xem tất cả
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                    Sự kiện
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="mb-3 text-lg font-bold text-gray-900 group-hover:text-blue-600 leading-tight line-clamp-2 min-h-[3.5rem] transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{event.location || 'TP. Hồ Chí Minh'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{event.date || '15/11 - 17/11/2024'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-medium">Đang mở đăng ký</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                      Xem chi tiết
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Speakers Section */}
        <section className="mt-16 mb-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Diễn Giả Nổi Bật</h2>
              <p className="text-sm text-gray-500">Gặp gỡ những chuyên gia hàng đầu</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {featuredSpeakers.map((speaker) => (
              <div
                key={speaker.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={speaker.imageUrl}
                    alt={speaker.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-indigo-600 leading-tight transition-colors">
                    {speaker.name}
                  </h3>
                  <p className="mb-3 text-sm text-indigo-600 font-semibold">
                    {speaker.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {speaker.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {speaker.expertise.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
