import axios from 'axios';

const DEFAULT_API_URL = 'https://ecommercebackend-production-a5a1.up.railway.app/api';

const rawBaseUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim();
const baseURL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(config => {
  if (config.url?.startsWith('/')) {
    config.url = config.url.slice(1);
  }
  return config;
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
