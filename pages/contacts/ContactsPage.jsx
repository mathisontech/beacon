import React, { useState, useMemo } from 'react'
import './ContactsPage.css'
import { STATUS_TYPES, getStatusById } from '../../shared_util/data/userStatusUpdates'
import { LOCATION_ALERTS } from '../../shared_util/data/locationAlerts'
import SimpleMap from '../../shared_util/components/map/SimpleMap'

function ContactsPage({ user }) {
  const [activeView, setActiveView] = useState('list')
  const [selectedContact, setSelectedContact] = useState(null)
  const [newMessage, setNewMessage] = useState('')

  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Mom',
      avatar: '👩',
      beaconActive: true,
      needsHelp: false,
      status: 'safe',
      lastSeen: Date.now() - 10 * 60 * 1000,
      unreadMessages: 0
    },
    {
      id: 2,
      name: 'Dad',
      avatar: '👨',
      beaconActive: true,
      needsHelp: false,
      status: 'sheltering',
      lastSeen: Date.now() - 30 * 60 * 1000,
      unreadMessages: 2
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      avatar: '👩',
      beaconActive: true,
      needsHelp: true,
      status: 'help',
      lastSeen: Date.now() - 5 * 60 * 1000,
      unreadMessages: 5
    },
    {
      id: 4,
      name: 'Mike Chen',
      avatar: '👨',
      beaconActive: false,
      needsHelp: false,
      status: 'offline',
      lastSeen: Date.now() - 2 * 60 * 60 * 1000,
      unreadMessages: 0
    },
    {
      id: 5,
      name: 'Sister',
      avatar: '👧',
      beaconActive: false,
      needsHelp: false,
      status: 'offline',
      lastSeen: Date.now() - 20 * 60 * 1000,
      unreadMessages: 1
    }
  ])

  const [messages, setMessages] = useState({
    1: [],
    2: [
      {
        id: 1,
        senderId: 2,
        content: 'Are you safe?',
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        id: 2,
        senderId: user?.id,
        content: 'Yes, sheltering at home',
        timestamp: Date.now() - 50 * 60 * 1000
      }
    ],
    3: [
      {
        id: 1,
        senderId: 3,
        content: 'Need help evacuating, elderly parent can\'t walk',
        timestamp: Date.now() - 10 * 60 * 1000
      }
    ]
  })

  const [statusUpdates, setStatusUpdates] = useState({
    1: [
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
        type: 'location_alert',
        alertId: 'flood_warning',
        userMessage: null,
        location: { lat: 40.758, lng: -73.985 },
        timestamp: Date.now() - 100 * 60 * 1000
      },
      {
        id: 3,
        type: 'status',
        statusType: 'evacuating',
        userMessage: 'Evacuating to Red Cross shelter',
        location: { lat: 40.758, lng: -73.985 },
        timestamp: Date.now() - 90 * 60 * 1000
      },
      {
        id: 4,
        type: 'location_alert',
        alertId: 'road_blockage',
        userMessage: null,
        location: { lat: 40.758, lng: -73.986 },
        timestamp: Date.now() - 70 * 60 * 1000
      },
      {
        id: 5,
        type: 'status',
        statusType: 'at_shelter',
        userMessage: 'Made it to shelter',
        location: { lat: 40.758, lng: -73.986 },
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        id: 6,
        type: 'location_alert',
        alertId: 'excessive_heat_warning',
        userMessage: null,
        location: { lat: 40.758, lng: -73.986 },
        timestamp: Date.now() - 30 * 60 * 1000
      },
      {
        id: 7,
        type: 'status',
        statusType: 'safe',
        userMessage: 'Safe and secure here',
        location: { lat: 40.758, lng: -73.986 },
        timestamp: Date.now() - 10 * 60 * 1000
      }
    ],
    2: [
      {
        id: 1,
        type: 'location_alert',
        alertId: 'high_wind_warning',
        userMessage: null,
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 180 * 60 * 1000
      },
      {
        id: 2,
        type: 'location_alert',
        alertId: 'power_outage_widespread',
        userMessage: null,
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 150 * 60 * 1000
      },
      {
        id: 3,
        type: 'status',
        statusType: 'sheltering_in_place',
        userMessage: 'Staying at home',
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 120 * 60 * 1000
      },
      {
        id: 4,
        type: 'location_alert',
        alertId: 'water_service_disruption',
        userMessage: null,
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 90 * 60 * 1000
      },
      {
        id: 5,
        type: 'status',
        statusType: 'have_generator',
        userMessage: 'Running on generator',
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 45 * 60 * 1000
      },
      {
        id: 6,
        type: 'location_alert',
        alertId: 'live_wire',
        userMessage: 'Power lines down on my street!',
        location: { lat: 40.748, lng: -73.986 },
        timestamp: Date.now() - 15 * 60 * 1000
      }
    ],
    3: [
      {
        id: 1,
        type: 'location_alert',
        alertId: 'flash_flood_warning',
        userMessage: null,
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 100 * 60 * 1000
      },
      {
        id: 2,
        type: 'status',
        statusType: 'elderly_care',
        userMessage: 'With my elderly mother, she has mobility issues',
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 90 * 60 * 1000
      },
      {
        id: 3,
        type: 'location_alert',
        alertId: 'evacuation_warning',
        userMessage: null,
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 50 * 60 * 1000
      },
      {
        id: 4,
        type: 'location_alert',
        alertId: 'road_blockage',
        userMessage: 'Main street is flooded!',
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 30 * 60 * 1000
      },
      {
        id: 5,
        type: 'status',
        statusType: 'need_transport',
        userMessage: 'Need help evacuating, car won\'t start',
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 15 * 60 * 1000
      },
      {
        id: 6,
        type: 'location_alert',
        alertId: 'evacuation_order',
        userMessage: null,
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 8 * 60 * 1000
      },
      {
        id: 7,
        type: 'status',
        statusType: 'need_help',
        userMessage: 'URGENT - Need help now!',
        location: { lat: 40.706, lng: -73.997 },
        timestamp: Date.now() - 5 * 60 * 1000
      }
    ],
    4: [
      {
        id: 1,
        type: 'location_alert',
        alertId: 'shelter_in_place',
        userMessage: null,
        location: { lat: 40.720, lng: -74.000 },
        timestamp: Date.now() - 250 * 60 * 1000
      },
      {
        id: 2,
        type: 'status',
        statusType: 'at_work',
        userMessage: 'At the hospital, pulling double shift',
        location: { lat: 40.720, lng: -74.000 },
        timestamp: Date.now() - 240 * 60 * 1000
      },
      {
        id: 3,
        type: 'status',
        statusType: 'medical_professional',
        userMessage: 'Helping with emergency patients',
        location: { lat: 40.720, lng: -74.000 },
        timestamp: Date.now() - 180 * 60 * 1000
      },
      {
        id: 4,
        type: 'status',
        statusType: 'no_cell_service',
        userMessage: 'Cell service getting spotty, may lose contact',
        location: { lat: 40.720, lng: -74.000 },
        timestamp: Date.now() - 120 * 60 * 1000
      }
    ],
    5: [
      {
        id: 1,
        type: 'status',
        statusType: 'evacuated',
        userMessage: 'Made it to grandma\'s house upstate',
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 180 * 60 * 1000
      },
      {
        id: 2,
        type: 'status',
        statusType: 'with_children',
        userMessage: 'Kids are safe and doing okay',
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 150 * 60 * 1000
      },
      {
        id: 3,
        type: 'status',
        statusType: 'have_power',
        userMessage: null,
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 120 * 60 * 1000
      },
      {
        id: 4,
        type: 'location_alert',
        alertId: 'wind_advisory',
        userMessage: 'Roads are clear here, storm hasn\'t reached us',
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 100 * 60 * 1000
      },
      {
        id: 5,
        type: 'status',
        statusType: 'have_food',
        userMessage: null,
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 90 * 60 * 1000
      },
      {
        id: 6,
        type: 'status',
        statusType: 'have_shelter_space',
        userMessage: 'Grandma has 2 extra bedrooms if anyone needs a place',
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        id: 7,
        type: 'status',
        statusType: 'can_transport',
        userMessage: null,
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 30 * 60 * 1000
      },
      {
        id: 8,
        type: 'status',
        statusType: 'can_help_others',
        userMessage: 'Ready to help if anyone needs it',
        location: { lat: 40.785, lng: -73.968 },
        timestamp: Date.now() - 10 * 60 * 1000
      }
    ]
  })

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.beaconActive && b.beaconActive) {
        if (a.needsHelp && !b.needsHelp) return -1
        if (!a.needsHelp && b.needsHelp) return 1
        return b.lastSeen - a.lastSeen
      }
      if (a.beaconActive && !b.beaconActive) return -1
      if (!a.beaconActive && b.beaconActive) return 1
      return b.lastSeen - a.lastSeen
    })
  }, [contacts])

  const beaconActiveContacts = sortedContacts.filter(c => c.beaconActive)
  const offlineContacts = sortedContacts.filter(c => !c.beaconActive)

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

  const handleOpenChat = (contact) => {
    alert('CLICK DETECTED: ' + contact.name)
    console.log('handleOpenChat called with contact:', contact)
    setSelectedContact(contact)
    setActiveView('chat')
    console.log('activeView set to: chat')
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const message = {
      id: Date.now(),
      senderId: user?.id,
      content: newMessage,
      timestamp: Date.now()
    }

    setMessages({
      ...messages,
      [selectedContact.id]: [...(messages[selectedContact.id] || []), message]
    })
    setNewMessage('')
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'safe': return '✅ Safe'
      case 'sheltering': return '🏠 Sheltering'
      case 'help': return '🆘 Need Help!'
      case 'offline': return 'Last seen'
      default: return ''
    }
  }

  const renderContactsList = () => (
    <div className="contacts-list-view">
      <div className="view-header">
        <h2>Contacts</h2>
        <button className="add-btn">+ Add</button>
      </div>

      {beaconActiveContacts.length > 0 && (
        <div className="contacts-section">
          <div className="section-header">
            <span className="section-icon">🔴</span>
            <span className="section-title">BEACON ACTIVE</span>
          </div>

          <div className="contacts-list">
            {beaconActiveContacts.map(contact => (
              <div
                key={contact.id}
                className={`contact-card ${contact.needsHelp ? 'needs-help' : ''}`}
                onClick={() => handleOpenChat(contact)}
              >
                <div className="contact-avatar">{contact.avatar}</div>

                <div className="contact-info">
                  <div className="contact-name-row">
                    <span className="contact-name">{contact.name}</span>
                    {contact.needsHelp && <span className="help-badge">❗</span>}
                  </div>
                  <div className={`contact-status status-${contact.status}`}>
                    {getStatusDisplay(contact.status)} • {formatTimeAgo(contact.lastSeen)}
                  </div>
                </div>

                {contact.unreadMessages > 0 && (
                  <div className="unread-badge">{contact.unreadMessages}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {offlineContacts.length > 0 && (
        <div className="contacts-section">
          <div className="section-header">
            <span className="section-icon">⚫</span>
            <span className="section-title">OFFLINE</span>
          </div>

          <div className="contacts-list">
            {offlineContacts.map(contact => (
              <div
                key={contact.id}
                className="contact-card offline"
                onClick={() => handleOpenChat(contact)}
              >
                <div className="contact-avatar offline">{contact.avatar}</div>

                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-status offline">
                    Last seen {formatTimeAgo(contact.lastSeen)}
                  </div>
                </div>

                {contact.unreadMessages > 0 && (
                  <div className="unread-badge">{contact.unreadMessages}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderChatView = () => {
    console.log('renderChatView called, selectedContact:', selectedContact)
    console.log('activeView:', activeView)

    if (!selectedContact) {
      console.log('No selected contact, returning null')
      return null
    }

    const chatMessages = messages[selectedContact.id] || []
    const contactStatusUpdates = statusUpdates[selectedContact.id] || []

    // Get contact's location from their latest status update
    const latestUpdate = contactStatusUpdates.length > 0
      ? contactStatusUpdates[contactStatusUpdates.length - 1]
      : null
    const contactLocation = latestUpdate?.location

    console.log('Rendering chat view for:', selectedContact.name)
    console.log('contactLocation:', contactLocation)

    return (
      <div className="contact-view" style={{ backgroundColor: 'pink', padding: '20px' }}>
        <div className="contact-header">
          <button className="back-btn" onClick={() => setActiveView('list')}>
            ← Back
          </button>
          <div className="contact-info-header">
            <div className="contact-avatar-small">{selectedContact.avatar}</div>
            <div>
              <div className="contact-name">{selectedContact.name}</div>
              <div className={`contact-status ${selectedContact.beaconActive ? 'active' : 'offline'}`}>
                {selectedContact.beaconActive ? `🟢 ${getStatusDisplay(selectedContact.status)}` : `⚫ Offline`}
              </div>
            </div>
          </div>
        </div>

        <h1 style={{ color: 'red', fontSize: '72px', backgroundColor: 'yellow' }}>BEFORE MAIN LAYOUT</h1>

        <div className="main-layout" style={{ display: 'flex', width: '100%', height: '500px', border: '3px solid blue' }}>
          <div className="left-panel" style={{ width: '50%', backgroundColor: 'lightblue' }}>
            <p>LEFT PANEL VISIBLE</p>
            <div className="chat-section">
              <div className="section-title">💬 Chat</div>
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <div className="empty-state">No messages yet</div>
                ) : (
                  chatMessages.map(message => {
                    const isMyMessage = message.senderId === user?.id
                    return (
                      <div key={message.id} className={`message ${isMyMessage ? 'my-message' : 'their-message'}`}>
                        <div className="message-content">
                          <div className="message-text">{message.content}</div>
                          <div className="message-time">{formatTimeAgo(message.timestamp)}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input"
                  placeholder={`Message ${selectedContact.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="send-btn" onClick={handleSendMessage}>Send</button>
              </div>
            </div>

            <div className="status-section">
              <div className="section-title">📢 Status Feed</div>
              <div className="status-feed">
                {contactStatusUpdates.length === 0 ? (
                  <div className="empty-state">No status updates</div>
                ) : (
                  <div className="status-updates-list">
                    {[...contactStatusUpdates].reverse().map(update => {
                      let icon, name, color, category

                      if (update.type === 'location_alert') {
                        const alertData = getAlertByVariantId(update.alertId)
                        if (!alertData) return null

                        icon = alertData.icon
                        name = alertData.variant ? alertData.variant.name : alertData.name
                        color = alertData.color
                        category = alertData.category
                      } else {
                        const statusData = getStatusById(update.statusType)
                        if (!statusData) return null

                        icon = statusData.icon
                        name = statusData.name
                        color = statusData.color
                        category = statusData.category
                      }

                      return (
                        <div key={update.id} className="status-update" style={{ borderLeftColor: color }}>
                          <div className="status-header">
                            <span className="status-icon">{icon}</span>
                            <span className="status-name">{name}</span>
                            <span className="status-time">{formatTimeAgo(update.timestamp)}</span>
                          </div>
                          {update.userMessage && <div className="status-message">{update.userMessage}</div>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="right-panel" style={{ backgroundColor: 'red', border: '10px solid yellow' }}>
            <h1 style={{ color: 'white', fontSize: '48px' }}>RIGHT PANEL TEST</h1>
            <div className="section-title">🗺️ Location</div>
            <div className="map-section">
              {contactLocation ? (
                <SimpleMap
                  userLocation={{
                    latitude: contactLocation.lat,
                    longitude: contactLocation.lng,
                    timestamp: latestUpdate.timestamp
                  }}
                  emergencyMode={selectedContact.needsHelp}
                  className="contact-map"
                />
              ) : (
                <div className="map-placeholder">
                  <p>📍</p>
                  <p>No location data available for {selectedContact.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('ContactsPage render - activeView:', activeView, 'selectedContact:', selectedContact)

  return (
    <div className="contacts-page">
      {activeView === 'list' && renderContactsList()}
      {activeView === 'chat' && renderChatView()}
    </div>
  )
}

export default ContactsPage
