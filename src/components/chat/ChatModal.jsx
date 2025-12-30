import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import { messageService, socketService } from '../../services'
import { getErrorMessage } from '../../utils/apiHelpers'
import { useUser } from '../../context/UserContext'
import './ChatModal.css'

const ChatModal = ({ friend, isOpen, onClose, onlineUsers }) => {
  const { user } = useUser()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Check if friend is online
  const isOnline = friend && onlineUsers.has(friend.id)

  // Load messages when chat opens or friend changes
  useEffect(() => {
    if (isOpen && friend) {
      loadMessages()
    }
  }, [isOpen, friend])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Socket listener for incoming messages
  useEffect(() => {
    if (!isOpen || !friend || !user) return

    const handleReceiveMessage = (message) => {

      // Check if message belongs to this conversation
      const isInThisConversation =
        (message.sender_id === friend.id && message.receiver_id === user.id) ||
        (message.sender_id === user.id && message.receiver_id === friend.id)

      if (isInThisConversation) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.id === message.id)
          if (exists) return prev

          // Add new message and scroll
          const updated = [...prev, message]
          setTimeout(scrollToBottom, 100)
          return updated
        })
      }
    }

    // Register listener
    socketService.onReceiveMessage(handleReceiveMessage)

    // Cleanup - pass the specific handler to remove only this listener
    return () => {
      socketService.offReceiveMessage(handleReceiveMessage)
    }
  }, [isOpen, friend, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!friend) return

    try {
      setLoading(true)
      const response = await messageService.getConversation(friend.id)
      if (response.success) {
        setMessages(response.data.messages || [])
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast.error('Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !friend) return

    const messageContent = newMessage
    setNewMessage('') // Clear immediately for better UX

    try {
      const response = await messageService.sendMessage(friend.id, messageContent)

      if (response.success) {
        // Add message to local state
        setMessages(prev => [...prev, response.data.message])

        // Send via socket for real-time delivery to receiver
        socketService.sendMessage(friend.id, response.data.message)

        // Scroll to bottom
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error(getErrorMessage(error))
    }
  }

  if (!isOpen || !friend) return null

  return (
    <div className="chat-modal">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-friend-info">
            <img
              src={friend.avatar || 'https://i.pravatar.cc/150'}
              alt={friend.name}
              className="chat-avatar"
            />
            <div>
              <h4>{friend.name}</h4>
              <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>
          <button className="close-chat" onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {loading ? (
            <div className="loading">Đang tải tin nhắn...</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">Chưa có tin nhắn nào</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
              >
                <div className="message-avatar">
                  <img
                    src={msg.sender?.avatar || 'https://i.pravatar.cc/150'}
                    alt={msg.sender?.name}
                  />
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="chat-input"
            autoFocus
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}


ChatModal.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onlineUsers: PropTypes.instanceOf(Set).isRequired
}

export default ChatModal
