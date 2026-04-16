// ============================================================================
// ALERT BANNER - Display emergency weather alerts and warnings
// ============================================================================

import React from 'react'

function AlertBanner({ alerts = [], severity = 'moderate' }) {
  if (!alerts || alerts.length === 0) {
    return null
  }

  const getSeverityClass = (alertSeverity) => {
    switch (alertSeverity?.toLowerCase()) {
      case 'extreme':
      case 'critical':
        return 'alert-critical'
      case 'severe':
        return 'alert-severe'
      case 'moderate':
        return 'alert-moderate'
      case 'minor':
        return 'alert-minor'
      default:
        return 'alert-moderate'
    }
  }

  const getSeverityIcon = (alertSeverity) => {
    switch (alertSeverity?.toLowerCase()) {
      case 'extreme':
      case 'critical':
        return '🚨'
      case 'severe':
        return '⚠️'
      case 'moderate':
        return '⚡'
      case 'minor':
        return 'ℹ️'
      default:
        return '⚠️'
    }
  }

  const formatTimeToImpact = (timeToImpact) => {
    if (timeToImpact === undefined || timeToImpact === Infinity) return ''
    if (timeToImpact <= 0) return ' - NOW'
    
    const hours = Math.floor(timeToImpact / 3600000)
    const minutes = Math.floor((timeToImpact % 3600000) / 60000)
    
    if (hours > 0) {
      return ` - ${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return ` - ${minutes}m`
    } else {
      return ' - NOW'
    }
  }

  return (
    <div className={`alert-banner ${getSeverityClass(severity)}`}>
      <div className="alert-content">
        {alerts.map((alert, index) => (
          <div key={alert.id || index} className="alert-item">
            <div className="alert-header">
              <span className="alert-icon">{getSeverityIcon(alert.threatLevel || alert.severity || severity)}</span>
              <span className="alert-title">
                {alert.title || alert.headline || alert.event || 'Weather Alert'}
                {formatTimeToImpact(alert.timeToImpact)}
              </span>
              <span className="alert-time">
                {alert.effective ? new Date(alert.effective).toLocaleTimeString() : 
                 alert.time ? new Date(alert.time).toLocaleTimeString() : 'Now'}
              </span>
            </div>
            
            {alert.description && (
              <div className="alert-description">
                {alert.description}
              </div>
            )}
            
            {alert.instruction && (
              <div className="alert-description" style={{ fontWeight: 'bold', color: '#fca5a5' }}>
                🚨 {alert.instruction}
              </div>
            )}
            
            {(alert.areas || alert.area) && (
              <div className="alert-area">
                📍 Area: {Array.isArray(alert.areas) ? alert.areas.join(', ') : (alert.areas || alert.area)}
              </div>
            )}
            
            {alert.actionRequired && alert.actionRequired.length > 0 && (
              <div className="alert-actions">
                <strong>Required Actions:</strong>
                <ul style={{ margin: '4px 0 0 20px', fontSize: '12px' }}>
                  {alert.actionRequired.map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {alert.evacuationRecommended && (
              <div className="evacuation-warning" style={{ 
                background: '#dc2626', 
                color: 'white', 
                padding: '8px', 
                borderRadius: '4px', 
                marginTop: '8px',
                fontWeight: 'bold'
              }}>
                🚨 EVACUATION RECOMMENDED
              </div>
            )}
          </div>
        ))}
        
        {alerts.length > 1 && (
          <div className="alert-count">
            {alerts.length} active alerts in your area
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertBanner