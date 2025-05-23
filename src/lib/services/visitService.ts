import api from '../api';

export interface Visit {
  id: number;
  property_id: number;
  property?: {
    id: number;
    title: string;
    address: string;
    main_photo?: string;
  };
  client_id: number;
  client?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  agent_id?: number;
  agent?: {
    id: number;
    name: string;
  };
  visit_date: string; // formato ISO
  visit_time: string; // formato HH:MM
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  feedback_rating?: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface VisitFilter {
  page?: number;
  per_page?: number;
  property_id?: number;
  client_id?: number;
  agent_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const visitService = {
  /**
   * Lista todas as visitas com filtros opcionais
   */
  getAll: async (filters: VisitFilter = {}) => {
    try {
      return await api.get('/visits', { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém uma visita específica pelo ID
   */
  getById: async (id: number) => {
    try {
      return await api.get(`/visits/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Agenda uma nova visita
   */
  schedule: async (data: Partial<Visit>) => {
    try {
      return await api.post('/visits', data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Atualiza uma visita existente
   */
  update: async (id: number, data: Partial<Visit>) => {
    try {
      return await api.put(`/visits/${id}`, data);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cancela uma visita
   */
  cancel: async (id: number, reason?: string) => {
    try {
      return await api.put(`/visits/${id}/cancel`, { reason });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Confirma uma visita
   */
  confirm: async (id: number) => {
    try {
      return await api.put(`/visits/${id}/confirm`);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Marca uma visita como concluída
   */
  complete: async (id: number, feedback?: string, rating?: number) => {
    try {
      return await api.put(`/visits/${id}/complete`, { feedback, rating });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Reagenda uma visita
   */
  reschedule: async (id: number, visit_date: string, visit_time: string, reason?: string) => {
    try {
      return await api.put(`/visits/${id}/reschedule`, { visit_date, visit_time, reason });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém os horários disponíveis para um imóvel em uma data específica
   */
  getAvailableSlots: async (propertyId: number, date: string) => {
    try {
      return await api.get(`/properties/${propertyId}/available-slots`, { params: { date } });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém as visitas de um cliente
   */
  getClientVisits: async (clientId: number, filters: Partial<VisitFilter> = {}) => {
    try {
      return await api.get(`/clients/${clientId}/visits`, { params: filters });
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Obtém as visitas de um corretor
   */
  getAgentVisits: async (agentId: number, filters: Partial<VisitFilter> = {}) => {
    try {
      return await api.get(`/agents/${agentId}/visits`, { params: filters });
    } catch (error) {
      throw error;
    }
  }
}; 