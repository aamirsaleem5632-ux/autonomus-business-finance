import type { ApiErrorResponse } from '../types/health';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiClientError extends Error {
  public statusCode: number;
  public details?: ApiErrorResponse;

  constructor(message: string, statusCode: number, details?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorPayload: ApiErrorResponse | undefined;
      try {
        errorPayload = await response.json();
      } catch {
        // Response was not JSON
      }

      const errorMessage =
        (Array.isArray(errorPayload?.message)
          ? errorPayload?.message.join(', ')
          : errorPayload?.message) ||
        `HTTP Error ${response.status}: ${response.statusText}`;

      throw new ApiClientError(errorMessage, response.status, errorPayload);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network connection failure',
      0,
    );
  }
}
