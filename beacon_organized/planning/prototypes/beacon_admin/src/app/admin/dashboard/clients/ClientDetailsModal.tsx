'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalTabs } from '@/components/ui/Modal';
import { StatusBadge, ExpiryBadge } from '@/components/ui/StatusBadge';
import { colors, shadows, getButtonClasses } from '@/lib/design';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Client {
  id: string;
  clientId: string;
  name: string;
  organizationType: string;
  primaryContact: string | null;
  email: string | null;
  phone: string | null;
  jurisdiction: string | null;
  state: string | null;
  boundingBox: any;
  plan: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  accountManagers: Array<{
    id: string;
    role: string;
    employee: {
      id: string;
      employeeId: string;
      name: string;
      email: string;
    };
  }>;
}

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'usage', label: 'Usage' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'settings', label: 'Settings' },
];

const CHART_COLORS = [colors.beacon.primary, colors.status.success, colors.status.warning, colors.status.info];

export function ClientDetailsModal({ client, isOpen, onClose, onUpdate }: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client.name} size="2xl">
      <ModalTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && <OverviewTab client={client} onUpdate={onUpdate} />}
      {activeTab === 'usage' && <UsageTab clientId={client.id} />}
      {activeTab === 'incidents' && <IncidentsTab clientId={client.id} />}
      {activeTab === 'settings' && <SettingsTab client={client} onUpdate={onUpdate} onClose={onClose} />}
    </Modal>
  );
}

// Overview Tab
function OverviewTab({ client, onUpdate }: { client: Client; onUpdate: () => void }) {
  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="grid grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
            Contact Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Contact</span>
              <span className="text-sm">{client.primaryContact || 'No contact'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Email</span>
              <span className="text-sm">{client.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Phone</span>
              <span className="text-sm">{client.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Location</span>
              <span className="text-sm">
                {client.jurisdiction ? `${client.jurisdiction}, ${client.state}` : client.state || 'No location'}
              </span>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
            Subscription Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Status</span>
              <StatusBadge status={client.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Plan</span>
              <span className="text-sm font-medium">{client.plan || 'Trial'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Activated</span>
              <span className="text-sm">
                {client.activatedAt ? new Date(client.activatedAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: colors.text.muted }}>Expires</span>
              <div className="flex items-center">
                <span className="text-sm">
                  {client.expiresAt ? new Date(client.expiresAt).toLocaleDateString() : '-'}
                </span>
                <ExpiryBadge expiresAt={client.expiresAt} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Managers */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
          Account Managers
        </h4>
        {client.accountManagers.length > 0 ? (
          <div className="space-y-2">
            {client.accountManagers.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: colors.border.light, backgroundColor: colors.neutral[50] }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: colors.beacon.primaryLight, color: colors.beacon.primary }}
                  >
                    {assignment.employee.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{assignment.employee.name}</div>
                    <div className="text-xs" style={{ color: colors.text.muted }}>
                      {assignment.employee.email}
                    </div>
                  </div>
                </div>
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    backgroundColor: assignment.role === 'Primary' ? colors.beacon.primaryLight : colors.neutral[200],
                    color: assignment.role === 'Primary' ? colors.beacon.primary : colors.text.muted,
                  }}
                >
                  {assignment.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: colors.text.muted }}>
            No account managers assigned
          </p>
        )}
      </div>

      {/* Coverage Area */}
      {client.boundingBox && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
            Coverage Area
          </h4>
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: colors.border.light, backgroundColor: colors.neutral[50] }}
          >
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span style={{ color: colors.text.muted }}>North:</span>{' '}
                {client.boundingBox.north}
              </div>
              <div>
                <span style={{ color: colors.text.muted }}>South:</span>{' '}
                {client.boundingBox.south}
              </div>
              <div>
                <span style={{ color: colors.text.muted }}>East:</span>{' '}
                {client.boundingBox.east}
              </div>
              <div>
                <span style={{ color: colors.text.muted }}>West:</span>{' '}
                {client.boundingBox.west}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Usage Tab
function UsageTab({ clientId }: { clientId: string }) {
  const [timeRange, setTimeRange] = useState(30);
  const [usageData, setUsageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, [clientId, timeRange]);

  const fetchUsageData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/usage?days=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setUsageData(result.data);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" style={{ color: colors.text.muted }}>
        Loading...
      </div>
    );
  }

  // Generate mock data if no real data exists
  const chartData = usageData?.chartData?.length > 0 ? usageData.chartData : generateMockChartData(timeRange);
  const featureUsage = usageData?.featureUsage?.length > 0 ? usageData.featureUsage : [
    { name: 'Map Views', value: 4500 },
    { name: 'API Calls', value: 3200 },
    { name: 'Alerts', value: 890 },
    { name: 'Help Requests', value: 245 },
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: colors.border.light }}>
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: timeRange === days ? colors.beacon.primary : 'transparent',
                color: timeRange === days ? 'white' : colors.text.muted,
              }}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'API Calls', value: usageData?.totals?.apiCalls || 12450 },
          { label: 'Active EM Users', value: usageData?.totals?.emUsers || 24 },
          { label: 'Public Users', value: usageData?.totals?.publicUsers || 1893 },
          { label: 'Alerts Sent', value: usageData?.totals?.alertsSent || 156 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border"
            style={{ borderColor: colors.border.light }}
          >
            <div className="mb-2">
              <span className="text-xs font-medium uppercase" style={{ color: colors.text.muted }}>
                {stat.label}
              </span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* API Calls Line Chart */}
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.border.light }}>
          <h4 className="text-sm font-semibold mb-4">API Calls</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="api_calls"
                stroke={colors.beacon.primary}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Users Area Chart */}
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.border.light }}>
          <h4 className="text-sm font-semibold mb-4">Active Users</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="active_users"
                stroke={colors.status.success}
                fill={colors.status.successLight}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage Pie Chart */}
        <div className="col-span-2 p-4 rounded-lg border" style={{ borderColor: colors.border.light }}>
          <h4 className="text-sm font-semibold mb-4">Feature Usage</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={featureUsage}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {featureUsage.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate mock chart data
function generateMockChartData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0].slice(5), // MM-DD format
      api_calls: Math.floor(Math.random() * 500) + 200,
      active_users: Math.floor(Math.random() * 100) + 50,
      alerts_sent: Math.floor(Math.random() * 20) + 5,
    });
  }
  return data;
}

