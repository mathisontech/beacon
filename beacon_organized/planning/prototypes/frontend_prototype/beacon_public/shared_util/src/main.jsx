// ============================================================================
// BEACON STANDALONE ENTRY POINT - Independent React app
// ============================================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import BeaconDashboard from '../../pages/dashboard/BeaconDashboard'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BeaconDashboard />
    </BrowserRouter>
  </React.StrictMode>
)