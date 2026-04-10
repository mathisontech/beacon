'use client';

import { useState, useEffect } from 'react';

interface Status {
  connected: boolean;
  configured: boolean;
  email?: string;
  name?: string;
}

export default function DriveConnectButton() {
  const [status, setStatus] = useState<Status | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/integrations/google/status');
      setStatus(await res.json());
    } catch {
      setStatus({ connected: false, configured: false });
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const connect = async () => {
    const res = await fetch('/api/admin/integrations/google/auth');
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const disconnect = async () => {
    await fetch('/api/admin/integrations/google/status', { method: 'DELETE' });
    fetchStatus();
  };

  if (!status) return <div className="drive-status-loading">Checking connection...</div>;

  if (!status.configured) {
    return (
      <div className="drive-status-msg">
        Google OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="drive-connected">
        <span className="drive-connected-info">
          Connected as {status.name || status.email}
        </span>
        <button className="drive-action-btn drive-disconnect-btn" onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button className="drive-action-btn drive-connect-btn" onClick={connect}>
      Connect Google Drive
    </button>
  );
}
