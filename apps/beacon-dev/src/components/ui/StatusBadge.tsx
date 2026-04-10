'use client';

import { colors } from '@/lib/design';

type StatusType = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  TRIAL: {
    bg: colors.status.warningLight,
    text: colors.status.warningDarker,
    label: 'Trial',
  },
  ACTIVE: {
    bg: colors.status.successLight,
    text: colors.status.successDarkest,
    label: 'Active',
  },
  SUSPENDED: {
    bg: colors.status.errorLight,
    text: colors.status.errorDark,
    label: 'Suspended',
  },
  EXPIRED: {
    bg: colors.neutral[200],
    text: colors.neutral[700],
    label: 'Expired',
  },
  CANCELLED: {
    bg: colors.neutral[300],
    text: colors.neutral[700],
    label: 'Cancelled',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.EXPIRED;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
}

// Countdown badge for expiring soon
interface ExpiryBadgeProps {
  expiresAt: Date | string | null;
}

export function ExpiryBadge({ expiresAt }: ExpiryBadgeProps) {
  if (!expiresAt) return null;

  const expiry = new Date(expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft > 30) return null;

  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft <= 7;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ml-2"
      style={{
        backgroundColor: isExpired
          ? colors.status.errorLight
          : isUrgent
          ? colors.status.warningLight
          : colors.beacon.primaryLight,
        color: isExpired
          ? colors.status.errorDark
          : isUrgent
          ? colors.status.warningDarker
          : colors.beacon.primary,
      }}
    >
      {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
    </span>
  );
}
