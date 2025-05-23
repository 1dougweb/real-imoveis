import api from '../api';
import { Person } from './peopleService';
import { Property } from './propertyService';

export interface Contract {
  id: number;
  type: 'sale' | 'rent'; // Tipo de contrato (venda ou aluguel)
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'completed';
  property_id: number;
  property?: Property;
  client_id: number;
  client?: Person;
  agent_id: number;
  agent?: Person;
  value: number; // Valor do contrato (valor de venda ou valor mensal do aluguel)
  start_date: string;
  end_date?: string; // Data de término (para contratos de aluguel)
  payment_day?: number; // Dia de pagamento mensal (para aluguéis)
  duration_months?: number; // Duração em meses (para aluguéis)
  payment_method: string;
  payment_type_id: number;
  payment_type?: {
    id: number;
    name: string;
  };
  bank_account_id?: number;
  bank_account?: {
    id: number;
    bank_name: string;
    branch: string;
    account: string;
  };
  commission_value?: number; // Valor da comissão
  commission_percentage?: number; // Percentual da comissão
  notes?: string;
  documents?: {
    id: number;
    name: string;
    file_path: string;
    document_type_id: number;
    document_type_name?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface ContractFilter {
  page?: number;
  per_page?: number;
  type?: 'sale' | 'rent';
  status?: 'pending' | 'active' | 'cancelled' | 'expired' | 'completed';
  client_id?: number;
  agent_id?: number;
  property_id?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface ProposalData {
  type: 'sale' | 'rent';
  property_id: number;
  client_id: number;
  agent_id: number;
  value: number;
  payment_method: string;
  payment_type_id: number;
  start_date: string;
  end_date?: string;
  duration_months?: number;
  payment_day?: number;
  notes?: string;
}

export const contractService = {
  /**
   * Lista todos os contratos com filtros opcionais
   */
  getAll: async (filters: ContractFilter = {}) => {
    try {
      return await api.get('/contracts', { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém um contrato específico pelo ID
   */
  getById: async (id: number) => {
    try {
      return await api.get(`/contracts/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cria um novo contrato
   */
  create: async (data: Partial<Contract>) => {
    try {
      return await api.post('/contracts', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza um contrato existente
   */
  update: async (id: number, data: Partial<Contract>) => {
    try {
      return await api.put(`/contracts/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove um contrato
   */
  delete: async (id: number) => {
    try {
      return await api.delete(`/contracts/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Gera PDF de um contrato
   */
  generatePdf: async (id: number) => {
    try {
      const response = await api.get(`/contracts/${id}/generate-pdf`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cria uma nova proposta de compra/locação
   */
  createProposal: async (data: ProposalData) => {
    try {
      return await api.post('/proposals', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Aceita uma proposta, transformando-a em contrato
   */
  acceptProposal: async (id: number) => {
    try {
      return await api.put(`/proposals/${id}/accept`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Rejeita uma proposta
   */
  rejectProposal: async (id: number, reason?: string) => {
    try {
      return await api.put(`/proposals/${id}/reject`, { reason });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Adiciona um documento a um contrato
   */
  addDocument: async (contractId: number, documentData: FormData) => {
    try {
      return await api.post(`/contracts/${contractId}/documents`, documentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Remove um documento de um contrato
   */
  removeDocument: async (contractId: number, documentId: number) => {
    try {
      return await api.delete(`/contracts/${contractId}/documents/${documentId}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Gera um laudo de vistoria para um contrato
   */
  generateInspectionReport: async (contractId: number, data: any) => {
    try {
      return await api.post(`/contracts/${contractId}/inspection-report`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cancela um contrato
   */
  cancel: async (id: number, reason: string) => {
    try {
      return await api.put(`/contracts/${id}/cancel`, { reason });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Finaliza um contrato
   */
  complete: async (id: number) => {
    try {
      return await api.put(`/contracts/${id}/complete`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Renova um contrato de aluguel
   */
  renew: async (id: number, data: { duration_months: number; new_value?: number }) => {
    try {
      return await api.put(`/contracts/${id}/renew`, data);
    } catch (error) {
      throw error;
    }
  }
}; 