import api from "./api";
import { API_ENDPOINTS } from "../configs/forumIndex";

const forumService = {
  /**
   * Tạo bài viết mới kèm media
   * @param {Object} postData - { title, content, category_id, tags, imageFiles, videoFiles }
   */
  createPost: async (postData) => {
    try {
      const formData = new FormData();

      // Text Data
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("category_id", postData.category_id);

      // Xử Lý tag

      const finalTags =
        postData.tag && postData.tag.length > 0 ? postData.tag : [];

      finalTags.forEach((tagName) => {
        formData.append("tag", tagName);
      });

      // Hình ảnh (Key: images)
      if (postData.imageFiles && postData.imageFiles.length > 0) {
        postData.imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // Video (Key: videos)
      if (postData.videoFiles && postData.videoFiles.length > 0) {
        postData.videoFiles.forEach((file) => {
          formData.append("videos", file);
        });
      }

      // Gửi request với multipart/form-data
      return await api.post(API_ENDPOINTS.FORUM.POST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("forumService Error:", error);
      throw error;
    }
  },

  getCategories: async () => {
    return await api.get(API_ENDPOINTS.FORUM.GETCAT);
  },

  getAllPosts: async ({
    page,
    limit,
    category,
    sortBy,
    tag,
    popular,
    myself,
    search,
  }) => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.GET, {
        params: {
          page,
          limit,
          category_id: category !== "all" ? category : undefined,
          sort: sortBy,
          tag: tag || undefined,
          popular: popular || undefined,
          myself: myself || undefined,
          search: search || undefined,
        },
      });
      return response;
    } catch (error) {
      console.error("Fetch posts error:", error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.GETBYID(postId));
      return response;
    } catch (error) {
      console.error("Fetch post detail error:", error);
      throw error;
    }
  },

  getTags: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.GETTAG);

      return response;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(API_ENDPOINTS.FORUM.DELETE(postId));
      return response;
    } catch (error) {
      console.error("Delete post error:", error);
      throw error.response?.data || error;
    }
  },

  activePost: async (postId) => {
    try {
      const response = await api.put(API_ENDPOINTS.FORUM.ACTIVE(postId));
      return response;
    } catch (error) {
      console.error("Delete post error:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Xử lý Like/Dislike bài viết
   * @param {string} postId - ID của bài viết
   * @param {string} reactionType - "LIKE" hoặc "DISLIKE"
   */
  reactPost: async (postId, reactionType) => {
    try {
      const response = await api.post(API_ENDPOINTS.FORUM.LIKE(postId), {
        reactionType: reactionType, // "LIKE" hoặc "DISLIKE"
        targetType: "POST",
      });

      return response;
    } catch (error) {
      console.error("Error reacting to post:", error);
      throw error;
    }
  },

  postComment: async (postId, content) => {
    try {
      const response = await api.post(API_ENDPOINTS.FORUM.POSTCOMMENT(postId), {
        content: content,
      });
      return response;
    } catch (error) {
      console.error("Post comment error:", error);
      throw error.response?.data || error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.FORUM.DELETECOMMENT(commentId),
      );
      return response;
    } catch (error) {
      console.error("Delete comment error:", error);
      throw error.response?.data || error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.GETUSERBYID(userId));
      return response;
    } catch (error) {
      console.error("Fetch user detail error:", error);
      throw error;
    }
  },

  updatePostById: async (postId, formData) => {
    try {
      const response = await api.put(
        API_ENDPOINTS.FORUM.UPDATEBYID(postId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating post:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi cập nhật",
      };
    }
  },

  getMyPosts: async (userId) => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.FILTERISMINE(userId));
      return response;
    } catch (error) {
      console.error("Fetch my posts error:", error);
      throw error;
    }
  },

  getAllPostsForAdmin: async ({ page, limit, search, status, category_id }) => {
    try {
      const response = await api.get(API_ENDPOINTS.FORUM.GETFORADMIN, {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          category_id: category_id || undefined,
        },
      });
      return response;
    } catch (error) {
      console.error("Fetch admin posts error:", error);
      throw error;
    }
  },
};

export default forumService;
