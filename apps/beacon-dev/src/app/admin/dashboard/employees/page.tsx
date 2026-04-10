'use client';

import { useState, useEffect, useCallback } from 'react';
import { colors, getButtonClasses } from '@/lib/design';
import { DataTable, Column, ActionMenu, ActionMenuItem } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
  EMPLOYEE_ROLES,
  ROLE_LABELS,
  ROLE_BADGE_COLORS,
  EmployeeRole,
} from '@/lib/validation/employee';
import { checkPasswordStrength } from '@/lib/auth/password';
import { Search, ChevronDown, Loader2, Copy, Check, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Employee type from API
interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  username: string;
  role: EmployeeRole;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  _count?: {
    loginHistory: number;
    clientAssignments: number;
  };
}

// Login history session
interface LoginSession {
  id: string;
  loginTime: string;
  logoutTime: string | null;
  duration: string;
  durationSeconds: number | null;
  ipAddress: string;
  userAgent: string;
  active: boolean;
}

// Filter options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  ...EMPLOYEE_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
];

// Relative time formatter
function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

// Role badge component
function RoleBadge({ role }: { role: EmployeeRole }) {
  const roleColors = ROLE_BADGE_COLORS[role] || ROLE_BADGE_COLORS.SUPPORT;
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${roleColors.bg} ${roleColors.text}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

// Status badge component
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

// Password strength indicator component
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const { strength, feedback } = checkPasswordStrength(password);
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-amber-500',
    strong: 'bg-green-500',
  };
  const strengthWidths = {
    weak: 'w-1/3',
    medium: 'w-2/3',
    strong: 'w-full',
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${strengthWidths[strength]} ${strengthColors[strength]} transition-all`} />
        </div>
        <span
          className="text-xs font-medium capitalize"
          style={{ color: strength === 'weak' ? colors.status.error : strength === 'medium' ? colors.status.warning : colors.status.success }}
        >
          {strength}
        </span>
      </div>
      {feedback.length > 0 && (
        <p className="text-xs" style={{ color: colors.text.muted }}>
          {feedback[0]}
        </p>
      )}
    </div>
  );
}

// Add Employee Modal
function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isCheckingUnique, setIsCheckingUnique] = useState(false);
  const [usernameUnique, setUsernameUnique] = useState<boolean | null>(null);
  const [emailUnique, setEmailUnique] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      role: 'SUPPORT',
      sendWelcomeEmail: false,
    },
  });

  const password = watch('password');
  const username = watch('username');
  const email = watch('email');

  // Check username uniqueness with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameUnique(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUnique(true);
      try {
        const res = await fetch('/api/admin/employees/check-unique', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'username', value: username }),
        });
        const data = await res.json();
        setUsernameUnique(data.unique);
        if (!data.unique) {
          setError('username', { message: 'Username already taken' });
        } else {
          clearErrors('username');
        }
      } catch {
        setUsernameUnique(null);
      }
      setIsCheckingUnique(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [username, setError, clearErrors]);

  // Check email uniqueness with debounce
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailUnique(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/employees/check-unique', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'email', value: email }),
        });
        const data = await res.json();
        setEmailUnique(data.unique);
        if (!data.unique) {
          setError('email', { message: 'Email already in use' });
        } else if (errors.email?.message === 'Email already in use') {
          clearErrors('email');
        }
      } catch {
        setEmailUnique(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [email, setError, clearErrors, errors.email]);

  const onSubmit = async (data: CreateEmployeeFormData) => {
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          username: data.username,
          password: data.password,
          role: data.role,
          sendWelcomeEmail: data.sendWelcomeEmail,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create employee');
      }

      toast.success(`Employee added successfully. Username: ${result.data.username}`);
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create employee');
    }
  };

  const handleClose = () => {
    reset();
    setUsernameUnique(null);
    setEmailUnique(null);
    onClose();
  };

  const inputClass = 'w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee ID Info */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: colors.beacon.primaryLight }}>
          <p className="text-sm" style={{ color: colors.beacon.primary }}>
            Employee ID will be auto-generated (e.g., EMP001)
          </p>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={inputClass}
                style={{
                  borderColor: errors.name ? colors.status.error : colors.border.default,
                }}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className={inputClass}
                style={{
                  borderColor: errors.email ? colors.status.error : emailUnique === false ? colors.status.error : colors.border.default,
                }}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.email.message}
                </p>
              )}
              {emailUnique === true && !errors.email && (
                <p className="text-xs mt-1" style={{ color: colors.status.success }}>
                  Email is available
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('username')}
                  className={inputClass}
                  style={{
                    borderColor: errors.username ? colors.status.error : usernameUnique === false ? colors.status.error : colors.border.default,
                  }}
                  placeholder="username"
                />
                {isCheckingUnique && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: colors.text.muted }} />
                  </div>
                )}
              </div>
              {errors.username && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.username.message}
                </p>
              )}
              {usernameUnique === true && !errors.username && (
                <p className="text-xs mt-1" style={{ color: colors.status.success }}>
                  Username is available
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                Letters, numbers, and underscores only
              </p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Password
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                {...register('password')}
                type="password"
                className={inputClass}
                style={{
                  borderColor: errors.password ? colors.status.error : colors.border.default,
                }}
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.password.message}
                </p>
              )}
              <PasswordStrength password={password || ''} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className={inputClass}
                style={{
                  borderColor: errors.confirmPassword ? colors.status.error : colors.border.default,
                }}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: colors.text.muted }}>
            User must change this password on first login
          </p>
        </div>

        {/* Role */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Role & Permissions
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
              Role <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className={inputClass}
              style={{ borderColor: errors.role ? colors.status.error : colors.border.default }}
            >
              {EMPLOYEE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('sendWelcomeEmail')}
              className="w-4 h-4 rounded border-gray-300 text-beacon-primary focus:ring-beacon-primary"
            />
            <span className="text-sm" style={{ color: colors.text.primary }}>
              Send welcome email with login credentials
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <button type="button" onClick={handleClose} className={getButtonClasses('outline', 'md')}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || usernameUnique === false || emailUnique === false}
            className={getButtonClasses('primary', 'md')}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Employee'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Edit Employee Modal
function EditEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}) {
  const [emailUnique, setEmailUnique] = useState<boolean | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
  });

  const password = watch('password');
  const email = watch('email');

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        isActive: employee.isActive,
        password: '',
        confirmPassword: '',
      });
      setShowPasswordFields(false);
      setEmailUnique(null);
    }
  }, [employee, reset]);

  // Check email uniqueness with debounce
  useEffect(() => {
    if (!email || !email.includes('@') || email === employee?.email) {
      setEmailUnique(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/employees/check-unique', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'email', value: email, excludeId: employee?.id }),
        });
        const data = await res.json();
        setEmailUnique(data.unique);
        if (!data.unique) {
          setError('email', { message: 'Email already in use' });
        } else if (errors.email?.message === 'Email already in use') {
          clearErrors('email');
        }
      } catch {
        setEmailUnique(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [email, employee?.email, employee?.id, setError, clearErrors, errors.email]);

  const onSubmit = async (data: UpdateEmployeeFormData) => {
    if (!employee) return;

    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };

      // Only include password if provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update employee');
      }

      toast.success('Employee updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
    }
  };

  const handleClose = () => {
    reset();
    setEmailUnique(null);
    setShowPasswordFields(false);
    onClose();
  };

  const inputClass = 'w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all';

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Employee" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Readonly Fields */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.neutral[50] }}>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
              Employee ID
            </label>
            <p className="font-mono text-sm" style={{ color: colors.text.primary }}>
              {employee.employeeId}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
              Username
            </label>
            <p className="text-sm" style={{ color: colors.text.primary }}>
              {employee.username}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
              2FA Enabled
            </label>
            <p className="text-sm" style={{ color: colors.text.primary }}>
              {employee.twoFactorEnabled ? 'Yes' : 'No'} (user managed)
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
              Created
            </label>
            <p className="text-sm" style={{ color: colors.text.primary }}>
              {new Date(employee.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Editable Fields */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={inputClass}
                style={{
                  borderColor: errors.name ? colors.status.error : colors.border.default,
                }}
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className={inputClass}
                style={{
                  borderColor: errors.email ? colors.status.error : emailUnique === false ? colors.status.error : colors.border.default,
                }}
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role')}
                className={inputClass}
                style={{ borderColor: colors.border.default }}
              >
                {EMPLOYEE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 rounded border-gray-300 text-beacon-primary focus:ring-beacon-primary"
            />
            <span className="text-sm" style={{ color: colors.text.primary }}>
              Account is active
            </span>
          </label>
        </div>

        {/* Optional Password Change */}
        <div>
          <button
            type="button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-sm font-medium"
            style={{ color: colors.beacon.primary }}
          >
            {showPasswordFields ? 'Cancel password change' : 'Change password'}
          </button>

          {showPasswordFields && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                  New Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className={inputClass}
                  style={{
                    borderColor: errors.password ? colors.status.error : colors.border.default,
                  }}
                  placeholder="Min 8 characters"
                />
                {errors.password && (
                  <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                    {errors.password.message}
                  </p>
                )}
                <PasswordStrength password={password || ''} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className={inputClass}
                  style={{
                    borderColor: errors.confirmPassword ? colors.status.error : colors.border.default,
                  }}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <button type="button" onClick={handleClose} className={getButtonClasses('outline', 'md')}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || emailUnique === false}
            className={getButtonClasses('primary', 'md')}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Reset Password Modal
function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}) {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    if (!employee) return;

    setIsResetting(true);
    try {
      const res = await fetch(`/api/admin/employees/${employee.id}/reset-password`, {
        method: 'POST',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setNewPassword(result.data.temporaryPassword);
      toast.success('Password reset successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopy = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewPassword(null);
    setCopied(false);
    onClose();
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Password" size="md">
      <div className="space-y-6">
        {!newPassword ? (
          <>
            <p className="text-sm" style={{ color: colors.text.primary }}>
              Generate a new temporary password for <strong>{employee.name}</strong>?
            </p>
            <p className="text-sm" style={{ color: colors.text.muted }}>
              The user will be required to change this password on their next login.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border.light }}>
              <button type="button" onClick={handleClose} className={getButtonClasses('outline', 'md')}>
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className={getButtonClasses('primary', 'md')}
              >
                {isResetting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  'Generate New Password'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.status.successLight }}>
              <p className="text-sm font-medium mb-2" style={{ color: colors.status.successDarkest }}>
                New temporary password generated
              </p>
              <p className="text-xs" style={{ color: colors.status.successMuted }}>
                Copy this password and share it securely with the employee.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
                Temporary Password
              </label>
              <div
                className="flex items-center gap-2 p-3 rounded-lg border font-mono"
                style={{ borderColor: colors.border.default, backgroundColor: colors.neutral[50] }}
              >
                <span className="flex-1 select-all">{newPassword}</span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4" style={{ color: colors.status.success }} />
                  ) : (
                    <Copy className="w-4 h-4" style={{ color: colors.text.muted }} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t" style={{ borderColor: colors.border.light }}>
              <button onClick={handleClose} className={getButtonClasses('primary', 'md')}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// Login History Modal
function LoginHistoryModal({
  isOpen,
  onClose,
  employee,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}) {
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      fetchHistory();
    }
  }, [isOpen, employee]);

  const fetchHistory = async () => {
    if (!employee) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/employees/${employee.id}/login-history`);
      const result = await res.json();

      if (result.success) {
        setSessions(result.data.sessions);
      }
    } catch (error) {
      toast.error('Failed to fetch login history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!employee || sessions.length === 0) return;

    const headers = ['Login Time', 'Logout Time', 'Duration', 'IP Address', 'User Agent'];
    const rows = sessions.map((s) => [
      new Date(s.loginTime).toLocaleString(),
      s.logoutTime ? new Date(s.logoutTime).toLocaleString() : 'Still active',
      s.duration,
      s.ipAddress,
      s.userAgent,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-history-${employee.employeeId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Login history exported');
  };

  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Login History: ${employee.name}`} size="2xl">
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: colors.text.muted }}>
            Showing last 50 sessions
          </p>
          <button
            onClick={handleExportCSV}
            disabled={sessions.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ borderColor: colors.border.default }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: colors.neutral[50] }}>
                <th className="px-3 py-2 text-left font-medium" style={{ color: colors.text.muted }}>
                  Login Time
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: colors.text.muted }}>
                  Logout Time
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: colors.text.muted }}>
                  Duration
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: colors.text.muted }}>
                  IP Address
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: colors.text.muted }}>
                  Browser
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: colors.border.light }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center" style={{ color: colors.text.muted }}>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center" style={{ color: colors.text.muted }}>
                    No login history found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2" style={{ color: colors.text.primary }}>
                      {new Date(session.loginTime).toLocaleString()}
                    </td>
                    <td className="px-3 py-2" style={{ color: colors.text.primary }}>
                      {session.active ? (
                        <span className="text-green-600 font-medium">Active now</span>
                      ) : session.logoutTime ? (
                        new Date(session.logoutTime).toLocaleString()
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-2" style={{ color: colors.text.primary }}>
                      {session.duration}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs" style={{ color: colors.text.muted }}>
                      {session.ipAddress}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-48 truncate" style={{ color: colors.text.muted }}>
                      {session.userAgent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <button onClick={onClose} className={getButtonClasses('outline', 'md')}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Confirm Delete Dialog
function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  employee,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employee: Employee | null;
  isDeleting: boolean;
}) {
  if (!isOpen || !employee) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.beacon.navy }}>
          Delete Employee?
        </h3>
        <p className="text-sm mb-4" style={{ color: colors.text.primary }}>
          Are you sure you want to delete <strong>{employee.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={getButtonClasses('outline', 'md')} disabled={isDeleting}>
            Cancel
          </button>
          <button onClick={onConfirm} className={getButtonClasses('danger', 'md')} disabled={isDeleting}>
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0, limit: 20 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/employees?${params}`);
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
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

  const handleStatusChange = async (employee: Employee, newStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (res.ok) {
        toast.success(`Employee ${newStatus ? 'activated' : 'deactivated'}`);
        fetchEmployees();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Employee deleted');
        fetchEmployees();
        setShowDeleteDialog(false);
        setSelectedEmployee(null);
      } else {
        toast.error(result.error || 'Failed to delete employee');
      }
    } catch {
      toast.error('Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      sortable: true,
      width: '110px',
      render: (emp) => (
        <span className="font-mono text-sm" style={{ color: colors.text.muted }}>
          {emp.employeeId}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (emp) => (
        <span className="font-medium" style={{ color: colors.text.primary }}>
          {emp.name}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (emp) => (
        <span className="text-sm" style={{ color: colors.text.primary }}>
          {emp.email}
        </span>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (emp) => (
        <span className="font-mono text-sm" style={{ color: colors.text.muted }}>
          {emp.username}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (emp) => <RoleBadge role={emp.role} />,
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      width: '100px',
      render: (emp) => <StatusBadge isActive={emp.isActive} />,
    },
    {
      key: 'twoFactorEnabled',
      header: '2FA',
      width: '80px',
      render: (emp) => (
        <span className="text-sm" style={{ color: emp.twoFactorEnabled ? colors.status.success : colors.text.muted }}>
          {emp.twoFactorEnabled ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: (emp) => (
        <span className="text-sm" style={{ color: colors.text.muted }}>
          {formatRelativeTime(emp.lastLogin)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.beacon.navy }}>
          Employees
        </h1>
        <button onClick={() => setShowAddModal(true)} className={getButtonClasses('primary', 'md')}>
          Add New Employee
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
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: colors.text.muted }}
          />
          <input
            type="text"
            placeholder="Search by name, email, username, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.neutral.white,
            }}
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-4 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.neutral.white,
            }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: colors.text.muted }}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-4 pr-10 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
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
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: colors.text.muted }}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={employees}
        keyField="id"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage="No employees found"
        actions={(employee) => (
          <ActionMenu>
            <ActionMenuItem
              onClick={() => {
                setSelectedEmployee(employee);
                setShowEditModal(true);
              }}
            >
              Edit Employee
            </ActionMenuItem>
            <ActionMenuItem
              onClick={() => {
                setSelectedEmployee(employee);
                setShowLoginHistoryModal(true);
              }}
            >
              View Login History
            </ActionMenuItem>
            <ActionMenuItem
              onClick={() => {
                setSelectedEmployee(employee);
                setShowResetPasswordModal(true);
              }}
            >
              Reset Password
            </ActionMenuItem>
            <div className="border-t my-1" style={{ borderColor: colors.border.light }} />
            {employee.isActive ? (
              <ActionMenuItem onClick={() => handleStatusChange(employee, false)}>
                Deactivate Account
              </ActionMenuItem>
            ) : (
              <ActionMenuItem onClick={() => handleStatusChange(employee, true)}>
                Activate Account
              </ActionMenuItem>
            )}
            {/* Only show delete if never logged in */}
            {!employee.lastLogin && (
              <>
                <div className="border-t my-1" style={{ borderColor: colors.border.light }} />
                <ActionMenuItem
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowDeleteDialog(true);
                  }}
                  danger
                >
                  Delete
                </ActionMenuItem>
              </>
            )}
          </ActionMenu>
        )}
      />

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchEmployees}
      />

      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={fetchEmployees}
        employee={selectedEmployee}
      />

      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={fetchEmployees}
        employee={selectedEmployee}
      />

      <LoginHistoryModal
        isOpen={showLoginHistoryModal}
        onClose={() => {
          setShowLoginHistoryModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDelete}
        employee={selectedEmployee}
        isDeleting={isDeleting}
      />
    </div>
  );
}
