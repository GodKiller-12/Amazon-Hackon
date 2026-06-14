/**
 * Standardized API response builders for consistent response shapes.
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: { timestamp: string; requestId: string };
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown };
  meta: { timestamp: string; requestId: string };
}

function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getMeta() {
  return {
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
}

export function successResponse<T>(data: T, status = 200): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: getMeta(),
  };
  return Response.json(body, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
    meta: getMeta(),
  };
  return Response.json(body, { status });
}
