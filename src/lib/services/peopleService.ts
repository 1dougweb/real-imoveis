import api from '../api';

export interface Person {
  id: number;
  name: string;
  email: string;
  document_type: 'cpf' | 'cnpj';
  document_number: string;
  phone: string;
  cell_phone?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  type: 'client' | 'owner' | 'agent' | 'employee'; // Tipo de pessoa
  role_id?: number; // ID do cargo (para funcionários/agentes)
  role?: {
    id: number;
    name: string;
  };
  commission_rate?: number; // Taxa de comissão para agentes
  bank_accounts?: {
    id: number;
    bank_id: number;
    bank_name?: string;
    branch: string;
    account: string;
    account_type: string;
  }[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PersonFilter {
  page?: number;
  per_page?: number;
  search?: string;
  document_type?: 'cpf' | 'cnpj';
  type?: 'client' | 'owner' | 'agent' | 'employee';
  status?: 'active' | 'inactive';
  role_id?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const peopleService = {
  /**
   * Lista todas as pessoas com filtros opcionais
   */
  getAll: async (filters: PersonFilter = {}) => {
    try {
      return await api.get('/people', { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém uma pessoa específica pelo ID
   */
  getById: async (id: number) => {
    try {
      return await api.get(`/people/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cria uma nova pessoa
   */
  create: async (data: Partial<Person>) => {
    try {
      return await api.post('/people', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza uma pessoa existente
   */
  update: async (id: number, data: Partial<Person>) => {
    try {
      return await api.put(`/people/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove uma pessoa
   */
  delete: async (id: number) => {
    try {
      return await api.delete(`/people/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Busca pessoas por nome, email ou documento
   */
  search: async (term: string) => {
    try {
      return await api.get('/people/search', { params: { term } });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém os imóveis favoritos de um cliente
   */
  getFavorites: async (personId: number) => {
    try {
      return await api.get(`/people/${personId}/favorites`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Adiciona um imóvel aos favoritos do cliente
   */
  addFavorite: async (personId: number, propertyId: number) => {
    try {
      return await api.post(`/people/${personId}/favorites`, { property_id: propertyId });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove um imóvel dos favoritos do cliente
   */
  removeFavorite: async (personId: number, propertyId: number) => {
    try {
      return await api.delete(`/people/${personId}/favorites/${propertyId}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém o histórico de visitas de uma pessoa
   */
  getVisits: async (personId: number) => {
    try {
      return await api.get(`/people/${personId}/visits`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém o histórico de contratos de uma pessoa
   */
  getContracts: async (personId: number) => {
    try {
      return await api.get(`/people/${personId}/contracts`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém contas bancárias de uma pessoa
   */
  getBankAccounts: async (personId: number) => {
    try {
      return await api.get(`/people/${personId}/bank-accounts`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Adiciona uma conta bancária para uma pessoa
   */
  addBankAccount: async (personId: number, accountData: {
    bank_id: number;
    branch: string;
    account: string;
    account_type: string;
  }) => {
    try {
      return await api.post(`/people/${personId}/bank-accounts`, accountData);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém as comissões de um agente
   */
  getCommissions: async (personId: number, filters: {
    status?: 'pending' | 'approved' | 'paid' | 'cancelled';
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {}) => {
    try {
      return await api.get(`/people/${personId}/commissions`, { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém os imóveis associados a uma pessoa (proprietário)
   */
  getProperties: async (personId: number) => {
    try {
      return await api.get(`/people/${personId}/properties`);
    } catch (error) {
      throw error;
    }
  }
}; 