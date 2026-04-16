'use client';

import { useState } from 'react';
import { UserCheck, Settings, Plus, Check, X, Minus, Edit2 } from 'lucide-react';

// Account types (columns)
const accountTypes = [
  { id: 'fire-chief', name: 'Fire Chief', category: 'leadership', color: '#ef4444' },
  { id: 'police-chief', name: 'Police Chief', category: 'leadership', color: '#3b82f6' },
  { id: 'group-admin', name: 'Standard Group Admin', category: 'leadership', color: '#8b5cf6' },
  { id: 'fire-member', name: 'Fire Member', category: 'responder', color: '#f97316' },
  { id: 'dispatch', name: 'Dispatch', category: 'responder', color: '#06b6d4' },
  { id: 'police-member', name: 'Police Member', category: 'responder', color: '#6366f1' },
  { id: 'ems-paid', name: 'Paid EMS User', category: 'ems', color: '#22c55e' },
  { id: 'standard', name: 'Standard User', category: 'public', color: '#9ca3af' },
  { id: 'premium', name: 'Premium User', category: 'public', color: '#f59e0b' },
  { id: 'plower', name: 'Plower', category: 'contractor', color: '#64748b' },
];

// Permission categories and items (rows)
const permissionCategories = [
  {
    category: 'Dashboard & Overview',
    permissions: [
      { id: 'view-dashboard', name: 'View Dashboard', description: 'Access to main dashboard overview' },
      { id: 'view-analytics', name: 'View Analytics', description: 'Access to usage and performance analytics' },
      { id: 'system-status', name: 'System Status', description: 'View system health and status' },
    ],
  },
  {
    category: 'Incidents & Emergencies',
    permissions: [
      { id: 'view-incidents', name: 'View Incidents', description: 'See active and historical incidents' },
      { id: 'create-incident', name: 'Create Incidents', description: 'Report new incidents' },
      { id: 'manage-incidents', name: 'Manage Incidents', description: 'Update, assign, and close incidents' },
      { id: 'priority-override', name: 'Priority Override', description: 'Change incident priority levels' },
      { id: 'incident-history', name: 'Full Incident History', description: 'Access complete incident archives' },
    ],
  },
  {
    category: 'Map & Navigation',
    permissions: [
      { id: 'view-map', name: 'View Map', description: 'Access to map interface' },
      { id: 'view-hazards', name: 'View Hazard Zones', description: 'See active hazard overlays' },
      { id: 'view-routes', name: 'View Evacuation Routes', description: 'Access evacuation route information' },
      { id: 'edit-map-layers', name: 'Edit Map Layers', description: 'Modify map layer visibility and data' },
      { id: 'create-geofences', name: 'Create Geofences', description: 'Define geographic boundaries' },
    ],
  },
  {
    category: 'Resources & Units',
    permissions: [
      { id: 'view-units', name: 'View Units', description: 'See unit locations and status' },
      { id: 'dispatch-units', name: 'Dispatch Units', description: 'Assign units to incidents' },
      { id: 'manage-resources', name: 'Manage Resources', description: 'Add, edit, remove resources' },
      { id: 'view-all-units', name: 'View All Agency Units', description: 'Cross-agency unit visibility' },
      { id: 'resource-requests', name: 'Request Resources', description: 'Request additional resources' },
    ],
  },
  {
    category: 'Communication',
    permissions: [
      { id: 'send-alerts', name: 'Send Alerts', description: 'Broadcast emergency alerts' },
      { id: 'receive-alerts', name: 'Receive Alerts', description: 'Get emergency notifications' },
      { id: 'mass-notification', name: 'Mass Notification', description: 'Send to all users in area' },
      { id: 'inter-agency-comms', name: 'Inter-Agency Comms', description: 'Communicate across agencies' },
      { id: 'public-broadcast', name: 'Public Broadcast', description: 'Send alerts to public users' },
    ],
  },
  {
    category: 'Team Management',
    permissions: [
      { id: 'view-team', name: 'View Team Members', description: 'See team roster and status' },
      { id: 'manage-team', name: 'Manage Team', description: 'Add, remove, edit team members' },
      { id: 'assign-roles', name: 'Assign Roles', description: 'Change team member permissions' },
      { id: 'view-schedule', name: 'View Schedule', description: 'Access team schedules' },
      { id: 'edit-schedule', name: 'Edit Schedule', description: 'Modify team schedules' },
    ],
  },
  {
    category: 'Reporting & Data',
    permissions: [
      { id: 'view-reports', name: 'View Reports', description: 'Access generated reports' },
      { id: 'create-reports', name: 'Create Reports', description: 'Generate new reports' },
      { id: 'export-data', name: 'Export Data', description: 'Download data exports' },
      { id: 'audit-logs', name: 'View Audit Logs', description: 'Access activity logs' },
    ],
  },
  {
    category: 'Public Features',
    permissions: [
      { id: 'status-updates', name: 'Post Status Updates', description: 'Share personal status' },
      { id: 'family-tracking', name: 'Family Tracking', description: 'Track family member locations' },
      { id: 'shelter-info', name: 'Shelter Information', description: 'View shelter locations and capacity' },
      { id: 'road-conditions', name: 'Road Conditions', description: 'View road and weather conditions' },
      { id: 'emergency-contacts', name: 'Emergency Contacts', description: 'Store emergency contact info' },
    ],
  },
  {
    category: 'Contractor Features',
    permissions: [
      { id: 'view-assignments', name: 'View Assignments', description: 'See assigned work areas' },
      { id: 'update-status', name: 'Update Work Status', description: 'Mark areas as completed' },
      { id: 'priority-routes', name: 'Priority Route Access', description: 'Access priority clearing routes' },
      { id: 'contractor-dispatch', name: 'Contractor Dispatch', description: 'Receive dispatch assignments' },
    ],
  },
  {
    category: 'Administration',
    permissions: [
      { id: 'org-settings', name: 'Organization Settings', description: 'Modify organization configuration' },
      { id: 'billing-access', name: 'Billing Access', description: 'View and manage billing' },
      { id: 'api-keys', name: 'API Key Management', description: 'Create and manage API keys' },
      { id: 'integrations', name: 'Manage Integrations', description: 'Configure third-party integrations' },
    ],
  },
];

