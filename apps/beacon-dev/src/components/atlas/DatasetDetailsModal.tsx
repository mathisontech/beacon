'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { modals, getButtonClasses, getCardClasses, badges } from '@/lib/design';
import type { Dataset } from './DatasetCard';

interface DatasetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset | null;
  onArchive: (dataset: Dataset) => void;
  onReprocess: (dataset: Dataset) => void;
}

interface DatasetDetails {
  dataset: Dataset & {
    metadata?: Record<string, unknown>;
    processedAt?: string;
  };
  uploader: { name: string; email: string } | null;
  usage: {
    clientCount: number;
    clients: { id: string; name: string }[];
  };
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

// Status colors
const statusColors: Record<string, string> = {
  ACTIVE: 'bg-status-success text-white',
  PROCESSING: 'bg-status-warning text-white',
  ERROR: 'bg-status-error text-white',
  ARCHIVED: 'bg-gray-500 text-white',
  UPLOADING: 'bg-blue-500 text-white',
};

function formatFileSize(bytes: string | null): string {
  if (!bytes) return 'Unknown';
  const size = parseInt(bytes, 10);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DatasetDetailsModal({
  isOpen,
  onClose,
  dataset,
  onArchive,
  onReprocess,
}: DatasetDetailsModalProps) {
  const [details, setDetails] = useState<DatasetDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dataset) {
      fetchDetails();
    }
  }, [isOpen, dataset]);

  const fetchDetails = async () => {
    if (!dataset) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/atlas/datasets/${dataset.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!dataset) return null;

  const typeBadge = typeBadgeColors[dataset.type] || 'bg-gray-100 text-gray-800';
  const statusBadge = statusColors[dataset.status] || 'bg-gray-500 text-white';

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-modal" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`${modals.container.base} ${modals.container.xl} max-w-2xl`}>
                {/* Header */}
                <div className={modals.header}>
                  <div>
                    <Dialog.Title as="h3" className={modals.title}>
                      {dataset.name}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">{dataset.datasetId}</p>
                  </div>
                  <button onClick={onClose} className={modals.closeBtn}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-6">
                  <span className={`${badges.base} ${badges.sizes.md} ${typeBadge}`}>
                    {dataset.type}
                  </span>
                  <span className={`${badges.base} ${badges.sizes.md} ${statusBadge}`}>
                    {dataset.status}
                  </span>
                  {dataset.version && (
                    <span className={`${badges.base} ${badges.sizes.md} bg-gray-100 text-gray-700`}>
                      v{dataset.version}
                    </span>
                  )}
                </div>

                {/* Tabs */}
                <Tab.Group>
                  <Tab.List className="flex space-x-1 border-b border-gray-200 mb-6">
                    {['Overview', 'Usage', 'Settings'].map((tab) => (
                      <Tab
                        key={tab}
                        className={({ selected }) =>
                          classNames(
                            'px-4 py-2.5 text-sm font-medium leading-5 focus:outline-none transition-colors',
                            selected
                              ? 'text-beacon-primary border-b-2 border-beacon-primary -mb-px'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          )
                        }
                      >
                        {tab}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels>
                    {/* Overview Panel */}
                    <Tab.Panel className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-beacon-primary rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Metadata Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className={getCardClasses('default', 'md')}>
                              <p className="text-sm text-gray-500 mb-1">File Size</p>
                              <p className="font-semibold text-beacon-navy">
                                {formatFileSize(dataset.fileSize)}
                              </p>
                            </div>
                            <div className={getCardClasses('default', 'md')}>
                              <p className="text-sm text-gray-500 mb-1">Uploaded</p>
                              <p className="font-semibold text-beacon-navy">
                                {format(new Date(dataset.uploadedAt), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(dataset.uploadedAt), { addSuffix: true })}
                              </p>
                            </div>
                            {dataset.source && (
                              <div className={getCardClasses('default', 'md')}>
                                <p className="text-sm text-gray-500 mb-1">Source</p>
                                <p className="font-semibold text-beacon-navy">{dataset.source}</p>
                              </div>
                            )}
                            {details?.uploader && (
                              <div className={getCardClasses('default', 'md')}>
                                <p className="text-sm text-gray-500 mb-1">Uploaded By</p>
                                <p className="font-semibold text-beacon-navy">
                                  {details.uploader.name}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Bounding Box / Coverage */}
                          {dataset.boundingBox && (
                            <div className={getCardClasses('default', 'md')}>
                              <p className="text-sm text-gray-500 font-medium mb-3">Coverage Area</p>
                              <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                  <p className="text-sm mb-2">Bounding Box</p>
                                  <p className="text-xs font-mono">
                                    N: {dataset.boundingBox.north.toFixed(4)}, S: {dataset.boundingBox.south.toFixed(4)}
                                  </p>
                                  <p className="text-xs font-mono">
                                    E: {dataset.boundingBox.east.toFixed(4)}, W: {dataset.boundingBox.west.toFixed(4)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          {details?.dataset?.metadata && (
                            <div className={getCardClasses('default', 'md')}>
                              <h4 className="font-medium text-beacon-navy mb-3">Technical Metadata</h4>
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {Object.entries(details.dataset.metadata).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <dt className="text-gray-500 capitalize">{key}</dt>
                                    <dd className="font-medium text-gray-900">
                                      {Array.isArray(value) ? value.join(', ') : String(value)}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          )}
                        </>
                      )}
                    </Tab.Panel>

                    {/* Usage Panel */}
                    <Tab.Panel className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-beacon-primary rounded-full animate-spin" />
                        </div>
                      ) : details?.usage ? (
                        <>
                          <div className={getCardClasses('default', 'md')}>
                            <h4 className="font-medium text-beacon-navy mb-2">Client Coverage</h4>
                            <p className="text-3xl font-bold text-beacon-primary">
                              {details.usage.clientCount}
                            </p>
                            <p className="text-sm text-gray-500">
                              clients in this dataset's coverage area
                            </p>
                          </div>

                          {details.usage.clients.length > 0 && (
                            <div className={getCardClasses('default', 'md')}>
                              <h4 className="font-medium text-beacon-navy mb-3">Clients Using This Dataset</h4>
                              <ul className="space-y-2">
                                {details.usage.clients.map((client) => (
                                  <li
                                    key={client.id}
                                    className="p-2 rounded-lg hover:bg-gray-50 text-gray-900"
                                  >
                                    {client.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {details.usage.clients.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No clients currently using this dataset</p>
                            </div>
                          )}
                        </>
                      ) : null}
                    </Tab.Panel>

                    {/* Settings Panel */}
                    <Tab.Panel className="space-y-6">
                      <div className={getCardClasses('default', 'md')}>
                        <h4 className="font-medium text-beacon-navy mb-4">Dataset Actions</h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => onReprocess(dataset)}
                            className={`${getButtonClasses('outline', 'md')} w-full`}
                          >
                            Re-process Dataset
                          </button>
                          {dataset.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                onArchive(dataset);
                                onClose();
                              }}
                              className={`${getButtonClasses('outline', 'md')} w-full text-amber-600 hover:bg-amber-50`}
                            >
                              Archive Dataset
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`${getCardClasses('default', 'md')} border-amber-200 bg-amber-50`}>
                        <h4 className="font-medium text-amber-800 mb-2">Danger Zone</h4>
                        <p className="text-sm text-amber-700 mb-4">
                          Archived datasets can be permanently deleted. This action cannot be undone.
                        </p>
                        {dataset.status === 'ARCHIVED' && (
                          <button className={getButtonClasses('danger', 'md')}>
                            Permanently Delete
                          </button>
                        )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>

                {/* Footer */}
                <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                  <button onClick={onClose} className={getButtonClasses('outline', 'md')}>
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
