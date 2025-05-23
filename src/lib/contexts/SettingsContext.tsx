import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemSettings } from '@/types/settings';
import { useAuth } from '@/hooks';
import { API_ROUTES } from '@/config/api';
import api from '@/lib/api';
import { snakeToCamel, camelToSnake } from '@/lib/utils';

interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

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

// Helper function to ensure string values are never null
const ensureStringValues = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' || obj === null ? (obj ?? '') : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(ensureStringValues);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (typeof value === 'string' || value === null) {
      acc[key] = value ?? ''; // Convert null to empty string
    } else if (typeof value === 'object') {
      acc[key] = ensureStringValues(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  error: null,
  updateSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Função para buscar as configurações
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Faça a chamada à API usando o serviço (importante usar o .get completo)
      const response = await api.get(API_ROUTES.settings.get);
      
      // Log da resposta para depuração
      console.log('Resposta da API de configurações:', response);
      
      // Se a resposta estiver vazia ou for inválida, use as configurações padrão
      if (!response || Object.keys(response).length === 0) {
        console.warn('Resposta da API vazia, usando configurações padrão');
        setSettings(defaultSettings);
        return;
      }
      
      // Converta os dados de snake_case para camelCase
      const formattedData = snakeToCamel(response);
      
      console.log('Dados formatados:', formattedData);
      
      // Mescle com os valores padrão para garantir que todos os campos existam
      const mergedSettings = { ...defaultSettings, ...formattedData };
      
      // Garantir que não haja valores null em campos de string
      const sanitizedSettings = ensureStringValues(mergedSettings);
      
      // Defina as configurações no estado
      setSettings(sanitizedSettings as SystemSettings);
    } catch (error: any) {
      console.error('Erro ao buscar configurações:', error);
      setError(error.message || 'Erro ao buscar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Buscar configurações quando o usuário estiver autenticado ou sempre no ambiente de desenvolvimento
  useEffect(() => {
    // Sempre busque as configurações, pois a API foi modificada para não exigir autenticação
    fetchSettings();
  }, []); // Removida a dependência de user para evitar requisições desnecessárias

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Garantir que não haja valores null em campos de string
      const sanitizedSettings = ensureStringValues(newSettings);
      
      // Create a copy of the settings for sending to server
      const settingsToSave = { ...sanitizedSettings };
      
      // Check for data URLs that might be large
      const isDataUrl = (url: string) => url.startsWith('data:');
      
      // Check logo data URL size
      if (typeof settingsToSave.logo === 'string' && isDataUrl(settingsToSave.logo)) {
        const sizeInKB = Math.round(settingsToSave.logo.length / 1024);
        console.log(`Logo data URL size: ${sizeInKB}KB`);
        
        // In a real app, you would upload this file to the server
        // and replace the data URL with the server URL
      }
      
      // Check OG image data URL size
      if (typeof settingsToSave.seoOgImage === 'string' && isDataUrl(settingsToSave.seoOgImage)) {
        const sizeInKB = Math.round(settingsToSave.seoOgImage.length / 1024);
        console.log(`OG image data URL size: ${sizeInKB}KB`);
        
        // In a real app, you would upload this file to the server
        // and replace the data URL with the server URL
      }
      
      // Converta os dados de camelCase para snake_case
      const formattedData = camelToSnake(settingsToSave);
      
      // Log dos dados enviados para depuração
      console.log('Enviando atualização de configurações:', formattedData);
      
      // Verifique se o cabeçalho de autorização está sendo enviado
      const token = localStorage.getItem('token');
      console.log('Token de autenticação presente:', !!token);
      
      // Faça a chamada à API usando o serviço
      const response = await api.post(API_ROUTES.settings.update, formattedData);
      
      // Log da resposta para depuração
      console.log('Resposta da atualização de configurações:', response);
      
      // Se a resposta estiver vazia ou for inválida, lance um erro
      if (!response) {
        throw new Error('Resposta vazia do servidor');
      }

      // Converta os dados de snake_case para camelCase
      const formattedResponseData = snakeToCamel(response);
      
      // Sanitize response data to ensure no null values for string fields
      const sanitizedResponseData = ensureStringValues(formattedResponseData);
      
      // Mescle com as configurações atuais
      setSettings(prev => ({ ...prev, ...sanitizedResponseData }));
      
      // Busque as configurações atualizadas para garantir sincronização
      fetchSettings();
      
      return sanitizedResponseData;
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', {
        error,
        message: error.message,
        response: error.response?.data
      });
      
      setError(error.message || 'Erro ao atualizar configurações');
      
      // Lance um erro mais descritivo
      if (error.response?.data?.errors) {
        throw new Error(Object.values(error.response.data.errors).flat().join('\n'));
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Erro ao atualizar as configurações. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}; 
