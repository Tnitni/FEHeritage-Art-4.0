import api from './api';

const messageService = {
  // Send message
  sendMessage: async (receiverId, content) => {
    try {
      const response = await api.post('/messages', {
        receiver_id: receiverId,
        content
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation with a user
  getConversation: async (friendId, limit = 50, offset = 0) => {
    try {
      const response = await api.get(`/messages/${friendId}`, {
        params: { limit, offset }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all conversations
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default messageService;
