import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google/getToken';
import { uploadFile } from '@/lib/google/drive';

export async function POST(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Not connected' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(token, buffer, file.name, file.type, folderId || undefined);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
