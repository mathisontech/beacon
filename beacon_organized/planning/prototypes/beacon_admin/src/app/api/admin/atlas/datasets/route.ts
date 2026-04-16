import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET: Fetch all datasets with sorting
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const datasets = await prisma.mapDataset.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    // Convert BigInt to string for JSON serialization
    const serializedDatasets = datasets.map((dataset) => ({
      ...dataset,
      fileSize: dataset.fileSize?.toString() ?? null,
    }));

    return NextResponse.json({ datasets: serializedDatasets });
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

// POST: Create new dataset with file upload
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const source = formData.get('source') as string;
    const version = formData.get('version') as string;
    const minLat = parseFloat(formData.get('minLat') as string);
    const minLng = parseFloat(formData.get('minLng') as string);
    const maxLat = parseFloat(formData.get('maxLat') as string);
    const maxLng = parseFloat(formData.get('maxLng') as string);
    const file = formData.get('file') as File | null;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Generate dataset ID
    const prefix = type.substring(0, 3).toUpperCase();
    const existingCount = await prisma.mapDataset.count({
      where: { type },
    });
    const datasetId = `${prefix}-${String(existingCount + 1).padStart(3, '0')}`;

    // Handle file upload
    let fileSize: bigint | null = null;
    let s3Key: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileSize = BigInt(buffer.length);

      // Create tmp directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Save file to tmp
      const fileName = `${datasetId}-${file.name}`;
      s3Key = `datasets/${type.toLowerCase()}/${fileName}`;
      await writeFile(path.join(uploadDir, fileName), buffer);
    }

    // Create dataset record
    const dataset = await prisma.mapDataset.create({
      data: {
        datasetId,
        name,
        type,
        source: source || null,
        version: version || null,
        uploadedBy: session.user.id,
        boundingBox: {
          north: maxLat,
          south: minLat,
          east: maxLng,
          west: minLng,
        },
        status: file ? 'PROCESSING' : 'UPLOADING',
        s3Bucket: 'beacon-geodata',
        s3Key,
        fileSize,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        employeeId: session.user.id,
        action: 'created_dataset',
        target: 'MapDataset',
        targetId: dataset.id,
        details: { datasetId, name, type },
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
    console.error('Failed to create dataset:', error);
    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}
