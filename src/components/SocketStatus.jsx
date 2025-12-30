import React, { useState, useEffect } from 'react'
import { socketService } from '../services'

const SocketStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    socketId: null,
    lastUpdate: null
  })

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        connected: socketService.socket?.connected || false,
        socketId: socketService.socket?.id || null,
        lastUpdate: new Date().toLocaleTimeString()
      })
    }

    // Initial check
    updateStatus()

    // Update every second
    const interval = setInterval(updateStatus, 1000)

    // Listen to socket events
    if (socketService.socket) {
      socketService.socket.on('connect', updateStatus)
      socketService.socket.on('disconnect', updateStatus)
    }

    return () => {
      clearInterval(interval)
      if (socketService.socket) {
        socketService.socket.off('connect', updateStatus)
        socketService.socket.off('disconnect', updateStatus)
      }
    }
  }, [])

  const forceReconnect = () => {
    console.log('Force reconnecting socket...')
    if (socketService.socket) {
      socketService.socket.disconnect()
      socketService.socket.connect()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: status.connected ? '#22c55e' : '#ef4444',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      cursor: 'pointer'
    }} onClick={forceReconnect} title="Click to reconnect">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status.connected ? '#86efac' : '#fca5a5',
          animation: status.connected ? 'pulse 2s infinite' : 'none'
        }} />
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {status.connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          {status.socketId && (
            <div style={{ fontSize: '10px', opacity: 0.9 }}>
              ID: {status.socketId.substring(0, 8)}...
            </div>
          )}
          <div style={{ fontSize: '10px', opacity: 0.7 }}>
            {status.lastUpdate}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default SocketStatus
