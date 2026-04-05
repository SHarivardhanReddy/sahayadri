import axios from 'axios';

// Get API URL from environment variables or use default
const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

console.log('API Base URL:', apiBaseURL);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

export default apiClient;