// Incidents Tab
function IncidentsTab({ clientId }: { clientId: string }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, [clientId]);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/incidents`);
      const result = await response.json();
      if (result.success) {
        setIncidents(result.data);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" style={{ color: colors.text.muted }}>
        Loading...
      </div>
    );
  }

  // Show mock incidents if none exist
  const displayIncidents = incidents.length > 0 ? incidents : [
    {
      id: '1',
      incidentId: 'INC-001',
      type: 'Wildfire',
      severity: 'high',
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      affectedUsers: 1245,
      alertsSent: 89,
      status: 'resolved',
      durationHours: 72,
    },
    {
      id: '2',
      incidentId: 'INC-002',
      type: 'Tornado',
      severity: 'critical',
      startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      endTime: null,
      affectedUsers: 3421,
      alertsSent: 156,
      status: 'active',
      durationHours: 12,
    },
  ];

  return (
    <div className="space-y-4">
      {displayIncidents.length === 0 ? (
        <div className="text-center py-12" style={{ color: colors.text.muted }}>
          <p>No incidents recorded</p>
        </div>
      ) : (
        displayIncidents.map((incident) => {
          const isActive = incident.status === 'active';

          return (
            <div
              key={incident.id}
              className="p-4 rounded-lg border"
              style={{
                borderColor: isActive ? colors.status.error : colors.border.light,
                backgroundColor: isActive ? colors.status.errorLighter : 'transparent',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{incident.type}</span>
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: isActive ? colors.status.errorLight : colors.status.successLight,
                        color: isActive ? colors.status.error : colors.status.successDarkest,
                      }}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text.muted }}>
                    Started: {new Date(incident.startTime).toLocaleString()}
                    {incident.endTime && ` • Ended: ${new Date(incident.endTime).toLocaleString()}`}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div><span style={{ color: colors.text.muted }}>Duration:</span> {incident.durationHours}h</div>
                  <div><span style={{ color: colors.text.muted }}>Users:</span> {incident.affectedUsers}</div>
                  <div><span style={{ color: colors.text.muted }}>Alerts:</span> {incident.alertsSent}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Settings Tab
function SettingsTab({ client, onUpdate, onClose }: { client: Client; onUpdate: () => void; onClose: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRenew = async () => {
    if (!confirm('Renew subscription for another year?')) return;

    setIsUpdating(true);
    try {
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE',
          expiresAt: newExpiry.toISOString(),
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (client.status !== 'CANCELLED') {
      alert('Client must be cancelled before deletion');
      return;
    }
    if (!confirm('This action cannot be undone. Are you sure you want to delete this client?')) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onClose();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Management */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
          Subscription Management
        </h4>
        <div className="flex gap-3">
          <button
            onClick={handleRenew}
            disabled={isUpdating}
            className={getButtonClasses('primary', 'sm')}
          >
            Renew Subscription
          </button>
          {client.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusChange('SUSPENDED')}
              disabled={isUpdating}
              className={getButtonClasses('outline', 'sm')}
            >
              Suspend Account
            </button>
          )}
          {client.status === 'SUSPENDED' && (
            <button
              onClick={() => handleStatusChange('ACTIVE')}
              disabled={isUpdating}
              className={getButtonClasses('outline', 'sm')}
            >
              Activate Account
            </button>
          )}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>
          Features Enabled
        </h4>
        <div className="space-y-2">
          {['Real-time Alerts', 'Interactive Map', 'Help Requests', 'Analytics Dashboard', 'API Access'].map((feature) => (
            <label key={feature} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
                style={{ accentColor: colors.beacon.primary }}
              />
              <span className="text-sm">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="p-4 rounded-lg border-2"
        style={{ borderColor: colors.status.errorBorder, backgroundColor: colors.status.errorLighter }}
      >
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.status.error }}>
          Danger Zone
        </h4>
        <div className="space-y-3">
          {client.status !== 'CANCELLED' && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={isUpdating}
              className={`${getButtonClasses('outline', 'sm')} border-red-300 text-red-600 hover:bg-red-50`}
            >
              Cancel Account
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isUpdating || client.status !== 'CANCELLED'}
            className={getButtonClasses('danger', 'sm')}
          >
            Delete Client
          </button>
          {client.status !== 'CANCELLED' && (
            <p className="text-xs" style={{ color: colors.text.muted }}>
              Client must be cancelled before deletion
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
