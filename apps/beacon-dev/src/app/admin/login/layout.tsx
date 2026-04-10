import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beacon Admin - Login',
  description: 'Sign in to Beacon Admin Dashboard',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
