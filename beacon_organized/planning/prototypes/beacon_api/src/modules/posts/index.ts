import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, optionalAuth } from '../auth/middleware.js';
import type { AuthenticatedRequest, OptionalAuthRequest } from '../auth/middleware.js';
import {
  listPostsQuerySchema,
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  voteSchema,
  type ListPostsQuery,
  type CreatePostInput,
  type UpdatePostInput,
  type PostIdParam,
  type VoteInput,
} from './schemas.js';
import {
  applyPostSorting,
  enrichPostWithScores,
  getPrismaTimeframeFilter,
  type PostForSorting,
} from './sorting.js';
import { commentRoutes } from './comments.js';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map the schema PostType to the Prisma PostType
 * STORY -> THANK_YOU (heartwarming stories)
 * INCIDENT_REPORT -> SITUATION_REPORT (crazy stuff incidents)
 */
function mapPostTypeToPrisma(type: 'STORY' | 'INCIDENT_REPORT'): string {
  switch (type) {
    case 'STORY':
      return 'THANK_YOU';
    case 'INCIDENT_REPORT':
      return 'SITUATION_REPORT';
    default:
      return type;
  }
}

/**
 * Map Prisma PostType back to the API PostType
 */
function mapPrismaToPostType(prismaType: string): 'STORY' | 'INCIDENT_REPORT' | string {
  switch (prismaType) {
    case 'THANK_YOU':
      return 'STORY';
    case 'SITUATION_REPORT':
      return 'INCIDENT_REPORT';
    default:
      return prismaType;
  }
}

/**
 * Format a post for API response
 */
function formatPostResponse(post: {
  id: string;
  title: string;
  content: string;
  postType: string;
  reviewStatus: string;
  postStatus: string;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  imageUrls: string[];
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  eventId: string | null;
  author: {
    id: string;
    displayName: string | null;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    verificationLevel: string;
  };
  event?: {
    id: string;
    name: string;
    type: string;
  } | null;
}, userVote?: boolean | null) {
  const voteScore = post.upvoteCount - post.downvoteCount;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    postType: mapPrismaToPostType(post.postType),
    reviewStatus: post.reviewStatus,
    postStatus: post.postStatus,
    location: post.locationLat && post.locationLng
      ? {
          lat: post.locationLat,
          lng: post.locationLng,
          name: post.locationName,
        }
      : null,
    imageUrls: post.imageUrls,
    voteScore,
    upvoteCount: post.upvoteCount,
    downvoteCount: post.downvoteCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    userVote: userVote !== undefined ? (userVote === true ? 1 : userVote === false ? -1 : null) : undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      id: post.author.id,
      displayName: post.author.displayName || `${post.author.firstName} ${post.author.lastName.charAt(0)}.`,
      profileImageUrl: post.author.profileImageUrl,
      verificationLevel: post.author.verificationLevel,
    },
    event: post.event
      ? {
          id: post.event.id,
          name: post.event.name,
          type: post.event.type,
        }
      : null,
  };
}

// ============================================================================
// Post Routes
// ============================================================================

