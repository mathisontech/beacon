import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/google/getToken';
import { listFiles, searchFiles } from '@/lib/google/drive';

export async function GET(req: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Not connected to Google Drive' }, { status: 401 });
  }

  const folderId = req.nextUrl.searchParams.get('folderId') || undefined;
  const search = req.nextUrl.searchParams.get('search') || undefined;
  const pageToken = req.nextUrl.searchParams.get('pageToken') || undefined;

  try {
    const result = search
      ? await searchFiles(token, search)
      : await listFiles(token, folderId, pageToken);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Drive API error' }, { status: 500 });
  }
}
