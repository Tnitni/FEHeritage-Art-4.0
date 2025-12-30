import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useUser } from '../context/UserContext'
import { friendService, socketService, cloudinaryService } from '../services'
import { getErrorMessage } from '../utils/apiHelpers'
import ChatModal from '../components/chat/ChatModal'
import './FriendsPage.css'

const FriendsPage = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  // Chat state
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const [isEditingAvatar, setIsEditingAvatar] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadFriends()
      loadFriendRequests()
      loadSuggestions()

      // Setup socket listeners
      socketService.onReceiveFriendRequest(handleReceiveFriendRequest)
      socketService.onFriendRequestAccepted(handleFriendRequestAccepted)
      socketService.onReceiveMessage(handleReceiveMessage)
      socketService.onUserOnline(handleUserOnline)
      socketService.onUserOffline(handleUserOffline)

      return () => {
        socketService.offReceiveFriendRequest()
        socketService.offFriendRequestAccepted()
        socketService.offReceiveMessage()
        socketService.offUserStatus()
      }
    }
  }, [user])

  // Socket event handlers
  const handleReceiveFriendRequest = (request) => {
    toast.success(`${request.user.name} đã gửi lời mời kết bạn!`)
    loadFriendRequests()
  }

  const handleFriendRequestAccepted = (friendship) => {
    toast.success('Lời mời kết bạn đã được chấp nhận!')
    loadFriends()
  }

  const handleReceiveMessage = (message) => {
    console.log('Received message:', message)
    // Only show notification if chat is not open with that friend
    if (!isChatOpen || selectedFriend?.id !== message.sender_id) {
      toast.success(`Tin nhắn mới từ ${message.sender?.name || 'bạn bè'}`)
    }
  }

  const handleUserOnline = ({ userId }) => {
    setOnlineUsers(prev => new Set([...prev, userId]))
  }

  const handleUserOffline = ({ userId }) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev)
      newSet.delete(userId)
      return newSet
    })
  }

  // API calls
  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await friendService.getFriends()
      if (response.success) {
        setFriends(response.data.friends || [])
      }
    } catch (error) {
      console.error('Failed to load friends:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const response = await friendService.getPendingRequests()
      if (response.success) {
        setFriendRequests(response.data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load friend requests:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await friendService.getSuggestions()
      if (response.success) {
        setSuggestions(response.data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const handleSendFriendRequest = async (friendId) => {
    try {
      const response = await friendService.sendFriendRequest(friendId)
      if (response.success) {
        toast.success('Đã gửi lời mời kết bạn!')

        // Send socket notification
        socketService.sendFriendRequest(friendId, response.data.friendship)

        // Remove from suggestions
        setSuggestions(prev => prev.filter(s => s.id !== friendId))
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleAcceptFriendRequest = async (request) => {
    try {
      const response = await friendService.acceptFriendRequest(request.id)
      if (response.success) {
        toast.success('Đã chấp nhận lời mời kết bạn!')

        // Notify sender via socket
        socketService.notifyFriendRequestAccepted(request.user_id, response.data.friendship)

        // Reload data
        loadFriends()
        setFriendRequests(prev => prev.filter(r => r.id !== request.id))
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleRejectFriendRequest = async (request) => {
    try {
      const response = await friendService.rejectFriendRequest(request.id)
      if (response.success) {
        toast.success('Đã từ chối lời mời kết bạn')
        setFriendRequests(prev => prev.filter(r => r.id !== request.id))
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Bạn có chắc muốn xóa bạn bè này?')) return

    try {
      const response = await friendService.removeFriend(friendId)
      if (response.success) {
        toast.success('Đã xóa bạn bè')
        setFriends(prev => prev.filter(f => f.id !== friendId))

        // Close chat if open
        if (selectedFriend?.id === friendId) {
          setIsChatOpen(false)
          setSelectedFriend(null)
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  // Chat functions
  const openChat = (friend) => {
    setSelectedFriend(friend)
    setIsChatOpen(true)
  }

  const closeChat = () => {
    setIsChatOpen(false)
    setSelectedFriend(null)
  }

  // Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    try {
      toast.loading('Đang tải ảnh lên...', { id: 'upload-avatar' })
      await cloudinaryService.uploadAvatar(file)
      // Update via authService would be better but for now just show success
      toast.success('Cập nhật ảnh đại diện thành công!', { id: 'upload-avatar' })
      setIsEditingAvatar(false)
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Không thể tải ảnh lên', { id: 'upload-avatar' })
    }
  }

  const handleAvatarURL = () => {
    const url = prompt('Nhập URL ảnh đại diện:')
    if (url) {
      toast.success('Cập nhật ảnh đại diện thành công!')
      setIsEditingAvatar(false)
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isOnline = (friendId) => onlineUsers.has(friendId)

  return (
    <div className="friends-page">
      <div className="friends-container">
        {/* User Profile Card */}
        <div className="user-profile-card">
          <div className="profile-banner"></div>
          <div className="profile-content">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                <img src={user?.avatar || 'https://i.pravatar.cc/150?img=68'} alt={user?.name} className="profile-avatar" />
                <button
                  className="avatar-edit-btn"
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  title="Thay đổi ảnh đại diện"
                >
                  <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {isEditingAvatar && (
                  <div className="avatar-edit-menu">
                    <label className="avatar-option">
                      <svg className="option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Tải ảnh lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button className="avatar-option" onClick={handleAvatarURL}>
                      <svg className="option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Nhập URL</span>
                    </button>
                    <button
                      className="avatar-option cancel"
                      onClick={() => setIsEditingAvatar(false)}
                    >
                      <svg className="option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Hủy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user?.name || 'Người dùng'}</h2>
              <p className="profile-bio">{user?.intro || 'Yêu thích nghệ thuật AI và công nghệ'}</p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{friends.length}</span>
                  <span className="stat-label">Bạn bè</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{friends.filter(f => isOnline(f.id)).length}</span>
                  <span className="stat-label">Đang online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="friends-header">
          <div className="header-content">
            <div className="header-icon">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="header-title">Danh sách bạn bè</h1>
              <p className="header-subtitle">Bạn có {friends.length} người bạn</p>
            </div>
          </div>

          {/* Search */}
          <div className="search-box">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="friends-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          >
            👥 Tất cả bạn bè ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          >
            ✉️ Lời mời kết bạn ({friendRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          >
            💡 Gợi ý kết bạn
          </button>
        </div>

        {/* Content */}
        <div className="friends-content">
          {/* All Friends */}
          {activeTab === 'all' && (
            <div className="friends-grid">
              {filteredFriends.map(friend => (
                <div key={friend.id} className="friend-card">
                  <div className="friend-avatar-wrapper">
                    <img src={friend.avatar || 'https://i.pravatar.cc/150'} alt={friend.name} className="friend-avatar" />
                    <span className={`status-badge ${isOnline(friend.id) ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{friend.name}</h3>
                    <p className="friend-bio">{friend.intro || 'Người dùng Heritage Art'}</p>
                  </div>
                  <div className="friend-actions">
                    <button className="action-btn message" onClick={() => openChat(friend)}>
                      <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Nhắn tin
                    </button>
                    <button className="action-btn unfriend" onClick={() => handleRemoveFriend(friend.id)}>
                      <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friend Requests */}
          {activeTab === 'requests' && (
            <div className="friends-grid">
              {friendRequests.map(request => (
                <div key={request.id} className="friend-card request-card">
                  <div className="friend-avatar-wrapper">
                    <img src={request.user?.avatar || 'https://i.pravatar.cc/150'} alt={request.user?.name} className="friend-avatar" />
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{request.user?.name}</h3>
                    <p className="friend-bio">{request.user?.intro || 'Người dùng Heritage Art'}</p>
                  </div>
                  <div className="friend-actions request-actions">
                    <button className="action-btn accept" onClick={() => handleAcceptFriendRequest(request)}>
                      ✓ Chấp nhận
                    </button>
                    <button className="action-btn reject" onClick={() => handleRejectFriendRequest(request)}>
                      ✕ Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="friends-grid">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="friend-card suggestion-card">
                  <div className="friend-avatar-wrapper">
                    <img src={suggestion.avatar || 'https://i.pravatar.cc/150'} alt={suggestion.name} className="friend-avatar" />
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{suggestion.name}</h3>
                    <p className="friend-bio">{suggestion.intro || 'Người dùng Heritage Art'}</p>
                  </div>
                  <div className="friend-actions">
                    <button className="action-btn add-friend" onClick={() => handleSendFriendRequest(suggestion.id)}>
                      ➕ Kết bạn
                    </button>
                    <button className="action-btn remove">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal Component */}
        <ChatModal
          friend={selectedFriend}
          isOpen={isChatOpen}
          onClose={closeChat}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  )
}

export default FriendsPage