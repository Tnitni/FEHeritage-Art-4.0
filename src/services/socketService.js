import { io } from 'socket.io-client';
import { API_CONFIG } from '../configs';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {

    if (this.socket?.connected) {
      return;
    }

    // Get base URL without /api
    const baseURL = API_CONFIG.BASE_URL?.replace('/api', '') || 'http://localhost:3000';

    try {
      this.socket = io(baseURL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.isConnected = true;

        // Join with user ID
        if (userId) {
          this.socket.emit('join', userId);
        }
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        this.isConnected = true;
        // Rejoin with user ID
        if (userId) {
          this.socket.emit('join', userId);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
    } catch (error) {
      console.error('Failed to create socket instance:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message events
  sendMessage(receiverId, message) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { receiver_id: receiverId, message });
    } else {
      console.warn('⚠️ [SocketService] Cannot send message - socket not connected');
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', (message) => {
        callback(message);
      });
    }
  }

  offReceiveMessage(callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off('receive_message', callback);
      } else {
        this.socket.off('receive_message');
      }
    }
  }

  // Friend request events
  sendFriendRequest(receiverId, request) {
    if (this.socket?.connected) {
      this.socket.emit('send_friend_request', { receiver_id: receiverId, request });
    }
  }

  onReceiveFriendRequest(callback) {
    if (this.socket) {
      this.socket.on('receive_friend_request', callback);
    }
  }

  offReceiveFriendRequest() {
    if (this.socket) {
      this.socket.off('receive_friend_request');
    }
  }

  // Friend request accepted events
  notifyFriendRequestAccepted(userId, friendship) {
    if (this.socket?.connected) {
      this.socket.emit('friend_request_accepted', { user_id: userId, friendship });
    }
  }

  onFriendRequestAccepted(callback) {
    if (this.socket) {
      this.socket.on('friend_request_accepted', callback);
    }
  }

  offFriendRequestAccepted() {
    if (this.socket) {
      this.socket.off('friend_request_accepted');
    }
  }

  // Online/Offline status
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  offUserStatus() {
    if (this.socket) {
      this.socket.off('user_online');
      this.socket.off('user_offline');
    }
  }
}
// Export singleton instance
export default new SocketService();