// Permission matrix - which account types have which permissions
// 'full' = full access, 'limited' = limited access, 'none' = no access
type PermissionLevel = 'full' | 'limited' | 'none';

const permissionMatrix: Record<string, Record<string, PermissionLevel>> = {
  // Dashboard & Overview
  'view-dashboard': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'limited', 'standard': 'limited', 'premium': 'limited', 'plower': 'limited' },
  'view-analytics': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'system-status': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Incidents & Emergencies
  'view-incidents': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'limited', 'standard': 'limited', 'premium': 'limited', 'plower': 'limited' },
  'create-incident': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'limited', 'premium': 'full', 'plower': 'limited' },
  'manage-incidents': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'priority-override': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'incident-history': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Map & Navigation
  'view-map': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },
  'view-hazards': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'limited', 'premium': 'full', 'plower': 'full' },
  'view-routes': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'limited', 'premium': 'full', 'plower': 'full' },
  'edit-map-layers': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'create-geofences': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Resources & Units
  'view-units': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'limited', 'standard': 'none', 'premium': 'limited', 'plower': 'none' },
  'dispatch-units': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'manage-resources': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'view-all-units': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'resource-requests': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'limited' },

  // Communication
  'send-alerts': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'receive-alerts': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },
  'mass-notification': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'inter-agency-comms': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'public-broadcast': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Team Management
  'view-team': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'manage-team': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'assign-roles': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'view-schedule': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'limited' },
  'edit-schedule': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Reporting & Data
  'view-reports': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'limited', 'plower': 'none' },
  'create-reports': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'limited', 'dispatch': 'full', 'police-member': 'limited', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'export-data': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'limited', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'audit-logs': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },

  // Public Features
  'status-updates': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },
  'family-tracking': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'limited', 'premium': 'full', 'plower': 'full' },
  'shelter-info': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },
  'road-conditions': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },
  'emergency-contacts': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'full', 'standard': 'full', 'premium': 'full', 'plower': 'full' },

  // Contractor Features
  'view-assignments': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'full' },
  'update-status': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'full' },
  'priority-routes': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'full', 'dispatch': 'full', 'police-member': 'full', 'ems-paid': 'limited', 'standard': 'none', 'premium': 'limited', 'plower': 'full' },
  'contractor-dispatch': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'full', 'fire-member': 'none', 'dispatch': 'full', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'full' },

  // Administration
  'org-settings': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'billing-access': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'limited', 'standard': 'none', 'premium': 'limited', 'plower': 'none' },
  'api-keys': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
  'integrations': { 'fire-chief': 'full', 'police-chief': 'full', 'group-admin': 'limited', 'fire-member': 'none', 'dispatch': 'none', 'police-member': 'none', 'ems-paid': 'none', 'standard': 'none', 'premium': 'none', 'plower': 'none' },
};

