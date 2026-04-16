'use client';

import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { colors, shadows } from '@/lib/design';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
  onPageChange?: (page: number) => void;
  actions?: (item: T) => ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  pagination,
  onPageChange,
  actions,
  isLoading,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg border"
        style={{
          borderColor: colors.border.light,
          boxShadow: shadows.card,
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: colors.neutral[50] }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                  }`}
                  style={{
                    color: sortBy === column.key ? colors.text.primary : colors.text.muted,
                    width: column.width,
                  }}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  {column.header}
                  {column.sortable && sortBy === column.key && (
                    <span className="ml-1 text-xs">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
              {actions && (
                <th
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.text.muted, width: '80px' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ backgroundColor: colors.neutral.white }}>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                  style={{ color: colors.text.muted }}
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                  style={{ color: colors.text.muted }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item[keyField]}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                  style={{ borderColor: colors.border.light }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-3 mt-4"
          style={{ color: colors.text.muted }}
        >
          <div className="text-sm">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              style={{ borderColor: colors.border.light }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              style={{ borderColor: colors.border.light }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Dropdown menu for row actions
interface ActionMenuProps {
  children: ReactNode;
}

export function ActionMenu({ children }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
        style={{ color: colors.text.muted }}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-1 w-48 rounded-lg border bg-white py-1 z-20"
            style={{
              boxShadow: shadows.lg,
              borderColor: colors.border.light,
            }}
          >
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </div>
        </>
      )}
    </div>
  );
}

interface ActionMenuItemProps {
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}

export function ActionMenuItem({ onClick, children, danger }: ActionMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 flex items-center gap-2"
      style={{
        color: danger ? colors.status.error : colors.text.primary,
      }}
    >
      {children}
    </button>
  );
}
