'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { colors, shadows, getButtonClasses, getInputClasses } from '@/lib/design';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const ORG_TYPES = [
  'Fire Department',
  'Police Department',
  'City Government',
  'County Government',
  'State Agency',
  'Federal Agency',
  'Private Organization',
];

const PLANS = ['Trial', 'Basic', 'Pro', 'Enterprise'];

const clientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  organizationType: z.string().min(1, 'Organization type is required'),
  primaryContact: z.string().min(2, 'Primary contact is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jurisdiction: z.string().optional(),
  state: z.string().optional(),
  plan: z.string(),
  boundingBoxNorth: z.number().optional(),
  boundingBoxSouth: z.number().optional(),
  boundingBoxEast: z.number().optional(),
  boundingBoxWest: z.number().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddClientModal({ isOpen, onClose, onSuccess }: AddClientModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      plan: 'Trial',
    },
  });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      // Build bounding box if coordinates provided
      let boundingBox = null;
      if (data.boundingBoxNorth && data.boundingBoxSouth && data.boundingBoxEast && data.boundingBoxWest) {
        boundingBox = {
          north: data.boundingBoxNorth,
          south: data.boundingBoxSouth,
          east: data.boundingBoxEast,
          west: data.boundingBoxWest,
        };
      }

      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          organizationType: data.organizationType,
          primaryContact: data.primaryContact,
          email: data.email,
          phone: data.phone,
          jurisdiction: data.jurisdiction,
          state: data.state,
          plan: data.plan,
          boundingBox,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create client');
      }

      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating client:', error);
      alert(error.message || 'Failed to create client');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Client" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={inputClass}
                style={{
                  borderColor: errors.name ? colors.status.error : colors.border.default,
                  boxShadow: errors.name ? `0 0 0 2px ${colors.status.errorLight}` : undefined,
                }}
                placeholder="Enter client name"
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Organization Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('organizationType')}
                className={inputClass}
                style={{ borderColor: errors.organizationType ? colors.status.error : colors.border.default }}
              >
                <option value="">Select type...</option>
                {ORG_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.organizationType && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.organizationType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Plan
              </label>
              <select
                {...register('plan')}
                className={inputClass}
                style={{ borderColor: colors.border.default }}
              >
                {PLANS.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Contact Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Primary Contact <span className="text-red-500">*</span>
              </label>
              <input
                {...register('primaryContact')}
                className={inputClass}
                style={{ borderColor: errors.primaryContact ? colors.status.error : colors.border.default }}
                placeholder="Contact name"
              />
              {errors.primaryContact && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.primaryContact.message}
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
                style={{ borderColor: errors.email ? colors.status.error : colors.border.default }}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: colors.status.error }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Phone
              </label>
              <input
                {...register('phone')}
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="(555) 555-5555"
                onChange={(e) => {
                  e.target.value = formatPhoneNumber(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Location
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                Jurisdiction
              </label>
              <input
                {...register('jurisdiction')}
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="City/County name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text.primary }}>
                State
              </label>
              <select
                {...register('state')}
                className={inputClass}
                style={{ borderColor: colors.border.default }}
              >
                <option value="">Select state...</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Coverage Area (Bounding Box) */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: colors.text.muted }}>
            Coverage Area (Optional)
          </h3>
          <p className="text-xs mb-3" style={{ color: colors.text.muted }}>
            Define the geographic bounding box for this client's coverage area.
          </p>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
                North
              </label>
              <input
                {...register('boundingBoxNorth', { valueAsNumber: true })}
                type="number"
                step="0.0001"
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="Lat"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
                South
              </label>
              <input
                {...register('boundingBoxSouth', { valueAsNumber: true })}
                type="number"
                step="0.0001"
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="Lat"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
                East
              </label>
              <input
                {...register('boundingBoxEast', { valueAsNumber: true })}
                type="number"
                step="0.0001"
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="Lng"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: colors.text.muted }}>
                West
              </label>
              <input
                {...register('boundingBoxWest', { valueAsNumber: true })}
                type="number"
                step="0.0001"
                className={inputClass}
                style={{ borderColor: colors.border.default }}
                placeholder="Lng"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <button
            type="button"
            onClick={handleClose}
            className={getButtonClasses('outline', 'md')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={getButtonClasses('primary', 'md')}
          >
            {isSubmitting ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
