import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../auth/middleware.js';
import type { AuthenticatedRequest } from '../auth/middleware.js';
import {
  createCommentSchema,
  commentIdParamSchema,
  listCommentsQuerySchema,
  postIdParamSchema,
  type CreateCommentInput,
  type CommentIdParam,
  type ListCommentsQuery,
  type PostIdParam,
} from './schemas.js';

/**
 * Comment routes for community posts
 * Handles creating, listing, and deleting comments
 */
export async function commentRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/v1/posts/:id/comments
   * Get all comments for a specific post
   */
  fastify.get<{
    Params: PostIdParam;
    Querystring: ListCommentsQuery;
  }>(
    '/:id/comments',
    async (request: FastifyRequest, reply: FastifyReply) => {
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

      // Validate query
      const queryResult = listCommentsQuerySchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid query parameters',
          details: queryResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;
      const { page, limit, sortBy, sortOrder, includeReplies } = queryResult.data;
      const offset = (page - 1) * limit;

      // Verify post exists
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, postStatus: true },
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

      // Build where clause
      const where: Record<string, unknown> = {
        postId,
        reviewStatus: { not: 'REJECTED' },
      };

      // If not including replies, only get top-level comments
      if (!includeReplies) {
        where.parentId = null;
      }

      // Get total count
      const totalCount = await prisma.postComment.count({ where });

      // Fetch comments
      const comments = await prisma.postComment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
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
          // Include replies if top-level comments only
          ...(includeReplies
            ? {}
            : {
                replies: {
                  where: { reviewStatus: { not: 'REJECTED' } },
                  orderBy: { createdAt: 'asc' },
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
              }),
        },
      });

      // Format comments with author display name
      const formattedComments = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        parentId: comment.parentId,
        author: {
          id: comment.author.id,
          displayName: comment.author.displayName || `${comment.author.firstName} ${comment.author.lastName.charAt(0)}.`,
          profileImageUrl: comment.author.profileImageUrl,
          verificationLevel: comment.author.verificationLevel,
        },
        replies: 'replies' in comment
          ? (comment.replies as unknown as Array<{
              id: string;
              content: string;
              createdAt: Date;
              updatedAt: Date;
              parentId: string | null;
              author: {
                id: string;
                displayName: string | null;
                firstName: string;
                lastName: string;
                profileImageUrl: string | null;
                verificationLevel: string;
              };
            }>).map((reply) => ({
              id: reply.id,
              content: reply.content,
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt,
              parentId: reply.parentId,
              author: {
                id: reply.author.id,
                displayName: reply.author.displayName || `${reply.author.firstName} ${reply.author.lastName.charAt(0)}.`,
                profileImageUrl: reply.author.profileImageUrl,
                verificationLevel: reply.author.verificationLevel,
              },
            }))
          : undefined,
      }));

      return reply.status(200).send({
        statusCode: 200,
        data: {
          comments: formattedComments,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: offset + comments.length < totalCount,
          },
        },
      });
    }
  );

  /**
   * POST /api/v1/posts/:id/comments
   * Add a comment to a post
   * Requires authentication
   */
  fastify.post<{
    Params: PostIdParam;
    Body: CreateCommentInput;
  }>(
    '/:id/comments',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId, userType } = (request as AuthenticatedRequest).user;

      // Only public users can comment
      if (userType !== 'public') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Only public users can comment on posts',
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
      const bodyResult = createCommentSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: bodyResult.error.flatten(),
        });
      }

      const { id: postId } = paramsResult.data;
      const { content, parentId } = bodyResult.data;

      // Verify post exists and is published
      const post = await prisma.communityPost.findUnique({
        where: { id: postId },
        select: { id: true, postStatus: true },
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
          message: 'Cannot comment on this post',
        });
      }

      // If replying to a comment, verify parent exists
      if (parentId) {
        const parentComment = await prisma.postComment.findFirst({
          where: {
            id: parentId,
            postId,
          },
        });

        if (!parentComment) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Parent comment not found',
          });
        }
      }

      // Create comment and update comment count in a transaction
      const [comment] = await prisma.$transaction([
        prisma.postComment.create({
          data: {
            content,
            postId,
            authorId: userId,
            parentId: parentId || null,
            reviewStatus: 'AUTO_APPROVED',
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
          },
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { commentCount: { increment: 1 } },
        }),
      ]);

      return reply.status(201).send({
        statusCode: 201,
        message: 'Comment added successfully',
        data: {
          comment: {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            parentId: comment.parentId,
            author: {
              id: comment.author.id,
              displayName: comment.author.displayName || `${comment.author.firstName} ${comment.author.lastName.charAt(0)}.`,
              profileImageUrl: comment.author.profileImageUrl,
              verificationLevel: comment.author.verificationLevel,
            },
          },
        },
      });
    }
  );

  /**
   * DELETE /api/v1/posts/:id/comments/:commentId
   * Delete a comment (author only)
   * Requires authentication
   */
  fastify.delete<{
    Params: CommentIdParam;
  }>(
    '/:id/comments/:commentId',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = (request as AuthenticatedRequest).user;

      // Validate params
      const paramsResult = commentIdParamSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid parameters',
          details: paramsResult.error.flatten(),
        });
      }

      const { id: postId, commentId } = paramsResult.data;

      // Find the comment
      const comment = await prisma.postComment.findFirst({
        where: {
          id: commentId,
          postId,
        },
        select: {
          id: true,
          authorId: true,
          postId: true,
        },
      });

      if (!comment) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Comment not found',
        });
      }

      // Check if user is the author
      if (comment.authorId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only delete your own comments',
        });
      }

      // Delete comment and update count in a transaction
      // Also delete any replies to this comment
      const [deletedRepliesCount] = await prisma.$transaction([
        prisma.postComment.deleteMany({
          where: { parentId: commentId },
        }),
        prisma.postComment.delete({
          where: { id: commentId },
        }),
        // We'll update the count after knowing how many were deleted
      ]);

      // Update comment count (original comment + replies)
      const totalDeleted = deletedRepliesCount.count + 1;
      await prisma.communityPost.update({
        where: { id: postId },
        data: { commentCount: { decrement: totalDeleted } },
      });

      return reply.status(200).send({
        statusCode: 200,
        message: 'Comment deleted successfully',
      });
    }
  );
}

export default commentRoutes;
