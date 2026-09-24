import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const JWT_STORAGE_KEY = 'dawa_jwt_token';

export interface StandardApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type AuthErrorHandler = (error: { status: 401 | 403; code: string; message: string }) => void;
export type ApiErrorHandler = (error: StandardApiError) => void;

let authErrorHandler: AuthErrorHandler | null = null;
let apiErrorHandler: ApiErrorHandler | null = null;

/**
 * Token management utilities
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(JWT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(JWT_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[HTTP Client] Failed to update localStorage token', err);
  }
}

export function clearStoredToken(): void {
  setStoredToken(null);
}

/**
 * Standardize HTTP error messages into a consistent contract
 */
export function formatApiError(error: AxiosError | any): StandardApiError {
  const timestamp = new Date().toISOString();

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const responseData: any = error.response?.data;

    let message = responseData?.message || responseData?.error || error.message;
    let code = responseData?.code || `HTTP_${status}`;

    if (status === 401) {
      code = 'TOKEN_EXPIRED_OR_INVALID';
      message = responseData?.message || 'Your clinical session has expired. Please sign in again to continue.';
    } else if (status === 403) {
      code = 'ACCESS_FORBIDDEN';
      message = responseData?.message || 'Access denied. You do not possess the clinical role authorization for this action.';
    } else if (status === 404) {
      code = 'RESOURCE_NOT_FOUND';
      message = responseData?.message || 'Requested healthcare endpoint or record was not found.';
    } else if (status >= 500) {
      code = 'SERVER_ERROR';
      message = responseData?.message || 'Clinical intelligence backend temporarily encountered a processing issue.';
    } else if (error.code === 'ECONNABORTED') {
      code = 'TIMEOUT';
      message = 'Clinical request timed out. Please check network connectivity.';
    } else if (!error.response) {
      code = 'NETWORK_OFFLINE';
      message = 'Network connection unavailable. Operating in local failover cache mode.';
    }

    return {
      status,
      code,
      message,
      details: responseData?.details || responseData,
      timestamp,
    };
  }

  return {
    status: 500,
    code: 'UNKNOWN_CLIENT_ERROR',
    message: error?.message || 'An unexpected client-side error occurred.',
    timestamp,
  };
}

/**
 * Centralized Axios instance with timeout and JSON configuration
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': 'DawaVerify-X-Web',
  },
});

/**
 * Request Interceptor: Attach JWT Bearer Token if available
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(formatApiError(error));
  }
);

/**
 * Response Interceptor: Catch 401/403 session expiration & format standardized errors
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const standardizedError = formatApiError(error);
    const status = error.response?.status;

    // Handle 401 Unauthorized (Expired or Revoked JWT)
    if (status === 401) {
      clearStoredToken();
      if (authErrorHandler) {
        authErrorHandler({
          status: 401,
          code: standardizedError.code,
          message: standardizedError.message,
        });
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('dawa:auth-session-expired', {
            detail: standardizedError,
          })
        );
      }
    }

    // Handle 403 Forbidden (Insufficient role privileges)
    if (status === 403) {
      if (authErrorHandler) {
        authErrorHandler({
          status: 403,
          code: standardizedError.code,
          message: standardizedError.message,
        });
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('dawa:auth-forbidden', {
            detail: standardizedError,
          })
        );
      }
    }

    // Dispatch global error listener if registered
    if (apiErrorHandler) {
      apiErrorHandler(standardizedError);
    }

    return Promise.reject(standardizedError);
  }
);

/**
 * Initialization handler designed to be called inside App initialization logic (useEffect)
 */
export function setupApiClient(options: {
  onAuthError?: AuthErrorHandler;
  onApiError?: ApiErrorHandler;
}): () => void {
  authErrorHandler = options.onAuthError || null;
  apiErrorHandler = options.onApiError || null;

  // Global browser event listeners for decoupled components
  const handleAuthExpiredEvent = (e: Event) => {
    const custom = e as CustomEvent<StandardApiError>;
    if (options.onAuthError) {
      options.onAuthError({
        status: 401,
        code: custom.detail?.code || 'TOKEN_EXPIRED',
        message: custom.detail?.message || 'Your session has expired.',
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dawa:auth-session-expired', handleAuthExpiredEvent);
  }

  // Cleanup function for unmount
  return () => {
    authErrorHandler = null;
    apiErrorHandler = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('dawa:auth-session-expired', handleAuthExpiredEvent);
    }
  };
}
