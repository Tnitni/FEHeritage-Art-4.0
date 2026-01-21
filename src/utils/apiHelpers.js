
export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const hasRole = (user, roleCode) => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => role.role_code === roleCode);
};

export const isAdmin = (user) => {
  return hasRole(user, 'ADMIN');
};

export const getRoleNames = (user) => {
  if (!user || !user.roles) return '';
  return user.roles.map((role) => role.role_name).join(', ');
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  return {
    valid: errors.length === 0,
    isValid: errors.length === 0, // Support both naming conventions
    errors,
    message: errors[0] || '', // Return first error as message
  };
};

export const isValidIdentityNumber = (identityNumber) => {
  if (!identityNumber) return true; // Optional field
  return /^\d{12}$/.test(identityNumber);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  // Format: 0xxx xxx xxx
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const getStatusColor = (status) => {
  const statusColors = {
    Active: 'green',
    Inactive: 'orange',
    Banned: 'red',
  };
  return statusColors[status] || 'gray';
};

export const getGenderText = (gender) => {
  const genderMap = {
    Male: 'Nam',
    Female: 'Nữ',
    Other: 'Khác',
  };
  return genderMap[gender] || gender;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getErrorMessage = (error) => {
  if (error.message) {
    return error.message;
  }

  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map((e) => e.message).join(', ');
  }

  return 'Có lỗi xảy ra, vui lòng thử lại';
};

export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const buildQueryString = (params) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
};

export const parseQueryString = (queryString) => {
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * Math.pow(2, i));
    }
  }
};

export default {
  formatDate,
  formatDateForInput,
  hasRole,
  isAdmin,
  getRoleNames,
  isValidEmail,
  validatePassword,
  isValidIdentityNumber,
  formatPhone,
  getStatusColor,
  getGenderText,
  debounce,
  getErrorMessage,
  truncate,
  deepClone,
  isEmpty,
  buildQueryString,
  parseQueryString,
  downloadFile,
  copyToClipboard,
  formatFileSize,
  sleep,
  retry,
};
