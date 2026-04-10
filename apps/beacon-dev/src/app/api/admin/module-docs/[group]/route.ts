import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GROUP_MAP: Record<string, string> = {
  'base-map': 'base-map',
  'condition-monitoring': 'condition-monitoring',
  'risk-monitoring': 'risk-monitoring',
  'event-triggers': 'event-triggers',
  'hazard-onset': 'hazard-onset',
  'event-management': 'event-management',
  'navigation': 'navigation',
  'operations': 'operations',
  'people': 'people',
  'comms': 'comms',
  'post-ops': 'post-ops',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  const { group } = await params;
  const folder = GROUP_MAP[group];
  if (!folder) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    'src/app/admin/dashboard/modules',
    folder,
    'MODULE_DOC.md'
  );

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new NextResponse('Document not found', { status: 404 });
  }
}
