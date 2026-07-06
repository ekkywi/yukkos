import axios from 'axios';

const DEFAULT_API_URL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const accessToken = window.localStorage.getItem('access_token');

    if (accessToken) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    const headers = config.headers as Record<string, unknown> & {
      delete?: (name: string) => void;
      set?: (name: string, value: string) => void;
    };

    if (typeof headers.delete === 'function') {
      headers.delete('Content-Type');
      headers.delete('content-type');
    } else {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }
  }

  return config;
});

export default httpClient;
