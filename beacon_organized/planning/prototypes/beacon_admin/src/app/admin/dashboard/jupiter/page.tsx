'use client';

import { useState } from 'react';
import { Flame, Play, Pause, Settings, Download, Upload, ChevronRight, AlertTriangle } from 'lucide-react';

// Mock hazard models
const hazardModels = [
  {
    id: 'wildfire-spread',
    name: 'Wildfire Spread Model',
    type: 'fire',
    status: 'active',
    lastRun: '2 hours ago',
    accuracy: 94.2,
    description: 'Predicts fire spread patterns based on terrain, weather, and fuel load data.',
    parameters: ['Wind Speed', 'Humidity', 'Temperature', 'Fuel Moisture', 'Terrain Slope'],
  },
  {
    id: 'flood-prediction',
    name: 'Flood Prediction Model',
    type: 'water',
    status: 'active',
    lastRun: '30 minutes ago',
    accuracy: 91.8,
    description: 'Forecasts flooding based on precipitation, drainage, and topography.',
    parameters: ['Rainfall Rate', 'Soil Saturation', 'River Levels', 'Drainage Capacity'],
  },
  {
    id: 'seismic-risk',
    name: 'Seismic Risk Assessment',
    type: 'earth',
    status: 'inactive',
    lastRun: '1 week ago',
    accuracy: 87.5,
    description: 'Evaluates earthquake risk and structural vulnerability.',
    parameters: ['Fault Lines', 'Soil Type', 'Building Age', 'Foundation Type'],
  },
  {
    id: 'storm-surge',
    name: 'Storm Surge Model',
    type: 'water',
    status: 'active',
    lastRun: '4 hours ago',
    accuracy: 89.3,
    description: 'Predicts coastal flooding from hurricanes and tropical storms.',
    parameters: ['Storm Category', 'Tide Level', 'Coastal Topology', 'Barrier Islands'],
  },
  {
    id: 'blizzard-impact',
    name: 'Blizzard Impact Model',
    type: 'weather',
    status: 'active',
    lastRun: '1 hour ago',
    accuracy: 92.1,
    description: 'Models snow accumulation, visibility, and road conditions.',
    parameters: ['Snowfall Rate', 'Wind Speed', 'Temperature', 'Ground Temperature'],
  },
];

const modelTypeColors: Record<string, string> = {
  fire: '#ef4444',
  water: '#3b82f6',
  earth: '#a855f7',
  weather: '#06b6d4',
};

