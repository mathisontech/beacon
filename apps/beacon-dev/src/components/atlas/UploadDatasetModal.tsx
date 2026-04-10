'use client';

import { Fragment, useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { modals, getButtonClasses, getInputClasses, inputs } from '@/lib/design';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  type: string;
  source: string;
  version: string;
  minLat: string;
  minLng: string;
  maxLat: string;
  maxLng: string;
}

const datasetTypes = [
  'DEM',
  'LANDFIRE',
  'Roads',
  'Buildings',
  'Vegetation',
  'Hydrants',
  'Boundaries',
  'Waterways',
  'Terrain',
  'Other',
];

const acceptedFileTypes = '.tif,.tiff,.geojson,.shp,.zip';

export default function UploadDatasetModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadDatasetModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('source', data.source);
      formData.append('version', data.version);
      formData.append('minLat', data.minLat);
      formData.append('minLng', data.minLng);
      formData.append('maxLat', data.maxLat);
      formData.append('maxLng', data.maxLng);

      if (file) {
        formData.append('file', file);
      }

      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/admin/atlas/datasets', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Reset form and close
      reset();
      setFile(null);
      setUploadProgress(0);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      reset();
      setFile(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-modal" onClose={handleClose}>
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
              <Dialog.Panel className={`${modals.container.base} ${modals.container.lg}`}>
                {/* Header */}
                <div className={modals.header}>
                  <Dialog.Title as="h3" className={modals.title}>
                    Upload New Dataset
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className={modals.closeBtn}
                    disabled={uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Dataset Name */}
                  <div>
                    <label className={`${inputs.label.base} ${inputs.label.default}`}>
                      Dataset Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className={getInputClasses('standard', 'md', !!errors.name)}
                      placeholder="e.g., DEM Elevation - Buffalo"
                    />
                    {errors.name && (
                      <p className={inputs.helpText.error}>{errors.name.message}</p>
                    )}
                  </div>

                  {/* Type and Source */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`${inputs.label.base} ${inputs.label.default}`}>
                        Type *
                      </label>
                      <select
                        {...register('type', { required: 'Type is required' })}
                        className={getInputClasses('standard', 'md', !!errors.type)}
                      >
                        <option value="">Select type...</option>
                        {datasetTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className={inputs.helpText.error}>{errors.type.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={`${inputs.label.base} ${inputs.label.default}`}>
                        Source
                      </label>
                      <input
                        type="text"
                        {...register('source')}
                        className={getInputClasses('standard', 'md')}
                        placeholder="e.g., USGS 3DEP"
                      />
                    </div>
                  </div>

                  {/* Version */}
                  <div>
                    <label className={`${inputs.label.base} ${inputs.label.default}`}>
                      Version
                    </label>
                    <input
                      type="text"
                      {...register('version')}
                      className={getInputClasses('standard', 'md')}
                      placeholder="e.g., 2024.1 or v3.2"
                    />
                  </div>

                  {/* Bounding Box */}
                  <div>
                    <label className={`${inputs.label.base} ${inputs.label.default}`}>
                      Bounding Box
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="any"
                          {...register('minLat')}
                          className={getInputClasses('standard', 'sm')}
                          placeholder="Min Latitude"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          {...register('minLng')}
                          className={getInputClasses('standard', 'sm')}
                          placeholder="Min Longitude"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          {...register('maxLat')}
                          className={getInputClasses('standard', 'sm')}
                          placeholder="Max Latitude"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          {...register('maxLng')}
                          className={getInputClasses('standard', 'sm')}
                          placeholder="Max Longitude"
                        />
                      </div>
                    </div>
                    <p className={inputs.helpText.default}>
                      Define the geographic coverage area
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className={`${inputs.label.base} ${inputs.label.default}`}>
                      File Upload
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`
                        relative border-2 border-dashed rounded-lg p-6 text-center transition-all
                        ${dragActive ? 'border-beacon-primary bg-beacon-primaryLight/10' : 'border-gray-300 hover:border-gray-400'}
                        ${file ? 'bg-green-50 border-green-300' : ''}
                      `}
                    >
                      <input
                        type="file"
                        accept={acceptedFileTypes}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {file ? (
                        <div className="text-center">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600">
                            Drag and drop your file here, or{' '}
                            <span className="text-beacon-primary font-medium">browse</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports: .tif, .tiff, .geojson, .shp, .zip
                          </p>
                        </>
                      )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-beacon-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={getButtonClasses('outline', 'md')}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={getButtonClasses('primary', 'md')}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Dataset'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
