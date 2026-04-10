'use client';

import { useState } from 'react';
import { Network, Wifi, WifiOff, Radio, Smartphone, Server, Signal, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// Mock mesh network nodes
const meshNodes = [
  { id: 'node-1', name: 'Station 7 Hub', type: 'base', status: 'online', connections: 12, signal: 95, battery: 100, location: 'Fire Station 7' },
  { id: 'node-2', name: 'Mobile Unit Alpha', type: 'mobile', status: 'online', connections: 4, signal: 78, battery: 85, location: 'Downtown Buffalo' },
  { id: 'node-3', name: 'Shelter Relay 1', type: 'relay', status: 'online', connections: 8, signal: 92, battery: 72, location: 'Lincoln High School' },
  { id: 'node-4', name: 'Command Post', type: 'base', status: 'online', connections: 15, signal: 98, battery: 100, location: 'City Hall' },
  { id: 'node-5', name: 'Mobile Unit Beta', type: 'mobile', status: 'degraded', connections: 2, signal: 45, battery: 34, location: 'Parkside Area' },
  { id: 'node-6', name: 'Repeater Tower North', type: 'relay', status: 'online', connections: 6, signal: 88, battery: 100, location: 'North Buffalo' },
  { id: 'node-7', name: 'Emergency Vehicle 12', type: 'mobile', status: 'offline', connections: 0, signal: 0, battery: 12, location: 'Last: I-190' },
  { id: 'node-8', name: 'Shelter Relay 2', type: 'relay', status: 'online', connections: 5, signal: 82, battery: 91, location: 'Community Center' },
];

const connectedDevices = [
  { id: 'd1', name: 'First Responder Radios', count: 127, status: 'connected' },
  { id: 'd2', name: 'Civilian App Users', count: 2841, status: 'connected' },
  { id: 'd3', name: 'Vehicle MDTs', count: 45, status: 'connected' },
  { id: 'd4', name: 'Fixed Sensors', count: 89, status: 'connected' },
  { id: 'd5', name: 'Drone Relays', count: 3, status: 'standby' },
];

const networkAlerts = [
  { id: 'a1', severity: 'warning', message: 'Mobile Unit Beta signal degraded - switch to backup channel recommended', time: '5 min ago' },
  { id: 'a2', severity: 'critical', message: 'Emergency Vehicle 12 offline - last contact 15 minutes ago', time: '15 min ago' },
  { id: 'a3', severity: 'info', message: 'Shelter Relay 1 battery below 75% - charging recommended', time: '1 hour ago' },
];

export default function BeaconMeshPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onlineNodes = meshNodes.filter(n => n.status === 'online').length;
  const totalConnections = meshNodes.reduce((sum, n) => sum + n.connections, 0);
  const totalDevices = connectedDevices.reduce((sum, d) => sum + d.count, 0);

  const nodeTypeIcons: Record<string, React.ReactNode> = {
    base: <Server size={16} />,
    mobile: <Smartphone size={16} />,
    relay: <Radio size={16} />,
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    online: { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e' },
    degraded: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
    offline: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
  };

  return (
    <div className="beaconmesh-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <Network className="page-icon" size={28} />
            <div>
              <h1>BeaconMesh - Network Resilience</h1>
              <p>Monitor and manage the distributed mesh network for offline-capable communications.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-secondary">
              <RefreshCw size={16} />
              Refresh Status
            </button>
            <button className="btn-primary">
              <Radio size={16} />
              Network Diagnostics
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{meshNodes.length}</div>
          <div className="stat-label">Total Nodes</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-green">{onlineNodes}</div>
          <div className="stat-label">Online</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalConnections}</div>
          <div className="stat-label">Active Connections</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalDevices.toLocaleString()}</div>
          <div className="stat-label">Connected Devices</div>
        </div>
      </div>

      {/* Alerts Banner */}
      {networkAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <div className="alerts-banner">
          <AlertTriangle size={18} />
          <span>{networkAlerts.filter(a => a.severity === 'critical').length} critical alert(s) require attention</span>
        </div>
      )}

      <div className="content-grid">
        {/* Mesh Nodes */}
        <div className="nodes-section">
          <h2>Mesh Network Nodes</h2>
          <div className="nodes-grid">
            {meshNodes.map((node) => (
              <div
                key={node.id}
                className={`node-card ${selectedNode === node.id ? 'selected' : ''} ${node.status}`}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              >
                <div className="node-header">
                  <div className="node-type">
                    {nodeTypeIcons[node.type]}
                    <span>{node.type}</span>
                  </div>
                  <div
                    className="node-status-badge"
                    style={{
                      backgroundColor: statusColors[node.status].bg,
                      color: statusColors[node.status].text,
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{ backgroundColor: statusColors[node.status].dot }}
                    />
                    {node.status}
                  </div>
                </div>

                <h3>{node.name}</h3>
                <p className="node-location">{node.location}</p>

                <div className="node-metrics">
                  <div className="metric">
                    <Signal size={14} />
                    <span className="metric-value">{node.signal}%</span>
                    <span className="metric-label">Signal</span>
                  </div>
                  <div className="metric">
                    <Wifi size={14} />
                    <span className="metric-value">{node.connections}</span>
                    <span className="metric-label">Links</span>
                  </div>
                  <div className="metric">
                    <div className={`battery-icon ${node.battery < 30 ? 'low' : ''}`}>
                      {node.battery}%
                    </div>
                    <span className="metric-label">Battery</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Connected Devices */}
          <div className="devices-section">
            <h2>Connected Devices</h2>
            <div className="devices-list">
              {connectedDevices.map((device) => (
                <div key={device.id} className="device-item">
                  <div className="device-info">
                    <div className="device-name">{device.name}</div>
                    <div className="device-status">
                      {device.status === 'connected' ? (
                        <CheckCircle size={12} className="status-icon connected" />
                      ) : (
                        <WifiOff size={12} className="status-icon standby" />
                      )}
                      {device.status}
                    </div>
                  </div>
                  <div className="device-count">{device.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Alerts */}
          <div className="alerts-section">
            <h2>Network Alerts</h2>
            <div className="alerts-list">
              {networkAlerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
                  <AlertTriangle size={16} className="alert-icon" />
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn">
                <Radio size={18} />
                Deploy Backup Node
              </button>
              <button className="action-btn">
                <RefreshCw size={18} />
                Force Resync
              </button>
              <button className="action-btn">
                <Wifi size={18} />
                Switch Channels
              </button>
              <button className="action-btn">
                <Signal size={18} />
                Run Diagnostics
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .beaconmesh-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
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
          color: #22d3ee;
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
          background: #1f3348;
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

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        .alerts-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
        }

        .nodes-section, .devices-section, .alerts-section, .actions-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .nodes-section h2, .devices-section h2, .alerts-section h2, .actions-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .node-card {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .node-card:hover {
          border-color: #1f3348;
        }

        .node-card.selected {
          border-color: #1f3348;
          background: #f0fdff;
        }

        .node-card.offline {
          opacity: 0.7;
        }

        .node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .node-type {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .node-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .node-card h3 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .node-location {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .node-metrics {
          display: flex;
          gap: 16px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #6b7280;
        }

        .metric-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .metric-label {
          font-size: 10px;
          color: #9ca3af;
        }

        .battery-icon {
          font-size: 12px;
          font-weight: 600;
          color: #22c55e;
        }

        .battery-icon.low {
          color: #ef4444;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .devices-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .device-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .device-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .device-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .status-icon.connected { color: #22c55e; }
        .status-icon.standby { color: #9ca3af; }

        .device-count {
          font-size: 18px;
          font-weight: 700;
          color: #1f3348;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
        }

        .alert-item.critical {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
        }

        .alert-item.warning {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
        }

        .alert-item.info {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
        }

        .alert-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-item.critical .alert-icon { color: #ef4444; }
        .alert-item.warning .alert-icon { color: #f59e0b; }
        .alert-item.info .alert-icon { color: #3b82f6; }

        .alert-message {
          font-size: 13px;
          color: #1f2937;
          line-height: 1.4;
        }

        .alert-time {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: #4b5563;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f3f4f6;
          border-color: #1f3348;
          color: #1f3348;
        }
      `}</style>
    </div>
  );
}
