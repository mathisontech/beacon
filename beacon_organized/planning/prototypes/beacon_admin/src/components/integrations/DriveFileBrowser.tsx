'use client';

import { useState, useEffect, useCallback } from 'react';
import DriveFileRow, { drivePreviewUrl } from './DriveFileRow';
import DriveUploadButton from './DriveUploadButton';
import DriveNewFolder from './DriveNewFolder';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

interface BreadcrumbItem {
  id?: string;
  name: string;
}

export default function DriveFileBrowser() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ name: 'My Drive' }]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null);

  const currentFolderId = breadcrumbs.length > 1
    ? breadcrumbs[breadcrumbs.length - 1].id
    : undefined;

  const loadFiles = useCallback(async (folderId?: string, pageToken?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folderId) params.set('folderId', folderId);
      if (pageToken) params.set('pageToken', pageToken);
      const res = await fetch(`/api/admin/integrations/google/drive?${params}`);
      const data = await res.json();
      if (pageToken) {
        setFiles(prev => [...prev, ...(data.files || [])]);
      } else {
        setFiles(data.files || []);
      }
      setNextPageToken(data.nextPageToken);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearchActive(true);
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: search.trim() });
      const res = await fetch(`/api/admin/integrations/google/drive?${params}`);
      const data = await res.json();
      setFiles(data.files || []);
      setNextPageToken(undefined);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSearchActive(false);
    loadFiles(currentFolderId);
  };

  const navigateToFolder = (id: string, name: string) => {
    setPreview(null);
    setBreadcrumbs(prev => [...prev, { id, name }]);
    setSearchActive(false);
    setSearch('');
    loadFiles(id);
  };

  const navigateToBreadcrumb = (index: number) => {
    setPreview(null);
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newCrumbs);
    setSearchActive(false);
    setSearch('');
    loadFiles(index === 0 ? undefined : newCrumbs[newCrumbs.length - 1].id);
  };

  const refresh = () => {
    if (searchActive) handleSearch();
    else loadFiles(currentFolderId);
  };

  useEffect(() => { loadFiles(); }, [loadFiles]);

  return (
    <div className="drive-browser">
      <div className="drive-toolbar">
        <div className="drive-search-wrap">
          <input
            className="drive-search-input"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchActive && (
            <button className="drive-clear-search" onClick={clearSearch}>clear</button>
          )}
        </div>
        <div className="drive-actions">
          <DriveNewFolder parentId={currentFolderId} onCreated={refresh} />
          <DriveUploadButton folderId={currentFolderId} onUploadComplete={refresh} />
        </div>
      </div>

      {!searchActive && (
        <div className="drive-breadcrumbs">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="drive-breadcrumb-sep">/</span>}
              <button
                className={`drive-breadcrumb ${i === breadcrumbs.length - 1 ? 'current' : ''}`}
                onClick={() => navigateToBreadcrumb(i)}
                disabled={i === breadcrumbs.length - 1}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}
      {searchActive && (
        <div className="drive-breadcrumbs">
          <span className="drive-breadcrumb current">Search results for &quot;{search}&quot;</span>
        </div>
      )}

      <div className={`drive-split ${preview ? 'has-preview' : ''}`}>
        <div className="drive-file-panel">
          <div className="drive-file-header">
            <span className="drive-file-name">Name</span>
            <span className="drive-file-modified">Modified</span>
            <span className="drive-file-size">Size</span>
          </div>
          <div className="drive-file-list">
            {loading && files.length === 0 && <div className="drive-empty">Loading...</div>}
            {!loading && files.length === 0 && <div className="drive-empty">No files found</div>}
            {files.map((file) => (
              <DriveFileRow
                key={file.id}
                {...file}
                onFolderClick={navigateToFolder}
                onFileSelect={(id, name) => setPreview({ id, name })}
              />
            ))}
            {nextPageToken && !loading && (
              <button className="drive-load-more" onClick={() => loadFiles(currentFolderId, nextPageToken)}>
                Load more
              </button>
            )}
          </div>
        </div>

        {preview && (
          <div className="drive-preview-panel">
            <div className="drive-preview-header">
              <span className="drive-preview-title">{preview.name}</span>
              <button className="drive-preview-close" onClick={() => setPreview(null)}>close</button>
            </div>
            <iframe
              className="drive-preview-frame"
              src={drivePreviewUrl(preview.id)}
              title={preview.name}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
