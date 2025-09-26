import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (abha_id: string, phone: string) =>
    api.post('/abha/login', { abha_id, phone }),
  
  getProfile: () =>
    api.get('/abha/profile'),
  
  getTranslationHistory: () =>
    api.get('/abha/translation-history'),
};

export const searchAPI = {
  searchNamaste: (query: string) =>
    api.get(`/namaste/namaste/search?query=${encodeURIComponent(query)}`),
  
  searchICD: (query: string) =>
    api.get(`/icd/icd11/tm2/search?query=${encodeURIComponent(query)}`),
};

export const mappingAPI = {
  translate: (system: string, code: string, saveHistory: boolean = false) =>
    api.get(`/mapping/translate?system=${system}&code=${encodeURIComponent(code)}&save_history=${saveHistory}`),
};

export default api;