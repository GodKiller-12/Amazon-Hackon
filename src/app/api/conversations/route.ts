import { type NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getConversationRepository } from '@/repositories';

const DEFAULT_USER_ID = 'default-user';

function generateConversationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `conv-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const situationLabel = (body as { situationLabel?: string }).situationLabel || '';

    const conversationId = generateConversationId();
    const conversationRepo = getConversationRepository();
    await conversationRepo.create(DEFAULT_USER_ID, conversationId, situationLabel);

    return successResponse({ conversationId }, 201);
  } catch (error) {
    console.error('[conversations] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
