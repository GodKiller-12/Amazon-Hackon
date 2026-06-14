import { type NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getUserRepository } from '@/repositories';
import { AuthUser } from '@/lib/auth/types';

export const GET = withAuth(async (_request: NextRequest, user: AuthUser) => {
  try {
    const userRepo = getUserRepository();
    const profile = await userRepo.getById(user.userId);

    if (!profile) {
      // Return basic info from token if no profile exists
      return successResponse({
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        name: user.name,
      });
    }

    return successResponse(profile);
  } catch (error) {
    console.error('[auth/me] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
