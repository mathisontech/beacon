// ============================================================================
// PROFILE PAGE - User settings and preferences
// ============================================================================

import React, { useState } from 'react'

function ProfilePage({ user, onLogout }) {
  const [settings, setSettings] = useState({
    locationUpdates: '5min',
    shareWithCommunity: true,
    emergencyNotifications: true,
    soundAlerts: true,
    autoEvacuate: false,
    mapStyle: 'standard'
  })

  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: 1,
      name: 'Jane Smith',
      phone: '555-0123',
      relationship: 'Spouse'
    },
    {
      id: 2,
      name: 'John Doe',
      phone: '555-0456',
      relationship: 'Parent'
    }
  ])

  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  })

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
    // TODO: Save to backend
    console.log('Setting updated:', key, value)
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in name and phone number')
      return
    }

    const contact = {
      id: Date.now(),
      ...newContact
    }

    setEmergencyContacts([...emergencyContacts, contact])
    setNewContact({ name: '', phone: '', relationship: '' })
    setShowAddContact(false)
  }

  const handleRemoveContact = (id) => {
    if (confirm('Remove this emergency contact?')) {
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== id))
    }
  }

  return (
    <div className="profile-page">
      {/* User Info Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          <span className="avatar-icon">👤</span>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.username || 'User'}</h2>
          <p className="profile-email">{user?.email || 'user@beacon.app'}</p>
          {user?.isDevUser && (
            <span className="dev-badge">Development Mode</span>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Settings Sections */}
      <div className="settings-container">

        {/* Beacon Settings */}
        <div className="settings-section">
          <h3 className="section-title">Beacon Settings</h3>

          <div className="setting-item">
            <div className="setting-label">
              <span>Location Update Frequency</span>
              <span className="setting-description">How often to update your location</span>
            </div>
            <select
              className="setting-input"
              value={settings.locationUpdates}
              onChange={(e) => handleSettingChange('locationUpdates', e.target.value)}
            >
              <option value="1min">Every minute</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="30min">Every 30 minutes</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Share Location with Community</span>
              <span className="setting-description">Let neighbors see your status</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.shareWithCommunity}
                onChange={(e) => handleSettingChange('shareWithCommunity', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Emergency Notifications</span>
              <span className="setting-description">Receive alerts for critical events</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.emergencyNotifications}
                onChange={(e) => handleSettingChange('emergencyNotifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Sound Alerts</span>
              <span className="setting-description">Play sound for urgent notifications</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={(e) => handleSettingChange('soundAlerts', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Map Settings */}
        <div className="settings-section">
          <h3 className="section-title">Map Settings</h3>

          <div className="setting-item">
            <div className="setting-label">
              <span>Default Map Style</span>
              <span className="setting-description">Preferred map appearance</span>
            </div>
            <select
              className="setting-input"
              value={settings.mapStyle}
              onChange={(e) => handleSettingChange('mapStyle', e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Auto-Suggest Evacuation Routes</span>
              <span className="setting-description">Automatically show safe routes</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.autoEvacuate}
                onChange={(e) => handleSettingChange('autoEvacuate', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="settings-section">
          <div className="section-header">
            <h3 className="section-title">Emergency Contacts</h3>
            <button
              className="add-btn"
              onClick={() => setShowAddContact(!showAddContact)}
            >
              {showAddContact ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showAddContact && (
            <div className="add-contact-form">
              <input
                type="text"
                className="form-input"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <input
                type="tel"
                className="form-input"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Relationship (optional)"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              />
              <button className="submit-btn" onClick={handleAddContact}>
                Add Contact
              </button>
            </div>
          )}

          <div className="contacts-list">
            {emergencyContacts.length === 0 ? (
              <p className="empty-message">No emergency contacts added yet</p>
            ) : (
              emergencyContacts.map(contact => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-icon">📞</div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-phone">{contact.phone}</div>
                    {contact.relationship && (
                      <div className="contact-relationship">{contact.relationship}</div>
                    )}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveContact(contact.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h3 className="section-title">About</h3>

          <div className="about-item">
            <span className="about-label">Version</span>
            <span className="about-value">1.0.0</span>
          </div>

          <div className="about-item">
            <span className="about-label">Developer</span>
            <span className="about-value">Mathison</span>
          </div>

          <button className="link-btn">Terms of Service</button>
          <button className="link-btn">Privacy Policy</button>
          <button className="link-btn">Help & Support</button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage