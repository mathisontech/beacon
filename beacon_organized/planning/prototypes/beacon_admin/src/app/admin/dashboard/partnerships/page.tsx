'use client';

import { useState } from 'react';
import { Handshake, Plus, ExternalLink, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Mock partnerships data
const partnerships = [
  {
    id: 'noaa',
    name: 'NOAA',
    fullName: 'National Oceanic and Atmospheric Administration',
    type: 'data-provider',
    status: 'active',
    since: 'Jan 2023',
    contact: 'Dr. Sarah Mitchell',
    email: 'mitchell@noaa.gov',
    description: 'Weather data, storm tracking, and climate information',
    integration: 'API',
    dataTypes: ['Weather Alerts', 'Storm Tracking', 'Marine Forecasts', 'Climate Data'],
    logo: '🌊',
  },
  {
    id: 'usgs',
    name: 'USGS',
    fullName: 'United States Geological Survey',
    type: 'data-provider',
    status: 'active',
    since: 'Mar 2023',
    contact: 'John Reynolds',
    email: 'reynolds@usgs.gov',
    description: 'Seismic data, topography, and geological information',
    integration: 'API',
    dataTypes: ['Earthquake Data', 'DEM/Elevation', 'Flood Gauges', 'Land Cover'],
    logo: '🏔️',
  },
  {
    id: 'nifc',
    name: 'NIFC',
    fullName: 'National Interagency Fire Center',
    type: 'data-provider',
    status: 'active',
    since: 'Jun 2023',
    contact: 'Mark Thompson',
    email: 'mthompson@nifc.gov',
    description: 'Wildfire data, fire perimeters, and incident information',
    integration: 'API',
    dataTypes: ['Active Fire Perimeters', 'Fire Weather', 'Incident Reports'],
    logo: '🔥',
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    fullName: 'AWS Public Sector',
    type: 'infrastructure',
    status: 'active',
    since: 'Jan 2023',
    contact: 'Lisa Wang',
    email: 'lwang@amazon.com',
    description: 'Cloud infrastructure, GovCloud hosting, and disaster response credits',
    integration: 'Infrastructure',
    dataTypes: ['Cloud Hosting', 'Data Storage', 'CDN', 'Compute'],
    logo: '☁️',
  },
  {
    id: 'esri',
    name: 'Esri',
    fullName: 'Environmental Systems Research Institute',
    type: 'technology',
    status: 'active',
    since: 'Feb 2023',
    contact: 'David Chen',
    email: 'dchen@esri.com',
    description: 'GIS technology, mapping tools, and spatial analysis',
    integration: 'SDK',
    dataTypes: ['Basemaps', 'Geocoding', 'Spatial Analysis', 'ArcGIS Integration'],
    logo: '🗺️',
  },
  {
    id: 'redcross',
    name: 'American Red Cross',
    fullName: 'American Red Cross',
    type: 'nonprofit',
    status: 'active',
    since: 'Apr 2023',
    contact: 'Jennifer Adams',
    email: 'jadams@redcross.org',
    description: 'Shelter data, volunteer coordination, and disaster relief',
    integration: 'Data Share',
    dataTypes: ['Shelter Locations', 'Capacity Data', 'Volunteer Networks'],
    logo: '🏥',
  },
  {
    id: 'verizon',
    name: 'Verizon',
    fullName: 'Verizon Frontline',
    type: 'infrastructure',
    status: 'pending',
    since: 'Pending',
    contact: 'Robert Kim',
    email: 'rkim@verizon.com',
    description: 'FirstNet integration, priority network access for first responders',
    integration: 'Network',
    dataTypes: ['FirstNet Access', 'Priority Routing', 'Mobile Command'],
    logo: '📡',
  },
  {
    id: 'starlink',
    name: 'Starlink',
    fullName: 'SpaceX Starlink',
    type: 'infrastructure',
    status: 'negotiating',
    since: 'In Progress',
    contact: 'TBD',
    email: 'enterprise@starlink.com',
    description: 'Satellite internet for disaster areas without connectivity',
    integration: 'Network',
    dataTypes: ['Satellite Internet', 'Emergency Connectivity'],
    logo: '🛰️',
  },
];

const partnershipTypes: Record<string, { label: string; color: string }> = {
  'data-provider': { label: 'Data Provider', color: '#3b82f6' },
  'infrastructure': { label: 'Infrastructure', color: '#8b5cf6' },
  'technology': { label: 'Technology', color: '#06b6d4' },
  'nonprofit': { label: 'Nonprofit', color: '#22c55e' },
};

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  active: { label: 'Active', bg: '#dcfce7', text: '#16a34a', icon: <CheckCircle size={14} /> },
  pending: { label: 'Pending', bg: '#fef3c7', text: '#d97706', icon: <Clock size={14} /> },
  negotiating: { label: 'Negotiating', bg: '#dbeafe', text: '#2563eb', icon: <AlertCircle size={14} /> },
};

