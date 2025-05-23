import axios, { AxiosError, AxiosInstance } from 'axios';

// Helper function to get the backend URL
export const getBackendUrl = (): string => {
  // Use the current hostname with the backend port
  return `${window.location.protocol}//${window.location.hostname}:8000`;
};

// Make sure this points to your running Laravel instance
const API_URL = `${getBackendUrl()}/api`;

// Base config for all requests
const axiosConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 seconds
};

// Create two axios instances - one with credentials, one without
// For login/register we don't need credentials
const publicApi: AxiosInstance = axios.create({
  ...axiosConfig,
  withCredentials: false, // No credentials for public endpoints
});

// For authenticated requests we include credentials
const api: AxiosInstance = axios.create({
  ...axiosConfig,
  withCredentials: true, // Important for CORS with credentials
});

// Adicionar token JWT em todas as requisições autenticadas
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
      console.log('Enviando requisição autenticada:', config.url, 'com token:', tokenType, token.substring(0, 15) + '...');
    } else {
      console.log('Enviando requisição sem token de autenticação:', config.url);
    }
    
    return config;
  },
  error => {
    console.error('Erro na interceptação da requisição:', error);
    return Promise.reject(error);
  }
);

// Same for public requests, just in case there's a token
publicApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for authenticated API
api.interceptors.response.use(
  response => {
    // Return the data directly
    return response.data;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('Network error or server unavailable');
      return Promise.reject(new Error('Erro de rede ou servidor indisponível'));
    }
    
    // Token expired
    if (error.response.status === 401) {
      try {
        // Try to refresh the token
        const originalRequest = error.config;
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = refreshResponse.data;
        
        if (data.access_token) {
          // Save new token
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('token_type', data.token_type || 'bearer');
          if (data.expires_in) {
            localStorage.setItem('expires_in', data.expires_in.toString());
          }
          
          // Retry the original request with the new token
          if (originalRequest) {
            originalRequest.headers.Authorization = `${data.token_type || 'Bearer'} ${data.access_token}`;
            return axios(originalRequest);
          }
        } else {
          // Logout if token refresh fails
          localStorage.removeItem('token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('expires_in');
          window.location.href = '/admin/login?expired=true';
        }
      } catch (refreshError) {
        // Logout on refresh error
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('expires_in');
        window.location.href = '/admin/login?expired=true';
      }
    }
    
    // Validation errors
    if (error.response.status === 422) {
      const validationErrors = (error.response.data as any)?.errors || {};
      console.error('Erros de validação:', validationErrors);
    }
    
    // Not found
    if (error.response.status === 404) {
      console.error('Recurso não encontrado:', error.config?.url);
    }
    
    // Server error
    if (error.response.status >= 500) {
      console.error('Erro do servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor for public API
publicApi.interceptors.response.use(
  response => {
    // Return the data directly
    return response.data;
  },
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('Network error or server unavailable');
      return Promise.reject(new Error('Erro de rede ou servidor indisponível'));
    }
    
    // Validation errors
    if (error.response.status === 422) {
      const validationErrors = (error.response.data as any)?.errors || {};
      console.error('Erros de validação:', validationErrors);
    }
    
    // Not found
    if (error.response.status === 404) {
      console.error('Recurso não encontrado:', error.config?.url);
    }
    
    // Server error
    if (error.response.status >= 500) {
      console.error('Erro do servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Utility functions for API requests
export const apiService = {
  // Public endpoints (no auth required)
  public: {
    post: async (url: string, data = {}, config = {}) => {
      try {
        const response = await publicApi.post(url, data, config);
        return response;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    }
  },
  
  // For authenticated requests
  get: async (url: string, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  post: async (url: string, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  put: async (url: string, data = {}) => {
    try {
      const response = await api.put(url, data);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  delete: async (url: string) => {
    try {
      const response = await api.delete(url);
      return response;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

/**
 * Centralized API error handling
 */
function handleApiError(error: any) {
  // User-friendly error messages
  let userMessage = 'Ocorreu um erro ao processar sua solicitação';
  
  if (error.response) {
    // Server responded with an error code
    const status = error.response.status;
    const backendMessage = error.response.data?.message;
    
    if (backendMessage) {
      userMessage = backendMessage;
    } else if (status === 400) {
      userMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
    } else if (status === 403) {
      userMessage = 'Você não tem permissão para acessar este recurso.';
    } else if (status === 404) {
      userMessage = 'O recurso solicitado não existe ou foi removido.';
    } else if (status === 422) {
      userMessage = 'Dados de formulário inválidos. Verifique os campos obrigatórios.';
    } else if (status >= 500) {
      userMessage = 'Erro no servidor. Nossa equipe foi notificada.';
    }
  } else if (error.request) {
    // Request made but no response
    userMessage = 'Não foi possível se comunicar com o servidor. Verifique sua conexão.';
  }
  
  return userMessage;
}

// Export both APIs
export { publicApi };
export default api; 