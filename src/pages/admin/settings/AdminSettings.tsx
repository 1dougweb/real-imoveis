import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Trash2,
  Search,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { SystemSettings } from "@/types/settings";
import api from "@/lib/api";
import { API_ROUTES, API_BASE_URL } from "@/config/api";

const defaultSettings: SystemSettings = {
  // SEO Settings
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImage: "",
  canonicalUrl: "",
  indexFollow: true,
  
  // Analytics Settings
  gtmContainerId: "",
  facebookPixelId: "",
  googleAnalyticsCode: "",
  
  // SMTP Settings
  smtpHost: "",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  smtpEncryption: "",
  mailFromAddress: "",
  mailFromName: "",

  // Existing settings
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  companyWebsite: "",
  socialInstagram: "",
  socialFacebook: "",
  socialLinkedin: "",
  socialTwitter: "",
  socialYoutube: "",
  logo: "",
  useLogo: false,
  primaryColor: "#f97316",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  seoOgImage: ""
};

const AdminSettings = () => {
  const { user } = useAuth();
  const { settings: systemSettings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("aparencia");
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Estado local para as configurações
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Atualizar o estado local quando as configurações do sistema mudarem
  useEffect(() => {
    if (systemSettings) {
      // Ensure no null values in settings by providing fallbacks
      const sanitizedSettings = Object.fromEntries(
        Object.entries(systemSettings).map(([key, value]) => [
          key, 
          typeof value === 'string' ? (value ?? '') : value
        ])
      );
      setSettings(sanitizedSettings as SystemSettings);
    }
  }, [systemSettings]);
  
  // Estado para armazenar a prévia da imagem
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  
  // State for actual file objects rather than just blob URLs
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  
  // Helper function to create safe data URLs instead of blob URLs
  const createDataUrl = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Função para lidar com o upload do logo
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato de arquivo inválido. Use JPG, PNG ou SVG.");
      return;
    }
    
    // Validação de tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 2MB.");
      return;
    }
    
    // Store the file in state
    setLogoFile(file);
    
    // Create a data URL instead of a blob URL
    try {
      setLogoLoading(true);
      const dataUrl = await createDataUrl(file);
      setLogoPreview(dataUrl);
      
      // Simulating upload delay
      setTimeout(() => {
        setLogoLoading(false);
        setSettings(prev => ({
          ...prev,
          logo: dataUrl
        }));
        toast.success("Logo atualizado com sucesso!");
      }, 1500);
    } catch (error) {
      console.error("Error creating data URL:", error);
      setLogoLoading(false);
      toast.error("Erro ao processar a imagem. Tente novamente.");
    }
  };

  // Função para lidar com o upload da imagem OG
  const handleOgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validação de tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato de arquivo inválido. Use JPG ou PNG.");
      return;
    }
    
    // Validação de tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 2MB.");
      return;
    }
    
    // Store the file in state
    setOgImageFile(file);
    
    // Create a data URL instead of a blob URL
    try {
      const dataUrl = await createDataUrl(file);
      setOgImagePreview(dataUrl);
      
      // Simulate upload delay
      setTimeout(() => {
        setSettings(prev => ({
          ...prev,
          seoOgImage: dataUrl
        }));
        toast.success("Imagem OG atualizada com sucesso!");
      }, 1000);
    } catch (error) {
      console.error("Error creating data URL:", error);
      toast.error("Erro ao processar a imagem. Tente novamente.");
    }
  };
  
  // Função para remover o logo
  const handleRemoveLogo = () => {
    // Clear file and preview
    setLogoFile(null);
    setLogoPreview(null);
    
    setSettings(prev => ({
      ...prev,
      logo: "",
      useLogo: false
    }));
    toast.success("Logo removido com sucesso!");
  };
  
  // Função para remover a imagem OG
  const handleRemoveOgImage = () => {
    // Clear file and preview
    setOgImageFile(null);
    setOgImagePreview(null);
    
    setSettings(prev => ({
      ...prev,
      seoOgImage: ""
    }));
    toast.success("Imagem OG removida com sucesso!");
  };
  
  // Função para salvar as configurações
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Create a copy of settings to avoid modifying the state directly
      const settingsToSave = { ...settings };
      
      // In a real implementation:
      // 1. Check if we have logo or OG image files to upload
      // 2. Upload them to server first
      // 3. Replace data URLs with server URLs
      
      // For data URLs, add a warning about large data
      const isDataUrl = (url: string) => url.startsWith('data:');
      
      // Check logo data URL size
      if (settingsToSave.logo && isDataUrl(settingsToSave.logo)) {
        const sizeInKB = Math.round(settingsToSave.logo.length / 1024);
        if (sizeInKB > 100) {
          console.warn(`Logo data URL is large (${sizeInKB}KB) and might impact performance when saving.`);
        }
      }
      
      // Check OG image data URL size
      if (settingsToSave.seoOgImage && isDataUrl(settingsToSave.seoOgImage)) {
        const sizeInKB = Math.round(settingsToSave.seoOgImage.length / 1024);
        if (sizeInKB > 100) {
          console.warn(`OG image data URL is large (${sizeInKB}KB) and might impact performance when saving.`);
        }
      }
      
      // Log the settings being saved
      console.log('Saving settings:', settingsToSave);
      
      await updateSettings(settingsToSave);
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      
      // Show a more user-friendly error message
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao salvar as configurações. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar entre logo e texto
  const handleToggleLogoText = (useLogoValue: boolean) => {
    setSettings(prev => ({
      ...prev,
      useLogo: useLogoValue
    }));
  };

  // Função para testar configurações SMTP
  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      await api.post(API_ROUTES.settings.testSmtp);
      toast.success('Teste de SMTP realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao testar configurações de SMTP');
    } finally {
      setTestingSmtp(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar alterações
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full md:w-auto">
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        
        {/* Configurações de Aparência */}
        <TabsContent value="aparencia" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo do Sistema</CardTitle>
              <CardDescription>
                Configure o logo que aparece na barra lateral do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna de upload e prévia */}
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                    {logoLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
                        <p className="text-sm text-gray-500">Carregando logo...</p>
                      </div>
                    ) : logoPreview || settings.logo ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={getSafeImageUrl(logoPreview || settings.logo) || ''} 
                          alt="Logo preview" 
                          className="max-h-36 object-contain mb-4"
                          onError={(e) => {
                            // Handle image loading error
                            console.warn('Error loading logo preview image');
                            e.currentTarget.src = ''; // Set empty src to prevent further errors
                            if (logoPreview) setLogoPreview(null);
                            if (settings.logo) setSettings(prev => ({ ...prev, logo: '' }));
                          }}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Alterar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRemoveLogo}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Clique para fazer upload do logo</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG ou JPG (max. 2MB)</p>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/svg+xml"
                      className="sr-only"
                      onChange={handleLogoChange}
                      disabled={logoLoading}
                    />
                  </div>
                </div>
                
                {/* Coluna de opções */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Opções de exibição</h3>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="use-logo" 
                          name="logo-display" 
                          checked={settings.useLogo} 
                          onChange={() => handleToggleLogoText(true)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                        />
                        <Label htmlFor="use-logo">Usar imagem de logo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="use-text" 
                          name="logo-display" 
                          checked={!settings.useLogo}
                          onChange={() => handleToggleLogoText(false)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                        />
                        <Label htmlFor="use-text">Usar texto como logo</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Prévia</h3>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="flex flex-col items-center">
                        {settings.useLogo && (settings.logo || logoPreview) ? (
                          <img 
                            src={getSafeImageUrl(logoPreview || settings.logo) || ''}
                            alt="Logo" 
                            className="h-16 object-contain"
                            onError={(e) => {
                              // Handle image loading error
                              console.warn('Error loading logo preview image');
                              e.currentTarget.src = ''; // Set empty src to prevent further errors
                              if (logoPreview) setLogoPreview(null);
                              if (settings.logo) setSettings(prev => ({ ...prev, logo: '' }));
                            }}
                          />
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                              <span className="text-white font-bold text-xl">LR</span>
                            </div>
                            <div className="text-center">
                              <h2 className="text-lg font-bold text-orange-600">
                                {settings.companyName ? settings.companyName.split(' ')[0] : 'Laranja'}
                              </h2>
                              <p className="text-xs text-gray-500">
                                {settings.companyName ? settings.companyName.split(' ').slice(1).join(' ') : 'Real Imóveis'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cores do Sistema</CardTitle>
              <CardDescription>
                Personalize as cores utilizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Cor primária</Label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        id="primary-color"
                        value={settings.primaryColor ?? "#f97316"}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-10 w-10 rounded border border-gray-300"
                      />
                      <Input
                        value={settings.primaryColor ?? "#f97316"}
                        onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dados da Empresa */}
        <TabsContent value="empresa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure os dados da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="company-name"
                        value={settings.companyName ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="company-email"
                        type="email"
                        value={settings.companyEmail ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="company-phone"
                        value={settings.companyPhone ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="company-address"
                        value={settings.companyAddress ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="company-website"
                        value={settings.companyWebsite ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, companyWebsite: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Redes Sociais */}
        <TabsContent value="redes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Configure as redes sociais da sua imobiliária
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="social-instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="social-instagram"
                        value={settings.socialInstagram ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialInstagram: e.target.value }))}
                        className="pl-10"
                        placeholder="@seuinstagram"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social-facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="social-facebook"
                        value={settings.socialFacebook ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialFacebook: e.target.value }))}
                        className="pl-10"
                        placeholder="seuface"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social-linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="social-linkedin"
                        value={settings.socialLinkedin ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialLinkedin: e.target.value }))}
                        className="pl-10"
                        placeholder="sua-empresa"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="social-twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="social-twitter"
                        value={settings.socialTwitter ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialTwitter: e.target.value }))}
                        className="pl-10"
                        placeholder="@seutwitter"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social-youtube">YouTube</Label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="social-youtube"
                        value={settings.socialYoutube ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, socialYoutube: e.target.value }))}
                        className="pl-10"
                        placeholder="seu-canal"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 mt-4">
      <Card>
        <CardHeader>
              <CardTitle>Configurações de SEO</CardTitle>
          <CardDescription>
                Configure as informações de SEO para melhorar o ranqueamento do seu site
          </CardDescription>
        </CardHeader>
        <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Título do Site (Meta Title)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="seo-title"
                      value={settings.seoTitle ?? ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, seoTitle: e.target.value }))}
                      className="pl-10"
                      placeholder="Título principal do seu site"
                      maxLength={60}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {(settings.seoTitle ?? "").length}/60 caracteres recomendados
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seo-description">Descrição (Meta Description)</Label>
                  <Textarea
                    id="seo-description"
                    value={settings.seoDescription ?? ""}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoDescription: e.target.value }))}
                    className="min-h-[100px]"
                    placeholder="Uma breve descrição do seu site..."
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(settings.seoDescription ?? "").length}/160 caracteres recomendados
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Palavras-chave (Meta Keywords)</Label>
                  <Textarea
                    id="seo-keywords"
                    value={settings.seoKeywords ?? ""}
                    onChange={(e) => setSettings(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="imóveis, compra, venda, locação, apartamentos, casas..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separe as palavras-chave por vírgulas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="og-image">Imagem de Compartilhamento (OG Image)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    {ogImagePreview || settings.seoOgImage ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={getSafeImageUrl(ogImagePreview || settings.seoOgImage) || ''} 
                          alt="OG Image preview" 
                          className="max-h-48 object-contain mb-4"
                          onError={(e) => {
                            // Handle image loading error
                            console.warn('Error loading OG image');
                            e.currentTarget.src = ''; // Set empty src to prevent further errors
                            if (ogImagePreview) setOgImagePreview(null);
                            if (settings.seoOgImage) setSettings(prev => ({ ...prev, seoOgImage: '' }));
                          }}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('og-image-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Alterar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRemoveOgImage}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
            </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 cursor-pointer" onClick={() => document.getElementById('og-image-upload')?.click()}>
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Clique para fazer upload da imagem OG</p>
                        <p className="text-xs text-gray-500 mt-1">JPG ou PNG (1200x630 recomendado)</p>
            </div>
          )}
                    <input
                      id="og-image-upload"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="sr-only"
                      onChange={handleOgImageChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta imagem será exibida quando seu site for compartilhado nas redes sociais
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium mb-2">Prévia do Google</h3>
                  <div className="space-y-1">
                    <p className="text-lg text-blue-600 font-medium">{settings.seoTitle}</p>
                    <p className="text-sm text-green-700">{window.location.origin}</p>
                    <p className="text-sm text-gray-600">{settings.seoDescription}</p>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Analytics</CardTitle>
              <CardDescription>
                Configure as ferramentas de análise e rastreamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="gtm-id">ID do Container GTM</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="gtm-id"
                      value={settings.gtmContainerId ?? ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, gtmContainerId: e.target.value }))}
                      className="pl-10"
                      placeholder="GTM-XXXXXX"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    O ID do seu container do Google Tag Manager
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pixel-id">ID do Facebook Pixel</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="pixel-id"
                      value={settings.facebookPixelId ?? ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                      className="pl-10"
                      placeholder="XXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    O ID do seu Facebook Pixel
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ga-code">Código do Google Analytics</Label>
                  <Textarea
                    id="ga-code"
                    value={settings.googleAnalyticsCode ?? ""}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsCode: e.target.value }))}
                    placeholder="<!-- Google Analytics -->"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Cole aqui o código de acompanhamento do Google Analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email (SMTP)</CardTitle>
              <CardDescription>
                Configure o servidor SMTP para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input
                        id="smtp-host"
                        value={settings.smtpHost ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.exemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Porta</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        value={settings.smtpPort ?? 587}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                        placeholder="587"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-encryption">Criptografia</Label>
                      <select
                        id="smtp-encryption"
                        value={settings.smtpEncryption ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpEncryption: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      >
                        <option value="">Nenhuma</option>
                        <option value="tls">TLS</option>
                        <option value="ssl">SSL</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-username">Usuário</Label>
                      <Input
                        id="smtp-username"
                        value={settings.smtpUsername ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Senha</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        value={settings.smtpPassword ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações de Envio</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mail-from-name">Nome do Remetente</Label>
                      <Input
                        id="mail-from-name"
                        value={settings.mailFromName ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, mailFromName: e.target.value }))}
                        placeholder="Sua Empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mail-from-address">Email do Remetente</Label>
                      <Input
                        id="mail-from-address"
                        type="email"
                        value={settings.mailFromAddress ?? ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, mailFromAddress: e.target.value }))}
                        placeholder="noreply@seudominio.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp || !settings.smtpHost}
                  >
                    {testingSmtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      'Testar Configurações'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
