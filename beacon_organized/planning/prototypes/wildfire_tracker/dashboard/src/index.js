import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DashboardRouter from './DashboardRouter';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DashboardRouter />
  </React.StrictMode>
);
