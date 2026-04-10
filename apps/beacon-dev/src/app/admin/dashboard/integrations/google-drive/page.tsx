'use client';

import { useState, useEffect } from 'react';
import DriveConnectButton from '@/components/integrations/DriveConnectButton';
import DriveFileBrowser from '@/components/integrations/DriveFileBrowser';

export default function GoogleDrivePage() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/integrations/google/status')
      .then(r => r.json())
      .then(d => setConnected(d.connected))
      .catch(() => setConnected(false));
  }, []);

  return (
    <div className="drive-page">
      <div className="drive-page-header">
        <h1 className="page-title">Google Drive</h1>
        <DriveConnectButton />
      </div>
      {connected === null && <p className="drive-loading">Loading...</p>}
      {connected === false && (
        <p className="drive-not-connected">Connect your Google account to browse files.</p>
      )}
      {connected && <DriveFileBrowser />}
    </div>
  );
}
