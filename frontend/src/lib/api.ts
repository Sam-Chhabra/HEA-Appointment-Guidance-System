export const API_BASE = 'http://localhost:4000/api';

export interface ApiError extends Error {
  status?: number;
  details?: string[];
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, suppressErrors = false): Promise<T> {
  const { headers, ...rest } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...rest,
    // Ensure cookies are included in cross-origin requests
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (suppressErrors) {
      return null as T;
    }
    const error = new Error(errorData.error || 'An error occurred while fetching the data.') as ApiError;
    error.status = response.status;
    error.details = errorData.details;
    throw error;
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
