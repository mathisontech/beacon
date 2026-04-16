import type { CreatorType, VerificationLevel } from '@prisma/client';

/**
 * Credence scoring algorithm for map tags
 *
 * The credence score represents the trustworthiness of a tag on a scale of 0.0 to 1.0.
 * Higher scores indicate more reliable information.
 *
 * Scoring rules:
 * - Base score starts at 1.0
 * - +0.2 for each confirmation (capped contribution)
 * - -0.3 for each dispute (capped contribution)
 * - +0.5 if creator is verified (IDENTITY_VERIFIED or higher)
 * - EMS/Admin/System tags always have credence 1.0 (trusted sources)
 *
 * Final score is clamped between 0.0 and 1.0
 */

// Constants for credence calculation
const BASE_CREDENCE = 1.0;
const CONFIRMATION_BONUS = 0.2;
const DISPUTE_PENALTY = 0.3;
const VERIFIED_CREATOR_BONUS = 0.5;
const MIN_CREDENCE = 0.0;
const MAX_CREDENCE = 1.0;

// Maximum confirmations/disputes that affect score (prevents gaming)
const MAX_CONFIRMATION_IMPACT = 5;
const MAX_DISPUTE_IMPACT = 3;

// Trusted creator types that bypass credence calculation
const TRUSTED_CREATOR_TYPES: CreatorType[] = ['EMS_USER', 'ADMIN_USER', 'SYSTEM'];

// Verification levels that grant the verified creator bonus
const VERIFIED_LEVELS: VerificationLevel[] = ['IDENTITY_VERIFIED', 'TRUSTED_MEMBER'];

export interface CredenceInput {
  creatorType: CreatorType;
  confirmationCount: number;
  disputeCount: number;
  creatorVerificationLevel?: VerificationLevel | null;
}

export interface CredenceResult {
  score: number;
  isTrusted: boolean;
  breakdown: {
    base: number;
    confirmationBonus: number;
    disputePenalty: number;
    verifiedBonus: number;
  };
}

/**
 * Calculate the credence score for a map tag
 *
 * @param input - The input parameters for credence calculation
 * @returns The credence result with score and breakdown
 */
export function calculateCredence(input: CredenceInput): CredenceResult {
  const { creatorType, confirmationCount, disputeCount, creatorVerificationLevel } = input;

  // Trusted sources always have maximum credence
  if (TRUSTED_CREATOR_TYPES.includes(creatorType)) {
    return {
      score: MAX_CREDENCE,
      isTrusted: true,
      breakdown: {
        base: MAX_CREDENCE,
        confirmationBonus: 0,
        disputePenalty: 0,
        verifiedBonus: 0,
      },
    };
  }

  // Calculate confirmation bonus (capped)
  const effectiveConfirmations = Math.min(confirmationCount, MAX_CONFIRMATION_IMPACT);
  const confirmationBonus = effectiveConfirmations * CONFIRMATION_BONUS;

  // Calculate dispute penalty (capped)
  const effectiveDisputes = Math.min(disputeCount, MAX_DISPUTE_IMPACT);
  const disputePenalty = effectiveDisputes * DISPUTE_PENALTY;

  // Calculate verified creator bonus
  const verifiedBonus =
    creatorVerificationLevel && VERIFIED_LEVELS.includes(creatorVerificationLevel)
      ? VERIFIED_CREATOR_BONUS
      : 0;

  // Calculate raw score
  const rawScore = BASE_CREDENCE + confirmationBonus - disputePenalty + verifiedBonus;

  // Clamp score between min and max
  const score = Math.max(MIN_CREDENCE, Math.min(MAX_CREDENCE, rawScore));

  return {
    score,
    isTrusted: false,
    breakdown: {
      base: BASE_CREDENCE,
      confirmationBonus,
      disputePenalty,
      verifiedBonus,
    },
  };
}

/**
 * Check if a tag should be visible based on minimum credence threshold
 *
 * @param credenceScore - The tag's credence score
 * @param minCredence - The minimum credence threshold
 * @returns Whether the tag meets the credence threshold
 */
export function meetsCredenceThreshold(credenceScore: number, minCredence: number): boolean {
  return credenceScore >= minCredence;
}

/**
 * Get a human-readable credence level label
 *
 * @param score - The credence score (0.0 to 1.0)
 * @returns A human-readable label
 */
export function getCredenceLabel(score: number): string {
  if (score >= 0.9) return 'Highly Trusted';
  if (score >= 0.7) return 'Trusted';
  if (score >= 0.5) return 'Moderate';
  if (score >= 0.3) return 'Low';
  return 'Unverified';
}

/**
 * Determine the recommended visibility boost based on confirmations
 *
 * Tags with multiple confirmations may be promoted for higher visibility
 *
 * @param confirmationCount - Number of confirmations
 * @param disputeCount - Number of disputes
 * @returns The visibility boost factor (1.0 = no boost)
 */
export function getVisibilityBoost(confirmationCount: number, disputeCount: number): number {
  const netConfirmations = confirmationCount - disputeCount;

  if (netConfirmations >= 10) return 2.0; // Double visibility
  if (netConfirmations >= 5) return 1.5;  // 50% boost
  if (netConfirmations >= 3) return 1.25; // 25% boost
  if (netConfirmations >= 1) return 1.1;  // 10% boost

  return 1.0; // No boost
}

/**
 * Check if a creator type is a trusted source
 *
 * @param creatorType - The creator type to check
 * @returns Whether the creator type is trusted
 */
export function isTrustedCreator(creatorType: CreatorType): boolean {
  return TRUSTED_CREATOR_TYPES.includes(creatorType);
}

// Export constants for testing and configuration
export const CREDENCE_CONSTANTS = {
  BASE_CREDENCE,
  CONFIRMATION_BONUS,
  DISPUTE_PENALTY,
  VERIFIED_CREATOR_BONUS,
  MIN_CREDENCE,
  MAX_CREDENCE,
  MAX_CONFIRMATION_IMPACT,
  MAX_DISPUTE_IMPACT,
  TRUSTED_CREATOR_TYPES,
  VERIFIED_LEVELS,
} as const;
