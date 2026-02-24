import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import { Palette, Paintbrush, BookOpen, Check } from 'lucide-react';
import './Home.css';

import logoImg from '../../assets/logo.png';
import bannerImg from '../../assets/banner.png';
import heroGif from '../../assets/Hero_vid.gif';
import nhaThoImg from '../../assets/nhatho.png';
import baoTangImg from '../../assets/baotang.png';
import diaDaoImg from '../../assets/diadao.png';
import benCangImg from '../../assets/bencang.png';
import designerImg from '../../assets/Designer.png';
import ceoImg from '../../assets/ceo.jpg';
import creativeHubImg from '../../assets/home.png';


const FEATURED_ITEMS = [
  {
    id: 'nha-tho-duc-ba',
    title: 'NHÀ THỜ ĐỨC BÀ',
    description:
      'Nhà thờ Đức Bà Sài Gòn, tên chính thức là Vương cung thánh đường Chính tòa Đức Bà Sài Gòn, là một trong những công trình kiến trúc biểu tượng và lâu đời nhất tại Thành phố Hồ Chí Minh. Nằm ở trung tâm Quận 1, tại số 01 Công xã Paris, công trình này thu hút đông đảo du khách và người dân địa phương bởi vẻ đẹp cổ kính và giá trị lịch sử.',
    image: nhaThoImg,
    alt: 'Nhà thờ Đức Bà Sài Gòn',

  },
  {
    id: 'bao-tang-chien-tranh',
    title: 'BẢO TÀNG CHIẾN TRANH',
    description:
      'Bảo tàng Chứng tích Chiến tranh là một trong những bảo tàng nổi tiếng và quan trọng nhất tại Thành phố Hồ Chí Minh, tọa lạc tại địa chỉ 28 Võ Văn Tần, Phường Võ Thị Sáu, Quận 3. Bảo tàng chuyên trưng bày những tư liệu, hình ảnh và hiện vật liên quan đến cuộc Chiến tranh Việt Nam và những hậu quả mà nó gây ra.',
    image: baoTangImg,
    alt: 'Bảo tàng Chứng tích Chiến tranh',

  },
  {
    id: 'dia-dao-cu-chi',
    title: 'ĐỊA ĐẠO CỦ CHI',
    description:
      'Địa đạo Củ Chi là một hệ thống đường hầm ngầm khổng lồ nằm ở huyện Củ Chi, cách trung tâm Thành phố Hồ Chí Minh khoảng 70 km về phía Tây Bắc. Đây là một di tích lịch sử quốc gia đặc biệt, đóng vai trò quan trọng trong cuộc kháng chiến chống Mỹ của quân và dân Việt Nam.',
    image: diaDaoImg,
    alt: 'Địa đạo Củ Chi',

  },
  {
    id: 'ben-cang-nha-rong',
    title: 'BẾN CẢNG NHÀ RỒNG',
    description:
      'Bến cảng Nhà Rồng, hay còn gọi là Bảo tàng Hồ Chí Minh – Chi nhánh Thành phố Hồ Chí Minh, là một di tích lịch sử quan trọng nằm tại số 1 Nguyễn Tất Thành, Phường 12, Quận 4, Thành phố Hồ Chí Minh.',
    image: benCangImg,
    alt: 'Bến cảng Nhà Rồng',

  },
];

