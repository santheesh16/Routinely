import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor - this will be set up in the component
export const setupApiInterceptors = (getToken) => {
  api.interceptors.request.use(
    async (config) => {
      try {
        // Get token from Clerk
        // getToken() returns a session token by default
        // For JWT verification, we can pass a template name if configured in Clerk
        // Otherwise, the backend will need CLERK_JWT_KEY set
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - Clerk will handle redirect
        console.error('Unauthorized request');
      }
      return Promise.reject(error);
    }
  );
};

export default api;
