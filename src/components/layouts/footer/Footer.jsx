import { Link } from "react-router-dom";
import logoImg from "../../../assets/logo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer" id="lienhe">
      <div className="footer-top">
        <div className="footer-top-inner">
          <img src={logoImg} alt="Logo" className="logo" />
        </div>
      </div>
      <div className="footer-inner">
        {/* About Column */}
        <div className="footer-column footer-about">
          <h3>Triển lãm Nghệ thuật Lịch sử</h3>
          <p>
            Chúng tôi mang đến trải nghiệm nghệ thuật AI tương tác, kể câu
            chuyện di sản Việt Nam bằng góc nhìn hiện đại và lan tỏa giá trị văn
            hóa tới cộng đồng sáng tạo.
          </p>
          <ul className="footer-contact-list">
            {/* DÒNG 1: HOTLINE */}
            <li>
              <span className="icon phone-icon" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.43 2.43z" />
                </svg>
              </span>
              <div className="contact-info">
                <span>Hotline:</span>
                <a href="tel:0399148815">0399 148 815</a>
              </div>
            </li>

            {/* DÒNG 2: EMAIL */}
            <li>
              <span className="icon mail-icon" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </span>
              <div className="contact-info">
                <span>Email:</span>
                <a href="mailto:andrey@novaha.vn">andrey@novaha.vn</a>
              </div>
            </li>

            {/* DÒNG 3: ĐỊA CHỈ */}
            <li>
              <span className="icon location-icon" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
              </span>
              <div className="contact-info">
                <span>Địa chỉ:</span>
                <address>
                  26 đường số 23, Bình Trưng Đông, TP. Thủ Đức, TP. Hồ Chí Minh
                </address>
              </div>
            </li>
          </ul>

          {/* Social Connect Section */}
          <div className="footer-social">
            <h4>Kết nối với chúng tôi</h4>
            <div className="footer-social-links">
              <a
                href="mailto:andrey@novaha.vn"
                className="social-link"
                aria-label="Email"
                title="Email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-column footer-links">
          <h3>Điều hướng nhanh</h3>
          <ul>
            <li>
              <Link to="/">Trang chủ</Link>
            </li>
            <li>
              <Link to="/about">Giới thiệu</Link>
            </li>
            <li>
              <a href="#featured-projects">Dự án tiêu biểu</a>
            </li>
            <li>
              <a href="#community-programs">Cộng đồng</a>
            </li>
            <li>
              <a href="trainghiem.html">Trải nghiệm</a>
            </li>
            <li>
              <a href="taotranh.html">Tạo tranh AI</a>
            </li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-column footer-contact">
          <h3>Liên hệ</h3>
          <p>
            Hãy để lại thông tin liên hệ của bạn, chúng tôi sẽ phản hồi trong
            thời gian sớm nhất!
          </p>
          <form className="footer-form" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">
              Email liên hệ
            </label>
            <div className="footer-form-row">
              <input
                id="footer-email"
                type="email"
                name="footer-email"
                placeholder="Nhập email của bạn"
                autoComplete="email"
                required
              />
              <button type="submit">Liên hệ ngay</button>
            </div>
          </form>
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.3834968450287!2d106.77465077769249!3d10.787729861931647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317526830098c2e3%3A0xcffb6043db6d123b!2zMjYgxJDGsOG7nW5nIHPhu5EgMjMsIELDrG5oIFRyxrBuZyDEkMO0bmcsIFRo4bunIMSQ4bupYywgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e1!3m2!1svi!2s!4v1751130688952!5m2!1svi!2s"
              title="Vị trí công ty"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Công ty TNHH Novaha. Bảo lưu mọi quyền.
        </p>
        <div className="footer-supplemental-links">
          <a href="#projects">Hợp tác</a>
          <a href="congdong.html">Cộng đồng sáng tạo</a>
          <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
