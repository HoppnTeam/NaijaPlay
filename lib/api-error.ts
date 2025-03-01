import { NextResponse } from 'next/server'

export type ApiErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'AUTH_ERROR'

interface ApiErrorOptions {
  code?: ApiErrorCode
  message?: string
  details?: any
  status?: number
  log?: boolean
}

export class ApiError extends Error {
  code: ApiErrorCode
  status: number
  details?: any
  
  constructor(options: ApiErrorOptions = {}) {
    const {
      code = 'INTERNAL_SERVER_ERROR',
      message,
      details,
      status,
      log = true
    } = options
    
    // Set default message based on code if not provided
    const errorMessage = message || getDefaultMessageForCode(code)
    
    super(errorMessage)
    this.name = 'ApiError'
    this.code = code
    this.details = details
    
    // Set HTTP status code based on error code
    this.status = status || getStatusCodeForErrorCode(code)
    
    // Log error if enabled
    if (log) {
      console.error(`[API Error] ${code}: ${errorMessage}`, {
        details,
        timestamp: new Date().toISOString()
      })
    }
  }
  
  /**
   * Convert the error to a NextResponse object
   */
  toResponse() {
    return NextResponse.json(
      {
        error: {
          code: this.code,
          message: this.message,
          ...(this.details ? { details: this.details } : {})
        }
      },
      { status: this.status }
    )
  }
}

/**
 * Get the default HTTP status code for an error code
 */
function getStatusCodeForErrorCode(code: ApiErrorCode): number {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'METHOD_NOT_ALLOWED':
      return 405
    case 'CONFLICT':
      return 409
    case 'VALIDATION_ERROR':
      return 422
    case 'SERVICE_UNAVAILABLE':
      return 503
    case 'DATABASE_ERROR':
    case 'AUTH_ERROR':
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 500
  }
}

/**
 * Get a default message for an error code
 */
function getDefaultMessageForCode(code: ApiErrorCode): string {
  switch (code) {
    case 'BAD_REQUEST':
      return 'Bad request'
    case 'UNAUTHORIZED':
      return 'Authentication required'
    case 'FORBIDDEN':
      return 'You do not have permission to access this resource'
    case 'NOT_FOUND':
      return 'Resource not found'
    case 'METHOD_NOT_ALLOWED':
      return 'Method not allowed'
    case 'CONFLICT':
      return 'Resource conflict'
    case 'VALIDATION_ERROR':
      return 'Validation error'
    case 'DATABASE_ERROR':
      return 'Database error'
    case 'AUTH_ERROR':
      return 'Authentication error'
    case 'SERVICE_UNAVAILABLE':
      return 'Service temporarily unavailable'
    case 'INTERNAL_SERVER_ERROR':
    default:
      return 'Internal server error'
  }
}

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error.toResponse()
  }
  
  // Convert other errors to ApiError
  const apiError = new ApiError({
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    details: error instanceof Error ? { stack: error.stack } : { error }
  })
  
  return apiError.toResponse()
}

/**
 * Create a not found response
 */
export function notFound(message = 'Resource not found') {
  return new ApiError({
    code: 'NOT_FOUND',
    message
  }).toResponse()
}

/**
 * Create an unauthorized response
 */
export function unauthorized(message = 'Authentication required') {
  return new ApiError({
    code: 'UNAUTHORIZED',
    message
  }).toResponse()
}

/**
 * Create a forbidden response
 */
export function forbidden(message = 'You do not have permission to access this resource') {
  return new ApiError({
    code: 'FORBIDDEN',
    message
  }).toResponse()
}

/**
 * Create a bad request response
 */
export function badRequest(message = 'Bad request', details?: any) {
  return new ApiError({
    code: 'BAD_REQUEST',
    message,
    details
  }).toResponse()
}

/**
 * Create a validation error response
 */
export function validationError(message = 'Validation error', details?: any) {
  return new ApiError({
    code: 'VALIDATION_ERROR',
    message,
    details
  }).toResponse()
} 