import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MutualAidPage.css';

const API_BASE_URL = 'http://localhost:8000';

// Resource types
const RESOURCE_TYPES = {
  engine: { label: 'Fire Engine', icon: '🚒', code: 'E' },
  ladder: { label: 'Ladder Truck', icon: '🚨', code: 'L' },
  ambulance: { label: 'Ambulance', icon: '🚑', code: 'A' },
  police: { label: 'Police Unit', icon: '🚓', code: 'P' },
  helicopter: { label: 'Helicopter', icon: '🚁', code: 'H' },
  mixed: { label: 'Task Force (Mixed)', icon: '🔀', code: 'T' }
};

// Request types
const REQUEST_TYPES = {
  single_resource: 'Single Resource',
  strike_team: 'Strike Team (5 units same type)',
  task_force: 'Task Force (Mixed resources)'
};

// Priority levels
const PRIORITIES = {
  routine: { label: 'Routine', color: '#2196f3' },
  urgent: { label: 'Urgent', color: '#ff9800' },
  emergency: { label: 'Emergency', color: '#f44336' }
};

// Status colors
const STATUS_COLORS = {
  pending: '#ff9800',
  approved: '#2196f3',
  dispatched: '#9c27b0',
  arrived: '#4caf50',
  completed: '#757575',
  denied: '#f44336',
  cancelled: '#9e9e9e'
};

