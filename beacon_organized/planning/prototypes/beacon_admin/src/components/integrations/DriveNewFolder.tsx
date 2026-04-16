'use client';

import { useState } from 'react';

interface DriveNewFolderProps {
  parentId?: string;
  onCreated: () => void;
}

export default function DriveNewFolder({ parentId, onCreated }: DriveNewFolderProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/integrations/google/drive/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), parentId }),
      });
      if (res.ok) {
        setName('');
        setOpen(false);
        onCreated();
      }
    } catch (err) {
      console.error('Folder creation failed', err);
    } finally {
      setCreating(false);
    }
  };

  if (!open) {
    return (
      <button className="drive-action-btn" onClick={() => setOpen(true)}>
        New Folder
      </button>
    );
  }

  return (
    <div className="drive-new-folder-form">
      <input
        className="drive-folder-input"
        placeholder="Folder name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        autoFocus
      />
      <button className="drive-action-btn" onClick={handleCreate} disabled={creating}>
        {creating ? '...' : 'Create'}
      </button>
      <button className="drive-action-btn drive-cancel-btn" onClick={() => { setOpen(false); setName(''); }}>
        Cancel
      </button>
    </div>
  );
}
