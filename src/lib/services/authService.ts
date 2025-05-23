import api, { publicApi } from '../api';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
  message?: string;
}

// Type for JWT API responses
interface JWTResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user?: User;
  message?: string;
}

export const authService = {
  /**
   * Realiza login no sistema
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Use publicApi for login to avoid CORS issues
      const response = await publicApi.post('/auth/login', credentials) as JWTResponse;
      
      // Laravel JWT returns a structure with access_token directly
      if (response && response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('token_type', response.token_type || 'bearer');
        localStorage.setItem('expires_in', response.expires_in?.toString() || '');
        
        return {
          success: true,
          access_token: response.access_token,
          token_type: response.token_type,
          expires_in: response.expires_in,
          user: response.user
        };
      }
      
      return {
        success: !!response,
        ...response
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erro ao fazer login'
      };
    }
  },
  
  /**
   * Registra um novo usuário no sistema
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Use publicApi for register to avoid CORS issues
      const response = await publicApi.post('/auth/register', data) as JWTResponse;
      
      // Handle JWT auth response format
      if (response && response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('token_type', response.token_type || 'bearer');
        localStorage.setItem('expires_in', response.expires_in?.toString() || '');
        
        return {
          success: true,
          access_token: response.access_token,
          token_type: response.token_type,
          expires_in: response.expires_in,
          user: response.user
        };
      }
      
      return {
        success: !!response,
        ...response
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário'
      };
    }
  },
  
  /**
   * Realiza logout do sistema
   */
  logout: async (): Promise<boolean> => {
    try {
      // Use authenticated API for logout
      await api.post('/auth/logout');
      
      // Remove tokens independente da resposta da API
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('expires_in');
      
      return true;
    } catch (error) {
      // Mesmo em caso de erro na API, apaga os tokens locais
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('expires_in');
      
      return false;
    }
  },
  
  /**
   * Obtém os dados do usuário autenticado
   */
  getUser: async () => {
    try {
      const response = await api.get('/auth/me') as User;
      return {
        success: true,
        user: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao obter dados do usuário'
      };
    }
  },
  
  /**
   * Atualiza o token usando o refresh token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/refresh') as JWTResponse;
      
      if (response && response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('token_type', response.token_type || 'bearer');
        localStorage.setItem('expires_in', response.expires_in?.toString() || '');
        
        return {
          success: true,
          access_token: response.access_token,
          token_type: response.token_type,
          expires_in: response.expires_in
        };
      }
      
      return {
        success: !!response,
        ...response
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao renovar token'
      };
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
}; 