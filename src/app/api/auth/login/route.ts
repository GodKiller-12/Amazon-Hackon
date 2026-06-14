import { type NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { loginSchema } from '@/schemas/auth.schema';
import { successResponse, errorResponse } from '@/lib/api-response';
import * as cognitoService from '@/lib/auth/cognitoService';
import { localLogin } from '@/lib/auth/localAuth';

function isLocalMode(): boolean {
  return process.env.AUTH_MODE !== 'cognito';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    if (isLocalMode()) {
      const tokens = localLogin(validated.username);
      return successResponse(tokens);
    }

    const tokens = await cognitoService.login(validated);
    return successResponse(tokens);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return errorResponse('VALIDATION_ERROR', 'Invalid request body', 400, details);
    }

    console.error('[auth/login] Unexpected error:', error);
    return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
