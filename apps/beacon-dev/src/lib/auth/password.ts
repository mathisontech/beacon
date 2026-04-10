/**
 * Password Utilities for Beacon Admin
 *
 * Handles password generation, strength checking, and hashing.
 */

import { hash, compare } from 'bcryptjs';

const SALT_ROUNDS = 12;

// Character sets for password generation
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*';

/**
 * Generate a secure random temporary password
 * 12 characters: mix of uppercase, lowercase, numbers, symbols
 */
export function generateTemporaryPassword(): string {
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

  // Ensure at least one of each type
  const password: string[] = [
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];

  // Fill remaining 8 characters randomly
  for (let i = 0; i < 8; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the array using Fisher-Yates
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

/**
 * Check password strength and return score with details
 */
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters');
  }

  // Character variety checks
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Common patterns (penalize)
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/, // Repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('Avoid common patterns');
      break;
    }
  }

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 3) {
    strength = 'weak';
  } else if (score <= 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score: Math.max(0, Math.min(score, 7)),
    feedback,
  };
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

/**
 * Generate the next employee ID (EMP001, EMP002, etc.)
 */
export function generateNextEmployeeId(lastId: string | null): string {
  let nextNum = 1;
  if (lastId) {
    const match = lastId.match(/EMP(\d+)/);
    if (match) {
      nextNum = parseInt(match[1]) + 1;
    }
  }
  return `EMP${nextNum.toString().padStart(3, '0')}`;
}
