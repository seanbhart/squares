/**
 * API error handling utilities
 */

import { NextResponse } from 'next/server';
import { ERROR_CODES } from './config';

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create standardized error responses
 */
export function errorResponse(
  error: string,
  message: string,
  statusCode: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error,
      message,
      ...(details && { details }),
    },
    { status: statusCode }
  );
}

/**
 * Invalid request error
 */
export function invalidRequestError(message: string, details?: Record<string, unknown>): NextResponse {
  return errorResponse(ERROR_CODES.INVALID_REQUEST, message, 400, details);
}

/**
 * Authentication required error
 */
export function authenticationRequiredError(message: string = 'Invalid or missing API key'): NextResponse {
  return errorResponse(ERROR_CODES.AUTHENTICATION_REQUIRED, message, 401);
}

/**
 * Invalid API key error
 */
export function invalidApiKeyError(): NextResponse {
  return errorResponse(ERROR_CODES.INVALID_API_KEY, 'Invalid API key format or value', 401);
}

/**
 * API key revoked error
 */
export function apiKeyRevokedError(reason?: string): NextResponse {
  return errorResponse(
    ERROR_CODES.API_KEY_REVOKED,
    'This API key has been revoked',
    401,
    reason ? { reason } : undefined
  );
}

/**
 * API key expired error
 */
export function apiKeyExpiredError(): NextResponse {
  return errorResponse(ERROR_CODES.API_KEY_EXPIRED, 'This API key has expired', 401);
}

/**
 * API key suspended error
 */
export function apiKeySuspendedError(): NextResponse {
  return errorResponse(ERROR_CODES.API_KEY_SUSPENDED, 'This API key has been suspended', 403);
}

/**
 * Rate limit exceeded error
 */
export function rateLimitError(retryAfter: number): NextResponse {
  const response = NextResponse.json(
    {
      error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retry_after: retryAfter,
    },
    { status: 429 }
  );
  
  response.headers.set('Retry-After', retryAfter.toString());
  return response;
}

/**
 * Feature not available error
 */
export function featureNotAvailableError(feature: string, tier: string): NextResponse {
  return errorResponse(
    ERROR_CODES.FEATURE_NOT_AVAILABLE,
    `Feature '${feature}' is not available on ${tier} tier`,
    403,
    { feature, tier }
  );
}

/**
 * Service unavailable error
 */
export function serviceUnavailableError(reason: string, details?: Record<string, unknown>): NextResponse {
  return errorResponse(ERROR_CODES.SERVICE_UNAVAILABLE, reason, 503, details);
}

/**
 * Internal server error
 */
export function internalError(message: string = 'Internal server error'): NextResponse {
  return errorResponse(ERROR_CODES.INTERNAL_ERROR, message, 500);
}

/**
 * Handle unknown errors
 */
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.statusCode, error.details);
  }
  
  if (error instanceof Error) {
    return internalError(error.message);
  }
  
  return internalError('An unexpected error occurred');
}