export async function postRoutes(fastify: FastifyInstance): Promise<void> {
  // Register comment sub-routes
  await fastify.register(commentRoutes);

  /**
   * GET /api/v1/posts
   * Get posts with sorting and filtering
   * Supports: hot (Wilson score + recency), new (most recent), top (highest score)
   */
  fastify.get<{
    Querystring: ListPostsQuery;
  }>(
    '/',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as OptionalAuthRequest).user?.userId;

      // Validate query params
      const queryResult = listPostsQuerySchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: queryResult.error.flatten(),
        });
      }

      const {
        type,
        sort,
        timeframe,
        eventId,
        reviewStatus,
        minLat,
        maxLat,
        minLng,
        maxLng,
        page,
        limit,
      } = queryResult.data;

      // Build where clause
      const where: Record<string, unknown> = {
        postStatus: 'PUBLISHED',
      };

      // Filter by post type
      if (type) {
        where.postType = mapPostTypeToPrisma(type);
      } else {
        // Default to only STORY and INCIDENT_REPORT types
        where.postType = { in: ['THANK_YOU', 'SITUATION_REPORT'] };
      }

      // Filter by event
      if (eventId) {
        where.eventId = eventId;
      }

      // Filter by review status (for moderation)
      if (reviewStatus) {
        where.reviewStatus = reviewStatus;
      } else {
        // Default: show approved and auto-approved
        where.reviewStatus = { in: ['APPROVED', 'AUTO_APPROVED'] };
      }

      // Bounding box filter
      if (minLat !== undefined && maxLat !== undefined && minLng !== undefined && maxLng !== undefined) {
        where.locationLat = { gte: minLat, lte: maxLat };
        where.locationLng = { gte: minLng, lte: maxLng };
      }

      // Timeframe filter for "top" sorting
      if (sort === 'top') {
        const timeframeFilter = getPrismaTimeframeFilter(timeframe);
        if (timeframeFilter.createdAt) {
          where.createdAt = timeframeFilter.createdAt;
        }
      }

      // Get total count (before sorting/pagination for hot score)
      const totalCount = await prisma.communityPost.count({ where });

      // For "hot" sorting, we need to fetch more records and sort in memory
      // For other sorts, we can use database ordering
      let posts;
      const offset = (page - 1) * limit;

      if (sort === 'hot') {
        // Fetch more posts for hot scoring (up to 500 for proper ranking)
        const fetchLimit = Math.min(totalCount, 500);
        const allPosts = await prisma.communityPost.findMany({
          where,
          take: fetchLimit,
          orderBy: { createdAt: 'desc' }, // Initial order for fetching
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                verificationLevel: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        // Apply hot sorting
        const sortedPosts = applyPostSorting(
          allPosts as unknown as PostForSorting[],
          sort,
          timeframe
        );

        // Apply pagination
        posts = sortedPosts.slice(offset, offset + limit);
      } else if (sort === 'top') {
        // For top, order by vote difference
        posts = await prisma.communityPost.findMany({
          where,
          orderBy: [
            { upvoteCount: 'desc' },
            { createdAt: 'desc' },
          ],
          skip: offset,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                verificationLevel: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });

        // Re-sort by actual vote score
        posts.sort((a, b) => {
          const scoreA = a.upvoteCount - a.downvoteCount;
          const scoreB = b.upvoteCount - b.downvoteCount;
          return scoreB - scoreA;
        });
      } else {
        // "new" - simple date ordering
        posts = await prisma.communityPost.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                verificationLevel: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        });
      }

      // Get user's votes if authenticated
      let userVotes: Map<string, boolean> = new Map();
      if (userId && posts.length > 0) {
        const postIds = posts.map((p) => p.id);
        const votes = await prisma.postVote.findMany({
          where: {
            postId: { in: postIds },
            userId,
          },
          select: {
            postId: true,
            isUpvote: true,
          },
        });
        userVotes = new Map(votes.map((v) => [v.postId, v.isUpvote]));
      }

      // Format response
      const formattedPosts = posts.map((post) => {
        const userVote = userVotes.has(post.id) ? userVotes.get(post.id) : null;
        return formatPostResponse(post as Parameters<typeof formatPostResponse>[0], userVote);
      });

      return reply.status(200).send({
        statusCode: 200,
        data: {
          posts: formattedPosts,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: offset + posts.length < totalCount,
          },
          filters: {
            type,
            sort,
            timeframe: sort === 'top' ? timeframe : undefined,
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/posts
   * Create a new post
   * Requires authentication (public users only)
   */
  fastify.post<{
    Body: CreatePostInput;
  }>(
    '/',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Only public users can create posts
      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only public users can create community posts',
        });
      }

      // Validate body
      const bodyResult = createPostSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const {
        title,
        content,
        postType,
        locationLat,
        locationLng,
        locationName,
        imageUrls,
        eventId,
        flagForReview,
      } = bodyResult.data;

      // Verify event exists if provided
      if (eventId) {
        const event = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, isPublic: true },
        });

        if (!event) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Event not found',
          });
        }

        if (!event.isPublic) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Cannot post to a non-public event',
          });
        }
      }

      // Create post
      const post = await prisma.communityPost.create({
        data: {
          title,
          content,
          postType: mapPostTypeToPrisma(postType) as 'THANK_YOU' | 'SITUATION_REPORT',
          locationLat,
          locationLng,
          locationName,
          imageUrls,
          eventId,
          authorId: userId,
          // If flagged for review, set to PENDING, otherwise AUTO_APPROVED
          reviewStatus: flagForReview ? 'PENDING' : 'AUTO_APPROVED',
          postStatus: 'PUBLISHED',
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              verificationLevel: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        message: 'Post created successfully',
        data: {
          post: formatPostResponse(post as Parameters<typeof formatPostResponse>[0]),
        },
      });
    }
  );

  /**
   * GET /api/v1/posts/:id
   * Get a single post with comments
   */
  fastify.get<{
    Params: PostIdParam;
  }>(
    '/:id',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as OptionalAuthRequest).user?.userId;

      // Validate params
      const paramsResult = postIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;

      // Fetch post
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              verificationLevel: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          comments: {
            where: {
              parentId: null, // Top-level comments only
              reviewStatus: { not: 'REJECTED' },
            },
            orderBy: { createdAt: 'asc' },
            take: 20, // Initial comments
            include: {
              author: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                  verificationLevel: true,
                },
              },
              replies: {
                where: { reviewStatus: { not: 'REJECTED' } },
                orderBy: { createdAt: 'asc' },
                take: 5, // Initial replies
                include: {
                  author: {
                    select: {
                      id: true,
                      displayName: true,
                      firstName: true,
                      lastName: true,
                      profileImageUrl: true,
                      verificationLevel: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      if (post.postStatus === 'DELETED') {
        return reply.status(410).send({
          statusCode: 410,
          error: 'Gone',
          message: 'This post has been deleted',
        });
      }

      // Increment view count (fire and forget)
      prisma.communityPost.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {
        // Silently ignore view count errors
      });

      // Get user's vote if authenticated
      let userVote: boolean | null = null;
      if (userId) {
        const vote = await prisma.postVote.findUnique({
          where: {
            postId_userId: { postId, userId },
          },
          select: { isUpvote: true },
        });
        userVote = vote?.isUpvote ?? null;
      }

      // Format comments
      const formattedComments = post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: comment.author.id,
          displayName: comment.author.displayName || `${comment.author.firstName} ${comment.author.lastName.charAt(0)}.`,
          profileImageUrl: comment.author.profileImageUrl,
          verificationLevel: comment.author.verificationLevel,
        },
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          author: {
            id: reply.author.id,
            displayName: reply.author.displayName || `${reply.author.firstName} ${reply.author.lastName.charAt(0)}.`,
            profileImageUrl: reply.author.profileImageUrl,
            verificationLevel: reply.author.verificationLevel,
          },
        })),
        hasMoreReplies: comment.replies.length >= 5,
      }));

      const formattedPost = formatPostResponse(post as Parameters<typeof formatPostResponse>[0], userVote);

      return reply.status(200).send({
        statusCode: 200,
        data: {
          post: {
            ...formattedPost,
            comments: formattedComments,
            hasMoreComments: post.comments.length >= 20,
          },
        },
      });
    }
  );

  /**
   * PUT /api/v1/posts/:id
   * Update a post (author only)
   * Requires authentication
   */
  fastify.put<{
    Params: PostIdParam;
    Body: UpdatePostInput;
  }>(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = (request as AuthenticatedRequest).user;

      // Validate params
      const paramsResult = postIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        });
      }

      // Validate body
      const bodyResult = updatePostSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;
      const updateData = bodyResult.data;

      // Find post and verify ownership
      const existingPost = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true, postStatus: true },
      });

      if (!existingPost) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      if (existingPost.authorId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only edit your own posts',
        });
      }

      if (existingPost.postStatus === 'DELETED') {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Cannot edit a deleted post',
        });
      }

      // Build update data
      const prismaUpdate: Record<string, unknown> = {};

      if (updateData.title !== undefined) prismaUpdate.title = updateData.title;
      if (updateData.content !== undefined) prismaUpdate.content = updateData.content;
      if (updateData.locationLat !== undefined) prismaUpdate.locationLat = updateData.locationLat;
      if (updateData.locationLng !== undefined) prismaUpdate.locationLng = updateData.locationLng;
      if (updateData.locationName !== undefined) prismaUpdate.locationName = updateData.locationName;
      if (updateData.imageUrls !== undefined) prismaUpdate.imageUrls = updateData.imageUrls;
      if (updateData.eventId !== undefined) prismaUpdate.eventId = updateData.eventId;

      // If flagging for review
      if (updateData.flagForReview === true) {
        prismaUpdate.reviewStatus = 'PENDING';
      }

      // Update post
      const updatedPost = await prisma.communityPost.update({
        where: { id: postId },
        data: prismaUpdate,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              verificationLevel: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Post updated successfully',
        data: {
          post: formatPostResponse(updatedPost as Parameters<typeof formatPostResponse>[0]),
        },
      });
    }
  );

  /**
   * DELETE /api/v1/posts/:id
   * Delete a post (author only)
   * Requires authentication
   */
  fastify.delete<{
    Params: PostIdParam;
  }>(
    '/:id',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = (request as AuthenticatedRequest).user;

      // Validate params
      const paramsResult = postIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;

      // Find post and verify ownership
      const existingPost = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true },
      });

      if (!existingPost) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      if (existingPost.authorId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only delete your own posts',
        });
      }

      // Soft delete - mark as DELETED
      await prisma.communityPost.update({
        where: { id: postId },
        data: { postStatus: 'DELETED' },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Post deleted successfully',
      });
    }
  );

  /**
   * POST /api/v1/posts/:id/vote
   * Upvote or downvote a post
   * Requires authentication
   */
  fastify.post<{
    Params: PostIdParam;
    Body: VoteInput;
  }>(
    '/:id/vote',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Only public users can vote
      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only public users can vote on posts',
        });
      }

      // Validate params
      const paramsResult = postIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        });
      }

      // Validate body
      const bodyResult = voteSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid vote value',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;
      const { vote } = bodyResult.data;
      const isUpvote = vote === 1;

      // Verify post exists and is published
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, postStatus: true, authorId: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      if (post.postStatus !== 'PUBLISHED') {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Cannot vote on this post',
        });
      }

      // Check for existing vote
      const existingVote = await prisma.postVote.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });

      // Use transaction for vote + count update
      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          // Same vote already exists
          return reply.status(200).send({
            statusCode: 200,
            message: isUpvote ? 'Already upvoted' : 'Already downvoted',
            data: { vote: isUpvote ? 1 : -1 },
          });
        }

        // Change vote direction
        await prisma.$transaction([
          prisma.postVote.update({
            where: { id: existingVote.id },
            data: { isUpvote },
          }),
          prisma.communityPost.update({
            where: { id: postId },
            data: isUpvote
              ? { upvoteCount: { increment: 1 }, downvoteCount: { decrement: 1 } }
              : { upvoteCount: { decrement: 1 }, downvoteCount: { increment: 1 } },
          }),
        ]);
      } else {
        // Create new vote
        await prisma.$transaction([
          prisma.postVote.create({
            data: {
              postId,
              userId,
              isUpvote,
            },
          }),
          prisma.communityPost.update({
            where: { id: postId },
            data: isUpvote
              ? { upvoteCount: { increment: 1 } }
              : { downvoteCount: { increment: 1 } },
          }),
        ]);
      }

      // Get updated vote counts
      const updatedPost = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { upvoteCount: true, downvoteCount: true },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: isUpvote ? 'Upvoted successfully' : 'Downvoted successfully',
        data: {
          vote: isUpvote ? 1 : -1,
          voteScore: (updatedPost?.upvoteCount ?? 0) - (updatedPost?.downvoteCount ?? 0),
          upvoteCount: updatedPost?.upvoteCount ?? 0,
          downvoteCount: updatedPost?.downvoteCount ?? 0,
        },
      });
    }
  );

  /**
   * DELETE /api/v1/posts/:id/vote
   * Remove vote from a post
   * Requires authentication
   */
  fastify.delete<{
    Params: PostIdParam;
  }>(
    '/:id/vote',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = (request as AuthenticatedRequest).user;

      // Validate params
      const paramsResult = postIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid post ID',
          details: paramsResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;

      // Find existing vote
      const existingVote = await prisma.postVote.findUnique({
        where: {
          postId_userId: { postId, userId },
        },
      });

      if (!existingVote) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'No vote found to remove',
        });
      }

      // Remove vote and update count
      await prisma.$transaction([
        prisma.postVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: existingVote.isUpvote
            ? { upvoteCount: { decrement: 1 } }
            : { downvoteCount: { decrement: 1 } },
        }),
      ]);

      // Get updated vote counts
      const updatedPost = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { upvoteCount: true, downvoteCount: true },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Vote removed successfully',
        data: {
          vote: null,
          voteScore: (updatedPost?.upvoteCount ?? 0) - (updatedPost?.downvoteCount ?? 0),
          upvoteCount: updatedPost?.upvoteCount ?? 0,
          downvoteCount: updatedPost?.downvoteCount ?? 0,
        },
      });
    }
  );
}
