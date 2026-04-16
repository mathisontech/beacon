// ============================================================================
// ALERTS PAGE - Emergency notifications and weather warnings
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useWeatherAlerts } from '../../shared_util/hooks/useWeatherAlerts'

const ALERT_SEVERITY = {
  critical: { label: 'Critical', icon: '🔴', color: '#dc2626' },
  severe: { label: 'Severe', icon: '🟠', color: '#f59e0b' },
  moderate: { label: 'Moderate', icon: '🟡', color: '#eab308' },
  minor: { label: 'Minor', icon: '🟢', color: '#10b981' }
}

function AlertsPage({ user, userLocation }) {
  const {
    alerts: weatherAlerts,
    loading,
    error,
    refreshAlerts,
    hasCriticalAlerts
  } = useWeatherAlerts(userLocation, {
    autoStart: true,
    enablePolling: true
  })

  const [filter, setFilter] = useState('all') // 'all', 'critical', 'severe', 'moderate', 'minor'
  const [localAlerts, setLocalAlerts] = useState([
    {
      id: 1,
      type: 'wildfire',
      severity: 'critical',
      title: 'Wildfire Warning',
      description: 'Fast-moving fire approaching Highway 101. Evacuate immediately.',
      location: 'Highway 101 North',
      distance: '2.5 miles',
      timestamp: Date.now() - 15 * 60 * 1000,
      icon: '🔥'
    },
    {
      id: 2,
      type: 'flood',
      severity: 'moderate',
      title: 'Flood Advisory',
      description: 'Rising water levels on Main Street. Avoid low-lying areas.',
      location: 'Downtown Area',
      distance: '1.2 miles',
      timestamp: Date.now() - 60 * 60 * 1000,
      icon: '🌊'
    }
  ])

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} ago`
  }

  const getSeverityCounts = () => {
    const allAlerts = [...localAlerts, ...(weatherAlerts || [])]
    return {
      critical: allAlerts.filter(a => a.severity === 'critical' || a.threatLevel === 'critical').length,
      severe: allAlerts.filter(a => a.severity === 'severe' || a.threatLevel === 'severe').length,
      moderate: allAlerts.filter(a => a.severity === 'moderate' || a.threatLevel === 'moderate').length,
      minor: allAlerts.filter(a => a.severity === 'minor' || a.threatLevel === 'minor').length
    }
  }

  const getAllAlerts = () => {
    const combined = [
      ...localAlerts,
      ...(weatherAlerts || []).map(alert => ({
        id: `weather-${alert.id || Math.random()}`,
        type: 'weather',
        severity: alert.threatLevel || alert.severity,
        title: alert.title || alert.event,
        description: alert.description || alert.instruction,
        location: alert.area || 'Your area',
        distance: 'Unknown',
        timestamp: alert.timestamp || Date.now(),
        icon: getWeatherIcon(alert.event)
      }))
    ]

    // Sort by severity and timestamp
    const severityOrder = { critical: 0, severe: 1, moderate: 2, minor: 3 }
    return combined.sort((a, b) => {
      const aSev = severityOrder[a.severity] ?? 999
      const bSev = severityOrder[b.severity] ?? 999
      if (aSev !== bSev) return aSev - bSev
      return b.timestamp - a.timestamp
    })
  }

  const getWeatherIcon = (eventType) => {
    const iconMap = {
      'tornado': '🌪️',
      'hurricane': '🌀',
      'flood': '🌊',
      'fire': '🔥',
      'thunderstorm': '⛈️',
      'winter storm': '❄️',
      'heat': '🌡️'
    }
    const type = (eventType || '').toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
      if (type.includes(key)) return icon
    }
    return '⚠️'
  }

  const filteredAlerts = filter === 'all'
    ? getAllAlerts()
    : getAllAlerts().filter(a => a.severity === filter || a.threatLevel === filter)

  const counts = getSeverityCounts()

  return (
    <div className="alerts-page">
      {/* Header */}
      <div className="alerts-header">
        <h1>Emergency Alerts</h1>
        <button
          className={`refresh-btn ${loading ? 'loading' : ''}`}
          onClick={refreshAlerts}
          disabled={loading}
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Critical Alert Banner */}
      {hasCriticalAlerts && (
        <div className="critical-banner">
          <span className="banner-icon">🚨</span>
          <span className="banner-text">
            {counts.critical} Critical Alert{counts.critical > 1 ? 's' : ''} - Immediate Action Required
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="alert-summary">
        <div className="summary-card critical">
          <div className="card-icon">🔴</div>
          <div className="card-number">{counts.critical}</div>
          <div className="card-label">Critical</div>
        </div>
        <div className="summary-card severe">
          <div className="card-icon">🟠</div>
          <div className="card-number">{counts.severe}</div>
          <div className="card-label">Severe</div>
        </div>
        <div className="summary-card moderate">
          <div className="card-icon">🟡</div>
          <div className="card-number">{counts.moderate}</div>
          <div className="card-label">Moderate</div>
        </div>
        <div className="summary-card minor">
          <div className="card-icon">🟢</div>
          <div className="card-number">{counts.minor}</div>
          <div className="card-label">Minor</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({filteredAlerts.length})
        </button>
        <button
          className={`filter-tab critical ${filter === 'critical' ? 'active' : ''}`}
          onClick={() => setFilter('critical')}
        >
          Critical ({counts.critical})
        </button>
        <button
          className={`filter-tab severe ${filter === 'severe' ? 'active' : ''}`}
          onClick={() => setFilter('severe')}
        >
          Severe ({counts.severe})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Alerts List */}
      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No Active Alerts</h3>
            <p>You're all clear! We'll notify you if any emergencies arise.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
              <div className="alert-icon-container">
                <span className="alert-icon">{alert.icon}</span>
              </div>

              <div className="alert-content">
                <div className="alert-title-row">
                  <h3 className="alert-title">{alert.title}</h3>
                  <span className={`severity-badge ${alert.severity}`}>
                    {ALERT_SEVERITY[alert.severity]?.icon} {ALERT_SEVERITY[alert.severity]?.label}
                  </span>
                </div>

                <p className="alert-description">{alert.description}</p>

                <div className="alert-meta">
                  <span className="alert-location">📍 {alert.location}</span>
                  <span className="alert-distance">↔️ {alert.distance}</span>
                  <span className="alert-time">🕐 {formatTimeAgo(alert.timestamp)}</span>
                </div>
              </div>

              <div className="alert-actions">
                <button className="action-btn view-map">
                  View on Map
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlertsPage