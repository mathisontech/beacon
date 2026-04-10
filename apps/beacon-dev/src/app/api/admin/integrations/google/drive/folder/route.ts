import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google/getToken';
import { createFolder } from '@/lib/google/drive';

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  }

  try {
    const { name, parentId } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    const result = await createFolder(token, name, parentId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
