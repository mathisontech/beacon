'use client';

import { useRef, useState } from 'react';

interface DriveUploadButtonProps {
  folderId?: string;
  onUploadComplete: () => void;
}

export default function DriveUploadButton({ folderId, onUploadComplete }: DriveUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (folderId) form.append('folderId', folderId);

      const res = await fetch('/api/admin/integrations/google/drive/upload', {
        method: 'POST',
        body: form,
      });
      if (res.ok) onUploadComplete();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="drive-upload-btn-wrap">
      <input ref={inputRef} type="file" hidden onChange={handleUpload} />
      <button
        className="drive-action-btn"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
