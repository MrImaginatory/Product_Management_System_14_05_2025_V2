import axios from 'axios';

// Create Axios instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g., http://localhost:3001/api/v2
  withCredentials: true, // ✅ send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to include token in Authorization header
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // If token exists, attach to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response Interceptor to handle auth errors globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here (e.g., token expired, 401)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized: Token may be expired');
      // Optional: redirect to login or clear auth
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
