// ============================================================================
// COMMUNITY PAGE - Community management, chat, and resource coordination
// ============================================================================

import React, { useState } from 'react'

function CommunityPage({ user }) {
  const [activeView, setActiveView] = useState('list') // 'list', 'chat', 'map'
  const [selectedCommunity, setSelectedCommunity] = useState(null)

  // Communities data
  const [communities, setCommunities] = useState([
    {
      id: 1,
      name: 'Neighborhood Watch',
      description: 'Local neighborhood emergency coordination',
      memberCount: 47,
      activeMembers: 23,
      membersNeedingHelp: 2,
      unreadMessages: 12,
      avatar: '🏘️'
    },
    {
      id: 2,
      name: 'Family Group',
      description: 'Extended family coordination',
      memberCount: 12,
      activeMembers: 8,
      membersNeedingHelp: 0,
      unreadMessages: 3,
      avatar: '👨‍👩‍👧‍👦'
    },
    {
      id: 3,
      name: 'Riverside Community',
      description: 'Emergency preparedness and mutual aid',
      memberCount: 156,
      activeMembers: 89,
      membersNeedingHelp: 5,
      unreadMessages: 45,
      avatar: '🌊'
    }
  ])

  // Chat messages (sample data)
  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: 3,
      userName: 'Sarah Johnson',
      content: 'Need help evacuating, elderly parent can\'t walk',
      timestamp: Date.now() - 5 * 60 * 1000,
      replies: [
        {
          id: 11,
          userId: 2,
          userName: 'Dad',
          content: 'On my way! ETA 10 minutes',
          timestamp: Date.now() - 3 * 60 * 1000
        }
      ],
      pinned: true
    },
    {
      id: 2,
      userId: 5,
      userName: 'Mike Chen',
      content: 'Food distribution at community center, 3-5pm',
      timestamp: Date.now() - 30 * 60 * 1000,
      replies: [],
      pinned: true
    },
    {
      id: 3,
      userId: 7,
      userName: 'Lisa Rodriguez',
      content: 'Anyone have updates on road closures?',
      timestamp: Date.now() - 15 * 60 * 1000,
      replies: [
        {
          id: 31,
          userId: 8,
          userName: 'James Park',
          content: 'Highway 101 closed at Exit 24',
          timestamp: Date.now() - 10 * 60 * 1000
        }
      ],
      pinned: false
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleSelectCommunity = (community) => {
    setSelectedCommunity(community)
    setActiveView('chat')
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    if (replyingTo) {
      // Add reply to existing message
      const updatedMessages = messages.map(msg => {
        if (msg.id === replyingTo.id) {
          return {
            ...msg,
            replies: [
              ...msg.replies,
              {
                id: Date.now(),
                userId: user?.id,
                userName: user?.username,
                content: newMessage,
                timestamp: Date.now()
              }
            ]
          }
        }
        return msg
      })
      setMessages(updatedMessages)
      setReplyingTo(null)
    } else {
      // Create new message thread
      const message = {
        id: Date.now(),
        userId: user?.id,
        userName: user?.username,
        content: newMessage,
        timestamp: Date.now(),
        replies: [],
        pinned: false
      }
      setMessages([...messages, message])
    }

    setNewMessage('')
  }

  const handlePinMessage = (messageId) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, pinned: !msg.pinned }
      }
      return msg
    })
    setMessages(updatedMessages)
  }

  // Communities List View
  const renderCommunitiesList = () => (
    <div className="communities-list-view">
      <div className="view-header">
        <h2>My Communities</h2>
        <button className="add-btn">+ Join Community</button>
      </div>

      <div className="communities-list">
        {communities.map(community => (
          <div
            key={community.id}
            className="community-card"
            onClick={() => handleSelectCommunity(community)}
          >
            <div className="community-avatar">{community.avatar}</div>

            <div className="community-info">
              <div className="community-name">{community.name}</div>
              <div className="community-description">{community.description}</div>

              <div className="community-stats">
                <span className="stat">
                  👥 {community.activeMembers}/{community.memberCount} active
                </span>
                {community.membersNeedingHelp > 0 && (
                  <span className="stat help">
                    🆘 {community.membersNeedingHelp} need help
                  </span>
                )}
              </div>
            </div>

            {community.unreadMessages > 0 && (
              <div className="unread-badge">{community.unreadMessages}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Community Chat View (Reddit-style threading)
  const renderChatView = () => {
    if (!selectedCommunity) return null

    // Sort messages: pinned first, then by timestamp
    const sortedMessages = [...messages].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.timestamp - a.timestamp
    })

    return (
      <div className="chat-view">
        {/* Chat Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => setActiveView('list')}>
            ← Back
          </button>

          <div className="chat-header-info">
            <div className="chat-avatar">{selectedCommunity.avatar}</div>
            <div className="chat-title-info">
              <div className="chat-name">{selectedCommunity.name}</div>
              <div className="chat-subtitle">
                {selectedCommunity.activeMembers} active members
              </div>
            </div>
          </div>

          <button
            className="map-btn"
            onClick={() => setActiveView('map')}
            title="View community map"
          >
            🗺️
          </button>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {sortedMessages.map(message => (
            <div key={message.id} className={`message-thread ${message.pinned ? 'pinned' : ''}`}>
              {message.pinned && (
                <div className="pinned-indicator">📌 Pinned</div>
              )}

              {/* Main Message */}
              <div className="message">
                <div className="message-avatar">👤</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-author">{message.userName}</span>
                    <span className="message-time">{formatTimeAgo(message.timestamp)}</span>
                  </div>
                  <div className="message-text">{message.content}</div>

                  <div className="message-actions">
                    <button
                      className="action-btn"
                      onClick={() => setReplyingTo(message)}
                    >
                      💬 Reply ({message.replies.length})
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handlePinMessage(message.id)}
                    >
                      {message.pinned ? '📌 Unpin' : '📌 Pin'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies (threaded) */}
              {message.replies && message.replies.length > 0 && (
                <div className="message-replies">
                  {message.replies.map(reply => (
                    <div key={reply.id} className="message reply">
                      <div className="reply-line"></div>
                      <div className="message-avatar">👤</div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-author">{reply.userName}</span>
                          <span className="message-time">{formatTimeAgo(reply.timestamp)}</span>
                        </div>
                        <div className="message-text">{reply.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          {replyingTo && (
            <div className="replying-to-banner">
              <span>Replying to {replyingTo.userName}</span>
              <button onClick={() => setReplyingTo(null)}>✕</button>
            </div>
          )}
          <input
            type="text"
            className="message-input"
            placeholder={replyingTo ? "Write a reply..." : "Message to community..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="send-btn" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    )
  }

  // Community Map View
  const renderCommunityMap = () => (
    <div className="community-map-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => setActiveView('chat')}>
          ← Back to Chat
        </button>
        <h2>{selectedCommunity?.name} - Map</h2>
      </div>

      <div className="map-placeholder">
        <p>🗺️ Community Resources Map</p>
        <p className="placeholder-text">
          Interactive map showing:
          <br />• Members in need (🆘 red markers)
          <br />• Food distribution (🍽️ blue markers)
          <br />• Shelter locations (🏠 green markers)
          <br />• Medical assistance (⚕️ markers)
          <br />• Safe zones (green areas)
        </p>
      </div>

      <div className="map-resources-list">
        <h3>Community Resources</h3>

        <div className="resource-section">
          <h4>🆘 Members Needing Help ({selectedCommunity?.membersNeedingHelp || 0})</h4>
          <div className="resource-item">
            <span className="resource-icon">🆘</span>
            <div className="resource-info">
              <div className="resource-name">Sarah Johnson</div>
              <div className="resource-details">Needs evacuation assistance</div>
              <div className="resource-location">📍 0.8 miles away</div>
            </div>
          </div>
        </div>

        <div className="resource-section">
          <h4>🍽️ Food Distribution</h4>
          <div className="resource-item">
            <span className="resource-icon">🍽️</span>
            <div className="resource-info">
              <div className="resource-name">Community Center</div>
              <div className="resource-details">Daily meals 3-5pm</div>
              <div className="resource-location">📍 1.2 miles away</div>
            </div>
          </div>
        </div>

        <div className="resource-section">
          <h4>🏠 Shelter Locations</h4>
          <div className="resource-item">
            <span className="resource-icon">🏠</span>
            <div className="resource-info">
              <div className="resource-name">Red Cross Shelter</div>
              <div className="resource-details">Capacity: 200 people</div>
              <div className="resource-location">📍 2.5 miles away</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="community-page">
      {activeView === 'list' && renderCommunitiesList()}
      {activeView === 'chat' && renderChatView()}
      {activeView === 'map' && renderCommunityMap()}
    </div>
  )
}

export default CommunityPage