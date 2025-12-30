import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../../context/CartContext";
import { useUser } from "../../../context/UserContext";
import logo from "../../../assets/logo.png";
import { hasRole, isAdmin } from "../../../utils/apiHelpers";

const NavBar = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, isLoggedIn, logout } = useUser();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  // Kiểm tra xem user có phải admin không
  const userIsAdmin = user ? isAdmin(user) : false;

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const menuItems = useMemo(
    () => [
      { label: "Trang chủ", link: "/" },
      { label: "Giới thiệu", link: "/gioithieu" },
      {
        label: "Khám phá",
        submenu: [
          { label: "Trải nghiệm", link: "/trainghiem" },
          { label: "Tạo tranh", link: "/taotranh" },
          { label: "Công nghệ AI", link: "/congngheai" },
        ],
      },
      {
        label: "Cộng đồng",
        submenu: [
          { label: "Tin tức và Sự kiện", link: "/events-news" },
          { label: "Văn hóa - Lịch sử", link: "/vanhoalichsu" },
          { label: "Phân tích & Góc nhìn", link: "/phantichgocnhin" },
          { label: "Forum", link: "/forum" },
        ],
      },
      // {
      //   label: "Giáo dục",
      //   submenu: [
      //     { label: "Trang chủ Giáo dục", link: "/giaoduc" },
      //     { label: "Tài liệu & Bài giảng", link: "/tai-lieu-bai-giang" },
      //     // { label: 'Bài học minh họa', link: '/bai-giang-minh-hoa' },
      //     { label: "Trò chơi tương tác", link: "/virtual-chronicle" },
      //     { label: "---", separator: true },
      //     {
      //       label: "🏫 LMS - Giáo viên",
      //       link: "/lms/teacher/dashboard?teacherId=1",
      //     },
      //     {
      //       label: "🎓 LMS - Học sinh",
      //       link: "/lms/student/dashboard?studentId=10",
      //     },
      //   ],
      // },
      {
        label: "Cửa hàng",
        submenu: [
          { label: "Mua tranh in", link: "/mua-tranh-in" },
          { label: "Donate / Ủng hộ", link: "/donat-ung-ho" },
          { label: "Thành viên VIP", link: "/thanh-vien-vip" },
        ],
      },
    ],
    []
  );

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMenuEnter = useCallback(
    (index) => {
      clearExistingTimeout();
      // if (menuItems[index].submenu) {
      //   setOpenSubmenu(index)
      // }

      // Cho phép mở submenu cho cả menu items và user menu (index === menuItems.length)
      if (
        (menuItems[index] && menuItems[index].submenu) ||
        index === menuItems.length
      ) {
        setOpenSubmenu(index);
      }
    },
    [menuItems, clearExistingTimeout]
  );

  const handleMenuLeave = useCallback(() => {
    clearExistingTimeout();
    timeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 350);
  }, [clearExistingTimeout]);

  const handleSubmenuEnter = useCallback(() => {
    clearExistingTimeout();
  }, [clearExistingTimeout]);

  const handleSubmenuLeave = useCallback(() => {
    clearExistingTimeout();
    timeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 250);
  }, [clearExistingTimeout]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#3b2412] via-[#42281a] to-[#4a2d18] shadow-xl backdrop-blur-md border-b border-[#5a3822]/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex-shrink-0 group transition-transform duration-300 ease-out hover:scale-105"
            aria-label="Trang chủ"
          >
            <img
              src={logo}
              alt="MT4 Logo"
              className="h-11 w-auto drop-shadow-[0_2px_8px_rgba(255,213,79,0.3)] group-hover:drop-shadow-[0_4px_12px_rgba(255,213,79,0.5)] transition-all duration-300"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center" role="navigation">
            <ul className="flex items-center gap-1">
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  className="relative"
                  onMouseEnter={() => handleMenuEnter(index)}
                  onMouseLeave={handleMenuLeave}
                >
                  {item.submenu ? (
                    <div className="relative">
                      {/* Dropdown Button */}
                      <button
                        type="button"
                        className={`
                          group flex items-center gap-2 
                          px-4 py-2 rounded-lg font-semibold text-[0.938rem]
                          transition-all duration-200 ease-out
                          ${openSubmenu === index
                            ? "bg-[#4a2d18] text-[#ffd54f] shadow-inner"
                            : "text-[#fff1c7] hover:text-[#ffd54f] hover:bg-[#4a2d18]/50"
                          }
                        `}
                        aria-expanded={openSubmenu === index}
                        aria-haspopup="true"
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-300 ease-out ${openSubmenu === index ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className={`
                          absolute top-full left-0 mt-2 min-w-[240px]
                          transition-all duration-200 ease-out origin-top
                          ${openSubmenu === index
                            ? "opacity-100 visible scale-100 translate-y-0"
                            : "opacity-0 invisible scale-95 -translate-y-2 pointer-events-none"
                          }
                        `}
                        onMouseEnter={handleSubmenuEnter}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        <div className="bg-[#2a1a0f] rounded-xl shadow-2xl border border-[#4a2d18]/50 overflow-hidden backdrop-blur-sm">
                          <ul className="py-2">
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                {subItem.separator ? (
                                  <div className="mx-2 my-2 border-t border-[#4a2d18]/50"></div>
                                ) : (
                                  <Link
                                    to={subItem.link}
                                    className="
                                      group/item flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5
                                      text-[#e8dcc4] hover:text-[#ffd54f] text-[0.938rem] font-medium
                                      rounded-lg transition-all duration-200
                                      hover:bg-[#3a2515] hover:pl-5
                                      relative overflow-hidden
                                    "
                                  >
                                    {/* Left accent bar */}
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-[#ffd54f] to-[#ffb84d] rounded-r-full transition-all duration-300 group-hover/item:h-[65%]" />

                                    {/* Arrow icon */}
                                    <svg
                                      className="w-4 h-4 flex-shrink-0 opacity-0 -translate-x-2 transition-all duration-300 group-hover/item:opacity-70 group-hover/item:translate-x-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>

                                    <span className="relative z-10 transition-transform duration-200 group-hover/item:translate-x-0.5">
                                      {subItem.label}
                                    </span>

                                    {/* Shine effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd54f]/5 to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700" />
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.link}
                      className="
                        group/link relative flex items-center px-4 py-2
                        text-[#fff1c7] hover:text-[#ffd54f] font-semibold text-[0.938rem]
                        rounded-lg transition-all duration-200
                        hover:bg-[#4a2d18]/50
                      "
                    >
                      <span className="relative z-10">{item.label}</span>

                      {/* Bottom accent line */}
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-transparent via-[#ffd54f] to-transparent rounded-full transition-all duration-300 group-hover/link:w-3/4" />
                    </Link>
                  )}
                </li>
              ))}

              {/* Auth Buttons - Hiển thị khi chưa đăng nhập */}
              {!isLoggedIn && (
                <>
                  <li className="ml-2 pl-2 border-l border-[#5a3822]/50">
                    <Link
                      to="/register"
                      className="
                        group/signup relative flex items-center px-4 py-2
                        text-[#ffd54f] font-semibold text-[0.938rem]
                        rounded-lg transition-all duration-200
                        border-2 border-[#ffd54f]/40 hover:border-[#ffd54f]
                        hover:bg-[#ffd54f]/10
                      "
                    >
                      <svg
                        className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/signup:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      <span className="relative z-10">Đăng ký</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/login"
                      className="
                        group/login relative flex items-center px-5 py-2
                        text-[#3b2412] bg-gradient-to-r from-[#ffd54f] to-[#ffb84d]
                        hover:from-[#ffe082] hover:to-[#ffc961]
                        font-bold text-[0.938rem]
                        rounded-lg transition-all duration-200
                        shadow-md hover:shadow-lg hover:shadow-[#ffd54f]/30
                        hover:scale-105
                      "
                    >
                      <svg
                        className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/login:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="relative z-10">Đăng nhập</span>
                    </Link>
                  </li>
                </>
              )}

              {/* User Menu - Hiển thị khi đã đăng nhập */}
              {isLoggedIn && (
                <li
                  className="ml-2 pl-2 border-l border-[#5a3822]/50 relative"
                  onMouseEnter={() => handleMenuEnter(menuItems.length)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    type="button"
                    className={`
                      group flex items-center gap-2 
                      px-4 py-2 rounded-lg font-semibold text-[0.938rem]
                      transition-all duration-200 ease-out
                      ${openSubmenu === menuItems.length
                        ? "bg-[#4a2d18] text-[#ffd54f] shadow-inner"
                        : "text-[#fff1c7] hover:text-[#ffd54f] hover:bg-[#4a2d18]/50"
                      }
                    `}
                    aria-expanded={openSubmenu === menuItems.length}
                    aria-haspopup="true"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#ffd54f]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd54f] to-[#ffb84d] flex items-center justify-center text-[#3b2412] font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span>{user?.name || 'Tài khoản'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ease-out ${openSubmenu === menuItems.length ? "rotate-180" : ""
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  <div
                    className={`
                      absolute top-full right-0 mt-2 min-w-[240px]
                      transition-all duration-200 ease-out origin-top-right
                      ${openSubmenu === menuItems.length
                        ? "opacity-100 visible scale-100 translate-y-0"
                        : "opacity-0 invisible scale-95 -translate-y-2 pointer-events-none"
                      }
                    `}
                    onMouseEnter={handleSubmenuEnter}
                    onMouseLeave={handleSubmenuLeave}
                  >
                    <div className="bg-[#2a1a0f] rounded-xl shadow-2xl border border-[#4a2d18]/50 overflow-hidden backdrop-blur-sm">
                      <ul className="py-2">
                        {[
                          {
                            label: "Thông tin cá nhân",
                            link: "/info",
                            icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                          },

                          {
                            label: "Bạn bè",
                            link: "/friends",
                            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                          },
                          {
                            label: "Cài đặt",
                            link: "/settings",
                            icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                          },
                          {
                            label: "Hướng dẫn",
                            link: "/guides",
                            icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                          },
                          {
                            label: "Liên hệ",
                            link: "/contact-page",
                            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                          },
                        ].map((item, idx) => (
                          <li key={idx}>
                            <Link
                              to={item.link}
                              className="
                                group/item flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5
                                text-[#e8dcc4] hover:text-[#ffd54f] text-[0.938rem] font-medium
                                rounded-lg transition-all duration-200
                                hover:bg-[#3a2515] hover:pl-5
                                relative overflow-hidden
                              "
                            >
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-[#ffd54f] to-[#ffb84d] rounded-r-full transition-all duration-300 group-hover/item:h-[65%]" />

                              <svg
                                className="w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover/item:scale-110"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={item.icon}
                                />
                              </svg>

                              <span className="relative z-10 transition-transform duration-200 group-hover/item:translate-x-0.5">
                                {item.label}
                              </span>

                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd54f]/5 to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-700" />
                            </Link>
                          </li>
                        ))}

                        <li className="my-1 mx-2 border-t border-[#4a2d18]/50"></li>

                        <li>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await logout();
                                toast.success('Đăng xuất thành công!');
                                navigate('/');
                              } catch (error) {
                                toast.error('Đăng xuất thất bại');
                              }
                            }}
                            className="
                              group/item w-full flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5
                              text-[#ff6b6b] hover:text-[#ff5252] text-[0.938rem] font-medium
                              rounded-lg transition-all duration-200
                              hover:bg-[#3a2515] hover:pl-5
                              relative overflow-hidden text-left
                            "
                          >
                            <svg
                              className="w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover/item:scale-110"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>

                            <span className="relative z-10 transition-transform duration-200 group-hover/item:translate-x-0.5">
                              Đăng xuất
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              )}

              {/* Cart Button: chỉ hiển thị khi ở trang Cửa hàng */}
              {typeof window !== "undefined" &&
                /^\/((mua-tranh-in)|(donat-ung-ho)|(thanh-vien-vip)|(cart)|(checkout)|(chi-tiet))/.test(
                  window.location.pathname
                ) && (
                  <li className="ml-3 pl-3 border-l border-[#5a3822]/50">
                    <Link
                      to="/cart"
                      className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-[#fff1c7] hover:text-[#ffd54f] hover:bg-[#4a2d18]/50 transition-colors"
                      aria-label="Giỏ hàng"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                        />
                      </svg>
                      <span className="font-semibold">Giỏ hàng</span>
                      {getTotalItems() > 0 && (
                        <span className="absolute -top-2 -right-2 rounded-full bg-[#ffd54f] px-1.5 py-0.5 text-xs font-bold text-[#3b2412] shadow">
                          {getTotalItems()}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#fff1c7] hover:text-[#ffd54f] hover:bg-[#4a2d18]/50 transition-colors duration-200"
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMobileMenuOpen
              ? "max-h-[calc(100vh-4rem)] opacity-100"
              : "max-h-0 opacity-0"
            }
          `}
        >
          <nav className="py-4 border-t border-[#5a3822]/30">
            <ul className="space-y-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  {item.submenu ? (
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSubmenu(openSubmenu === index ? null : index)
                        }
                        className="
                          w-full flex items-center justify-between px-4 py-3
                          text-[#fff1c7] hover:text-[#ffd54f] font-semibold text-[0.938rem]
                          rounded-lg transition-all duration-200
                          hover:bg-[#4a2d18]/50
                        "
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${openSubmenu === index ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      <div
                        className={`
                          overflow-hidden transition-all duration-300 ease-in-out
                          ${openSubmenu === index
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                          }
                        `}
                      >
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subItem, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={subItem.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="
                                  flex items-center gap-2 px-4 py-2.5
                                  text-[#e8dcc4] hover:text-[#ffd54f] text-[0.875rem] font-medium
                                  rounded-lg transition-all duration-200
                                  hover:bg-[#3a2515]
                                "
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd54f]/50" />
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="
                        flex items-center px-4 py-3
                        text-[#fff1c7] hover:text-[#ffd54f] font-semibold text-[0.938rem]
                        rounded-lg transition-all duration-200
                        hover:bg-[#4a2d18]/50
                      "
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}

              {/* Mobile Auth Section */}
              {!isLoggedIn ? (
                <li className="pt-4 mt-4 border-t border-[#5a3822]/30 space-y-2 px-4">
                  <Link
                    to="/dangky"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      flex items-center justify-center gap-2 px-4 py-2.5
                      text-[#ffd54f] font-semibold text-[0.938rem]
                      rounded-lg transition-all duration-200
                      border-2 border-[#ffd54f]/40 hover:border-[#ffd54f]
                      hover:bg-[#ffd54f]/10
                    "
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Đăng ký
                  </Link>

                  <Link
                    to="/dangnhap"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="
                      flex items-center justify-center gap-2 px-4 py-2.5
                      text-[#3b2412] bg-gradient-to-r from-[#ffd54f] to-[#ffb84d]
                      font-bold text-[0.938rem]
                      rounded-lg transition-all duration-200
                      shadow-md hover:shadow-lg
                    "
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Đăng nhập
                  </Link>
                </li>
              ) : (
                <li className="pt-4 mt-4 border-t border-[#5a3822]/30">
                  <div className="px-4 mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd54f] to-[#ffb84d] flex items-center justify-center text-[#3b2412] font-bold">
                      U
                    </div>
                    <span className="text-[#fff1c7] font-semibold">
                      Tài khoản
                    </span>
                  </div>

                  <ul className="space-y-1">
                    {[
                      {
                        label: "Hồ sơ cá nhân",
                        link: "/profile",
                        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                      },
                      {
                        label: "Bạn bè",
                        link: "/friends",
                        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                      },
                      {
                        label: "Cài đặt",
                        link: "/settings",
                        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                      },
                      {
                        label: "Hướng dẫn",
                        link: "/faq",
                        icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                      },
                      {
                        label: "Liên hệ",
                        link: "/contact",
                        icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                      },
                    ].map((item, idx) => (
                      <li key={idx}>
                        <Link
                          to={item.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="
                            flex items-center gap-3 px-4 py-2.5
                            text-[#e8dcc4] hover:text-[#ffd54f] text-[0.875rem] font-medium
                            rounded-lg transition-all duration-200
                            hover:bg-[#3a2515]
                          "
                        >
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={item.icon}
                            />
                          </svg>
                          {item.label}
                        </Link>
                      </li>
                    ))}

                    <li className="my-2 mx-4 border-t border-[#4a2d18]/50"></li>

                    {/* Mobile Cart Link */}
                    <li>
                      <Link
                        to="/cart"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[#e8dcc4] hover:text-[#ffd54f] text-[0.875rem] font-medium rounded-lg transition-all duration-200 hover:bg-[#3a2515]"
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 22a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                          />
                        </svg>
                        Giỏ hàng
                        {getTotalItems() > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ffd54f] px-1 text-xs font-bold text-[#3b2412]">
                            {getTotalItems()}
                          </span>
                        )}
                      </Link>
                    </li>

                    <li>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await logout();
                            setIsMobileMenuOpen(false);
                            toast.success('Đăng xuất thành công!');
                            navigate('/');
                          } catch (error) {
                            toast.error('Đăng xuất thất bại');
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        className="
                          w-full flex items-center gap-3 px-4 py-2.5
                          text-[#ff6b6b] hover:text-[#ff5252] text-[0.875rem] font-medium
                          rounded-lg transition-all duration-200
                          hover:bg-[#3a2515] text-left
                        "
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
