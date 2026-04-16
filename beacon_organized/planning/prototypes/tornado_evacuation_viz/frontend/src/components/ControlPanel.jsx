import { useState } from 'react';
import './ControlPanel.css';

function ControlPanel({ scenario, layers, onToggleLayer, onScenarioChange, currentTime, playing, onPlay, onPause, onTimeChange }) {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState({
    efRating: 3,
    direction: 60,
    speed: 30,
    numDrivers: 20
  });

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const applyConfig = () => {
    onScenarioChange({
      townName: 'Moore, OK',
      center: [-97.4395, 35.3395],
      radiusMiles: 5,
      ...config
    });
    setShowConfig(false);
  };

  return (
    <div className="control-panel">
      <div className="panel-section">
        <h3>Scenario</h3>
        <button onClick={() => setShowConfig(!showConfig)} className="btn-secondary">
          {showConfig ? 'Hide' : 'Configure'} Scenario
        </button>

        {showConfig && (
          <div className="config-form">
            <div className="form-group">
              <label>EF Rating</label>
              <select value={config.efRating} onChange={(e) => handleConfigChange('efRating', e.target.value)}>
                {[0, 1, 2, 3, 4, 5].map(ef => (
                  <option key={ef} value={ef}>EF{ef}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Direction (degrees)</label>
              <input
                type="range"
                min="0"
                max="359"
                value={config.direction}
                onChange={(e) => handleConfigChange('direction', e.target.value)}
              />
              <span>{config.direction}°</span>
            </div>

            <div className="form-group">
              <label>Speed (mph)</label>
              <input
                type="range"
                min="10"
                max="70"
                value={config.speed}
                onChange={(e) => handleConfigChange('speed', e.target.value)}
              />
              <span>{config.speed} mph</span>
            </div>

            <div className="form-group">
              <label>Active Drivers</label>
              <input
                type="range"
                min="5"
                max="50"
                value={config.numDrivers}
                onChange={(e) => handleConfigChange('numDrivers', e.target.value)}
              />
              <span>{config.numDrivers}</span>
            </div>

            <button onClick={applyConfig} className="btn-primary">
              Generate New Scenario
            </button>
          </div>
        )}
      </div>

      <div className="panel-section">
        <h3>Map Layers</h3>
        <div className="layer-toggles">
          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.tornadoPath}
              onChange={() => onToggleLayer('tornadoPath')}
            />
            <span>Tornado Path</span>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.dangerZones}
              onChange={() => onToggleLayer('dangerZones')}
            />
            <span>Danger Zones</span>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.timestamps}
              onChange={() => onToggleLayer('timestamps')}
            />
            <span>Time Stamps</span>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.buildings}
              onChange={() => onToggleLayer('buildings')}
            />
            <span>Buildings</span>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.shelters}
              onChange={() => onToggleLayer('shelters')}
            />
            <span>Shelters</span>
          </label>

          <label className="toggle-item">
            <input
              type="checkbox"
              checked={layers.people}
              onChange={() => onToggleLayer('people')}
            />
            <span>People</span>
          </label>
        </div>
      </div>

      <div className="panel-section">
        <h3>Timeline</h3>
        <div className="timeline-controls">
          <div className="playback-controls">
            {playing ? (
              <button onClick={onPause} className="btn-icon">❚❚</button>
            ) : (
              <button onClick={onPlay} className="btn-icon">▶</button>
            )}
          </div>

          <div className="time-slider-container">
            <input
              type="range"
              min="0"
              max="30"
              value={currentTime}
              onChange={(e) => onTimeChange(parseInt(e.target.value))}
              className="time-slider"
            />
            <div className="time-labels">
              <span>T-0</span>
              <span>T+15</span>
              <span>T+30</span>
            </div>
          </div>

          <div className="current-time">
            <strong>T+{currentTime} minutes</strong>
          </div>
        </div>
      </div>

      <div className="panel-section legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-icon">🌪️</span>
            <span>Tornado</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏘️</span>
            <span>Trailer Park (Vulnerable)</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏥</span>
            <span>Shelter</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🏢</span>
            <span>Commercial Building</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">🚗</span>
            <span>Driver</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon">👤</span>
            <span>Resident</span>
          </div>
        </div>

        <h4>Action Colors</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#00ff00'}}></span>
            <span>Monitor</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#ffff00'}}></span>
            <span>Shelter in Place</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#ff9900'}}></span>
            <span>Evacuate</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#ff0000'}}></span>
            <span>Evacuate Urgently</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
