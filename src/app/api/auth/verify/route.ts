import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { verifySchema } from '@/schemas/auth.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import * as cognitoService from '@/lib/auth/cognitoService';

function isLocalMode(): boolean {
  return process.env.AUTH_MODE !== 'cognito';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifySchema.parse(body);

    if (isLocalMode()) {
      return successResponse({ message: 'Account verified' });
    }

    await cognitoService.confirmSignup(validated);
    return successResponse({ message: 'Account verified' });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    console.error('[auth/verify] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
