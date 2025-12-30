import { API_CONFIG } from '../configs';

// Cloudinary Upload Service
const cloudinaryService = {
  /**
   * Upload ảnh qua backend API
   * @param {File} file - File ảnh cần upload
   * @returns {Promise<{url: string, publicId: string}>}
   */
  uploadImage: async function (file) {
    try {
      console.log('Starting upload via backend:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);

      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để upload ảnh');
      }

      // Upload through backend
      const uploadURL = `${API_CONFIG.BASE_URL}/upload/avatar`;
      console.log('Uploading to backend:', uploadURL);

      const response = await fetch(uploadURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Backend response status:', response.status);

      const data = await response.json();
      console.log('Backend response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        url: data.data.url,
        publicId: data.data.publicId,
        width: data.data.width,
        height: data.data.height,
        format: data.data.format,
      };
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        error: error
      });
      throw new Error(error.message || 'Không thể upload ảnh. Vui lòng thử lại.');
    }
  },

  /**
   * Validate file trước khi upload
   * @param {File} file 
   * @returns {{isValid: boolean, error: string}}
   */
  validateFile: function (file) {
    // Check file existence
    if (!file) {
      return { isValid: false, error: 'Vui lòng chọn file' };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Kích thước file không được vượt quá 5MB'
      };
    }

    return { isValid: true, error: '' };
  },

  /**
   * Get optimized image URL với transformations
   * @param {string} publicId 
   * @param {object} options - {width, height, crop, quality}
   * @returns {string}
   */
  getOptimizedUrl: function (publicId, options = {}) {
    const { width = 300, height = 300, crop = 'fill', quality = 'auto' } = options;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
  },
};

export default cloudinaryService;
