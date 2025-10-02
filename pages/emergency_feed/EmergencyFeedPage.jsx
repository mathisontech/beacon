// ============================================================================
// EMERGENCY FEED PAGE - Unified people and communities under threat
// ============================================================================

import React, { useState, useMemo } from 'react'
import './EmergencyFeedPage.css'
import { STATUS_TYPES, getStatusById } from '../../shared_util/data/userStatusUpdates'
import { LOCATION_ALERTS } from '../../shared_util/data/locationAlerts'
import LocationAvailableIcon from '../../shared_util/managers/gps_mngr/location_available_icon.svg'
import LocationNotAvailableIcon from '../../shared_util/managers/gps_mngr/location_not_available_icon.svg'

function EmergencyFeedPage({ user }) {
  const [beaconActive, setBeaconActive] = useState(false)
  const [myStatus, setMyStatus] = useState('safe')
  const [selectedEntity, setSelectedEntity] = useState(null) // person or community
  const [newMessage, setNewMessage] = useState('')

  // Mock data: People and Communities under threat
  const [entities, setEntities] = useState([
    // People
    {
      id: 'person-1',
      type: 'person',
      name: 'Mom',
      avatar: '👩',
      beaconActive: true,
      location: { lat: 40.758, lng: -73.985, name: 'Manhattan, NY' },
      threat: 'hurricane_warning',
      lastUpdate: Date.now() - 10 * 60 * 1000
    },
    {
      id: 'person-2',
      type: 'person',
      name: 'Dad',
      avatar: '👨',
      beaconActive: true,
      location: { lat: 40.748, lng: -73.986, name: 'Chelsea, NY' },
      threat: 'power_outage_widespread',
      lastUpdate: Date.now() - 30 * 60 * 1000
    },
    {
      id: 'person-3',
      type: 'person',
      name: 'Sarah Johnson',
      avatar: '👩',
      beaconActive: true,
      location: { lat: 40.706, lng: -73.997, name: 'Brooklyn, NY' },
      threat: 'flash_flood_warning',
      lastUpdate: Date.now() - 5 * 60 * 1000
    },
    // Communities
    {
      id: 'community-1',
      type: 'community',
      name: 'Upper East Side Neighbors',
      avatar: '🏘️',
      beaconActive: true,
      location: { lat: 40.768, lng: -73.965, name: 'Upper East Side, NY' },
      threat: 'evacuation_warning',
      memberCount: 47,
      activeMemberCount: 32,
      lastUpdate: Date.now() - 15 * 60 * 1000
    },
    {
      id: 'community-2',
      type: 'community',
      name: 'Brooklyn Heights Community',
      avatar: '🏘️',
      beaconActive: true,
      location: { lat: 40.695, lng: -73.993, name: 'Brooklyn Heights, NY' },
      threat: 'flood_warning',
      memberCount: 128,
      activeMemberCount: 89,
      lastUpdate: Date.now() - 8 * 60 * 1000
    }
  ])

  // Mock status updates and messages
  const [statusUpdates] = useState({
    'person-1': [
      {
        id: 1,
        type: 'location_alert',
        alertId: 'hurricane_warning',
        userMessage: null,
        location: { lat: 40.758, lng: -73.985 },
        timestamp: Date.now() - 120 * 60 * 1000
      },
      {
        id: 2,
        type: 'status',
        statusType: 'evacuating',
        userMessage: 'Evacuating to Red Cross shelter',
        location: { lat: 40.758, lng: -73.985 },
        timestamp: Date.now() - 90 * 60 * 1000
      },
      {
        id: 3,
        type: 'status',
        statusType: 'at_shelter',
        userMessage: 'Made it to shelter',
        location: { lat: 40.758, lng: -73.986 },
        timestamp: Date.now() - 60 * 60 * 1000
      }
    ]
  })

  const [messages] = useState({
    'person-1': [
      {
        id: 1,
        senderId: 'person-1',
        content: 'Are you safe?',
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        id: 2,
        senderId: user?.id,
        content: 'Yes, at the shelter. How are you?',
        timestamp: Date.now() - 50 * 60 * 1000
      }
    ]
  })

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getAlertByVariantId = (variantId) => {
    for (const alert of LOCATION_ALERTS) {
      if (!alert.variants) continue
      const variant = alert.variants.find(v => v.id === variantId)
      if (variant) {
        return {
          ...alert,
          variant
        }
      }
    }
    return LOCATION_ALERTS.find(a => a.id === variantId)
  }

  const getThreatInfo = (threatId) => {
    const alertData = getAlertByVariantId(threatId)
    if (!alertData) return { name: 'Unknown Threat', icon: '⚠️', color: '#94a3b8' }

    return {
      name: alertData.variant ? alertData.variant.name : alertData.name,
      icon: alertData.icon,
      color: alertData.color
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedEntity) return
    // TODO: Send message
    setNewMessage('')
  }

  // Main Feed View
  const renderFeedView = () => (
    <div className="feed-view">
      {/* User Status Header */}
      <div className="user-status-header">
        <div className="user-profile">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-name">You</div>
            <div className="user-status">Status: {myStatus}</div>
          </div>
        </div>

        <button
          className={`beacon-toggle ${beaconActive ? 'active' : ''}`}
          onClick={() => setBeaconActive(!beaconActive)}
        >
          {beaconActive ? '🔴 Beacon Active' : '⚫ Beacon Off'}
        </button>
      </div>

      {/* Threat Feed */}
      <div className="threat-feed">
        <div className="feed-header">
          <h2>🚨 Active Threats</h2>
          <p className="feed-subtitle">People and communities in your network</p>
        </div>

        <div className="entities-list">
          {entities.map(entity => {
            const threat = getThreatInfo(entity.threat)

            return (
              <div
                key={entity.id}
                className="entity-card"
                onClick={() => setSelectedEntity(entity)}
              >
                <div className="entity-header">
                  <div className="entity-avatar">{entity.avatar}</div>
                  <div className="entity-info">
                    <div className="entity-name">{entity.name}</div>
                    <div className="entity-location">📍 {entity.location.name}</div>
                    {entity.type === 'community' && (
                      <div className="entity-members">
                        {entity.activeMemberCount}/{entity.memberCount} members active
                      </div>
                    )}
                  </div>
                  {entity.beaconActive && (
                    <div className="beacon-indicator">🔴 LIVE</div>
                  )}
                </div>

                <div className="entity-threat" style={{ borderLeftColor: threat.color }}>
                  <span className="threat-icon">{threat.icon}</span>
                  <span className="threat-name">{threat.name}</span>
                  <span className="threat-time">{formatTimeAgo(entity.lastUpdate)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // Detail View (3-panel layout)
  const renderDetailView = () => {
    if (!selectedEntity) return null

    const entityMessages = messages[selectedEntity.id] || []
    const entityStatusUpdates = statusUpdates[selectedEntity.id] || []
    const threat = getThreatInfo(selectedEntity.threat)

    return (
      <div className="detail-view">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={() => setSelectedEntity(null)}>
            ← Back
          </button>

          <div className="detail-header-info">
            <div className="detail-avatar">{selectedEntity.avatar}</div>
            <div className="detail-title">
              <div className="detail-name">{selectedEntity.name}</div>
              <div className="detail-location">📍 {selectedEntity.location.name}</div>
            </div>
          </div>

          <div className="detail-threat-badge" style={{ backgroundColor: threat.color }}>
            {threat.icon} {threat.name}
          </div>
        </div>

        {/* 2-Panel Layout: Chat (top 50%) and Status Feed (bottom 50%) */}
        <div className="two-panel-container">
          {/* Top: Chat (50% height) */}
          <div className="chat-panel">
            <div className="panel-title">Chat</div>
            <div className="chat-messages-area">
              {entityMessages.length === 0 ? (
                <div className="no-content">No messages yet</div>
              ) : (
                entityMessages.map(message => {
                  const isMyMessage = message.senderId === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`message ${isMyMessage ? 'my-message' : 'their-message'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">{formatTimeAgo(message.timestamp)}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>Send</button>
            </div>
          </div>

          {/* Bottom: Status Feed (50% height) */}
          <div className="status-panel">
            <div className="panel-title">Status Feed</div>
            <div className="status-feed-area-detail">
              {entityStatusUpdates.length === 0 ? (
                <div className="no-content">No status updates</div>
              ) : (
                <div className="status-updates-list">
                  {[...entityStatusUpdates].reverse().map(update => {
                    let bulletColor, name, color, category, hasLocation

                    if (update.type === 'location_alert') {
                      const alertData = getAlertByVariantId(update.alertId)
                      if (!alertData) return null

                      bulletColor = '#dc2626' // Red for computer-generated location alert
                      name = alertData.variant ? alertData.variant.name : alertData.name
                      color = alertData.color
                      category = alertData.category
                      hasLocation = true // Location alerts always have location
                    } else {
                      const statusData = getStatusById(update.statusType)
                      if (!statusData) return null

                      bulletColor = '#3b82f6' // Blue for user-created status update
                      name = statusData.name
                      color = statusData.color
                      category = statusData.category
                      hasLocation = update.location ? true : false // Check if update has location
                    }

                    return (
                      <div
                        key={update.id}
                        className="status-update-compact"
                      >
                        <div className="status-update-header">
                          <img
                            src={hasLocation ? LocationAvailableIcon : LocationNotAvailableIcon}
                            alt={hasLocation ? "Location available" : "Location not available"}
                            className="status-location-pin"
                            style={{ filter: `brightness(0) saturate(100%) invert(${bulletColor === '#dc2626' ? '27% sepia(89%) saturate(4623%) hue-rotate(348deg) brightness(97%) contrast(86%)' : '47% sepia(92%) saturate(3228%) hue-rotate(201deg) brightness(96%) contrast(88%)'})` }}
                          />
                          <span className="status-message">{update.userMessage || name}</span>
                          <span className="status-time">{formatTimeAgo(update.timestamp)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="emergency-feed-page">
      {!selectedEntity && renderFeedView()}
      {selectedEntity && renderDetailView()}
    </div>
  )
}

export default EmergencyFeedPage
