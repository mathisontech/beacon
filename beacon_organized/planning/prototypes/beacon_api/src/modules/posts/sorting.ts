/**
 * Reddit-style sorting algorithms for community posts
 *
 * This module implements various sorting strategies:
 * - hot: Score based on votes and recency (Wilson score confidence interval)
 * - new: Most recent first
 * - top: Highest vote score, filtered by timeframe
 */

import type { Timeframe } from './schemas.js';

// ============================================================================
// Types
// ============================================================================

export interface PostForSorting {
  id: string;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: Date;
}

export interface ScoredPost extends PostForSorting {
  hotScore: number;
  voteScore: number;
}

// ============================================================================
// Wilson Score Confidence Interval
// ============================================================================

/**
 * Calculate the lower bound of Wilson score confidence interval
 * This is the algorithm Reddit uses for ranking comments/posts
 *
 * The Wilson score gives a confidence interval for the true proportion
 * of upvotes. Using the lower bound ensures that posts with few votes
 * but high ratios don't unfairly rank above posts with many votes.
 *
 * @param upvotes - Number of upvotes
 * @param downvotes - Number of downvotes
 * @param confidence - Confidence level (default 0.95 for 95% confidence)
 * @returns Wilson score lower bound (0 to 1)
 */
export function wilsonScore(upvotes: number, downvotes: number, confidence = 0.95): number {
  const n = upvotes + downvotes;

  if (n === 0) {
    return 0;
  }

  // Z-score for confidence level (1.96 for 95%, 1.645 for 90%)
  // Using a lookup for common values to avoid external dependency
  const zScores: Record<number, number> = {
    0.80: 1.28,
    0.85: 1.44,
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };
  const z = zScores[confidence] || 1.96;

  const phat = upvotes / n;
  const zSquared = z * z;

  // Wilson score lower bound formula
  const numerator = phat + zSquared / (2 * n) - z * Math.sqrt((phat * (1 - phat) + zSquared / (4 * n)) / n);
  const denominator = 1 + zSquared / n;

  return numerator / denominator;
}

// ============================================================================
// Hot Score Algorithm
// ============================================================================

/**
 * Calculate "hot" score for a post
 *
 * Combines Wilson score with time decay to rank posts by both
 * quality (vote ratio) and recency. Newer posts get a boost,
 * but high-quality older posts can still compete.
 *
 * The algorithm:
 * 1. Calculate Wilson score for vote quality
 * 2. Apply logarithmic vote magnitude boost
 * 3. Apply time decay factor
 *
 * @param post - Post with vote counts and creation time
 * @returns Hot score (higher = more "hot")
 */
export function calculateHotScore(post: PostForSorting): number {
  const { upvoteCount, downvoteCount, createdAt } = post;

  // Calculate base Wilson score
  const wilson = wilsonScore(upvoteCount, downvoteCount);

  // Calculate vote magnitude (log scale to prevent runaway scores)
  const totalVotes = upvoteCount + downvoteCount;
  const voteScore = upvoteCount - downvoteCount;
  const magnitudeBoost = totalVotes > 0 ? Math.log10(Math.max(totalVotes, 1)) : 0;

  // Sign of the score determines direction
  const sign = voteScore >= 0 ? 1 : -1;

  // Time decay: posts lose "heat" over time
  // Half-life of approximately 12 hours
  const ageInHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const halfLife = 12; // hours
  const timeFactor = Math.pow(0.5, ageInHours / halfLife);

  // Combine factors:
  // - Wilson score ensures quality ratio
  // - Magnitude boost rewards engagement
  // - Time factor ensures freshness
  // - Add small constant to prevent zero scores
  const hotScore = (wilson * 10 + sign * magnitudeBoost + 1) * timeFactor;

  return Math.max(hotScore, 0.001); // Ensure positive score
}

// ============================================================================
// Sorting Functions
// ============================================================================

