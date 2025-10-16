import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only redirect to auth if it's not a login/register attempt
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register');
      
      if (!isAuthRequest) {
        // Check if we have valid tokens before clearing
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user && token !== 'missing' && user !== 'missing') {
          // Check if this is a token validation error
          const errorMessage = (error.response?.data as any)?.message || '';
          
          // Only clear auth data if it's a clear authentication failure
          if (errorMessage.includes('User not found') || 
              errorMessage.includes('Token validation failed') ||
              errorMessage.includes('Invalid token payload') ||
              errorMessage.includes('jwt expired') ||
              errorMessage.includes('jwt malformed')) {
            
            
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on auth page
            if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
              // Use a more reliable redirect method
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          } else {
            // For other 401 errors, just log them but don't clear auth data
            console.warn('401 error but not clearing auth data:', errorMessage);
          }
        } 
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