export default function AccountTypesPage() {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const renderPermissionCell = (permissionId: string, accountId: string) => {
    const level = permissionMatrix[permissionId]?.[accountId] || 'none';
    const cellId = `${permissionId}-${accountId}`;
    const isHovered = hoveredCell === cellId;

    return (
      <td
        key={accountId}
        className={`permission-cell ${level} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredCell(cellId)}
        onMouseLeave={() => setHoveredCell(null)}
      >
        {level === 'full' && <Check size={16} className="icon-full" />}
        {level === 'limited' && <Minus size={16} className="icon-limited" />}
        {level === 'none' && <X size={16} className="icon-none" />}
      </td>
    );
  };

  return (
    <div className="account-types-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-row">
            <UserCheck className="page-icon" size={28} />
            <div>
              <h1>Account Types & Permissions</h1>
              <p>Define and manage access levels for different user roles across the platform.</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn-secondary">
              <Plus size={16} />
              Add Account Type
            </button>
            <button className="btn-primary">
              <Settings size={16} />
              Permission Settings
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-icon full"><Check size={14} /></span>
          <span>Full Access</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon limited"><Minus size={14} /></span>
          <span>Limited Access</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon none"><X size={14} /></span>
          <span>No Access</span>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="table-container">
        <table className="permissions-table">
          <thead>
            <tr>
              <th className="feature-header">Feature / Permission</th>
              {accountTypes.map((type) => (
                <th key={type.id} className="account-header">
                  <div className="account-header-content">
                    <span
                      className="account-badge"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="account-name">{type.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionCategories.map((category) => (
              <>
                <tr key={category.category} className="category-row">
                  <td colSpan={accountTypes.length + 1} className="category-cell">
                    {category.category}
                  </td>
                </tr>
                {category.permissions.map((permission) => (
                  <tr key={permission.id} className="permission-row">
                    <td className="feature-cell">
                      <div className="feature-name">{permission.name}</div>
                      <div className="feature-description">{permission.description}</div>
                    </td>
                    {accountTypes.map((type) => renderPermissionCell(permission.id, type.id))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Account Type Summary Cards */}
      <div className="summary-section">
        <h2>Account Type Summary</h2>
        <div className="summary-grid">
          {accountTypes.map((type) => {
            const fullCount = Object.values(permissionMatrix).filter(p => p[type.id] === 'full').length;
            const limitedCount = Object.values(permissionMatrix).filter(p => p[type.id] === 'limited').length;
            const totalPermissions = Object.keys(permissionMatrix).length;

            return (
              <div key={type.id} className="summary-card">
                <div className="summary-header">
                  <span className="summary-badge" style={{ backgroundColor: type.color }} />
                  <span className="summary-name">{type.name}</span>
                </div>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-value text-green">{fullCount}</span>
                    <span className="stat-label">Full</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-value text-yellow">{limitedCount}</span>
                    <span className="stat-label">Limited</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-value text-gray">{totalPermissions - fullCount - limitedCount}</span>
                    <span className="stat-label">None</span>
                  </div>
                </div>
                <button className="edit-btn">
                  <Edit2 size={14} />
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .account-types-page {
          padding: 0;
        }

        .page-header {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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
          color: #c4b5fd;
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

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: #0097b2;
          color: white;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .legend {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
        }

        .legend-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legend-icon.full {
          background: #dcfce7;
          color: #16a34a;
        }

        .legend-icon.limited {
          background: #fef3c7;
          color: #d97706;
        }

        .legend-icon.none {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
          margin-bottom: 32px;
        }

        .permissions-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .permissions-table th,
        .permissions-table td {
          padding: 12px 16px;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }

        .feature-header {
          text-align: left !important;
          font-weight: 600;
          color: #1f2937;
          background: #f9fafb;
          position: sticky;
          left: 0;
          z-index: 10;
          min-width: 280px;
        }

        .account-header {
          background: #f9fafb;
          min-width: 100px;
          white-space: nowrap;
        }

        .account-header-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .account-badge {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .account-name {
          font-size: 11px;
          font-weight: 600;
          color: #1f2937;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          height: 80px;
        }

        .category-row {
          background: #f3f4f6;
        }

        .category-cell {
          text-align: left !important;
          font-weight: 700;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 16px !important;
        }

        .feature-cell {
          text-align: left !important;
          position: sticky;
          left: 0;
          background: white;
          z-index: 5;
        }

        .feature-name {
          font-weight: 500;
          color: #1f2937;
        }

        .feature-description {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .permission-cell {
          cursor: pointer;
          transition: all 0.15s;
        }

        .permission-cell:hover {
          background: #f3f4f6;
        }

        .permission-cell.full {
          color: #16a34a;
        }

        .permission-cell.limited {
          color: #d97706;
        }

        .permission-cell.none {
          color: #d1d5db;
        }

        .icon-full { color: #16a34a; }
        .icon-limited { color: #d97706; }
        .icon-none { color: #d1d5db; }

        .summary-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .summary-section h2 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .summary-card {
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .summary-badge {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .summary-name {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-stats {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
        }

        .stat-value.text-green { color: #16a34a; }
        .stat-value.text-yellow { color: #d97706; }
        .stat-value.text-gray { color: #9ca3af; }

        .stat-label {
          font-size: 10px;
          color: #9ca3af;
        }

        .edit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          color: #4b5563;
        }

        .edit-btn:hover {
          background: #f3f4f6;
          border-color: #0097b2;
          color: #0097b2;
        }
      `}</style>
    </div>
  );
}