const COLLAB_SECTIONS = [
  {
    id: 'featured-projects',
    eyebrow: 'Dự án tiêu biểu',
    title: 'Những dự án tạo dấu ấn công nghệ & văn hóa',
    description:
      'Khám phá những hành trình tiêu biểu nơi AI đồng hành cùng các nhà nghiên cứu, nghệ sĩ và cộng đồng địa phương để tái hiện di sản Việt Nam bằng góc nhìn mới mẻ.',
    highlights: [
      'Chuỗi triển lãm ký ức Sài Gòn – kết hợp tư liệu lịch sử và thị giác AI',
      'Dự án “Âm vang di sản” với trải nghiệm âm thanh tương tác theo vùng địa lý',
      'Hợp tác cùng bảo tàng địa phương để số hóa hiện vật đặc sắc',
    ],
    ctaLabel: 'Xem dự án chi tiết',
    ctaHref: '#featured-projects',
    image: designerImg,
  },
  {
    id: 'community-programs',
    eyebrow: 'Cộng đồng sáng tạo',
    title: 'Nuôi dưỡng hệ sinh thái nhà sáng tạo trẻ',
    description:
      'Từ workshop thực hành, hackathon chủ đề di sản đến thư viện dữ liệu mở, chúng tôi xây dựng cộng đồng giúp thế hệ trẻ khám phá lịch sử theo cách rất riêng.',
    highlights: [
      'Workshop “AI kể chuyện di tích” dành cho học sinh – sinh viên',
      'Cuộc thi sáng tác poster số với sự cố vấn của nghệ sĩ trẻ',
      'Thư viện dữ liệu mở hóa dành cho nhà nghiên cứu độc lập',
    ],
    ctaLabel: 'Tham gia cộng đồng',
    ctaHref: '#community-programs',
    image: creativeHubImg,
  },
  {
    id: 'collaboration-contact',
    eyebrow: 'Liên hệ hợp tác',
    title: 'Kết nối để cùng lan tỏa giá trị di sản',
    description:
      'Chúng tôi mong muốn hợp tác cùng các tổ chức văn hoá, doanh nghiệp, đơn vị giáo dục và đối tác công nghệ để mở rộng tác động xã hội của triển lãm.',
    highlights: [
      'Đồng tổ chức sự kiện triển lãm lưu động tại địa phương',
      'Tư vấn triển khai không gian trải nghiệm AI – XR cho bảo tàng',
      'Xây dựng chương trình giáo dục lịch sử tương tác theo yêu cầu',
    ],
    ctaLabel: 'Đặt lịch trao đổi',
    ctaHref: '#lienhe',
    image: ceoImg,
  },
];

