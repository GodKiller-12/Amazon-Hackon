import { type NextRequest } from 'next/server';
import { AuthUser, AuthResult } from './types';
import { verifyToken } from './jwtVerifier';
import { authenticateLocal } from './localAuth';
import { errorResponse } from '@/lib/api-response';

function isLocalMode(): boolean {
  return process.env.AUTH_MODE !== 'cognito';
}

/**
 * Extracts and verifies the authenticated user from a request.
 * Returns AuthResult with user info or error.
 *
 * Token can be in:
 * - Authorization header: "Bearer <token>"
 * - Cookie: "access_token=<token>"
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('access_token')?.value;

  // Local mode: skip real verification
  if (isLocalMode()) {
    return authenticateLocal(authHeader);
  }

  // Extract token from header or cookie
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return {
      authenticated: false,
      user: null,
      error: 'No authentication token provided',
    };
  }

  try {
    const user = await verifyToken(token);
    return { authenticated: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';
    return { authenticated: false, user: null, error: message };
  }
}

/**
 * Higher-order function that wraps a route handler with auth protection.
 * Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const result = await authenticateRequest(request);

    if (!result.authenticated || !result.user) {
      return errorResponse(
        'UNAUTHORIZED',
        result.error || 'Authentication required',
        401
      );
    }

    return handler(request, result.user);
  };
}

/**
 * Optional auth — extracts user if token present, continues without if not.
 * Useful for routes that work both authenticated and unauthenticated.
 */
export function withOptionalAuth(
  handler: (request: NextRequest, user: AuthUser | null) => Promise<Response>
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest) => {
    const result = await authenticateRequest(request);
    return handler(request, result.user);
  };
}
