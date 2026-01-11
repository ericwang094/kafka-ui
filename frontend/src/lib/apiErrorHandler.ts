/**
 * API Error Handler
 * Handles authentication errors, CORS errors, and session loss during application restart
 */

export interface ApiError {
  status?: number;
  statusText?: string;
  message?: string;
  isCorsError?: boolean;
  isAuthError?: boolean;
}

/**
 * Detects if an error is a CORS error
 */
export function isCorsError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('cors') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('load failed')
    );
  }
  // Also check for fetch errors that might be wrapped
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: string }).message || '').toLowerCase();
    return (
      message.includes('cors') ||
      message.includes('network error') ||
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('load failed')
    );
  }
  return false;
}

/**
 * Detects if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 401 || error.status === 403;
  }
  if (error && typeof error === 'object') {
    // Check for status property
    if ('status' in error) {
      const status = (error as { status?: number }).status;
      return status === 401 || status === 403;
    }
    // Check for response property (common in fetch errors)
    if ('response' in error && error.response instanceof Response) {
      return error.response.status === 401 || error.response.status === 403;
    }
  }
  return false;
}

/**
 * Detects if an error indicates session loss (CORS or auth errors)
 */
export function isSessionLostError(error: unknown): boolean {
  return isCorsError(error) || isAuthError(error);
}

/**
 * Handles session loss by redirecting to login
 */
export function handleSessionLoss(): void {
  // Clear any cached data
  if (typeof window !== 'undefined') {
    // Clear React Query cache
    const event = new CustomEvent('session-lost');
    window.dispatchEvent(event);
    
    // Redirect to login
    const currentPath = window.location.pathname;
    const loginPath = '/login';
    
    // Only redirect if not already on login page
    if (!currentPath.includes(loginPath)) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Redirect to login
      window.location.href = loginPath;
    }
  }
}

/**
 * Wraps fetch to handle errors globally
 */
export async function fetchWithErrorHandling(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(input, init);
    
    // Handle 401/403 responses
    if (response.status === 401 || response.status === 403) {
      handleSessionLoss();
      throw response;
    }
    
    return response;
  } catch (error) {
    // Handle CORS errors
    if (isCorsError(error)) {
      // CORS errors during restart often indicate session loss
      // Wait a bit and check if it's a restart scenario
      console.warn('CORS error detected, checking if application is restarting...');
      
      // Try to ping the health endpoint to see if app is up
      try {
        const healthCheck = await fetch('/actuator/health', {
          method: 'GET',
          credentials: 'include',
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        
        if (!healthCheck.ok) {
          // Health check failed, likely restarting
          handleSessionLoss();
        }
      } catch {
        // Health check also failed, definitely restarting
        handleSessionLoss();
      }
      
      throw error;
    }
    
    // Re-throw other errors
    throw error;
  }
}

