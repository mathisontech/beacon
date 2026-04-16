'use client';

import { useState } from 'react';
import { Route, Play, Settings, Download, RefreshCw, MapPin, Clock, Users, AlertTriangle } from 'lucide-react';

// Mock routing configurations
const routingProfiles = [
  {
    id: 'emergency-evac',
    name: 'Emergency Evacuation',
    description: 'Optimized routes for mass evacuation during emergencies',
    priority: 'critical',
    algorithms: ['Dijkstra', 'A*', 'Contraction Hierarchies'],
    avgResponseTime: '45ms',
    routesCalculated: '12.4K',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'first-responder',
    name: 'First Responder',
    description: 'Fastest routes for emergency vehicles with real-time traffic',
    priority: 'high',
    algorithms: ['Time-Dependent A*', 'Real-time Traffic Integration'],
    avgResponseTime: '32ms',
    routesCalculated: '89.2K',
    lastUpdated: '5 minutes ago',
  },
  {
    id: 'resource-delivery',
    name: 'Resource Delivery',
    description: 'Optimized delivery routes for supplies and equipment',
    priority: 'medium',
    algorithms: ['Vehicle Routing Problem (VRP)', 'Multi-Stop Optimization'],
    avgResponseTime: '120ms',
    routesCalculated: '5.1K',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'civilian-navigation',
    name: 'Civilian Navigation',
    description: 'Safe routes for public users avoiding hazard zones',
    priority: 'medium',
    algorithms: ['Hazard Avoidance', 'Dynamic Rerouting'],
    avgResponseTime: '28ms',
    routesCalculated: '234.5K',
    lastUpdated: '10 minutes ago',
  },
];

const recentRoutes = [
  { id: 1, type: 'Evacuation', from: 'Zone A - Downtown', to: 'Shelter 3 - Lincoln High', vehicles: 45, status: 'active' },
  { id: 2, type: 'First Responder', from: 'Station 7', to: '1234 Main St', vehicles: 3, status: 'completed' },
  { id: 3, type: 'Resource Delivery', from: 'Warehouse B', to: 'Multiple Shelters', vehicles: 8, status: 'in_progress' },
  { id: 4, type: 'Evacuation', from: 'Zone C - Coastal', to: 'Shelter 1 - Community Center', vehicles: 120, status: 'pending' },
];

const roadClosures = [
  { id: 1, road: 'I-190 Northbound', reason: 'Accident', eta: '2 hours' },
  { id: 2, road: 'Delaware Ave (Main to Forest)', reason: 'Flooding', eta: '6 hours' },
  { id: 3, road: 'Elmwood Ave Bridge', reason: 'Structural Inspection', eta: '24 hours' },
];

export default function ExodusPage() {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const priorityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#6b7280',
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: '#dcfce7', text: '#16a34a' },
    completed: { bg: '#f3f4f6', text: '#6b7280' },
    in_progress: { bg: '#fef3c7', text: '#d97706' },
    pending: { bg: '#dbeafe', text: '#2563eb' },
  };

  return (
    <div className="exodus-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <Route className="page-icon" size={28} />
            <div>
              <h1>Exodus - Routing Engine</h1>
              <p>Manage evacuation routes, emergency pathfinding, and real-time navigation.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-secondary">
              <RefreshCw size={16} />
              Sync Traffic Data
            </button>
            <button className="btn-primary">
              <Settings size={16} />
              Engine Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">341.2K</div>
          <div className="stat-label">Routes Today</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-green">38ms</div>
          <div className="stat-label">Avg Response</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-yellow">{roadClosures.length}</div>
          <div className="stat-label">Road Closures</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">99.7%</div>
          <div className="stat-label">Uptime</div>
        </div>
      </div>

      <div className="content-grid">
        {/* Routing Profiles */}
        <div className="profiles-section">
          <h2>Routing Profiles</h2>
          <div className="profiles-list">
            {routingProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`profile-card ${selectedProfile === profile.id ? 'selected' : ''}`}
                onClick={() => setSelectedProfile(profile.id === selectedProfile ? null : profile.id)}
              >
                <div className="profile-header">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: priorityColors[profile.priority] }}
                  >
                    {profile.priority}
                  </span>
                  <span className="response-time">{profile.avgResponseTime}</span>
                </div>
                <h3>{profile.name}</h3>
                <p>{profile.description}</p>
                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="stat-num">{profile.routesCalculated}</span>
                    <span className="stat-lbl">routes</span>
                  </div>
                  <div className="profile-stat">
                    <Clock size={12} />
                    <span className="stat-lbl">{profile.lastUpdated}</span>
                  </div>
                </div>
                <div className="algorithms">
                  {profile.algorithms.map((algo, i) => (
                    <span key={i} className="algo-chip">{algo}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Road Closures */}
          <div className="closures-section">
            <h2>
              <AlertTriangle size={18} className="section-icon warning" />
              Active Road Closures
            </h2>
            <div className="closures-list">
              {roadClosures.map((closure) => (
                <div key={closure.id} className="closure-item">
                  <div className="closure-info">
                    <div className="closure-road">{closure.road}</div>
                    <div className="closure-reason">{closure.reason}</div>
                  </div>
                  <div className="closure-eta">ETA: {closure.eta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Routes */}
          <div className="recent-section">
            <h2>Recent Route Calculations</h2>
            <div className="routes-list">
              {recentRoutes.map((route) => (
                <div key={route.id} className="route-item">
                  <div className="route-type">{route.type}</div>
                  <div className="route-path">
                    <MapPin size={12} />
                    <span>{route.from}</span>
                    <span className="arrow">→</span>
                    <span>{route.to}</span>
                  </div>
                  <div className="route-meta">
                    <div className="route-vehicles">
                      <Users size={12} />
                      {route.vehicles} vehicles
                    </div>
                    <span
                      className="route-status"
                      style={{
                        backgroundColor: statusColors[route.status].bg,
                        color: statusColors[route.status].text,
                      }}
                    >
                      {route.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .exodus-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
          padding: 32px;
          margin: -24px -24px 24px -24px;
          border-radius: 0 0 16px 16px;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-title-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .page-icon {
          color: #60a5fa;
          margin-top: 4px;
        }

        .page-header h1 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 14px;
        }

        .page-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: #0097b2;
          color: white;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-value.text-green { color: #22c55e; }
        .stat-value.text-yellow { color: #f59e0b; }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        .profiles-section, .closures-section, .recent-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .profiles-section h2, .closures-section h2, .recent-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon.warning { color: #f59e0b; }

        .profiles-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .profile-card {
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .profile-card:hover {
          border-color: #0097b2;
        }

        .profile-card.selected {
          border-color: #0097b2;
          background: #f0fdff;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .priority-badge {
          font-size: 10px;
          font-weight: 700;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .response-time {
          font-size: 12px;
          color: #22c55e;
          font-weight: 600;
        }

        .profile-card h3 {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .profile-card p {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .profile-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .profile-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .stat-num {
          font-weight: 600;
          color: #1f2937;
        }

        .algorithms {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .algo-chip {
          font-size: 10px;
          background: #f3f4f6;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .closures-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .closure-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }

        .closure-road {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .closure-reason {
          font-size: 12px;
          color: #6b7280;
        }

        .closure-eta {
          font-size: 12px;
          font-weight: 500;
          color: #d97706;
        }

        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .route-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .route-type {
          font-size: 10px;
          font-weight: 700;
          color: #0097b2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .route-path {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .route-path .arrow {
          color: #9ca3af;
        }

        .route-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .route-vehicles {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
        }

        .route-status {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}
