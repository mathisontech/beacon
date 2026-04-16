import { z } from 'zod';

// ============================================================================
// Enums for Community Posts
// ============================================================================

/**
 * Post types for the community feed
 * - STORY: "People Helping People" heartwarming stories
 * - INCIDENT_REPORT: "Crazy Stuff" incident reports
 */
export const PostTypeEnum = z.enum([
  'STORY',
  'INCIDENT_REPORT',
]);

export const ReviewStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'FLAGGED',
  'REJECTED',
  'AUTO_APPROVED',
]);

export const PostStatusEnum = z.enum([
  'DRAFT',
  'PUBLISHED',
  'HIDDEN',
  'ARCHIVED',
  'DELETED',
]);

// Sorting options
export const SortOptionEnum = z.enum(['hot', 'new', 'top']);
export const TimeframeEnum = z.enum(['day', 'week', 'month', 'all']);

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Query parameters for listing posts
 */
export const listPostsQuerySchema = z.object({
  // Filter by post type
  type: PostTypeEnum.optional(),

  // Sorting
  sort: SortOptionEnum.default('hot'),

  // Timeframe for "top" sorting
  timeframe: TimeframeEnum.default('week'),

  // Filter by event
  eventId: z.string().uuid().optional(),

  // Location-based filter (bounding box)
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),

  // Filter by review status (for moderation)
  reviewStatus: ReviewStatusEnum.optional(),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine(
  (data) => {
    // If any bbox param is provided, all must be provided
    const bboxParams = [data.minLat, data.maxLat, data.minLng, data.maxLng];
    const hasSomeBbox = bboxParams.some((p) => p !== undefined);
    const hasAllBbox = bboxParams.every((p) => p !== undefined);
    return !hasSomeBbox || hasAllBbox;
  },
  { message: 'All bounding box parameters (minLat, maxLat, minLng, maxLng) must be provided together' }
);

/**
 * Schema for creating a new post
 */
export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(10000),
  postType: PostTypeEnum,

  // Optional location
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationName: z.string().max(255).optional(),

  // Media
  imageUrls: z.array(z.string().url()).max(10).default([]),

  // Associated event
  eventId: z.string().uuid().optional(),

  // Flag for official review
  flagForReview: z.boolean().default(false),
});

/**
 * Schema for updating a post
 */
export const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).max(10000).optional(),

  // Optional location update
  locationLat: z.number().min(-90).max(90).nullable().optional(),
  locationLng: z.number().min(-180).max(180).nullable().optional(),
  locationName: z.string().max(255).nullable().optional(),

  // Media
  imageUrls: z.array(z.string().url()).max(10).optional(),

  // Event association
  eventId: z.string().uuid().nullable().optional(),

  // Flag for official review
  flagForReview: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Schema for post ID parameter
 */
export const postIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
});

/**
 * Schema for voting on a post
 * Vote value: +1 for upvote, -1 for downvote
 */
export const voteSchema = z.object({
  vote: z.number().int().refine(
    (val) => val === 1 || val === -1,
    { message: 'Vote must be +1 (upvote) or -1 (downvote)' }
  ),
});

// ============================================================================
// Comment Schemas
// ============================================================================

/**
 * Schema for creating a comment
 */
export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().uuid().optional(), // For nested replies
});

/**
 * Schema for comment ID parameter
 */
export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID format'),
  commentId: z.string().uuid('Invalid comment ID format'),
});

/**
 * Query parameters for listing comments
 */
export const listCommentsQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),

  // Sort order
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Include nested replies
  includeReplies: z.coerce.boolean().default(true),
});

// ============================================================================
// Type Exports
// ============================================================================

export type PostType = z.infer<typeof PostTypeEnum>;
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;
export type PostStatus = z.infer<typeof PostStatusEnum>;
export type SortOption = z.infer<typeof SortOptionEnum>;
export type Timeframe = z.infer<typeof TimeframeEnum>;

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostIdParam = z.infer<typeof postIdParamSchema>;
export type VoteInput = z.infer<typeof voteSchema>;

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentIdParam = z.infer<typeof commentIdParamSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
