import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Communications.css';

const API_BASE = 'http://localhost:8000';

function Communications({ incidentId, onClose }) {
  const [activeTab, setActiveTab] = useState('send'); // send, history, channels
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [units, setUnits] = useState([]);

  // Send Message Form State
  const [messageForm, setMessageForm] = useState({
    message_type: 'broadcast',
    priority: 'routine',
    subject: '',
    content: '',
    recipient_type: 'all_units',
    recipient_ids: [],
    requires_acknowledgment: false
  });

  // Channel Form State
  const [channelForm, setChannelForm] = useState({
    channel_name: '',
    channel_type: 'tactical',
    frequency: '',
    assigned_to: [],
    notes: ''
  });

  useEffect(() => {
    fetchMessages();
    fetchUnits();
    if (incidentId) {
      fetchChannels();
    }
  }, [incidentId]);

  const fetchMessages = async () => {
    try {
      const params = incidentId ? { incident_id: incidentId, limit: 20 } : { limit: 20 };
      const response = await axios.get(`${API_BASE}/api/messages`, { params });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/radio-channels/${incidentId}`);
      setChannels(response.data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/units`);
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      // Prepare recipient_ids as JSON string
      let recipientIds = null;
      if (messageForm.recipient_type === 'specific_units' && messageForm.recipient_ids.length > 0) {
        recipientIds = JSON.stringify(messageForm.recipient_ids);
      }

      const payload = {
        incident_id: incidentId,
        sender_name: 'Fire Chief',
        sender_role: 'fire_chief',
        ...messageForm,
        recipient_ids: recipientIds
      };

      await axios.post(`${API_BASE}/api/messages`, payload);

      // Reset form
      setMessageForm({
        message_type: 'broadcast',
        priority: 'routine',
        subject: '',
        content: '',
        recipient_type: 'all_units',
        recipient_ids: [],
        requires_acknowledgment: false
      });

      fetchMessages();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        incident_id: incidentId,
        ...channelForm,
        assigned_to: channelForm.assigned_to.length > 0 ? JSON.stringify(channelForm.assigned_to) : null
      };

      await axios.post(`${API_BASE}/api/radio-channels`, payload);

      // Reset form
      setChannelForm({
        channel_name: '',
        channel_type: 'tactical',
        frequency: '',
        assigned_to: [],
        notes: ''
      });

      fetchChannels();
      alert('Radio channel created successfully!');
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Error creating channel');
    }
  };

  const handleUnitSelection = (unitId) => {
    setMessageForm(prev => {
      const selected = prev.recipient_ids.includes(unitId)
        ? prev.recipient_ids.filter(id => id !== unitId)
        : [...prev.recipient_ids, unitId];
      return { ...prev, recipient_ids: selected };
    });
  };

  const handleChannelUnitSelection = (unitId) => {
    setChannelForm(prev => {
      const selected = prev.assigned_to.includes(unitId)
        ? prev.assigned_to.filter(id => id !== unitId)
        : [...prev.assigned_to, unitId];
      return { ...prev, assigned_to: selected };
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return '#d32f2f';
      case 'urgent': return '#f57c00';
      default: return '#1976d2';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="communications-modal">
      <div className="communications-overlay" onClick={onClose} />

      <div className="communications-content">
        <div className="communications-header">
          <div className="header-left">
            <span className="header-icon">📡</span>
            <h2>Communications Center</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="communications-tabs">
          <button
            className={`tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            📤 Send Message
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Message History
          </button>
          <button
            className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            📻 Radio Channels
          </button>
        </div>

        <div className="communications-body">
          {/* SEND MESSAGE TAB */}
          {activeTab === 'send' && (
            <form onSubmit={handleSendMessage} className="message-form">
              <div className="form-section">
                <h3>Message Type & Priority</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={messageForm.message_type}
                      onChange={(e) => setMessageForm({...messageForm, message_type: e.target.value})}
                      required
                    >
                      <option value="broadcast">Broadcast</option>
                      <option value="unit_message">Unit Message</option>
                      <option value="alert">Alert</option>
                      <option value="status_update">Status Update</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={messageForm.priority}
                      onChange={(e) => setMessageForm({...messageForm, priority: e.target.value})}
                      required
                    >
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Recipients</h3>
                <div className="form-group">
                  <label>Send To</label>
                  <select
                    value={messageForm.recipient_type}
                    onChange={(e) => setMessageForm({...messageForm, recipient_type: e.target.value, recipient_ids: []})}
                    required
                  >
                    <option value="all_units">All Units</option>
                    <option value="specific_units">Specific Units</option>
                    <option value="division">Division</option>
                    <option value="branch">Branch</option>
                  </select>
                </div>

                {messageForm.recipient_type === 'specific_units' && (
                  <div className="unit-selector">
                    <label>Select Units:</label>
                    <div className="unit-grid">
                      {units.map(unit => (
                        <div key={unit.id} className="unit-checkbox">
                          <label>
                            <input
                              type="checkbox"
                              checked={messageForm.recipient_ids.includes(unit.unit_id)}
                              onChange={() => handleUnitSelection(unit.unit_id)}
                            />
                            <span className="unit-label">{unit.unit_id} - {unit.unit_type}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Message Content</h3>
                <div className="form-group">
                  <label>Subject (Optional)</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                    placeholder="Brief subject line"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                    placeholder="Plain English message (no codes)..."
                    rows={5}
                    required
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={messageForm.requires_acknowledgment}
                      onChange={(e) => setMessageForm({...messageForm, requires_acknowledgment: e.target.checked})}
                    />
                    <span>Require Acknowledgment</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="send-btn">
                  📤 Send Message
                </button>
              </div>
            </form>
          )}

          {/* MESSAGE HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="message-history">
              <div className="history-header">
                <h3>Recent Messages</h3>
                <button className="refresh-btn" onClick={fetchMessages}>
                  🔄 Refresh
                </button>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>📭 No messages yet</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="message-card" style={{ borderLeftColor: getPriorityColor(message.priority) }}>
                      <div className="message-header-row">
                        <div className="message-meta">
                          <span className="message-from">{message.sender_name}</span>
                          <span className="message-time">{formatTimestamp(message.sent_at)}</span>
                        </div>
                        <div className="message-badges">
                          <span className={`priority-badge ${message.priority}`}>
                            {message.priority.toUpperCase()}
                          </span>
                          <span className="type-badge">{message.message_type}</span>
                        </div>
                      </div>

                      {message.subject && (
                        <div className="message-subject">{message.subject}</div>
                      )}

                      <div className="message-content">{message.content}</div>

                      <div className="message-footer">
                        <span className="recipient-info">
                          To: {message.recipient_type === 'all_units' ? 'All Units' : message.recipient_type}
                        </span>
                        {message.requires_acknowledgment && (
                          <span className="ack-required">⚠️ ACK Required</span>
                        )}
                      </div>

                      {message.recipients && message.recipients.length > 0 && (
                        <div className="recipients-status">
                          {message.recipients.map(recipient => (
                            <div key={recipient.id} className="recipient-status">
                              <span className="recipient-name">{recipient.recipient_name}</span>
                              {recipient.acknowledged_at ? (
                                <span className="status ack">✓ ACK</span>
                              ) : recipient.read_at ? (
                                <span className="status read">👁 Read</span>
                              ) : (
                                <span className="status delivered">📤 Sent</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* RADIO CHANNELS TAB */}
          {activeTab === 'channels' && (
            <div className="channels-tab">
              <div className="channels-header">
                <h3>Active Radio Channels</h3>
              </div>

              <div className="channels-list">
                {channels.map(channel => (
                  <div key={channel.id} className="channel-card">
                    <div className="channel-header-row">
                      <span className="channel-name">📻 {channel.channel_name}</span>
                      <span className={`channel-type ${channel.channel_type}`}>
                        {channel.channel_type}
                      </span>
                    </div>
                    {channel.frequency && (
                      <div className="channel-frequency">Frequency: {channel.frequency}</div>
                    )}
                    {channel.notes && (
                      <div className="channel-notes">{channel.notes}</div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateChannel} className="channel-form">
                <h3>Create New Channel</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Channel Name *</label>
                    <input
                      type="text"
                      value={channelForm.channel_name}
                      onChange={(e) => setChannelForm({...channelForm, channel_name: e.target.value})}
                      placeholder="e.g., Tactical 1, Branch Alpha"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      value={channelForm.channel_type}
                      onChange={(e) => setChannelForm({...channelForm, channel_type: e.target.value})}
                      required
                    >
                      <option value="command">Command</option>
                      <option value="tactical">Tactical</option>
                      <option value="branch">Branch</option>
                      <option value="division">Division</option>
                      <option value="logistics">Logistics</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <input
                    type="text"
                    value={channelForm.frequency}
                    onChange={(e) => setChannelForm({...channelForm, frequency: e.target.value})}
                    placeholder="e.g., 154.280 MHz"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={channelForm.notes}
                    onChange={(e) => setChannelForm({...channelForm, notes: e.target.value})}
                    placeholder="Channel purpose, restrictions, etc."
                    rows={2}
                  />
                </div>

                <button type="submit" className="create-channel-btn">
                  ➕ Create Channel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Communications;
