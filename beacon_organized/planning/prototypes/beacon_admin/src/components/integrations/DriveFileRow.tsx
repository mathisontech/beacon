'use client';

interface DriveFileRowProps {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  onFolderClick: (id: string, name: string) => void;
  onFileSelect?: (id: string, name: string) => void;
}

function formatSize(bytes?: string): string {
  if (!bytes) return '--';
  const n = parseInt(bytes, 10);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function drivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export default function DriveFileRow({
  id, name, mimeType, modifiedTime, size, webViewLink, onFolderClick, onFileSelect,
}: DriveFileRowProps) {
  const isFolder = mimeType === FOLDER_MIME;

  const handleClick = () => {
    if (isFolder) {
      onFolderClick(id, name);
    } else if (onFileSelect) {
      onFileSelect(id, name);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (webViewLink) window.open(webViewLink, '_blank');
  };

  return (
    <div className="drive-file-row" onClick={handleClick}>
      <span className="drive-file-name">
        <span className="drive-file-type">{isFolder ? 'folder' : mimeType.split('/').pop()?.split('.').pop()}</span>
        {name}
      </span>
      <span className="drive-file-modified">{formatDate(modifiedTime)}</span>
      <span className="drive-file-size">{isFolder ? '--' : formatSize(size)}</span>
      {!isFolder && webViewLink && (
        <button className="drive-open-btn" onClick={handleOpen} title="Open in Drive">open</button>
      )}
    </div>
  );
}
