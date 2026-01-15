import axios from 'axios';
import { useUserStore } from '@/stores/user';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request Interceptor: Inject Token
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const userStore = useUserStore();
    if (error.response?.status === 401) {
      // 避免在 login 页面无限重定向
      if (!window.location.pathname.startsWith('/login')) {
        userStore.logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
