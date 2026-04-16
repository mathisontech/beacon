'use client';

import { MapDatasetStatus } from '@prisma/client';
import { Eye, Upload, Archive, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCardClasses, badges, getButtonClasses } from '@/lib/design';

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Dataset {
  id: string;
  datasetId: string;
  name: string;
  type: string;
  source: string | null;
  version: string | null;
  uploadedAt: string;
  status: MapDatasetStatus;
  boundingBox: BoundingBox | null;
  fileSize: string | null;
}

interface DatasetCardProps {
  dataset: Dataset;
  onViewDetails: (dataset: Dataset) => void;
  onUpdateVersion: (dataset: Dataset) => void;
  onArchive: (dataset: Dataset) => void;
  onDelete: (dataset: Dataset) => void;
}

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  DEM: 'bg-blue-100 text-blue-800',
  LANDFIRE: 'bg-green-100 text-green-800',
  Roads: 'bg-orange-100 text-orange-800',
  Buildings: 'bg-purple-100 text-purple-800',
  Vegetation: 'bg-emerald-100 text-emerald-800',
  Hydrants: 'bg-red-100 text-red-800',
};

// Status text styles
const statusStyles: Record<MapDatasetStatus, string> = {
  ACTIVE: 'text-status-success',
  PROCESSING: 'text-status-warning',
  ERROR: 'text-status-error',
  ARCHIVED: 'text-gray-500',
  UPLOADING: 'text-blue-500',
};

// Format file size to human readable
function formatFileSize(bytes: string | null): string {
  if (!bytes) return 'Unknown';
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Get coverage area from bounding box (simplified)
function getCoverageArea(
  bbox: { north: number; south: number; east: number; west: number } | null
): string {
  if (!bbox) return 'Unknown';
  // This is a simplified version - in production you'd use reverse geocoding
  const centerLat = (bbox.north + bbox.south) / 2;
  const centerLng = (bbox.east + bbox.west) / 2;

  // Simple region detection for Western NY
  if (centerLat > 42.5 && centerLat < 43.2 && centerLng > -79.5 && centerLng < -78.0) {
    if (centerLat > 42.85 && centerLat < 42.95) return 'Buffalo, NY';
    if (centerLat > 43.0) return 'Niagara Falls, NY';
    return 'Erie County, NY';
  }
  if (centerLat > 42.0 && centerLat < 43.5 && centerLng > -80.0 && centerLng < -77.0) {
    return 'Western NY';
  }

  return `${centerLat.toFixed(2)}, ${centerLng.toFixed(2)}`;
}

export default function DatasetCard({
  dataset,
  onViewDetails,
  onUpdateVersion,
  onArchive,
  onDelete,
}: DatasetCardProps) {
  const typeBadge = typeBadgeColors[dataset.type] || 'bg-gray-100 text-gray-800';
  const statusStyle = statusStyles[dataset.status];

  return (
    <div className={`${getCardClasses('elevated', 'lg')} flex flex-col`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-beacon-navy truncate">{dataset.name}</h3>
          <p className="text-xs text-gray-500">{dataset.datasetId}</p>
        </div>
        <span className={`${badges.base} ${badges.sizes.sm} ${typeBadge} ml-2 flex-shrink-0`}>
          {dataset.type}
        </span>
      </div>

      {/* Version and Status */}
      <div className="flex items-center gap-3 mb-4">
        {dataset.version && (
          <span className="text-sm text-gray-600">v{dataset.version}</span>
        )}
        <span className={`text-sm font-medium ${statusStyle}`}>
          {dataset.status.charAt(0) + dataset.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-2 text-sm text-gray-600 flex-1">
        {dataset.source && (
          <div className="flex justify-between">
            <span className="text-gray-500">Source</span>
            <span className="font-medium">{dataset.source}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Last updated</span>
          <span>{formatDistanceToNow(new Date(dataset.uploadedAt), { addSuffix: true })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">File size</span>
          <span>{formatFileSize(dataset.fileSize)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Coverage</span>
          <span>{getCoverageArea(dataset.boundingBox)}</span>
        </div>
      </div>

      {/* Actions - icon only buttons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(dataset)}
          className={`${getButtonClasses('outline', 'sm')} p-2`}
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onUpdateVersion(dataset)}
          className={`${getButtonClasses('outline', 'sm')} p-2`}
          title="Update Version"
        >
          <Upload className="w-4 h-4" />
        </button>
        {dataset.status === 'ACTIVE' && (
          <button
            onClick={() => onArchive(dataset)}
            className={`${getButtonClasses('outline', 'sm')} p-2 text-amber-600 hover:bg-amber-50`}
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
        {dataset.status === 'ARCHIVED' && (
          <button
            onClick={() => onDelete(dataset)}
            className={`${getButtonClasses('danger', 'sm')} p-2`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
