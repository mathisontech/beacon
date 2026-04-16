import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Fetch single dataset details
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const dataset = await prisma.mapDataset.findUnique({
      where: { id },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Get uploader info
    let uploader = null;
    if (dataset.uploadedBy) {
      uploader = await prisma.employee.findUnique({
        where: { id: dataset.uploadedBy },
        select: { name: true, email: true },
      });
    }

    // Get usage statistics (clients using this dataset)
    const clientUsage = await prisma.client.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        boundingBox: true,
      },
    });

    // Filter clients whose bounding box overlaps with dataset
    const datasetBbox = dataset.boundingBox as {
      north: number;
      south: number;
      east: number;
      west: number;
    } | null;

    const matchingClients = datasetBbox
      ? clientUsage.filter((client: { id: string; name: string; boundingBox: unknown }) => {
          const clientBbox = client.boundingBox as {
            north: number;
            south: number;
            east: number;
            west: number;
          } | null;
          if (!clientBbox) return false;
          // Check for bounding box overlap
          return !(
            clientBbox.west > datasetBbox.east ||
            clientBbox.east < datasetBbox.west ||
            clientBbox.south > datasetBbox.north ||
            clientBbox.north < datasetBbox.south
          );
        })
      : [];

    return NextResponse.json({
      dataset: {
        ...dataset,
        fileSize: dataset.fileSize?.toString() ?? null,
      },
      uploader,
      usage: {
        clientCount: matchingClients.length,
        clients: matchingClients.map((c) => ({ id: c.id, name: c.name })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

// PUT: Update dataset
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.mapDataset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.source) updateData.source = body.source;
    if (body.version) updateData.version = body.version;
    if (body.status) updateData.status = body.status;
    if (body.boundingBox) updateData.boundingBox = body.boundingBox;
    if (body.metadata) updateData.metadata = body.metadata;

    const dataset = await prisma.mapDataset.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.user.id,
        action: 'updated_dataset',
        target: 'MapDataset',
        targetId: dataset.id,
        details: { datasetId: dataset.datasetId, changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json({
      success: true,
      dataset: {
        ...dataset,
        fileSize: dataset.fileSize?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to update dataset:', error);
    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    );
  }
}

// DELETE: Soft delete (archive) dataset
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.mapDataset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Soft delete - set status to ARCHIVED
    const dataset = await prisma.mapDataset.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.user.id,
        action: 'archived_dataset',
        target: 'MapDataset',
        targetId: dataset.id,
        details: { datasetId: dataset.datasetId },
      },
    });

    return NextResponse.json({
      success: true,
      dataset: {
        ...dataset,
        fileSize: dataset.fileSize?.toString() ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to archive dataset:', error);
    return NextResponse.json(
      { error: 'Failed to archive dataset' },
      { status: 500 }
    );
  }
}