function MutualAidPage() {
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, active, completed

  // Form state
  const [formData, setFormData] = useState({
    incident_id: '',
    requested_by: 'Fire Chief Thompson',
    requesting_agency: 'Maui Fire Department',
    request_type: 'single_resource',
    resource_type: 'engine',
    quantity: 1,
    priority: 'normal',
    reporting_location: '',
    travel_route: '',
    incident_type: 'fire',
    justification: '',
    notes: ''
  });

  useEffect(() => {
    loadRequests();
    loadIncidents();

    // WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'mutual_aid_request' || message.type === 'mutual_aid_update') {
        loadRequests();
      }
    };

    return () => ws.close();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mutual-aid`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadIncidents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/incidents`);
      setIncidents(response.data.filter(i => i.status === 'active'));
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/api/mutual-aid`, {
        ...formData,
        incident_id: parseInt(formData.incident_id),
        quantity: parseInt(formData.quantity)
      });

      setShowCreateModal(false);
      loadRequests();

      // Reset form
      setFormData({
        incident_id: '',
        requested_by: 'Fire Chief Thompson',
        requesting_agency: 'Maui Fire Department',
        request_type: 'single_resource',
        resource_type: 'engine',
        quantity: 1,
        priority: 'normal',
        reporting_location: '',
        travel_route: '',
        incident_type: 'fire',
        justification: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create mutual aid request');
    }
  };

  const updateRequestStatus = async (requestId, status, additionalData = {}) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/mutual-aid/${requestId}`, {
        status,
        ...additionalData
      });
      loadRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request status');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'active') return ['approved', 'dispatched', 'arrived'].includes(req.status);
    if (filter === 'completed') return ['completed', 'denied', 'cancelled'].includes(req.status);
    return true;
  });

  return (
    <div className="mutual-aid-page">
      {/* Header */}
      <header className="ma-header">
        <div className="ma-header-content">
          <div className="ma-title-section">
            <h1>🤝 Mutual Aid Request System</h1>
            <p className="ma-subtitle">Multi-Agency Coordination & Resource Management</p>
          </div>
          <button
            className="create-request-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Request Backup
          </button>
        </div>
      </header>

      <div className="ma-main">
        {/* Sidebar - Filters and Stats */}
        <aside className="ma-sidebar">
          <div className="ma-stats">
            <h3>Request Summary</h3>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">{requests.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active</span>
              <span className="stat-value active">{requests.filter(r => ['approved', 'dispatched', 'arrived'].includes(r.status)).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed</span>
              <span className="stat-value completed">{requests.filter(r => r.status === 'completed').length}</span>
            </div>
          </div>

          <div className="ma-filters">
            <h3>Filter Requests</h3>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Requests ({requests.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({requests.filter(r => ['approved', 'dispatched', 'arrived'].includes(r.status)).length})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({requests.filter(r => ['completed', 'denied', 'cancelled'].includes(r.status)).length})
            </button>
          </div>

          <div className="ma-info">
            <h3>ℹ️ About Mutual Aid</h3>
            <p>Mutual aid is reciprocal assistance between fire departments during emergencies. Never send more than 50% of available resources.</p>
            <ul>
              <li><strong>Strike Team:</strong> 5 units of same type</li>
              <li><strong>Task Force:</strong> Mixed resources</li>
              <li><strong>Single Resource:</strong> Individual unit</li>
            </ul>
          </div>
        </aside>

        {/* Main Content - Requests List */}
        <div className="ma-content">
          <div className="requests-grid">
            {filteredRequests.map(request => {
              const incident = incidents.find(i => i.id === request.incident_id);
              const resourceInfo = RESOURCE_TYPES[request.resource_type] || RESOURCE_TYPES.engine;

              return (
                <div
                  key={request.id}
                  className="request-card"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="request-header">
                    <div className="request-number">
                      <span className="number-badge">{request.request_number}</span>
                      <span
                        className="priority-badge"
                        style={{ background: PRIORITIES[request.priority]?.color || '#2196f3' }}
                      >
                        {PRIORITIES[request.priority]?.label || request.priority}
                      </span>
                    </div>
                    <div
                      className="status-badge"
                      style={{ background: STATUS_COLORS[request.status] }}
                    >
                      {request.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="request-body">
                    <div className="request-resource">
                      <span className="resource-icon">{resourceInfo.icon}</span>
                      <div className="resource-info">
                        <div className="resource-type">{resourceInfo.label}</div>
                        <div className="resource-quantity">
                          Quantity: {request.quantity} | Type: {REQUEST_TYPES[request.request_type]}
                        </div>
                      </div>
                    </div>

                    <div className="request-incident">
                      <strong>Incident:</strong> {incident?.name || 'Unknown'}
                    </div>

                    <div className="request-location">
                      <strong>Report To:</strong> {request.reporting_location}
                    </div>

                    <div className="request-justification">
                      {request.justification}
                    </div>

                    <div className="request-footer">
                      <div className="request-agency">
                        {request.requesting_agency}
                      </div>
                      <div className="request-time">
                        {new Date(request.request_time).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, 'approved', {
                            approved_by: 'Regional Coordinator',
                            responding_agency: 'Honolulu Fire Department'
                          });
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="deny-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, 'denied');
                        }}
                      >
                        ✗ Deny
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="request-actions">
                      <button
                        className="dispatch-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, 'dispatched');
                        }}
                      >
                        📤 Dispatch
                      </button>
                    </div>
                  )}

                  {request.status === 'dispatched' && (
                    <div className="request-actions">
                      <button
                        className="arrived-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, 'arrived');
                        }}
                      >
                        📍 Mark Arrived
                      </button>
                    </div>
                  )}

                  {request.status === 'arrived' && (
                    <div className="request-actions">
                      <button
                        className="complete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, 'completed');
                        }}
                      >
                        ✓ Complete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="no-requests">
                <div className="no-requests-icon">📋</div>
                <h3>No Requests Found</h3>
                <p>There are no mutual aid requests matching your filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🤝 Request Mutual Aid / Backup</h2>
              <button className="close-button" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Incident *</label>
                  <select
                    value={formData.incident_id}
                    onChange={(e) => setFormData({...formData, incident_id: e.target.value})}
                    required
                  >
                    <option value="">Select Incident</option>
                    {incidents.map(incident => (
                      <option key={incident.id} value={incident.id}>
                        {incident.name} (Severity {incident.severity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Request Type *</label>
                  <select
                    value={formData.request_type}
                    onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                    required
                  >
                    {Object.entries(REQUEST_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Resource Type *</label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
                    required
                  >
                    {Object.entries(RESOURCE_TYPES).map(([key, info]) => (
                      <option key={key} value={key}>{info.icon} {info.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    {Object.entries(PRIORITIES).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Reporting Location *</label>
                  <input
                    type="text"
                    placeholder="e.g., Lahaina Civic Center, 1840 Honoapiilani Hwy"
                    value={formData.reporting_location}
                    onChange={(e) => setFormData({...formData, reporting_location: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Travel Route (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Highway 30 North from Kahului"
                    value={formData.travel_route}
                    onChange={(e) => setFormData({...formData, travel_route: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Justification *</label>
                  <textarea
                    rows="3"
                    placeholder="Explain why backup is needed (e.g., fire spreading rapidly, multiple structures involved, insufficient local resources)"
                    value={formData.justification}
                    onChange={(e) => setFormData({...formData, justification: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <label>Additional Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Any additional information for responding units"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" className="cancel-button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details: {selectedRequest.request_number}</h2>
              <button className="close-button" onClick={() => setSelectedRequest(null)}>×</button>
            </div>

            <div className="modal-body detail-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Status</label>
                  <span
                    className="status-badge"
                    style={{ background: STATUS_COLORS[selectedRequest.status] }}
                  >
                    {selectedRequest.status.toUpperCase()}
                  </span>
                </div>

                <div className="detail-item">
                  <label>Priority</label>
                  <span>{PRIORITIES[selectedRequest.priority]?.label || selectedRequest.priority}</span>
                </div>

                <div className="detail-item">
                  <label>Resource Type</label>
                  <span>{RESOURCE_TYPES[selectedRequest.resource_type]?.label}</span>
                </div>

                <div className="detail-item">
                  <label>Quantity</label>
                  <span>{selectedRequest.quantity}</span>
                </div>

                <div className="detail-item full-width">
                  <label>Reporting Location</label>
                  <span>{selectedRequest.reporting_location}</span>
                </div>

                {selectedRequest.travel_route && (
                  <div className="detail-item full-width">
                    <label>Travel Route</label>
                    <span>{selectedRequest.travel_route}</span>
                  </div>
                )}

                <div className="detail-item full-width">
                  <label>Justification</label>
                  <span>{selectedRequest.justification}</span>
                </div>

                {selectedRequest.notes && (
                  <div className="detail-item full-width">
                    <label>Notes</label>
                    <span>{selectedRequest.notes}</span>
                  </div>
                )}

                <div className="timeline">
                  <h3>Timeline</h3>
                  <div className="timeline-item">
                    <span className="timeline-label">Requested:</span>
                    <span>{new Date(selectedRequest.request_time).toLocaleString()}</span>
                  </div>
                  {selectedRequest.approved_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">Approved:</span>
                      <span>{new Date(selectedRequest.approved_time).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRequest.dispatched_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">Dispatched:</span>
                      <span>{new Date(selectedRequest.dispatched_time).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRequest.arrived_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">Arrived:</span>
                      <span>{new Date(selectedRequest.arrived_time).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRequest.cleared_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">Completed:</span>
                      <span>{new Date(selectedRequest.cleared_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MutualAidPage;