export default function JupiterPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [runningModels, setRunningModels] = useState<Set<string>>(new Set());

  const toggleModelRun = (modelId: string) => {
    setRunningModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const activeCount = hazardModels.filter(m => m.status === 'active').length;

  return (
    <div className="jupiter-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <Flame className="page-icon" size={28} />
            <div>
              <h1>Jupiter - Hazard Modeling</h1>
              <p>Configure and manage predictive hazard models for emergency response.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-secondary">
              <Upload size={16} />
              Import Model
            </button>
            <button className="btn-primary">
              <Settings size={16} />
              Global Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{hazardModels.length}</div>
          <div className="stat-label">Total Models</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-green">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-yellow">{runningModels.size}</div>
          <div className="stat-label">Currently Running</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">91.4%</div>
          <div className="stat-label">Avg Accuracy</div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="models-grid">
        {hazardModels.map((model) => (
          <div
            key={model.id}
            className={`model-card ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => setSelectedModel(model.id === selectedModel ? null : model.id)}
          >
            <div className="model-card-header">
              <div className="model-type-badge" style={{ backgroundColor: modelTypeColors[model.type] }}>
                {model.type.toUpperCase()}
              </div>
              <div className={`model-status ${model.status}`}>
                {model.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            <h3 className="model-name">{model.name}</h3>
            <p className="model-description">{model.description}</p>

            <div className="model-meta">
              <div className="model-meta-item">
                <span className="meta-label">Last Run:</span>
                <span className="meta-value">{model.lastRun}</span>
              </div>
              <div className="model-meta-item">
                <span className="meta-label">Accuracy:</span>
                <span className="meta-value">{model.accuracy}%</span>
              </div>
            </div>

            <div className="model-parameters">
              <span className="parameters-label">Parameters:</span>
              <div className="parameters-list">
                {model.parameters.slice(0, 3).map((param, i) => (
                  <span key={i} className="parameter-chip">{param}</span>
                ))}
                {model.parameters.length > 3 && (
                  <span className="parameter-chip more">+{model.parameters.length - 3}</span>
                )}
              </div>
            </div>

            <div className="model-actions">
              <button
                className={`btn-run ${runningModels.has(model.id) ? 'running' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModelRun(model.id);
                }}
              >
                {runningModels.has(model.id) ? (
                  <>
                    <Pause size={14} />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Run
                  </>
                )}
              </button>
              <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                <Settings size={16} />
              </button>
              <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Predictions */}
      <div className="recent-section">
        <h2>Recent Predictions</h2>
        <div className="predictions-list">
          <div className="prediction-item">
            <AlertTriangle className="prediction-icon warning" size={20} />
            <div className="prediction-content">
              <div className="prediction-title">High fire risk detected - Santa Rosa County</div>
              <div className="prediction-meta">Wildfire Spread Model &bull; 15 minutes ago</div>
            </div>
            <ChevronRight size={20} className="prediction-arrow" />
          </div>
          <div className="prediction-item">
            <AlertTriangle className="prediction-icon info" size={20} />
            <div className="prediction-content">
              <div className="prediction-title">Flash flood warning - Buffalo Creek watershed</div>
              <div className="prediction-meta">Flood Prediction Model &bull; 45 minutes ago</div>
            </div>
            <ChevronRight size={20} className="prediction-arrow" />
          </div>
          <div className="prediction-item">
            <AlertTriangle className="prediction-icon success" size={20} />
            <div className="prediction-content">
              <div className="prediction-title">Storm surge risk decreasing - Lake Erie shoreline</div>
              <div className="prediction-meta">Storm Surge Model &bull; 2 hours ago</div>
            </div>
            <ChevronRight size={20} className="prediction-arrow" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .jupiter-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
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
          color: #f97316;
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

        .models-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .model-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
        }

        .model-card:hover {
          border-color: #0097b2;
        }

        .model-card.selected {
          border-color: #0097b2;
          box-shadow: 0 0 0 3px rgba(0, 151, 178, 0.1);
        }

        .model-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .model-type-badge {
          font-size: 10px;
          font-weight: 700;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .model-status {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .model-status.active {
          background: #dcfce7;
          color: #16a34a;
        }

        .model-status.inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .model-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .model-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .model-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }

        .model-meta-item {
          font-size: 12px;
        }

        .meta-label {
          color: #9ca3af;
        }

        .meta-value {
          color: #1f2937;
          font-weight: 500;
          margin-left: 4px;
        }

        .model-parameters {
          margin-bottom: 16px;
        }

        .parameters-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 8px;
        }

        .parameters-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .parameter-chip {
          font-size: 11px;
          background: #f3f4f6;
          color: #4b5563;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .parameter-chip.more {
          background: #e5e7eb;
          color: #6b7280;
        }

        .model-actions {
          display: flex;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .btn-run {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #0097b2;
          color: white;
          flex: 1;
          justify-content: center;
        }

        .btn-run.running {
          background: #f59e0b;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .btn-icon:hover {
          background: #f9fafb;
        }

        .recent-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .recent-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .predictions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .prediction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          cursor: pointer;
        }

        .prediction-item:hover {
          background: #f3f4f6;
        }

        .prediction-icon {
          flex-shrink: 0;
        }

        .prediction-icon.warning { color: #f59e0b; }
        .prediction-icon.info { color: #3b82f6; }
        .prediction-icon.success { color: #22c55e; }

        .prediction-content {
          flex: 1;
        }

        .prediction-title {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .prediction-meta {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .prediction-arrow {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