const Home = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [collabEmail, setCollabEmail] = useState('');
  const [collabError, setCollabError] = useState('');
  const [collabStatus, setCollabStatus] = useState('');

  const autoSlideRef = useRef(null);
  const isHoveringRef = useRef(false);
  const totalSlides = FEATURED_ITEMS.length;
  const activeItem = FEATURED_ITEMS[currentSlide] ?? null;





  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current || totalSlides <= 1) {
      return;
    }

    autoSlideRef.current = setInterval(() => {
      if (totalSlides === 0) {
        return;
      }

      setCurrentSlide((previous) => (previous + 1) % totalSlides);
    }, 5000); // tốc độ chuyển: 3 giây
  }, [totalSlides]);

  const stopAutoSlide = useCallback(() => {
    if (!autoSlideRef.current) {
      return;
    }

    clearInterval(autoSlideRef.current);
    autoSlideRef.current = null;
  }, []);

  const goToSlide = useCallback(
    (index) => {
      if (totalSlides === 0) {
        return;
      }

      const normalizedIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentSlide(normalizedIndex);
    },
    [totalSlides],
  );

  const handleNext = useCallback(() => {
    if (totalSlides === 0) {
      return;
    }

    setCurrentSlide((previous) => (previous + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    if (totalSlides === 0) {
      return;
    }

    setCurrentSlide((previous) => (previous - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const getDescriptionSnippet = useCallback((description, maxLength = 120) => {
    if (!description) {
      return '';
    }

    return description.length > maxLength ? `${description.slice(0, maxLength - 1)}…` : description;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email || 'Người dùng';
        setUserEmail(email);
      } catch (error) {
        console.error('Token không hợp lệ', error);
      }
    }
  }, []);

  useEffect(() => {
    startAutoSlide();

    return () => {
      stopAutoSlide();
    };
  }, [startAutoSlide, stopAutoSlide]);



  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    setUserEmail(null);
  };

  const handleFeaturedMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const handleFeaturedMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
  }, []);

  const handleSlideSelect = useCallback(
    (index) => {
      if (index === currentSlide) {
        return;
      }

      goToSlide(index);
    },
    [currentSlide, goToSlide],
  );



  const handleCollabEmailChange = useCallback((event) => {
    setCollabEmail(event.target.value);
    setCollabError('');
    setCollabStatus('');
  }, []);

  const handleCollabSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!collabEmail.trim()) {
        setCollabError('Vui lòng nhập email của bạn.');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(collabEmail.trim())) {
        setCollabError('Email chưa hợp lệ, vui lòng kiểm tra lại.');
        return;
      }

      setCollabError('');
      setCollabStatus('Cảm ơn bạn! Chúng tôi sẽ liên hệ trong thời gian sớm nhất.');
      setCollabEmail('');
    },
    [collabEmail],
  );

  return (
    <div className="home-page">


      <main className="hero">
        <img
          src={heroGif}
          alt="Hero background"
          className="background-video"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            minWidth: '100vw',
            minHeight: '100%',
            maxWidth: '100vw',
            maxHeight: '100%',
          }}
        />
        <div className="overlay" />
        <div className="content">
          <h1>Triễn lãm số</h1>
          <p className="subheading subheading-blur">
            Triễn lãm tranh di tích lịch sử văn hóa, tạo tranh AI và giáo dục cộng đồng.
          </p>
          <div className="cta-buttons">
            <Link className="btn-pill btn-gold" to="/gioithieu">
              Giới thiệu
            </Link>
            <Link className="btn-pill btn-gold" to="/gioithieu#lien-he">
              Liên hệ hợp tác
            </Link>
          </div>
        </div>
      </main>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-header">
            <span className="services-tag">Khám phá dịch vụ</span>
            <h2 className="services-title">Trải nghiệm đa chiều về di sản văn hóa</h2>
            <p className="services-subtitle">
              Hệ sinh thái công nghệ AI toàn diện giúp bạn khám phá, sáng tạo và kết nối với lịch sử Việt Nam
            </p>
          </div>

          <div className="services-grid">
            <article className="service-card experience-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Palette size={40} /></div>
              </div>
              <div className="service-content">
                <h3 className="service-title">Trải nghiệm</h3>
                <p className="service-description">
                  Trang web triển lãm tranh AI về di tích lịch sử Việt Nam mang đến một hành trình thị giác độc đáo,
                  nơi người xem được đắm chìm trong những tác phẩm nghệ thuật số được tạo ra bởi trí tuệ nhân tạo.
                </p>
                <ul className="service-features">
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Bộ sưu tập tranh AI chất lượng cao</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Trải nghiệm thực tế ảo tương tác</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Thư viện di tích phong phú</span>
                  </li>
                </ul>
                <a href="trainghiem.html" className="service-btn">
                  <span>Khám phá ngay</span>
                  <span className="btn-arrow">→</span>
                </a>
              </div>
            </article>

            <article className="service-card create-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><Paintbrush size={40} /></div>
              </div>
              <div className="service-content">
                <h3 className="service-title">Tạo tranh</h3>
                <p className="service-description">
                  Không gian sáng tạo của Triển lãm Tranh AI cho phép bạn tự tay tạo ra những bức tranh mang phong cách cổ điển kết hợp hiện đại, lấy cảm hứng từ di tích Việt Nam.
                </p>
                <ul className="service-features">
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Công cụ AI tạo tranh mạnh mẽ</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Đa dạng phong cách nghệ thuật</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Lưu trữ & chia sẻ tác phẩm</span>
                  </li>
                </ul>
                <a href="taotranh.html" className="service-btn">
                  <span>Bắt đầu sáng tạo</span>
                  <span className="btn-arrow">→</span>
                </a>
              </div>
            </article>

            <article className="service-card education-card">
              <div className="service-icon-wrapper">
                <div className="service-icon"><BookOpen size={40} /></div>
              </div>
              <div className="service-content">
                <h3 className="service-title" >Giáo dục <br /> & Cộng đồng</h3>
                <p className="service-description">
                  Trang Giáo dục là cầu nối giữa truyền thống và hiện đại, giúp học sinh – sinh viên và giáo viên dễ dàng tiếp
                  cận kiến thức lịch sử thông qua các công cụ tương tác.
                </p>
                <ul className="service-features">
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Tài liệu giáo dục tương tác</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Cộng đồng sáng tạo sôi động</span>
                  </li>
                  <li>
                    <span className="feature-icon"><Check size={20} /></span>
                    <span>Cuộc thi & sự kiện định kỳ</span>
                  </li>
                </ul>
                <a href="giaoduc.html" className="service-btn">
                  <span>Tham gia ngay</span>
                  <span className="btn-arrow">→</span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />

      <section className="featured-section">
        <div className="featured-inner">
          <div className="featured-header">
            <span className="featured-eyebrow">Bộ sưu tập nổi bật</span>
            <h1 className="featured-title">ẢNH NỔI BẬT</h1>
            <p className="featured-summary">
              Thưởng thức những góc nhìn giàu cảm xúc về các di tích lịch sử của Việt Nam, được tái hiện bằng công nghệ
              trí tuệ nhân tạo và cảm hứng nghệ thuật đương đại.
            </p>
          </div>

          <div className="featured-layout">
            {activeItem ? (
              <>
                <article className="featured-hero-card">
                  <div className="hero-media">
                    <img src={activeItem.image} alt={activeItem.alt} />
                    <div className="hero-meta-overlay">
                      <span className="hero-step">{String(currentSlide + 1).padStart(2, '0')}</span>
                      <span className="hero-total">/{String(totalSlides).padStart(2, '0')}</span>
                    </div>
                    {totalSlides > 1 && (
                      <div className="hero-controls">
                        <button type="button" className="hero-nav prev" onClick={handlePrev} aria-label="Ảnh trước">
                          ‹
                        </button>
                        <button type="button" className="hero-nav next" onClick={handleNext} aria-label="Ảnh tiếp theo">
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="hero-body">
                    <div className="hero-body-header">
                      <span className="hero-tag">Di tích lịch sử</span>
                      <span className="hero-progress">{currentSlide + 1} / {totalSlides}</span>
                    </div>
                    <h3 className="hero-title">{activeItem.title}</h3>
                    <p className="hero-description">{activeItem.description}</p>
                    <div className="hero-actions">
                      {totalSlides > 1 && (
                        <div className="hero-nav-actions">
                          <button
                            type="button"
                            className="btn-hero"
                            onClick={handlePrev}
                            aria-label="Ảnh trước"
                          >
                            ← Trước
                          </button>
                          <button
                            type="button"
                            className="btn-hero"
                            onClick={handleNext}
                            aria-label="Ảnh tiếp theo"
                          >
                            Tiếp →
                          </button>
                        </div>
                      )}

                    </div>
                  </div>

                </article>

                <div className="featured-thumbs">
                  {FEATURED_ITEMS.map((item, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`featured-thumb${isActive ? ' active' : ''}`}
                        onClick={() => handleSlideSelect(index)}
                        aria-label={`Xem ${item.title}`}
                      >
                        <div className="thumb-image">
                          <img src={item.image} alt={item.alt} />
                        </div>
                        <div className="thumb-content">
                          <span className="thumb-index">{String(index + 1).padStart(2, '0')}</span>
                          <h4>{item.title}</h4>
                          <p>{getDescriptionSnippet(item.description)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="empty-state">Chưa có ảnh nổi bật để hiển thị.</p>
            )}
          </div>
        </div>
      </section>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />

      {/* Section 1: Featured Projects */}
      <section className="collab-section featured-projects-section" id="featured-projects">
        <div className="section-header featured-projects-header">
          <span className="section-tag">Dự án tiêu biểu</span>
          <h2 className="section-title">Những dự án tạo dấu ấn công nghệ & văn hóa</h2>
          <p className="section-subtitle">
            Khám phá những hành trình tiêu biểu nơi AI đồng hành cùng các nhà nghiên cứu, nghệ sĩ và cộng đồng địa phương để tái hiện di sản Việt Nam bằng góc nhìn mới mẻ.
          </p>
        </div>
        <div className="featured-projects-body">
          <div className="featured-intro">
            <div className="highlights-grid">
              {COLLAB_SECTIONS[0].highlights.map((highlight, idx) => (
                <div key={idx} className="highlight-card">
                  <span className="highlight-number">{String(idx + 1).padStart(2, '0')}</span>
                  <p>{highlight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="featured-media">
            <div className="media-frame-enhanced">
              <img src={COLLAB_SECTIONS[0].image} alt={`${COLLAB_SECTIONS[0].eyebrow} minh họa`} />
              <div className="media-overlay">
                <span className="overlay-tag">🎨 Dự án AI</span>
              </div>
            </div>
          </div>
        </div>
        <div className="featured-projects-cta">
          <a className="btn-collab primary" href={COLLAB_SECTIONS[0].ctaHref}>
            <span>{COLLAB_SECTIONS[0].ctaLabel}</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </section>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />

      {/* Section 2: Community Programs - layout giống Dự án tiêu biểu, 3 option bên phải */}
      <section className="collab-section community-section" id="community-programs">
        <div className="section-header community-section-header">
          <span className="section-tag">Cộng đồng sáng tạo</span>
          <h2 className="section-title">Nuôi dưỡng hệ sinh thái nhà sáng tạo trẻ</h2>
          <p className="section-subtitle">
            Từ workshop thực hành, hackathon chủ đề di sản đến thư viện dữ liệu mở, chúng tôi xây dựng cộng đồng giúp thế hệ trẻ khám phá lịch sử theo cách rất riêng.
          </p>
        </div>
        <div className="community-body">
          <div className="community-media">
            <div className="media-frame-enhanced">
              <img src={COLLAB_SECTIONS[1].image} alt={`${COLLAB_SECTIONS[1].eyebrow} minh họa`} />
              <div className="media-overlay">
                <span className="overlay-tag">👥 Cộng đồng</span>
              </div>
            </div>
          </div>
          <div className="community-intro">
            <div className="highlights-grid">
              {COLLAB_SECTIONS[1].highlights.map((highlight, idx) => (
                <div key={idx} className="highlight-card">
                  <span className="highlight-number">{String(idx + 1).padStart(2, '0')}</span>
                  <p>{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="community-cta">
          <a className="btn-collab secondary" href={COLLAB_SECTIONS[1].ctaHref}>
            <span>{COLLAB_SECTIONS[1].ctaLabel}</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </section>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />

      {/* Section 3: Collaboration Contact - layout giống Dự án tiêu biểu, 3 option + form trái, ảnh phải */}
      <section className="collab-section contact-section" id="collaboration-contact">
        <div className="section-header contact-section-header">
          <span className="section-tag">Liên hệ hợp tác</span>
          <h2 className="section-title">Kết nối để cùng lan tỏa giá trị di sản</h2>
          <p className="section-subtitle">
            Chúng tôi mong muốn hợp tác cùng các tổ chức văn hoá, doanh nghiệp, đơn vị giáo dục và đối tác công nghệ để mở rộng tác động xã hội của triển lãm.
          </p>
        </div>
        <div className="contact-body">
          <div className="contact-intro">
            <div className="highlights-grid">
              {COLLAB_SECTIONS[2].highlights.map((highlight, idx) => (
                <div key={idx} className="highlight-card">
                  <span className="highlight-number">{String(idx + 1).padStart(2, '0')}</span>
                  <p>{highlight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="contact-media">
            <div className="media-frame-enhanced">
              <img src={COLLAB_SECTIONS[2].image} alt={`${COLLAB_SECTIONS[2].eyebrow} minh họa`} />
              <div className="media-overlay">
                <span className="overlay-tag">🤝 Hợp tác</span>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-cta">
          <form className="contact-cta-form" onSubmit={handleCollabSubmit} noValidate>
            <label className="sr-only" htmlFor="collab-email">
              Email liên hệ
            </label>
            <input
              id="collab-email"
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              value={collabEmail}
              onChange={handleCollabEmailChange}
              autoComplete="email"
              aria-describedby="collab-email-help"
              aria-invalid={collabError ? 'true' : 'false'}
              required
            />
            <button type="submit" className="btn-collab submit">
              <span>Gửi liên hệ</span>
              <span className="arrow">✉</span>
            </button>
            <div className="collab-form-feedback" id="collab-email-help" aria-live="polite">
              {collabError && <span className="error-message">⚠ {collabError}</span>}
              {!collabError && collabStatus && <span className="success-message">✓ {collabStatus}</span>}
            </div>
          </form>
        </div>
      </section>

      <img className="spacer-image" src={bannerImg} alt="Trang trí kết nối" />
    </div>
  );
};

export default Home;
