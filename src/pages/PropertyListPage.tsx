import { useState } from 'react';
import { useProperties } from '../hooks';
import { PropertyFilter } from '../lib/services';

export default function PropertyListPage() {
  // Estados locais para filtros de formulário
  const [formFilters, setFormFilters] = useState<PropertyFilter>({
    purpose: 'sale',
    sort_by: 'created_at',
    sort_direction: 'desc'
  });

  // Hook para buscar e filtrar imóveis
  const {
    properties,
    loading,
    error,
    pagination,
    updateFilters,
    changePage
  } = useProperties(formFilters);

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Trata valores numéricos
    if (type === 'number') {
      setFormFilters(prev => ({
        ...prev,
        [name]: value ? Number(value) : undefined
      }));
    } else {
      setFormFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Função para aplicar filtros
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(formFilters);
  };

  // Renderiza mensagem de erro
  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
        <p>Erro ao carregar imóveis: {error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => updateFilters(formFilters)}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Imóveis</h1>
      
      {/* Formulário de filtros */}
      <form onSubmit={handleApplyFilters} className="bg-gray-100 p-4 rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Finalidade</label>
            <select
              name="purpose"
              value={formFilters.purpose || ''}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Todas</option>
              <option value="sale">Venda</option>
              <option value="rent">Aluguel</option>
              <option value="both">Venda e Aluguel</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Ordenar por</label>
            <select
              name="sort_by"
              value={formFilters.sort_by || 'created_at'}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="created_at">Data de Cadastro</option>
              <option value="sale_price">Preço de Venda</option>
              <option value="rent_price">Valor do Aluguel</option>
              <option value="area">Área</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Direção</label>
            <select
              name="sort_direction"
              value={formFilters.sort_direction || 'desc'}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="desc">Maior para Menor</option>
              <option value="asc">Menor para Maior</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </form>
      
      {/* Exibição dos resultados */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {properties.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded">
              <p className="text-gray-500">Nenhum imóvel encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <div 
                  key={property.id} 
                  className="border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-gray-200">
                    {property.main_photo ? (
                      <img 
                        src={property.main_photo} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Sem imagem
                      </div>
                    )}
                    
                    {/* Badge de status */}
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-blue-500 text-white">
                      {property.status === 'active' ? 'Ativo' : 
                       property.status === 'sold' ? 'Vendido' : 
                       property.status === 'rented' ? 'Alugado' : 'Inativo'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h2 className="font-semibold text-lg mb-1">{property.title}</h2>
                    <p className="text-sm text-gray-500 mb-2">
                      {property.neighborhood?.name}, {property.city?.name}
                    </p>
                    
                    {property.purpose === 'sale' || property.purpose === 'both' ? (
                      <p className="text-blue-600 font-bold">
                        R$ {property.sale_price?.toLocaleString('pt-BR')}
                      </p>
                    ) : null}
                    
                    {property.purpose === 'rent' || property.purpose === 'both' ? (
                      <p className="text-green-600">
                        R$ {property.rent_price?.toLocaleString('pt-BR')}/mês
                      </p>
                    ) : null}
                    
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                      {property.bedrooms && (
                        <span>{property.bedrooms} quarto(s)</span>
                      )}
                      
                      {property.bathrooms && (
                        <span>{property.bathrooms} banheiro(s)</span>
                      )}
                      
                      {property.area && (
                        <span>{property.area}m²</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => changePage(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  &laquo;
                </button>
                
                <button
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  &lt;
                </button>
                
                <span className="px-3 py-1">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  &gt;
                </button>
                
                <button
                  onClick={() => changePage(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 