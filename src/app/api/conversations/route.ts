import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getConversationRepository } from '@/repositories';
import { withAuth } from '@/lib/auth/middleware';
import { AuthUser } from '@/lib/auth/types';

function generateConversationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `conv-${timestamp}-${random}`;
}

export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    const body = await request.json().catch(() => ({}));
    const situationLabel = (body as { situationLabel?: string }).situationLabel || '';

    const conversationId = generateConversationId();
    const conversationRepo = getConversationRepository();
    await conversationRepo.create(user.userId, conversationId, situationLabel);

    return successResponse({ conversationId }, 201);
  } catch (error) {
    console.error('[conversations] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
