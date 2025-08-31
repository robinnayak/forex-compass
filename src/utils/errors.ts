import { ErrorState } from '@/types/errors';
import axios, { AxiosError } from 'axios';

/**
 * Extracts error data from API response
 */
function extractErrorData(data: unknown): {
  message?: string;
  code?: string;
  details?: string;
  error?: unknown;
} {
  if (!data || typeof data !== 'object') {
    return {};
  }

  // Type assertion to access properties safely
  const errorData = data as Record<string, unknown>;
  
  return {
    message: (errorData.message as string) || (errorData.error_message as string),
    code: (errorData.code as string) || (errorData.error_code as string),
    details: (errorData.details as string) || (errorData.error_details as string),
    error: errorData.error
  };
}

/**
 * Parses errors from various sources into a consistent format
 */
export function parseError(error: unknown): ErrorState {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data;
    
    // Extract error information from response data if available
    const errorData = extractErrorData(responseData);
    
    // Try to parse custom error object if present
    let customError = errorData.error;
    
    // If the error field is a string that looks like JSON, try to parse it
    if (typeof customError === 'string' && 
        (customError.startsWith('{') || customError.startsWith('['))) {
      try {
        customError = JSON.parse(customError);
      } catch {
        // If parsing fails, keep the original string
      }
    }
    
    // Construct the error state with priority given to custom error fields
    return {
      status: axiosError.response?.status,
      message: errorData.message || axiosError.message || 'Request failed',
      code: errorData.code || axiosError.code || `HTTP${axiosError.response?.status}`,
      details: errorData.details || axiosError.response?.statusText,
      resError: customError || errorData || axiosError.message
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message || 'An error occurred',
      code: error.name,
      resError: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    // Check if the string is a JSON
    try {
      const jsonError = JSON.parse(error);
      if (typeof jsonError === 'object') {
        const errorData = extractErrorData(jsonError);
        return {
          message: errorData.message || 'Error from server',
          code: errorData.code,
          details: errorData.details,
          resError: jsonError
        };
      }
    } catch {
      // Not a JSON string, use as is
    }
    
    return {
      message: error,
      resError: error
    };
  }
  
  // Handle direct error objects
  if (error && typeof error === 'object') {
    const errorData = extractErrorData(error);
    return {
      message: errorData.message || 'Unknown error object',
      code: errorData.code,
      details: errorData.details,
      resError: error
    };
  }
  
  // Handle unknown error types
  return {
    message: 'An unknown error occurred',
    resError: error || 'Unknown error'
  };
}

/**
 * Maps error status codes to user-friendly messages
 */
export function getErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid';
    case 401:
      return 'You need to be authenticated to access this resource';
    case 403:
      return 'You don\'t have permission to access this resource';
    case 404:
      return 'The requested resource could not be found';
    case 429:
      return 'Too many requests. Please try again later';
    case 500:
      return 'Internal server error. Please try again later';
    case 503:
      return 'Service unavailable. Please try again later';
    default:
      return 'An error occurred while processing your request';
  }
}

/**
 * Gets a user-friendly message from an error object
 */
export function getFriendlyErrorMessage(error: ErrorState): string {
  // If we have a specific message in the error, use that
  if (error.message) {
    return error.message;
  }
  
  // Otherwise, use the status code to get a generic message
  return getErrorMessage(error.status);
}

/**
 * Type guard to check if resError exists
 */
export function hasError(resError: unknown): boolean {
  return resError !== null && resError !== undefined;
}

/**
 * Formats resError for display in development environments
 */
export function formatErrorForDisplay(resError: unknown): string {
  if (resError === null || resError === undefined) return '';
  
  try {
    if (typeof resError === 'string') {
      return resError;
    }
    
    return JSON.stringify(resError, null, 2);
  } catch {
    // If JSON stringification fails, convert to string
    return String(resError);
  }
}