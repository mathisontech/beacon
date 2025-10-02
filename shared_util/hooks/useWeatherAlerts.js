// ============================================================================
// React Hook for Emergency Weather Alerts
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react'
import { getWeatherPoller } from '../services/weather/WeatherPoller.js'

export function useWeatherAlerts(location, options = {}) {
  const [weatherData, setWeatherData] = useState({
    alerts: [],
    conditions: null,
    loading: true,
    error: null,
    lastUpdated: null,
    pollMode: 'normal'
  })

  const [connectionStatus, setConnectionStatus] = useState('connecting')
  const pollerRef = useRef(null)
  const locationRef = useRef(null)
  const optionsRef = useRef(options)

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const {
    autoStart = true,
    enablePolling = true,
    onAlertChange = null,
    onCriticalAlert = null
  } = options

  // Initialize weather poller
  useEffect(() => {
    if (!pollerRef.current) {
      pollerRef.current = getWeatherPoller()
    }

    return () => {
      // Cleanup on unmount
      if (pollerRef.current && locationRef.current) {
        pollerRef.current.removeCallback(handleWeatherUpdate)
      }
    }
  }, [])

  // Handle weather data updates
  const handleWeatherUpdate = useCallback((data) => {
    const alerts = data.alerts?.alerts || []
    const conditions = data.conditions
    const hasError = data.alerts?.error || data.conditions?.error || data.serviceError

    setWeatherData(prevData => {
      const newData = {
        alerts: alerts,
        conditions: conditions,
        loading: false,
        error: hasError ? (data.alerts?.error || data.conditions?.error || 'Weather service error') : null,
        lastUpdated: data.lastUpdated,
        pollMode: data.pollMode,
        location: data.location
      }

      // Notify of alert changes using current options from ref
      const currentOptions = optionsRef.current
      if (currentOptions.onAlertChange && JSON.stringify(alerts) !== JSON.stringify(prevData.alerts)) {
        currentOptions.onAlertChange(alerts, prevData.alerts)
      }

      // Check for critical alerts using current options from ref
      const criticalAlerts = alerts.filter(alert => alert.threatLevel === 'critical')
      if (currentOptions.onCriticalAlert && criticalAlerts.length > 0) {
        currentOptions.onCriticalAlert(criticalAlerts)
      }

      return newData
    })

    setConnectionStatus(hasError ? 'error' : 'connected')
  }, [])

  // Start monitoring weather for location
  const startMonitoring = useCallback((lat, lng) => {
    if (!pollerRef.current || !lat || !lng) return

    setWeatherData(prev => ({ ...prev, loading: true, error: null }))
    setConnectionStatus('connecting')

    locationRef.current = { latitude: lat, longitude: lng }

    const currentOptions = optionsRef.current
    if (currentOptions.enablePolling) {
      pollerRef.current.addCallback(handleWeatherUpdate)
      pollerRef.current.startPolling(lat, lng)
    } else {
      // Single fetch without polling
      pollerRef.current.getAlerts(lat, lng)
        .then(alertsData => {
          handleWeatherUpdate({
            alerts: alertsData,
            conditions: null,
            lastUpdated: new Date().toISOString(),
            pollMode: 'normal',
            location: { latitude: lat, longitude: lng }
          })
        })
        .catch(error => {
          setWeatherData(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to fetch weather data'
          }))
          setConnectionStatus('error')
        })
    }
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (pollerRef.current) {
      pollerRef.current.removeCallback(handleWeatherUpdate)
      const currentOptions = optionsRef.current
      if (currentOptions.enablePolling) {
        pollerRef.current.stopPolling()
      }
    }
    locationRef.current = null
    setConnectionStatus('disconnected')
  }, [])

  // Force refresh
  const refreshAlerts = useCallback(async () => {
    if (!pollerRef.current || !locationRef.current) return

    setWeatherData(prev => ({ ...prev, loading: true }))
    setConnectionStatus('connecting')

    try {
      await pollerRef.current.forceUpdate()
    } catch (error) {
      setWeatherData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to refresh weather data'
      }))
      setConnectionStatus('error')
    }
  }, [])

  // Auto-start monitoring when location is provided
  useEffect(() => {
    if (autoStart && location?.latitude && location?.longitude) {
      startMonitoring(location.latitude, location.longitude)
    }

    return () => {
      if (autoStart) {
        stopMonitoring()
      }
    }
  }, [location?.latitude, location?.longitude, autoStart])

  // Get alerts by severity level
  const getAlertsBySeverity = useCallback((severity) => {
    return weatherData.alerts.filter(alert => alert.threatLevel === severity)
  }, [weatherData.alerts])

  // Get most urgent alert
  const getMostUrgentAlert = useCallback(() => {
    if (weatherData.alerts.length === 0) return null
    
    // Alerts are already sorted by threat level and imminence
    return weatherData.alerts[0]
  }, [weatherData.alerts])

  // Check if there are any active critical alerts
  const hasCriticalAlerts = useCallback(() => {
    return weatherData.alerts.some(alert => alert.threatLevel === 'critical')
  }, [weatherData.alerts])

  // Check if any alerts recommend evacuation
  const hasEvacuationRecommendation = useCallback(() => {
    return weatherData.alerts.some(alert => alert.evacuationRecommended)
  }, [weatherData.alerts])

  // Get polling status
  const getPollingStatus = useCallback(() => {
    return pollerRef.current ? pollerRef.current.getStatus() : null
  }, [])

  // Format time until impact for display
  const formatTimeToImpact = useCallback((timeToImpact) => {
    if (timeToImpact === Infinity) return 'Unknown'
    if (timeToImpact <= 0) return 'NOW'
    
    const hours = Math.floor(timeToImpact / 3600000)
    const minutes = Math.floor((timeToImpact % 3600000) / 60000)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return 'NOW'
    }
  }, [])

  return {
    // Data
    alerts: weatherData.alerts,
    conditions: weatherData.conditions,
    loading: weatherData.loading,
    error: weatherData.error,
    lastUpdated: weatherData.lastUpdated,
    pollMode: weatherData.pollMode,
    connectionStatus,

    // Controls
    startMonitoring,
    stopMonitoring,
    refreshAlerts,

    // Utility functions
    getAlertsBySeverity,
    getMostUrgentAlert,
    hasCriticalAlerts,
    hasEvacuationRecommendation,
    getPollingStatus,
    formatTimeToImpact,

    // Status helpers
    isConnected: connectionStatus === 'connected',
    isLoading: weatherData.loading,
    hasError: !!weatherData.error,
    isEmpty: weatherData.alerts.length === 0
  }
}