'use client';

import { useState, useEffect, useCallback } from 'react';
import { colors, shadows, getButtonClasses } from '@/lib/design';
import { DataTable, Column, ActionMenu, ActionMenuItem } from '@/components/ui/DataTable';
import { StatusBadge, ExpiryBadge } from '@/components/ui/StatusBadge';
import { AddClientModal } from './AddClientModal';
import { ClientDetailsModal } from './ClientDetailsModal';
import toast, { Toaster } from 'react-hot-toast';

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
  _count?: {
    incidents: number;
    usageMetrics: number;
  };
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'TRIAL', label: 'Trial' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'EXPIRED', label: 'Expired' },
];

const ORG_TYPE_OPTIONS = [
  { value: 'all', label: 'All Organizations' },
  { value: 'Fire Department', label: 'Fire Dept' },
  { value: 'Police Department', label: 'Police' },
  { value: 'City Government', label: 'City' },
  { value: 'County Government', label: 'County' },
  { value: 'State Agency', label: 'State' },
  { value: 'Federal Agency', label: 'Federal' },
  { value: 'Private Organization', label: 'Private' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0, limit: 20 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (orgTypeFilter !== 'all') params.append('orgType', orgTypeFilter);

      const response = await fetch(`/api/admin/clients?${params}`);
      const result = await response.json();

      if (result.success) {
        setClients(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, orgTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleRowClick = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (client: Client, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Client ${newStatus.toLowerCase()}`);
        fetchClients();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = (client: Client, format: 'pdf' | 'csv') => {
    toast.success(`Exporting ${client.name} report as ${format.toUpperCase()}`);
    // Export implementation would go here
  };

  const handleClientCreated = () => {
    toast.success('Client created successfully');
    fetchClients();
  };

  const columns: Column<Client>[] = [
    {
      key: 'clientId',
      header: 'Client ID',
      sortable: true,
      width: '100px',
      render: (client) => (
        <span className="font-mono text-sm" style={{ color: colors.text.muted }}>
          {client.clientId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (client) => (
        <button
          className="text-left font-medium hover:underline"
          style={{ color: colors.beacon.primary }}
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(client);
          }}
        >
          {client.name}
        </button>
      ),
    },
    {
      key: 'organizationType',
      header: 'Organization',
      sortable: true,
      render: (client) => (
        <span className="text-sm">{client.organizationType}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '120px',
      render: (client) => <StatusBadge status={client.status} />,
    },
    {
      key: 'primaryContact',
      header: 'Primary Contact',
      render: (client) => (
        <div className="text-sm">
          <div>{client.primaryContact || '-'}</div>
          {client.email && (
            <div className="text-xs" style={{ color: colors.text.muted }}>
              {client.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'accountManagers',
      header: 'Account Manager',
      render: (client) => {
        const primary = client.accountManagers?.find((a) => a.role === 'Primary');
        return (
          <span className="text-sm">
            {primary?.employee.name || '-'}
          </span>
        );
      },
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      sortable: true,
      render: (client) => (
        <div className="flex items-center">
          <span className="text-sm">
            {client.expiresAt ? new Date(client.expiresAt).toLocaleDateString() : '-'}
          </span>
          <ExpiryBadge expiresAt={client.expiresAt} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.beacon.navy }}>
          Clients
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className={getButtonClasses('primary', 'md')}
        >
          Add New Client
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="flex items-center gap-4 p-4 mb-6 rounded-lg border"
        style={{
          borderColor: colors.border.light,
          backgroundColor: colors.neutral[50],
        }}
      >
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.neutral.white,
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.neutral.white,
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Organization Type Filter */}
        <div>
          <select
            value={orgTypeFilter}
            onChange={(e) => {
              setOrgTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.neutral.white,
            }}
          >
            {ORG_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={clients}
        keyField="id"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={handleRowClick}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No clients found"
        actions={(client) => (
          <ActionMenu>
            <ActionMenuItem onClick={() => handleRowClick(client)}>
              View Details
            </ActionMenuItem>
            <ActionMenuItem onClick={() => {
              setSelectedClient(client);
              setShowDetailsModal(true);
            }}>
              Edit Info
            </ActionMenuItem>
            <ActionMenuItem onClick={() => {
              setSelectedClient(client);
              setShowDetailsModal(true);
            }}>
              View Usage
            </ActionMenuItem>
            <div className="border-t my-1" style={{ borderColor: colors.border.light }} />
            {client.status === 'ACTIVE' && (
              <ActionMenuItem onClick={() => handleStatusChange(client, 'SUSPENDED')}>
                Suspend Account
              </ActionMenuItem>
            )}
            {client.status === 'SUSPENDED' && (
              <ActionMenuItem onClick={() => handleStatusChange(client, 'ACTIVE')}>
                Activate Account
              </ActionMenuItem>
            )}
            <ActionMenuItem onClick={() => handleExport(client, 'pdf')}>
              Export PDF
            </ActionMenuItem>
            <ActionMenuItem onClick={() => handleExport(client, 'csv')}>
              Export CSV
            </ActionMenuItem>
            {client.status === 'CANCELLED' && (
              <>
                <div className="border-t my-1" style={{ borderColor: colors.border.light }} />
                <ActionMenuItem
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this client?')) {
                      fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' })
                        .then(() => {
                          toast.success('Client deleted');
                          fetchClients();
                        })
                        .catch(() => toast.error('Failed to delete client'));
                    }
                  }}
                  danger
                >
                  Delete Client
                </ActionMenuItem>
              </>
            )}
          </ActionMenu>
        )}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleClientCreated}
      />

      {/* Client Details Modal */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedClient(null);
        }}
        onUpdate={fetchClients}
      />
    </div>
  );
}
