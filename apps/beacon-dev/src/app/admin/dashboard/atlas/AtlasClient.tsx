'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getButtonClasses, getCardClasses } from '@/lib/design';
import {
  DatasetCard,
  UploadDatasetModal,
  DatasetDetailsModal,
  type Dataset,
} from '@/components/atlas';

interface AtlasClientProps {
  initialDatasets: Dataset[];
}

export default function AtlasClient({ initialDatasets }: AtlasClientProps) {
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDatasets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/atlas/datasets');
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets);
      }
    } catch (error) {
      console.error('Failed to refresh datasets:', error);
      toast.error('Failed to refresh datasets');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleViewDetails = useCallback((dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsDetailsModalOpen(true);
  }, []);

  const handleUpdateVersion = useCallback((dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsUploadModalOpen(true);
  }, []);

  const handleArchive = useCallback(async (dataset: Dataset) => {
    try {
      const response = await fetch(`/api/admin/atlas/datasets/${dataset.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Dataset archived successfully');
        refreshDatasets();
      } else {
        toast.error('Failed to archive dataset');
      }
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to archive dataset');
    }
  }, [refreshDatasets]);

  const handleDelete = useCallback(async (dataset: Dataset) => {
    if (!confirm('Are you sure you want to permanently delete this dataset?')) {
      return;
    }

    try {
      // For now, we just show a message since we're doing soft deletes
      toast.success('Dataset removed from list');
      refreshDatasets();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete dataset');
    }
  }, [refreshDatasets]);

  const handleReprocess = useCallback(async (dataset: Dataset) => {
    try {
      const response = await fetch(`/api/admin/atlas/datasets/${dataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' }),
      });

      if (response.ok) {
        toast.success('Dataset queued for reprocessing');
        refreshDatasets();
      } else {
        toast.error('Failed to reprocess dataset');
      }
    } catch (error) {
      console.error('Reprocess error:', error);
      toast.error('Failed to reprocess dataset');
    }
  }, [refreshDatasets]);

  const handleUploadSuccess = useCallback(() => {
    toast.success('Dataset uploaded successfully');
    refreshDatasets();
  }, [refreshDatasets]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-beacon-navy">Atlas</h1>
          <p className="text-gray-600 mt-1">
            Manage GIS datasets for emergency routing and visualization
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshDatasets}
            disabled={isRefreshing}
            className={getButtonClasses('outline', 'md')}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => {
              setSelectedDataset(null);
              setIsUploadModalOpen(true);
            }}
            className={getButtonClasses('primary', 'md')}
          >
            Upload New Dataset
          </button>
        </div>
      </div>

      {/* Datasets Grid */}
      {datasets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              onViewDetails={handleViewDetails}
              onUpdateVersion={handleUpdateVersion}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`${getCardClasses('default', 'xl')} text-center py-16`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No datasets yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first dataset to get started with GIS data management.
          </p>
          <button
            onClick={() => {
              setSelectedDataset(null);
              setIsUploadModalOpen(true);
            }}
            className={getButtonClasses('primary', 'md')}
          >
            Upload New Dataset
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <UploadDatasetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Details Modal */}
      <DatasetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        dataset={selectedDataset}
        onArchive={handleArchive}
        onReprocess={handleReprocess}
      />
    </div>
  );
}
