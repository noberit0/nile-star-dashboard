import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Log API configuration on client side only
if (typeof window !== 'undefined') {
  console.log('🔗 Dashboard API Configuration:');
  console.log('   Base URL:', API_BASE_URL);
  console.log('   Environment:', process.env.NODE_ENV);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    // Log request details
    if (typeof window !== 'undefined') {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and log responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    if (typeof window !== 'undefined') {
      console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log error responses
    if (typeof window !== 'undefined') {
      if (error.response) {
        console.error(`❌ API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response.data);
      } else if (error.request) {
        console.error('❌ Network Error: No response received', error.message);
      } else {
        console.error('❌ Request Error:', error.message);
      }
    }

    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('operator');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
