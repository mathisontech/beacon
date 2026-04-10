'use client';

import Link from 'next/link';
import { integrations } from '@/data/integrations';

export default function IntegrationsPage() {
  return (
    <div className="integrations-overview">
      <h1 className="page-title">Integrations</h1>
      <div className="integrations-grid">
        {integrations.map((integ) => {
          const Icon = integ.icon;
          const disabled = integ.status === 'coming-soon';

          const content = (
            <>
              <Icon size={28} className="integration-card-icon" />
              <div className="integration-card-body">
                <span className="integration-card-label">{integ.label}</span>
                <span className="integration-card-desc">{integ.description}</span>
              </div>
              {disabled && <span className="integration-card-badge">Coming Soon</span>}
            </>
          );

          if (disabled) {
            return (
              <div key={integ.key} className="integration-card disabled">
                {content}
              </div>
            );
          }

          return (
            <Link key={integ.key} href={integ.href} className="integration-card">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
