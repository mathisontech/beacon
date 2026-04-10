'use client';

import Link from 'next/link';

export default function CommunityOverview() {
  const sections = [
    { label: 'Profile', href: '/admin/dashboard/product/community/profile' },
    { label: 'Contacts', href: '/admin/dashboard/product/community/contacts' },
    { label: 'Groups', href: '/admin/dashboard/product/community/groups' },
    { label: 'Chat', href: '/admin/dashboard/product/community/chat' },
  ];

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
        COMMUNITY OVERVIEW
      </h1>
      <p style={{ color: '#666', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
        Manage community features and user interactions.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          maxWidth: '800px',
        }}
      >
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{
              padding: '1.5rem',
              border: '1px solid #d0d0d0',
              borderRadius: '4px',
              textDecoration: 'none',
              color: '#1f3348',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.9rem',
              transition: 'border-color 0.2s',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1f3348';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d0d0d0';
            }}
          >
            {section.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
