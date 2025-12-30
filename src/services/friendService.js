import api from './api';
import { API_CONFIG } from '../configs';

const friendService = {
  // Send friend request
  sendFriendRequest: async (friendId) => {
    try {
      const response = await api.post('/friends/request', {
        friend_id: friendId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Accept friend request
  acceptFriendRequest: async (friendshipId) => {
    try {
      const response = await api.post('/friends/accept', {
        friendship_id: friendshipId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject friend request
  rejectFriendRequest: async (friendshipId) => {
    try {
      const response = await api.post('/friends/reject', {
        friendship_id: friendshipId
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get friends list
  getFriends: async () => {
    try {
      const response = await api.get('/friends');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    try {
      const response = await api.get('/friends/requests');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get friend suggestions
  getSuggestions: async () => {
    try {
      const response = await api.get('/friends/suggestions');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove friend
  removeFriend: async (friendId) => {
    try {
      const response = await api.delete(`/friends/${friendId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default friendService;
