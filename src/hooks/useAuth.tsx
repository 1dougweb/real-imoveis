import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { authService, LoginCredentials, RegisterData } from '../lib/services';

// Tipo para o usuário autenticado
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile_photo_path?: string | null;
  roles: string[];
  permissions: string[];
}

// Tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;
}

// Cria o contexto de autenticação
const AuthContext = createContext<AuthContextType | null>(null);

// Provedor de autenticação para envolver a aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário está autenticado pelo token
  const isAuthenticated = !!user;

  // Busca os dados do usuário no backend
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }
      
      const response = await authService.getUser();
      
      if (response.success) {
        setUser(response.user);
      } else {
        // Se a API retorna erro mas temos token, ele pode estar inválido
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para verificar autenticação ao iniciar
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Função de login
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        await fetchUser();
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { success: false, message: error.message || 'Erro ao realizar login' };
    }
  };

  // Função de registro
  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      
      if (response.success) {
        await fetchUser();
        return { success: true };
      }
      
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, message: error.message || 'Erro ao realizar cadastro' };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Função para atualizar dados do usuário
  const refreshUser = async () => {
    await fetchUser();
  };

  // Função para atualizar dados do usuário localmente
  const updateUserData = (userData: Partial<User>) => {
    if (user) {
      setUser(prevUser => ({
        ...prevUser!,
        ...userData
      }));
    }
  };

  // Valor do contexto de autenticação
  const authContextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUserData
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
} 