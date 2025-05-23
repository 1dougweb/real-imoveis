import { useState, useEffect, useCallback } from 'react';
import { propertyService, Property, PropertyFilter, PaginatedResponse } from '../lib/services';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  filters: PropertyFilter;
  pagination: PaginationState;
  updateFilters: (newFilters: Partial<PropertyFilter>) => void;
  changePage: (page: number) => void;
  refreshProperties: () => Promise<void>;
}

/**
 * Hook personalizado para gerenciar a listagem, filtragem e paginação de imóveis
 */
export function useProperties(initialFilters: PropertyFilter = {}): UsePropertiesResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilter>({
    page: 1,
    per_page: 10,
    ...initialFilters
  });
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: initialFilters.per_page || 10
  });

  // Função para buscar imóveis da API
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await propertyService.getAll(filters);
      
      if (response.success) {
        setProperties(response.data);
        setPagination({
          currentPage: response.pagination.current_page,
          totalPages: response.pagination.total_pages,
          totalItems: response.pagination.total_count,
          perPage: response.pagination.per_page
        });
      } else {
        setError(response.message || 'Erro ao carregar imóveis');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao comunicar com o servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Efeito para carregar imóveis quando filtros mudarem
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<PropertyFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Volta para a primeira página quando os filtros mudam
    }));
  }, []);

  // Função para mudar de página
  const changePage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  return {
    properties,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    changePage,
    refreshProperties: fetchProperties
  };
} 