import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks";
import { toast } from "@/components/ui/sonner";
import { User, Mail, Phone, Key, Upload, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { API_ROUTES, API_BASE_URL } from "@/config/api";

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

const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // State for avatar preview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Helper function to create data URL from file
  const createDataUrl = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Função para lidar com o envio do formulário de perfil
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post(API_ROUTES.auth.profile, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // The response is already unwrapped by the axios interceptor
      // so we can directly check the success property
      if (response.success) {
        // Update the user data in the auth context
        if (updateUserData) {
          updateUserData(response.user);
        }
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar perfil: " + response.message);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o envio do formulário de senha
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (!formData.currentPassword) {
      toast.error("Informe sua senha atual");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(API_ROUTES.auth.profile, {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      // The response is already unwrapped by the axios interceptor
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        toast.success("Senha atualizada com sucesso!");
      } else {
        toast.error("Erro ao atualizar senha: " + response.message);
      }
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast.error(error.response?.data?.message || "Erro ao atualizar senha");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com o upload de avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato de arquivo inválido. Use JPG, PNG ou GIF.");
      return;
    }
    
    // Validação de tamanho (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 1MB.");
      return;
    }

    try {
      setAvatarLoading(true);
      
      // Create a data URL
      const dataUrl = await createDataUrl(file);
      setAvatarPreview(dataUrl);
      
      // Log the request details
      console.log("Sending profile photo update request to:", API_ROUTES.auth.profile);
      
      // Send the data URL to the server
      const response = await api.post(API_ROUTES.auth.profile, {
        profile_photo: dataUrl,
      });
      
      // Log the complete response for debugging
      console.log("Avatar update response:", response);

      // The response is already unwrapped by the axios interceptor
      if (response.success) {
        // Update the user data in the auth context
        if (updateUserData && response.user) {
          updateUserData(response.user);
        }
        toast.success("Avatar atualizado com sucesso!");
      } else {
        // Handle case where success is false
        toast.error("Erro ao atualizar avatar: " + (response.message || "Erro desconhecido"));
      }
    } catch (error: any) {
      console.error("Erro ao atualizar avatar:", error);
      
      // Enhanced error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        toast.error(`Erro ao atualizar avatar: ${error.response.status} - ${error.response.data?.message || "Erro desconhecido"}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("Erro ao atualizar avatar: Não foi possível conectar ao servidor");
      } else {
        console.error("Error message:", error.message);
        toast.error(`Erro ao atualizar avatar: ${error.message}`);
      }
      
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Obter as iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna do Avatar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Avatar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              {avatarLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <AvatarImage 
                    src={getSafeImageUrl(avatarPreview || user?.profile_photo_path) || ''} 
                    onError={(e) => {
                      console.warn('Error loading avatar image');
                      e.currentTarget.src = ''; // Set empty src to prevent further errors
                    }}
                  />
                  <AvatarFallback className="text-3xl">{getUserInitials()}</AvatarFallback>
                </>
              )}
            </Avatar>
            
            <div className="w-full">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Upload className="h-4 w-4 mr-2" />
                  Alterar avatar
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={isLoading || avatarLoading}
                />
              </Label>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG ou GIF. Máximo 1MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coluna de Informações Pessoais */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Coluna de Segurança */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage; 