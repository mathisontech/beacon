import { cookies } from 'next/headers';
import { refreshToken } from './oauth';

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('google_tokens');
  if (!cookie) return null;

  try {
    const data = JSON.parse(Buffer.from(cookie.value, 'base64').toString());

    // Token still valid
    if (Date.now() < data.expires_at - 60000) {
      return data.access_token;
    }

    // Refresh expired token
    if (data.refresh_token) {
      const refreshed = await refreshToken(data.refresh_token);
      if (refreshed.access_token) {
        data.access_token = refreshed.access_token;
        data.expires_at = Date.now() + refreshed.expires_in * 1000;
        // Note: cookie update happens in the route handler
        return refreshed.access_token;
      }
    }

    return null;
  } catch {
    return null;
  }
}
