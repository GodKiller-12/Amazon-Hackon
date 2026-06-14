import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getConversationRepository } from '@/repositories';
import { withAuth } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';

type RouteContext = { params: Promise<{ id: string }> };

async function handleGet(
  _request: NextRequest,
  user: AuthUser,
  context: RouteContext
) {
  try {
    const { id: conversationId } = await context.params;

    if (!conversationId) {
      return errorResponse('VALIDATION_ERROR', 'Conversation ID is required', 400);
    }

    const conversationRepo = getConversationRepository();
    const messages = await conversationRepo.getMessages(user.userId, conversationId);

    return successResponse({ conversationId, messages });
  } catch (error) {
    console.error('[conversations/[id]] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { withAuth: withAuthFn } = await import('@/lib/auth/middleware');
  const handler = withAuthFn(async (req: NextRequest, user: AuthUser) => {
    return handleGet(req, user, context);
  });
  return handler(request);
}
