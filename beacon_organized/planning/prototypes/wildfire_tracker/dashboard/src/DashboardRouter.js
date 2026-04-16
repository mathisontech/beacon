import React, { useState } from 'react';
import App from './App';
import CommandDashboard from './CommandDashboard';
import MutualAidPage from './MutualAidPage';
import './DashboardRouter.css';

function DashboardRouter() {
  const [view, setView] = useState('public'); // 'public', 'command', or 'mutual-aid'

  if (view === 'command') {
    return (
      <>
        <div className="view-switcher">
          <button
            className="view-switch-btn"
            onClick={() => setView('public')}
          >
            Public View
          </button>
          <button
            className="view-switch-btn mutual-aid"
            onClick={() => setView('mutual-aid')}
          >
            Mutual Aid
          </button>
        </div>
        <CommandDashboard />
      </>
    );
  }

  if (view === 'mutual-aid') {
    return (
      <>
        <div className="view-switcher">
          <button
            className="view-switch-btn"
            onClick={() => setView('public')}
          >
            Public View
          </button>
          <button
            className="view-switch-btn command"
            onClick={() => setView('command')}
          >
            Command Center
          </button>
        </div>
        <MutualAidPage />
      </>
    );
  }

  return (
    <>
      <div className="view-switcher">
        <button
          className="view-switch-btn command"
          onClick={() => setView('command')}
        >
          Command Center
        </button>
        <button
          className="view-switch-btn mutual-aid"
          onClick={() => setView('mutual-aid')}
        >
          Mutual Aid
        </button>
      </div>
      <App />
    </>
  );
}

export default DashboardRouter;
