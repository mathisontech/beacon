// ============================================================================
// BEACON DASHBOARD - Map-focused emergency navigation app
// ============================================================================

import React, { useState, useEffect } from 'react'
import BeaconSignInPage from '../auth/SignInPage'
import NewCreateAccountPage from '../../shared_util/components/auth/NewCreateAccountPage'
import MapPage from '../map/MapPage'
import AlertsPage from '../alerts/AlertsPage'
import ProfilePage from '../profile/ProfilePage'
import MapIcon from './icons/map.png'
import AlertsIcon from './icons/alerts.png'
import ProfileIcon from './icons/profile.png'
import './BeaconDashboard.css'

function BeaconDashboard({ user, onExit }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [activePage, setActivePage] = useState('map') // 'map', 'alerts', 'profile'
  const [beaconActive, setBeaconActive] = useState(false)
  const [beaconStatus, setBeaconStatus] = useState('inactive') // inactive, safe, sheltering, help
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    // Check if user is already logged into Beacon
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const savedUser = localStorage.getItem('beacon_current_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setCurrentUser(userData)
      } else {
        // Auto-login for development
        const devUser = {
          id: 'dev-user-1',
          username: 'dev-tester',
          email: 'dev@beacon.test',
          isDevUser: true
        }
        setCurrentUser(devUser)
        localStorage.setItem('beacon_current_user', JSON.stringify(devUser))
      }
    } catch (error) {
      console.error('Error loading saved user:', error)
      localStorage.removeItem('beacon_current_user')
    }
    setCheckingAuth(false)
  }

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('beacon_current_user', JSON.stringify(userData))
  }

  const handleAccountCreated = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('beacon_current_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('beacon_current_user')
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="beacon-loading">
        <div className="loading-spinner"></div>
        <p>Loading Beacon Emergency System...</p>
      </div>
    )
  }

  // Show login if not authenticated
  if (!currentUser) {
    return (
      <div className="beacon-module">
        {showCreateAccount ? (
          <NewCreateAccountPage
            onAccountCreated={handleAccountCreated}
            onBackToSignIn={() => setShowCreateAccount(false)}
          />
        ) : (
          <BeaconSignInPage
            onLogin={handleLogin}
            onSwitchToCreateAccount={() => setShowCreateAccount(true)}
          />
        )}
      </div>
    )
  }

  // Show main emergency map interface
  return (
    <div className="beacon-app">
        {/* Top Header */}
        <div className="beacon-top-header">
          <div className="header-left">
            <button className="menu-btn">☰</button>
            <span className="app-title">Beacon</span>
          </div>
          <div className="header-right">
            <div className={`beacon-status-indicator ${beaconStatus}`} onClick={() => setBeaconActive(!beaconActive)}>
              <div className="status-dot"></div>
              <span className="status-text">
                {beaconStatus === 'inactive' && 'Inactive'}
                {beaconStatus === 'safe' && 'Safe'}
                {beaconStatus === 'sheltering' && 'Sheltering'}
                {beaconStatus === 'help' && 'Need Help'}
              </span>
            </div>
            <span className="user-name">{currentUser.username}</span>
            <button onClick={handleLogout} className="logout-btn">Exit</button>
            {onExit && (
              <button onClick={onExit} className="back-btn">← Back to Hive</button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {activePage === 'map' && (
            <MapPage user={currentUser} />
          )}

          {activePage === 'alerts' && (
            <AlertsPage user={currentUser} userLocation={userLocation} />
          )}

          {activePage === 'profile' && (
            <ProfilePage user={currentUser} onLogout={handleLogout} />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-navigation">
          <button
            className={`nav-tab ${activePage === 'map' ? 'active' : ''}`}
            onClick={() => setActivePage('map')}
          >
            <div className="nav-icon">
              <img src={MapIcon} alt="Map" className="nav-icon-image" />
            </div>
          </button>

          <button
            className={`nav-tab ${activePage === 'alerts' ? 'active' : ''}`}
            onClick={() => setActivePage('alerts')}
          >
            <div className="nav-icon">
              <img src={AlertsIcon} alt="Alerts" className="nav-icon-image" />
            </div>
          </button>

          <button
            className={`nav-tab ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <div className="nav-icon">
              <img src={ProfileIcon} alt="Profile" className="nav-icon-image" />
            </div>
          </button>
        </div>
    </div>
  )
}

export default BeaconDashboard