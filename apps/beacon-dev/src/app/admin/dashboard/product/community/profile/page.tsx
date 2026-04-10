'use client';

export default function ProfileAndAccount() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh' }}>
      <h1
        style={{
          color: '#1f3348',
          fontSize: '2rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          margin: '0 0 1.5rem 0',
        }}
      >
        PROFILE & ACCOUNT
      </h1>
      <p style={{ color: '#666', lineHeight: 1.6, maxWidth: '600px' }}>
        Manage user profiles and account information.
      </p>
    </div>
  );
}