/**
 * Sort posts by "hot" score (vote quality + recency)
 */
export function sortByHot<T extends PostForSorting>(posts: T[]): T[] {
  const scored = posts.map((post) => ({
    post,
    score: calculateHotScore(post),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.post);
}

/**
 * Sort posts by creation date (newest first)
 */
export function sortByNew<T extends PostForSorting>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Sort posts by vote score (highest first)
 * Used for "top" sorting with timeframe filtering
 */
export function sortByTop<T extends PostForSorting>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const scoreA = a.upvoteCount - a.downvoteCount;
    const scoreB = b.upvoteCount - b.downvoteCount;

    // If scores are equal, prefer newer posts
    if (scoreB === scoreA) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    return scoreB - scoreA;
  });
}

/**
 * Get the date threshold for a given timeframe
 */
export function getTimeframeDate(timeframe: Timeframe): Date | null {
  const now = new Date();

  switch (timeframe) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'all':
      return null; // No time filter
    default:
      return null;
  }
}

/**
 * Filter posts by timeframe
 */
export function filterByTimeframe<T extends PostForSorting>(
  posts: T[],
  timeframe: Timeframe
): T[] {
  const threshold = getTimeframeDate(timeframe);

  if (!threshold) {
    return posts;
  }

  return posts.filter((post) => post.createdAt >= threshold);
}

/**
 * Apply sorting and filtering based on sort option
 */
export function applyPostSorting<T extends PostForSorting>(
  posts: T[],
  sort: 'hot' | 'new' | 'top',
  timeframe: Timeframe = 'week'
): T[] {
  switch (sort) {
    case 'hot':
      return sortByHot(posts);

    case 'new':
      return sortByNew(posts);

    case 'top': {
      const filtered = filterByTimeframe(posts, timeframe);
      return sortByTop(filtered);
    }

    default:
      return sortByHot(posts);
  }
}

// ============================================================================
// Database Query Helpers
// ============================================================================

/**
 * Get Prisma orderBy clause for sorting
 * Note: For "hot" sorting, we need to fetch all and sort in-memory
 * because hot score requires computation
 */
export function getPrismaOrderBy(sort: 'hot' | 'new' | 'top'): {
  orderBy: Record<string, 'asc' | 'desc'>[];
  requiresInMemorySort: boolean;
} {
  switch (sort) {
    case 'new':
      return {
        orderBy: [{ createdAt: 'desc' }],
        requiresInMemorySort: false,
      };

    case 'top':
      // For top, we can use a computed field or sort in memory
      // Since Prisma doesn't support computed fields in orderBy,
      // we fetch ordered by upvoteCount and refine in memory
      return {
        orderBy: [{ upvoteCount: 'desc' }, { createdAt: 'desc' }],
        requiresInMemorySort: true, // Need to recalculate score
      };

    case 'hot':
    default:
      // Hot requires in-memory computation
      return {
        orderBy: [{ createdAt: 'desc' }],
        requiresInMemorySort: true,
      };
  }
}

/**
 * Get Prisma where clause for timeframe filtering
 */
export function getPrismaTimeframeFilter(timeframe: Timeframe): { createdAt?: { gte: Date } } {
  const threshold = getTimeframeDate(timeframe);

  if (!threshold) {
    return {};
  }

  return {
    createdAt: { gte: threshold },
  };
}

// ============================================================================
// Score Calculation Utilities
// ============================================================================

/**
 * Calculate the net vote score for a post
 */
export function calculateVoteScore(upvotes: number, downvotes: number): number {
  return upvotes - downvotes;
}

/**
 * Add computed scores to a post object
 */
export function enrichPostWithScores<T extends PostForSorting>(post: T): T & {
  voteScore: number;
  hotScore: number;
} {
  return {
    ...post,
    voteScore: calculateVoteScore(post.upvoteCount, post.downvoteCount),
    hotScore: calculateHotScore(post),
  };
}
