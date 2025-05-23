import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from '@/lib/api';
import { API_ROUTES, API_BASE_URL } from '@/config/api';

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

const ClientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const response = await api.get(API_ROUTES.settings.get);
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching system settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);

  // If user is already authenticated, redirect to client panel
  if (isAuthenticated) {
    return <Navigate to="/painel" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando para o painel do cliente...",
          duration: 3000,
        });
        navigate("/painel");
      } else {
        setError(result.message || "Credenciais inválidas");
      }
    } catch (err) {
      setError("Ocorreu um erro durante o login. Tente novamente.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {loadingSettings ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : settings?.useLogo && settings?.logo ? (
            <div className="flex justify-center mb-4">
              <img 
                src={getSafeImageUrl(settings.logo)} 
                alt={settings.companyName || 'Painel do Cliente'} 
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  console.warn('Error loading logo in client login page');
                  e.currentTarget.src = ''; // Set empty src to prevent further errors
                }}
              />
            </div>
          ) : (
            <CardTitle className="text-2xl font-bold text-center">
              {settings?.companyName || 'Acesso ao Painel do Cliente'}
            </CardTitle>
          )}
          <CardDescription className="text-center">
            Digite suas credenciais para acessar seu painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a 
                    href="#" 
                    className="text-sm hover:underline"
                    style={{ color: settings?.primaryColor || '#f97316' }}
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ 
                  backgroundColor: settings?.primaryColor || '#f97316',
                  borderColor: settings?.primaryColor || '#f97316'
                }}
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Não tem uma conta?{" "}
            <a 
              href="/registro" 
              className="font-medium hover:underline"
              style={{ color: settings?.primaryColor || '#f97316' }}
            >
              Criar conta
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientLogin; 