import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/google/oauth';
import { getUserInfo } from '@/lib/google/drive';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/admin/dashboard/integrations/google-drive?error=no_code', req.url));
  }

  try {
    const tokens = await exchangeCode(code);
    if (tokens.error) {
      return NextResponse.redirect(
        new URL(`/admin/dashboard/integrations/google-drive?error=${tokens.error}`, req.url)
      );
    }

    const user = await getUserInfo(tokens.access_token);

    // Store tokens in httpOnly cookie (encrypted in production)
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    const response = NextResponse.redirect(
      new URL('/admin/dashboard/integrations/google-drive?connected=true', req.url)
    );
    response.cookies.set('google_tokens', Buffer.from(tokenData).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL('/admin/dashboard/integrations/google-drive?error=exchange_failed', req.url)
    );
  }
}
