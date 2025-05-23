import api from '../api';

// Interface for property count response
export interface PropertyCountResponse {
  total: number;
  for_sale: number;
  for_rent: number;
  sold: number;
  rented: number;
  inactive: number;
  featured: number;
}

// Interface for property status response
export interface PropertyStatusResponse {
  available: number;
  reserved: number;
  sold: number;
  rented: number;
  inactive: number;
}

// Basic property interface
export interface Property {
  id: number;
  title: string;
  description: string;
  slug: string;
  price: number;
  status: string;
  purpose: string;
  is_featured: boolean;
  property_type: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  neighborhood: {
    id: number;
    name: string;
  };
  address: string;
  [key: string]: any;
}

// Interface for visit count response
export interface VisitCountResponse {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  today: number;
  this_week: number;
  this_month: number;
}

// Basic visit interface
export interface Visit {
  id: number;
  visit_date: string;
  status: string;
  notes: string;
  property: Property;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  agent: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  [key: string]: any;
}

// Interface for contract count response
export interface ContractCountResponse {
  total: number;
  sale: number;
  rent: number;
  active: number;
  pending: number;
  expired: number;
  cancelled: number;
}

// Basic contract interface
export interface Contract {
  id: number;
  type: string;
  status: string;
  value: number;
  start_date: string;
  end_date: string | null;
  property: Property;
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  agent: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  [key: string]: any;
}

// Interface for people count response
export interface PeopleCountResponse {
  total: number;
  clients: number;
  owners: number;
  agents: number;
  employees: number;
}

// Interface for financial summary response
export interface FinancialSummaryResponse {
  receivable: number;
  payable: number;
  sales_this_month: number;
  rentals_this_month: number;
  received_this_month: number;
  paid_this_month: number;
  balance: number;
  month_balance: number;
}

export const dashboardService = {
  /**
   * Obter contagem de imóveis por tipo (venda, locação, etc.)
   */
  getPropertyCount: async (): Promise<PropertyCountResponse> => {
    try {
      const response = await api.get('/dashboard/properties/count');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter contagem de imóveis:', error);
      throw error;
    }
  },
  
  /**
   * Obter dados de imóveis agrupados por status
   */
  getPropertyStatus: async (): Promise<PropertyStatusResponse> => {
    try {
      const response = await api.get('/dashboard/properties/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status dos imóveis:', error);
      throw error;
    }
  },
  
  /**
   * Obter imóveis adicionados recentemente
   */
  getRecentProperties: async (limit = 5): Promise<Property[]> => {
    try {
      const response = await api.get('/dashboard/properties/recent', { limit });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter imóveis recentes:', error);
      throw error;
    }
  },
  
  /**
   * Obter contagem de visitas por status
   */
  getVisitCount: async (): Promise<VisitCountResponse> => {
    try {
      const response = await api.get('/dashboard/visits/count');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter contagem de visitas:', error);
      throw error;
    }
  },
  
  /**
   * Obter próximas visitas agendadas
   */
  getUpcomingVisits: async (limit = 5): Promise<Visit[]> => {
    try {
      const response = await api.get('/dashboard/visits/upcoming', { limit });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter próximas visitas:', error);
      throw error;
    }
  },
  
  /**
   * Obter contagem de contratos por tipo
   */
  getContractCount: async (): Promise<ContractCountResponse> => {
    try {
      const response = await api.get('/dashboard/contracts/count');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter contagem de contratos:', error);
      throw error;
    }
  },
  
  /**
   * Obter contratos recentes
   */
  getRecentContracts: async (limit = 5): Promise<Contract[]> => {
    try {
      const response = await api.get('/dashboard/contracts/recent', { limit });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter contratos recentes:', error);
      throw error;
    }
  },
  
  /**
   * Obter contagem de pessoas por tipo
   */
  getPeopleCount: async (): Promise<PeopleCountResponse> => {
    try {
      const response = await api.get('/dashboard/people/count');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter contagem de pessoas:', error);
      throw error;
    }
  },
  
  /**
   * Obter resumo financeiro
   */
  getFinancialSummary: async (): Promise<FinancialSummaryResponse> => {
    try {
      const response = await api.get('/dashboard/financial/summary');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      throw error;
    }
  }
}; 