import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Beacon Admin',
  description: 'Beacon emergency management admin dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
