import { NextResponse } from 'next/server';

// Custom JSON serializer that handles BigInt
function serializeJSON(obj: any): string {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta']
): NextResponse<ApiSuccessResponse<T>> {
  const response = {
    success: true,
    data,
    message,
    meta,
  };
  
  return new NextResponse(serializeJSON(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  const response = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  
  return new NextResponse(serializeJSON(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', message, undefined, 401);
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return errorResponse('FORBIDDEN', message, undefined, 403);
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', message, undefined, 404);
}

export function validationErrorResponse(details: any): NextResponse<ApiErrorResponse> {
  return errorResponse('VALIDATION_ERROR', 'Validation failed', details, 400);
}

export function serverErrorResponse(
  message: string = 'Internal server error'
): NextResponse<ApiErrorResponse> {
  return errorResponse('SERVER_ERROR', message, undefined, 500);
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(error.code, error.message, error.details, error.status);
  }

  if (error instanceof Error) {
    return serverErrorResponse(error.message);
  }

  return serverErrorResponse('An unexpected error occurred');
}
