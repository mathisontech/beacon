// ============================================================================
// APP LOGIN - Simple login/register system for Beacon Emergency App
// ============================================================================

import React, { useState } from 'react'
import BeaconSignInPage from './BeaconSignInPage'
import BeaconCreateAccountPage from './BeaconCreateAccountPage'

function AppLogin({ appName, appLogo, onLogin }) {
  const [showCreateAccount, setShowCreateAccount] = useState(false)

  const handleLogin = (user) => {
    onLogin(user)
  }

  const handleAccountCreated = (user) => {
    onLogin(user)
  }

  return (
    <>
      {showCreateAccount ? (
        <BeaconCreateAccountPage
          appName={appName}
          appLogo={appLogo}
          appColor="#dc2626"
          welcomeTitle="Create Emergency Account"
          welcomeSubtitle="Join Beacon for emergency navigation and safety"
          onAccountCreated={handleAccountCreated}
          onBackToSignIn={() => setShowCreateAccount(false)}
        />
      ) : (
        <BeaconSignInPage
          appName={appName}
          appLogo={appLogo}
          onLogin={handleLogin}
          onSwitchToCreateAccount={() => setShowCreateAccount(true)}
        />
      )}
    </>
  )
}

export default AppLogin