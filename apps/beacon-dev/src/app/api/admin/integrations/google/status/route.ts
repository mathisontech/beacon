import { NextRequest, NextResponse } from 'next/server';
import { isConfigured } from '@/lib/google/oauth';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('google_tokens');
  const configured = isConfigured();

  if (!cookie) {
    return NextResponse.json({ connected: false, configured });
  }

  try {
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
    const expired = Date.now() > data.expires_at;
    return NextResponse.json({
      connected: !expired,
      configured,
      email: data.email,
      name: data.name,
      picture: data.picture,
      expiresAt: data.expires_at,
    });
  } catch {
    return NextResponse.json({ connected: false, configured });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ disconnected: true });
  response.cookies.delete('google_tokens');
  return response;
}
