import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api');

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string } | undefined;

    if (!error.response || error.code === 'ERR_NETWORK') {
      return 'Unable to reach the server. Please make sure the backend is running and try again.';
    }

    if (status === 401) {
      localStorage.removeItem('lifeos_token');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '#/login';
      }
    }

    return data?.message || error.message || 'Request failed.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifeos_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = getApiErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);
