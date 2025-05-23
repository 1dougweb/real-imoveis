import api from '../api';
import { ComplementaryFilter } from './types';

// Interfaces para tipagem forte
export interface Role {
  id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  guard_name?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  state?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Neighborhood {
  id: number;
  name: string;
  city_id: number;
  city?: {
    id: number;
    name: string;
    state_id: number;
    state?: {
      id: number;
      name: string;
      abbreviation: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  name: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: number;
  bank_id: number;
  bank?: Bank;
  person_id?: number;
  branch: string;
  account: string;
  account_type: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Frequency {
  id: number;
  name: string;
  days: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const catalogService = {
  /**
   * Obtém os tipos de imóveis
   */
  getPropertyTypes: async (filters: ComplementaryFilter = {}) => {
    try {
      return await api.get('/property-types', { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cria um novo tipo de imóvel
   */
  createPropertyType: async (data: Partial<PropertyType>) => {
    try {
      return await api.post('/property-types', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza um tipo de imóvel
   */
  updatePropertyType: async (id: number, data: Partial<PropertyType>) => {
    try {
      return await api.put(`/property-types/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove um tipo de imóvel
   */
  deletePropertyType: async (id: number) => {
    try {
      return await api.delete(`/property-types/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém as cidades
   */
  getCities: (params?: ComplementaryFilter & { state_id?: number }) => api.get('/cities', { params }),
  getCitiesByState: (stateId: number, params?: ComplementaryFilter) => api.get(`/states/${stateId}/cities`, { params }),
  getCity: (id: number) => api.get(`/cities/${id}`),
  createCity: (data: any) => api.post('/cities', data),
  updateCity: (id: number, data: any) => api.put(`/cities/${id}`, data),
  deleteCity: (id: number) => api.delete(`/cities/${id}`),
  
  /**
   * Obtém os bairros
   */
  getNeighborhoods: (params?: ComplementaryFilter & { city_id?: number, state_id?: number }) => api.get('/neighborhoods', { params }),
  getNeighborhoodsByCity: (cityId: number, params?: ComplementaryFilter) => api.get(`/cities/${cityId}/neighborhoods`, { params }),
  getNeighborhood: (id: number) => api.get(`/neighborhoods/${id}`),
  createNeighborhood: (data: any) => api.post('/neighborhoods', data),
  updateNeighborhood: (id: number, data: any) => api.put(`/neighborhoods/${id}`, data),
  deleteNeighborhood: (id: number) => api.delete(`/neighborhoods/${id}`),
  
  /**
   * Obtém as frequências
   */
  getFrequencies: (params?: ComplementaryFilter) => api.get('/frequencies', { params }),
  getFrequency: (id: number) => api.get(`/frequencies/${id}`),
  createFrequency: (data: any) => api.post('/frequencies', data),
  updateFrequency: (id: number, data: any) => api.put(`/frequencies/${id}`, data),
  deleteFrequency: (id: number) => api.delete(`/frequencies/${id}`),
  
  /**
   * Obtém os estados
   */
  getStates: () => api.get('/states'),
  getState: (id: number) => api.get(`/states/${id}`),
  
  /**
   * Obtém os cargos/funções
   */
  getRoles: (params?: ComplementaryFilter, withTrashed: boolean = false) => {
    const queryParams = { 
      ...params, 
      with_trashed: withTrashed 
    };
    return api.get('/roles', { params: queryParams });
  },
  
  getRole: (id: number) => api.get(`/roles/${id}`),
  createRole: (data: any) => api.post('/roles', data),
  updateRole: (id: number, data: any) => api.put(`/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/roles/${id}`),
  
  /**
   * Permissões
   */
  getPermissions: (params?: ComplementaryFilter) => api.get('/permissions', { params }),
  getPermission: (id: number) => api.get(`/permissions/${id}`),
  createPermission: (data: any) => api.post('/permissions', data),
  updatePermission: (id: number, data: any) => api.put(`/permissions/${id}`, data),
  deletePermission: (id: number) => api.delete(`/permissions/${id}`),
  
  /**
   * Relacionamento entre cargos e permissões
   */
  getRolePermissions: (roleId: number) => api.get(`/roles/${roleId}/permissions`),
  assignRolePermissions: (roleId: number, permissionIds: number[]) => api.post(`/roles/${roleId}/permissions`, { permissions: permissionIds }),
  
  /**
   * Bancos e contas bancárias
   */
  getBanks: (params?: ComplementaryFilter) => api.get('/banks', { params }),
  getBank: (id: number) => api.get(`/banks/${id}`),
  createBank: (data: any) => api.post('/banks', data),
  updateBank: (id: number, data: any) => api.put(`/banks/${id}`, data),
  deleteBank: (id: number) => api.delete(`/banks/${id}`),
  
  getBankAccounts: (params?: ComplementaryFilter & { person_id?: number }) => api.get('/bank-accounts', { params }),
  getBankAccount: (id: number) => api.get(`/bank-accounts/${id}`),
  createBankAccount: (data: any) => api.post('/bank-accounts', data),
  updateBankAccount: (id: number, data: any) => api.put(`/bank-accounts/${id}`, data),
  deleteBankAccount: (id: number) => api.delete(`/bank-accounts/${id}`),
}; 