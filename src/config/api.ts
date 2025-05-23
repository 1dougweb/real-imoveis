export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  settings: {
    get: '/settings',
    update: '/settings',
    testSmtp: '/settings/test-smtp',
  }
} as const; 