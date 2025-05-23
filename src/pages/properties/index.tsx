import { useState } from "react";
import { useProperties } from '../../hooks';
import { PropertyFilter } from '../../lib/services';
import PropertyList from "./components/PropertyList";
import SearchBar from "./components/SearchBar";
import FilterSidebar from "./components/FilterSidebar";
import MobileFilterToggle from "./components/MobileFilterToggle";

const Properties = () => {
  const [showFilters, setShowFilters] = useState(false);
  
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Encontre seu imóvel</h1>
        <p className="text-gray-600">Explore nossa seleção de imóveis para compra e aluguel</p>
      </div>
      
      <SearchBar />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <MobileFilterToggle showFilters={showFilters} setShowFilters={setShowFilters} />
        
        {/* Filters - Sidebar */}
        <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FilterSidebar />
        </div>
        
        {/* Properties */}
        <div className="lg:w-3/4">
          <PropertyList />
        </div>
      </div>
    </div>
  );
};

export default Properties;
