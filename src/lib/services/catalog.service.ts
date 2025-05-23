import { apiService } from '@/lib/api';
import { ApiResponse, ComplementaryFilter, PaginatedResponse } from './types';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  guard_name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PropertyType {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export const catalogService = {
  // Role Management
  getRoles: async (filter: ComplementaryFilter) => {
    try {
      const response = await apiService.get('/roles', filter);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar cargos');
    }
  },

  getRole: async (id: number) => {
    try {
      const response = await apiService.get(`/roles/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar cargo');
    }
  },

  createRole: async (data: Partial<Role>) => {
    try {
      const response = await apiService.post('/roles', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao criar cargo');
    }
  },

  updateRole: async (id: number, data: Partial<Role>) => {
    try {
      const response = await apiService.put(`/roles/${id}`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar cargo');
    }
  },

  deleteRole: async (id: number) => {
    try {
      const response = await apiService.delete(`/roles/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao excluir cargo');
    }
  },

  // Property Type Management
  // ... existing property type functions ...
}; 