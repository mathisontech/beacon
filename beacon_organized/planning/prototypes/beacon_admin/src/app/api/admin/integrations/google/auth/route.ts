import { NextResponse } from 'next/server';
import { getAuthUrl, isConfigured } from '@/lib/google/oauth';

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' },
      { status: 503 }
    );
  }
  const state = crypto.randomUUID();
  const url = getAuthUrl(state);
  return NextResponse.json({ url, state });
}
