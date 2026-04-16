// ============================================================================
// DEMO ENTRY POINT - Beacon Emergency App
// ============================================================================

import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Lazy load Beacon Dashboard
const BeaconDashboard = lazy(() => import('../../pages/dashboard/BeaconDashboard'))

import './index.css'

function App() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1f2937',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading Beacon...
      </div>
    }>
      <BeaconDashboard />
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
