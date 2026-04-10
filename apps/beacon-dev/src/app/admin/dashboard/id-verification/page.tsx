'use client';

import { useState } from 'react';
import { ShieldCheck, Upload, Settings, Eye, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

// Mock verification models
const verificationModels = [
  {
    id: 'first-responder',
    name: 'First Responder Badge',
    description: 'Validates official first responder credentials and badges',
    status: 'active',
    accuracy: 99.2,
    verificationsToday: 847,
    avgProcessTime: '1.2s',
    acceptedDocs: ['Fire Department ID', 'Police Badge', 'EMT License', 'Paramedic Certification'],
  },
  {
    id: 'govt-employee',
    name: 'Government Employee',
    description: 'Validates federal, state, and local government employee IDs',
    status: 'active',
    accuracy: 98.7,
    verificationsToday: 234,
    avgProcessTime: '1.8s',
    acceptedDocs: ['Federal Employee ID', 'State Employee ID', 'Municipal ID'],
  },
  {
    id: 'medical-license',
    name: 'Medical License',
    description: 'Validates healthcare provider licenses and certifications',
    status: 'active',
    accuracy: 97.9,
    verificationsToday: 156,
    avgProcessTime: '2.1s',
    acceptedDocs: ['Medical License', 'Nursing License', 'EMT-B/P Certification'],
  },
  {
    id: 'volunteer-cert',
    name: 'Volunteer Certification',
    description: 'Validates CERT, Red Cross, and other volunteer credentials',
    status: 'active',
    accuracy: 96.5,
    verificationsToday: 312,
    avgProcessTime: '1.5s',
    acceptedDocs: ['CERT ID', 'Red Cross Volunteer ID', 'ARES/RACES ID'],
  },
  {
    id: 'contractor-badge',
    name: 'Contractor Badge',
    description: 'Validates utility and emergency contractor credentials',
    status: 'testing',
    accuracy: 94.2,
    verificationsToday: 45,
    avgProcessTime: '2.4s',
    acceptedDocs: ['Utility Company ID', 'Contractor License', 'TWIC Card'],
  },
];

const recentVerifications = [
  { id: 1, name: 'Officer M. Torres', type: 'Police Badge', status: 'verified', time: '2 min ago', confidence: 99.8 },
  { id: 2, name: 'Paramedic J. Smith', type: 'EMT License', status: 'verified', time: '5 min ago', confidence: 98.5 },
  { id: 3, name: 'CERT Vol. R. Johnson', type: 'CERT ID', status: 'verified', time: '8 min ago', confidence: 97.2 },
  { id: 4, name: 'Unknown', type: 'Fire Department ID', status: 'rejected', time: '12 min ago', confidence: 34.1 },
  { id: 5, name: 'EMT K. Chen', type: 'EMT-B Certification', status: 'pending', time: '15 min ago', confidence: null },
];

const fraudAlerts = [
  { id: 1, type: 'Duplicate ID', description: 'Same badge number used from different locations', count: 3 },
  { id: 2, type: 'Expired Credential', description: 'Attempts to use expired certifications', count: 12 },
  { id: 3, type: 'Tampered Document', description: 'Detected modifications to uploaded documents', count: 1 },
];

export default function IDVerificationPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const totalVerifications = verificationModels.reduce((sum, m) => sum + m.verificationsToday, 0);
  const activeModels = verificationModels.filter(m => m.status === 'active').length;

  const statusColors: Record<string, { bg: string; text: string }> = {
    active: { bg: '#dcfce7', text: '#16a34a' },
    testing: { bg: '#fef3c7', text: '#d97706' },
    inactive: { bg: '#f3f4f6', text: '#6b7280' },
  };

  const verificationStatusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    verified: { bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={14} /> },
    rejected: { bg: '#fee2e2', text: '#dc2626', icon: <XCircle size={14} /> },
    pending: { bg: '#fef3c7', text: '#d97706', icon: <Clock size={14} /> },
  };

  return (
    <div className="id-verification-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <ShieldCheck className="page-icon" size={28} />
            <div>
              <h1>ID Verification Models</h1>
              <p>Manage identity verification for first responders, volunteers, and authorized personnel.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-secondary">
              <Upload size={16} />
              Upload Training Data
            </button>
            <button className="btn-primary">
              <Settings size={16} />
              Model Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{totalVerifications.toLocaleString()}</div>
          <div className="stat-label">Verifications Today</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-green">{activeModels}</div>
          <div className="stat-label">Active Models</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">98.1%</div>
          <div className="stat-label">Avg Accuracy</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-yellow">{fraudAlerts.reduce((s, a) => s + a.count, 0)}</div>
          <div className="stat-label">Fraud Alerts</div>
        </div>
      </div>

      <div className="content-grid">
        {/* Verification Models */}
        <div className="models-section">
          <h2>Verification Models</h2>
          <div className="models-list">
            {verificationModels.map((model) => (
              <div
                key={model.id}
                className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
                onClick={() => setSelectedModel(model.id === selectedModel ? null : model.id)}
              >
                <div className="model-header">
                  <h3>{model.name}</h3>
                  <span
                    className="model-status"
                    style={{
                      backgroundColor: statusColors[model.status].bg,
                      color: statusColors[model.status].text,
                    }}
                  >
                    {model.status}
                  </span>
                </div>
                <p>{model.description}</p>

                <div className="model-stats">
                  <div className="model-stat">
                    <span className="stat-num">{model.accuracy}%</span>
                    <span className="stat-lbl">Accuracy</span>
                  </div>
                  <div className="model-stat">
                    <span className="stat-num">{model.verificationsToday.toLocaleString()}</span>
                    <span className="stat-lbl">Today</span>
                  </div>
                  <div className="model-stat">
                    <span className="stat-num">{model.avgProcessTime}</span>
                    <span className="stat-lbl">Avg Time</span>
                  </div>
                </div>

                <div className="accepted-docs">
                  <span className="docs-label">Accepted Documents:</span>
                  <div className="docs-list">
                    {model.acceptedDocs.map((doc, i) => (
                      <span key={i} className="doc-chip">{doc}</span>
                    ))}
                  </div>
                </div>

                <div className="model-actions">
                  <button className="btn-sm">
                    <Eye size={14} />
                    View Details
                  </button>
                  <button className="btn-sm">
                    <RefreshCw size={14} />
                    Retrain
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Recent Verifications */}
          <div className="recent-section">
            <h2>Recent Verifications</h2>
            <div className="verifications-list">
              {recentVerifications.map((v) => (
                <div key={v.id} className="verification-item">
                  <div className="verification-info">
                    <div className="verification-name">{v.name}</div>
                    <div className="verification-type">{v.type}</div>
                  </div>
                  <div className="verification-right">
                    <span
                      className="verification-status"
                      style={{
                        backgroundColor: verificationStatusColors[v.status].bg,
                        color: verificationStatusColors[v.status].text,
                      }}
                    >
                      {verificationStatusColors[v.status].icon}
                      {v.status}
                    </span>
                    {v.confidence && (
                      <span className="verification-confidence">{v.confidence}%</span>
                    )}
                    <span className="verification-time">{v.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fraud Alerts */}
          <div className="fraud-section">
            <h2>
              <AlertTriangle size={18} className="section-icon" />
              Fraud Detection Alerts
            </h2>
            <div className="fraud-list">
              {fraudAlerts.map((alert) => (
                <div key={alert.id} className="fraud-item">
                  <div className="fraud-info">
                    <div className="fraud-type">{alert.type}</div>
                    <div className="fraud-description">{alert.description}</div>
                  </div>
                  <div className="fraud-count">{alert.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .id-verification-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
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
          color: #a5b4fc;
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

        .models-section, .recent-section, .fraud-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .models-section h2, .recent-section h2, .fraud-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-icon { color: #f59e0b; }

        .models-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .model-card {
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .model-card:hover {
          border-color: #6366f1;
        }

        .model-card.selected {
          border-color: #6366f1;
          background: #f5f3ff;
        }

        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .model-card h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .model-status {
          font-size: 11px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: capitalize;
        }

        .model-card p {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }

        .model-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .model-stat {
          display: flex;
          flex-direction: column;
        }

        .stat-num {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-lbl {
          font-size: 11px;
          color: #9ca3af;
        }

        .accepted-docs {
          margin-bottom: 16px;
        }

        .docs-label {
          font-size: 11px;
          color: #9ca3af;
          display: block;
          margin-bottom: 8px;
        }

        .docs-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .doc-chip {
          font-size: 11px;
          background: #f3f4f6;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .model-actions {
          display: flex;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-sm {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          background: white;
          color: #4b5563;
        }

        .btn-sm:hover {
          background: #f9fafb;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .verifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .verification-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .verification-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .verification-type {
          font-size: 12px;
          color: #6b7280;
        }

        .verification-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .verification-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .verification-confidence {
          font-size: 12px;
          font-weight: 600;
          color: #22c55e;
        }

        .verification-time {
          font-size: 10px;
          color: #9ca3af;
        }

        .fraud-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .fraud-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #fef2f2;
          border-radius: 8px;
          border-left: 4px solid #ef4444;
        }

        .fraud-type {
          font-size: 14px;
          font-weight: 500;
          color: #dc2626;
        }

        .fraud-description {
          font-size: 12px;
          color: #6b7280;
        }

        .fraud-count {
          font-size: 20px;
          font-weight: 700;
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
