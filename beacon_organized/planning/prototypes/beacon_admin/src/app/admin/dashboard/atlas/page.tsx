import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import AtlasClient from './AtlasClient';
import type { BoundingBox } from '@/components/atlas/DatasetCard';

// Force dynamic rendering (requires database connection)
export const dynamic = 'force-dynamic';

// Fetch datasets server-side
async function getDatasets() {
  const datasets = await prisma.mapDataset.findMany({
    orderBy: { uploadedAt: 'desc' },
  });

  // Convert BigInt to string and cast boundingBox for serialization
  return datasets.map((dataset) => ({
    id: dataset.id,
    datasetId: dataset.datasetId,
    name: dataset.name,
    type: dataset.type,
    source: dataset.source,
    version: dataset.version,
    uploadedAt: dataset.uploadedAt.toISOString(),
    status: dataset.status,
    boundingBox: dataset.boundingBox as BoundingBox | null,
    fileSize: dataset.fileSize?.toString() ?? null,
  }));
}

export default async function AtlasPage() {
  const datasets = await getDatasets();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beacon-primary" />
        </div>
      }
    >
      <AtlasClient initialDatasets={datasets} />
    </Suspense>
  );
}
