import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { API_ROUTES, API_BASE_URL } from '@/config/api';
import { Loader2 } from 'lucide-react';

// Utility function to safely get an image URL
const getSafeImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If it's a data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If it's a relative URL (starts with /), prepend the API base URL
  if (url.startsWith('/')) {
    // Use the API_BASE_URL from config, but remove any trailing slash
    const baseUrl = API_BASE_URL.endsWith('/') 
      ? API_BASE_URL.slice(0, -1) 
      : API_BASE_URL;
    
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, return as is
  return url;
};

interface SystemSettings {
  companyName?: string;
  logo?: string;
  useLogo?: boolean;
  primaryColor?: string;
}

export default function AdminLoginPage() {
  const { login, loading, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    remember: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const response = await api.get(API_ROUTES.settings.get);
        // The response is already unwrapped by the axios interceptor
        setSettings(response as unknown as SystemSettings);
      } catch (error) {
        console.error('Error fetching system settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Verificar se o usuário já está autenticado e é admin
  useEffect(() => {
    if (isAuthenticated && user && user.roles.includes('admin')) {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpa mensagens anteriores
    setError(null);
    
    // Validação básica
    if (!credentials.email.trim()) {
      setError('O email é obrigatório');
      return;
    }
    
    if (!credentials.password) {
      setError('A senha é obrigatória');
      return;
    }
    
    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Verifica se o usuário tem permissão de admin
        if (user && user.roles.includes('admin')) {
          navigate('/admin');
        } else {
          setError('Você não tem permissão para acessar o painel administrativo');
        }
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao processar login');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          {loadingSettings ? (
            <div className="py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            </div>
          ) : settings?.useLogo && settings?.logo ? (
            <img 
              src={getSafeImageUrl(settings.logo)} 
              alt={settings.companyName || 'Painel Administrativo'} 
              className="h-24 w-auto object-contain mb-4"
              onError={(e) => {
                console.warn('Error loading logo in login page');
                e.currentTarget.src = ''; // Set empty src to prevent further errors
              }}
            />
          ) : (
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              {settings?.companyName || 'Painel Administrativo'}
            </h2>
          )}
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite suas credenciais de administrador para acessar
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email de administrador"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                checked={credentials.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Lembrar de mim
              </label>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
              style={{ 
                backgroundColor: settings?.primaryColor || '#f97316',
                borderColor: settings?.primaryColor || '#f97316'
              }}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              Entrar como Administrador
            </button>
          </div>
          
          <div className="text-center mt-4">
            <a 
              href="/" 
              className="font-medium hover:underline"
              style={{ color: settings?.primaryColor || '#f97316' }}
            >
              Voltar para a página inicial
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 