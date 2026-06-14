import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getConversationRepository } from '@/repositories';

const DEFAULT_USER_ID = 'default-user';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: conversationId } = await context.params;

    if (!conversationId) {
      return errorResponse('VALIDATION_ERROR', 'Conversation ID is required', 400);
    }

    const conversationRepo = getConversationRepository();
    const messages = await conversationRepo.getMessages(DEFAULT_USER_ID, conversationId);

    return successResponse({ conversationId, messages });
  } catch (error) {
    console.error('[conversations/[id]] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
