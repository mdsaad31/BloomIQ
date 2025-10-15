import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use 10.0.2.2 for Android emulator, or your computer's IP for physical device
const API_BASE_URL = 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to navigate to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data: any) => 
    api.put('/auth/profile', data),
};

// Analysis API
export const analysisAPI = {
  analyze: (formData: FormData) => 
    api.post('/analysis/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getStats: () => 
    api.get('/analysis/stats'),
};

// Reports API
export const reportsAPI = {
  getReports: () => 
    api.get('/reports'),
  
  getReport: (id: string) => 
    api.get(`/reports/${id}`),
  
  deleteReport: (id: string) => 
    api.delete(`/reports/${id}`),
};

// Weather API
export const weatherAPI = {
  getWeather: (lat: number, lon: number) => 
    api.get(`/weather?lat=${lat}&lon=${lon}`),
  
  getWeatherByCity: (city: string) => 
    api.get(`/weather?city=${city}`),
};

export default api;