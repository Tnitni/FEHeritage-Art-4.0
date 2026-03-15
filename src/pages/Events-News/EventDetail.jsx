import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getEventById as fetchEventById, getEvents } from '../../services/api'
import { mapEventFromApi } from '../../utils/eventsNewsMappers'

const EventDetail = () => {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [otherEvents, setOtherEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    Promise.all([
      fetchEventById(eventId),
      getEvents(),
    ])
      .then(([detailRes, listRes]) => {
        if (cancelled) return
        const raw = detailRes?.data ?? detailRes
        setEvent(raw ? mapEventFromApi(raw) : null)
        const list = Array.isArray(listRes?.data) ? listRes.data : []
        const others = list
          .map(mapEventFromApi)
          .filter((e) => e && e.id !== eventId)
          .slice(0, 3)
        setOtherEvents(others)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Tải sự kiện thất bại')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [eventId])

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6eadf] flex items-center justify-center">
        <div className="text-gray-600 font-medium">Đang tải...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#f6eadf] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl shadow-lg p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Lỗi 404</p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Không tìm thấy sự kiện
          </h1>
          <p className="mt-4 text-gray-600">
            {error || 'Sự kiện bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
          </p>
          <Link
            to="/events"
            className="mt-8 inline-block rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Trở về danh sách sự kiện
          </Link>
        </div>
      </div>
    )
  }

return (
<div className="min-h-screen bg-[#f6eadf]">
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
    {/* Breadcrumb */}
    <div className="mb-6">
        <Link
        to="/events"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
            <span className="text-gray-500">Trang chủ</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600">Sự kiện</span>
        </Link>
    </div>

    {/* Main Grid Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Event Detail */}
        <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Image */}
        {(event.imageUrl || event.thumbnail_url) && (
        <div className="relative h-64 sm:h-80 overflow-hidden">
            <img 
            src={event.imageUrl || event.thumbnail_url} 
            alt={event.title} 
            className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-10">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {event.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm pb-6 mb-6 border-b border-gray-200">
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                </svg>
                {event.date}
            </span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-gray-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
            {event.location}
            </span>
            {event.time && (
            <>
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1.5 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                {event.time}
                </span>
            </>
            )}
        </div>

        {/* Introduction */}
        {event.shortIntro && (
            <div className="mb-8">
            <p className="text-lg text-gray-600 leading-relaxed italic font-medium">{event.shortIntro}</p>
            </div>
        )}

        {/* Main Description */}
        <div className="mb-10">
            <p className="text-base text-gray-800 leading-relaxed">
            {event.description}
            </p>
        </div>

        {/* Theme Section */}
        {event.theme && (
            <div className="mb-10">
            <h3 className="text-lg font-bold text-blue-700 mb-3 uppercase tracking-wide">Chủ đề sự kiện</h3>
            <p className="text-base text-gray-800 leading-relaxed">{event.theme}</p>
            </div>
        )}

        {/* Timeline Section */}
        {event.timeline && event.timeline.length > 0 && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-blue-700 mb-4 uppercase tracking-wide">Lịch trình sự kiện</h2>
            <div className="space-y-2.5">
                {event.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                    <span className="text-blue-600 font-bold min-w-[70px] text-sm">{item.time}</span>
                    <span className="text-gray-800 text-base">{item.label}</span>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Rules Section */}
        {event.rules && event.rules.length > 0 && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-blue-700 mb-4 uppercase tracking-wide">Quy định & Điều kiện tham gia</h2>
            <div className="space-y-4">
                {event.rules.map((rule, index) => (
                <div key={index}>
                    <p className="text-base text-gray-900 font-bold mb-2">
                    {index + 1}. {rule.title}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed ml-6">{rule.content}</p>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Requirements Section */}
        {event.requirements && event.requirements.length > 0 && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-blue-700 mb-4 uppercase tracking-wide">Thể lệ & Yêu cầu</h2>
            <div className="space-y-4">
                {event.requirements.map((req, index) => (
                <div key={index}>
                    <p className="text-base text-gray-900 font-bold mb-2">
                    {index + 1}. {req.title}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed ml-6">{req.content}</p>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Criteria Section */}
        {event.criteria && event.criteria.length > 0 && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-blue-700 mb-4 uppercase tracking-wide">Tiêu chí chấm điểm</h2>
            <div className="space-y-4">
                {event.criteria.map((criterion, index) => (
                <div key={index} className="flex gap-4">
                    <span className="text-blue-600 font-bold min-w-[60px] text-base">{criterion.percent}</span>
                    <div className="flex-1">
                    <p className="text-base text-gray-900 font-bold mb-1">{criterion.title}</p>
                    <p className="text-base text-gray-700 leading-relaxed">{criterion.description}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Judges & Prizes Section */}
        {(event.judges || (event.prizes && event.prizes.length > 0)) && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-blue-700 mb-4 uppercase tracking-wide">Ban Giám Khảo & Cơ cấu giải thưởng</h2>
            
            {event.judges && (
                <p className="text-base text-gray-800 leading-relaxed mb-6">{event.judges}</p>
            )}
            
            {event.prizes && event.prizes.length > 0 && (
                <div className="space-y-3">
                <p className="text-base text-gray-900 font-bold mb-3">Cơ cấu giải thưởng:</p>
                {event.prizes.map((prize, index) => (
                    <div key={index} className="flex gap-4 items-start ml-6">
                    <span className="text-blue-600 font-bold text-base">•</span>
                    <div className="flex-1">
                        <p className="text-base text-gray-900 font-bold">
                        {prize.name}: <span className="text-blue-600">{prize.value}</span> + <span className="text-base text-gray-700">{prize.bonus}</span>
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}

        {/* FAQ Section */}
        {event.faq && event.faq.length > 0 && (
            <div className="mb-10">
            <h2 className="text-lg font-bold text-purple-700 mb-4 uppercase tracking-wide">Câu hỏi thường gặp (FAQ)</h2>
            <div className="space-y-3">
                {event.faq.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between gap-4 p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                    <p className="text-base text-gray-900 font-bold flex-1">
                        Q{index + 1}: {item.question}
                    </p>
                    <svg
                        className={`h-5 w-5 text-purple-600 transition-transform duration-200 flex-shrink-0 ${
                        openFaqIndex === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </button>
                    <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    >
                    <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-base text-gray-700 leading-relaxed">
                        <span className="font-semibold text-purple-600">Trả lời:</span> {item.answer}
                        </p>
                    </div>
                    </div>
                </div>
                ))}
            </div>
            </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
            <div className="mb-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                    </svg>
                    {tag}
                </span>
                ))}
            </div>
            </div>
        )}

        {/* CTA Section */}
        <div className="pt-8 border-t-2 border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
            <Link
                to={`/events/${event.id}/register`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-base font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>Đăng ký tham gia ngay</span>
            </Link>
            <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-500 rounded-xl text-base font-semibold text-gray-700 hover:text-blue-600 transition-all"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Xem sự kiện khác</span>
            </Link>
            </div>
        </div>
        </div>
        </div>
        </div>

        {/* Sidebar - Suggestions */}
        <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-24 space-y-6">
        {/* Other Events */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Sự kiện khác
            </h3>
            <div className="space-y-4">
            {otherEvents.map((evt) => (
                <Link
                key={evt.id}
                to={`/events/${evt.id}`}
                className="group block"
                >
                <div className="flex gap-3">
                    {evt.imageUrl && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                        <img 
                        src={evt.imageUrl} 
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    )}
                    <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {evt.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                        </svg>
                        <span>{evt.date}</span>
                    </div>
                    </div>
                </div>
                </Link>
            ))}
            </div>
            <Link
            to="/events"
            className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
            Xem tất cả sự kiện →
            </Link>
        </div>
        </div>
        </aside>
    </div>
    </div>
</div>
)
}

export default EventDetail
