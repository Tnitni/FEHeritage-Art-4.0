import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './RegisterPage.css'
import { useUser } from '../../context/UserContext'
import { getErrorMessage, validatePassword } from '../../utils/apiHelpers'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, loading: contextLoading, isLoggedIn } = useUser()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Password validation - Sử dụng helper từ apiHelpers
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else {
      const passwordCheck = validatePassword(formData.password)
      if (!passwordCheck.valid) {
        newErrors.password = passwordCheck.errors[0] // Lấy lỗi đầu tiên
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    // Terms agreement validation
    if (!agreedToTerms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản sử dụng'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      // Chuẩn bị data để gửi lên API
      const registerData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }

      // Gọi API register
      const result = await register(registerData)

      // Hiển thị thông báo thành công
      toast.success('Đăng ký thành công! Chào mừng bạn đến với MT4!', {
        duration: 3000,
        position: 'top-center',
      })

      setTimeout(() => {
        navigate('/info', { replace: true })
      }, 500)

    } catch (error) {
      // Hiển thị lỗi
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage || 'Đăng ký thất bại', {
        duration: 4000,
        position: 'top-center',
      })
      console.error('Register error:', error)
    }
  }

  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`)
    // TODO: Implement social registration
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength: 33, label: 'Yếu', color: '#ff6b6b' }
    if (strength <= 4) return { strength: 66, label: 'Trung bình', color: '#ffd54f' }
    return { strength: 100, label: 'Mạnh', color: '#4caf50' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Form */}
        <div className="register-form-section">
          <div className="register-form-wrapper">
            <div className="form-header">
              <h2 className="form-title">Tạo tài khoản mới</h2>
              <p className="form-subtitle">
                Đã có tài khoản? {' '}
                <Link to="/login" className="login-link">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {/* Full Name Input */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Họ và tên
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@example.com"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? (
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      />
                    </div>
                    <span
                      className="strength-label"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                )}

                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Xác nhận mật khẩu
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? (
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="form-group">
                <label className="terms-agreement">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>
                    Tôi đồng ý với{' '}
                    <Link to="/terms" className="terms-link">Điều khoản sử dụng</Link>
                    {' '}và{' '}
                    <Link to="/privacy" className="terms-link">Chính sách bảo mật</Link>
                  </span>
                </label>
                {errors.terms && (
                  <span className="error-message">{errors.terms}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={contextLoading}
                className={`submit-button ${contextLoading ? 'loading' : ''}`}
              >
                {contextLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký</span>
                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="divider">
                <span>hoặc đăng ký với</span>
              </div>

              {/* Social Register */}
              <div className="social-register">
                <button
                  type="button"
                  onClick={() => handleSocialRegister('google')}
                  className="social-button google"
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialRegister('facebook')}
                  className="social-button facebook"
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="register-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-circle">
                <span className="logo-text">MT4</span>
              </div>
            </div>
            <h1 className="brand-title">Bắt đầu hành trình của bạn!</h1>
            <p className="brand-subtitle">
              Tham gia cộng đồng nghệ sĩ AI và khám phá vô vàn khả năng sáng tạo
            </p>
            <div className="brand-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">✨</div>
                <div className="benefit-text">
                  <h3>Miễn phí sử dụng</h3>
                  <p>Truy cập đầy đủ tính năng cơ bản</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎨</div>
                <div className="benefit-text">
                  <h3>Công cụ AI mạnh mẽ</h3>
                  <p>Tạo nghệ thuật chỉ trong vài giây</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">👥</div>
                <div className="benefit-text">
                  <h3>Cộng đồng sôi động</h3>
                  <p>Kết nối với nghệ sĩ toàn cầu</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🏆</div>
                <div className="benefit-text">
                  <h3>Phần thưởng hấp dẫn</h3>
                  <p>Nhận huy hiệu và ưu đãi đặc biệt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
