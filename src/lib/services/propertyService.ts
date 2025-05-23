import api from '../api';

// Interfaces para tipagem forte
export interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  neighborhood: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
    abbreviation: string;
  };
  zip_code: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  area?: number;
  sale_price?: number;
  rent_price?: number;
  purpose: 'sale' | 'rent' | 'both';
  status: 'active' | 'inactive' | 'sold' | 'rented';
  property_type_id: number;
  property_type?: {
    id: number;
    name: string;
  };
  features?: string[];
  main_photo?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
}

export interface PropertyFilter {
  page?: number;
  per_page?: number;
  search?: string;
  purpose?: 'sale' | 'rent' | 'both';
  property_type_id?: number;
  city_id?: number;
  neighborhood_id?: number;
  bedrooms_min?: number;
  bathrooms_min?: number;
  price_min?: number;
  price_max?: number;
  area_min?: number;
  area_max?: number;
  features?: number[];
  status?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  featured?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

// Interface para o formato de resposta que a API está retornando
interface ApiPropertyResponse {
  success: boolean;
  message?: string;
  properties: Property[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

export const propertyService = {
  /**
   * Lista todos os imóveis com filtros opcionais
   */
  getAll: async (filters: PropertyFilter = {}): Promise<PaginatedResponse<Property>> => {
    try {
      // O interceptor já retorna diretamente o response.data
      const response = await api.get('/properties', { params: filters }) as ApiPropertyResponse;
      
      // Adaptar o formato da resposta para o formato esperado pelo componente
      if (response.success && response.properties) {
        return {
          success: response.success,
          message: response.message,
          data: response.properties,
          pagination: response.pagination || {
            current_page: 1,
            per_page: 10,
            total_pages: 1,
            total_count: 0
          }
        };
      }
      
      // Se a resposta já estiver no formato correto (com data em vez de properties)
      return response as unknown as PaginatedResponse<Property>;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém um imóvel específico pelo ID
   */
  getById: async (id: number): Promise<{ success: boolean; property: Property; message?: string }> => {
    try {
      return await api.get(`/properties/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cria um novo imóvel
   */
  create: async (data: Partial<Property>): Promise<{ success: boolean; property?: Property; message?: string }> => {
    try {
      return await api.post('/properties', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza um imóvel existente
   */
  update: async (id: number, data: Partial<Property>): Promise<{ success: boolean; property?: Property; message?: string }> => {
    try {
      return await api.put(`/properties/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove um imóvel
   */
  delete: async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.delete(`/properties/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Busca imóveis por termos específicos
   */
  search: async (term: string): Promise<PaginatedResponse<Property>> => {
    try {
      return await api.get('/properties/search', { params: { term } });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Adiciona fotos a um imóvel
   */
  addPhotos: async (id: number, photos: FormData): Promise<{ success: boolean; message?: string; photos?: string[] }> => {
    try {
      return await api.post(`/properties/${id}/photos`, photos, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove uma foto de um imóvel
   */
  deletePhoto: async (id: number, photoId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.delete(`/properties/${id}/photos/${photoId}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Define a foto principal do imóvel
   */
  setMainPhoto: async (id: number, photoId: number): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.put(`/properties/${id}/photos/${photoId}/main`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém os tipos de imóveis disponíveis
   */
  getPropertyTypes: async (): Promise<{ success: boolean; types: { id: number; name: string }[]; message?: string }> => {
    try {
      return await api.get('/property-types');
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém os destaques da página inicial
   */
  getFeatured: async (): Promise<{ success: boolean; properties: Property[]; message?: string }> => {
    try {
      return await api.get('/properties/featured');
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Altera o status de um imóvel
   * @param id ID do imóvel
   * @param status Novo status (available, sold, rented, reserved, unavailable, etc)
   */
  updateStatus: async (id: number, status: string): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.put(`/properties/${id}/status`, { status });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Marca ou desmarca um imóvel como destaque
   * @param id ID do imóvel
   * @param featured true para marcar como destaque, false para remover
   */
  toggleFeatured: async (id: number, featured: boolean): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.put(`/properties/${id}/featured`, { featured });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza informações de SEO de um imóvel (slug, meta title, descrição)
   * @param id ID do imóvel
   * @param seoData Dados de SEO
   */
  updateSeo: async (id: number, seoData: { slug?: string; meta_title?: string; meta_description?: string }): Promise<{ success: boolean; message?: string }> => {
    try {
      return await api.put(`/properties/${id}/seo`, seoData);
    } catch (error) {
      throw error;
    }
  }
}; 