export default function PartnershipsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  const filteredPartnerships = selectedType
    ? partnerships.filter(p => p.type === selectedType)
    : partnerships;

  const activeCount = partnerships.filter(p => p.status === 'active').length;

  return (
    <div className="partnerships-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <Handshake className="page-icon" size={28} />
            <div>
              <h1>Partnerships</h1>
              <p>Manage data providers, technology partners, and strategic relationships.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-primary">
              <Plus size={16} />
              Add Partnership
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{partnerships.length}</div>
          <div className="stat-label">Total Partners</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-green">{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{partnerships.filter(p => p.type === 'data-provider').length}</div>
          <div className="stat-label">Data Providers</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{partnerships.filter(p => p.status === 'pending' || p.status === 'negotiating').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-row">
        <button
          className={`filter-chip ${selectedType === null ? 'active' : ''}`}
          onClick={() => setSelectedType(null)}
        >
          All
        </button>
        {Object.entries(partnershipTypes).map(([type, config]) => (
          <button
            key={type}
            className={`filter-chip ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type === selectedType ? null : type)}
            style={{ '--chip-color': config.color } as React.CSSProperties}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Partners Grid */}
      <div className="partners-grid">
        {filteredPartnerships.map((partner) => (
          <div
            key={partner.id}
            className={`partner-card ${selectedPartner === partner.id ? 'selected' : ''}`}
            onClick={() => setSelectedPartner(partner.id === selectedPartner ? null : partner.id)}
          >
            <div className="partner-header">
              <div className="partner-logo">{partner.logo}</div>
              <div className="partner-badges">
                <span
                  className="type-badge"
                  style={{ backgroundColor: partnershipTypes[partner.type].color }}
                >
                  {partnershipTypes[partner.type].label}
                </span>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: statusConfig[partner.status].bg,
                    color: statusConfig[partner.status].text,
                  }}
                >
                  {statusConfig[partner.status].icon}
                  {statusConfig[partner.status].label}
                </span>
              </div>
            </div>

            <h3>{partner.name}</h3>
            <p className="partner-fullname">{partner.fullName}</p>
            <p className="partner-description">{partner.description}</p>

            <div className="partner-meta">
              <div className="meta-item">
                <Calendar size={14} />
                <span>Since {partner.since}</span>
              </div>
              <div className="meta-item">
                <span className="integration-badge">{partner.integration}</span>
              </div>
            </div>

            <div className="data-types">
              {partner.dataTypes.slice(0, 3).map((dt, i) => (
                <span key={i} className="data-chip">{dt}</span>
              ))}
              {partner.dataTypes.length > 3 && (
                <span className="data-chip more">+{partner.dataTypes.length - 3}</span>
              )}
            </div>

            <div className="partner-contact">
              <div className="contact-name">{partner.contact}</div>
              <div className="contact-actions">
                <a href={`mailto:${partner.email}`} className="contact-btn" onClick={(e) => e.stopPropagation()}>
                  <Mail size={14} />
                </a>
                <button className="contact-btn" onClick={(e) => e.stopPropagation()}>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .partnerships-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #065f46 0%, #059669 100%);
          padding: 32px;
          margin: -24px -24px 24px -24px;
          border-radius: 0 0 16px 16px;
        }

        .page-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .page-title-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .page-icon {
          color: #6ee7b7;
          margin-top: 4px;
        }

        .page-header h1 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-size: 14px;
        }

        .page-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #0097b2;
          color: white;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-value.text-green { color: #22c55e; }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          margin-top: 4px;
        }

        .filter-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #e5e7eb;
          background: white;
          color: #4b5563;
          transition: all 0.2s;
        }

        .filter-chip:hover {
          border-color: #0097b2;
        }

        .filter-chip.active {
          background: #0097b2;
          color: white;
          border-color: #0097b2;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .partner-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
        }

        .partner-card:hover {
          border-color: #059669;
        }

        .partner-card.selected {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .partner-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .partner-logo {
          font-size: 40px;
        }

        .partner-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .type-badge {
          font-size: 10px;
          font-weight: 600;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .partner-card h3 {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .partner-fullname {
          font-size: 12px;
          color: #9ca3af;
          margin: 0 0 12px 0;
        }

        .partner-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .partner-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .integration-badge {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .data-types {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .data-chip {
          font-size: 11px;
          background: #ecfdf5;
          color: #059669;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .data-chip.more {
          background: #f3f4f6;
          color: #6b7280;
        }

        .partner-contact {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .contact-name {
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
        }

        .contact-actions {
          display: flex;
          gap: 8px;
        }

        .contact-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          text-decoration: none;
        }

        .contact-btn:hover {
          background: #f9fafb;
          color: #0097b2;
        }
      `}</style>
    </div>
  );
}
