import { useState, useEffect } from "react";
import { propertyService, Property, PropertyFilter } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertCircle, Edit, Trash, Eye, Search, Plus, ArrowDownUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

const PropertiesInactive = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    total_count: 0
  });
  
  // Filtros - pré-configurado para imóveis inativos
  const [filters, setFilters] = useState<PropertyFilter>({
    page: 1,
    per_page: 10,
    search: "",
    purpose: undefined, // Qualquer propósito
    property_type_id: undefined,
    status: "inactive", // Filtro fixo para imóveis inativos
    sort_by: "updated_at",
    sort_direction: "desc"
  });

  // Buscar dados
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await propertyService.getAll(filters);
        if (response && response.data) {
          setProperties(response.data);
          setPagination(response.pagination || {
            current_page: 1,
            per_page: 10,
            total_pages: 1,
            total_count: 0
          });
        } else {
          setProperties([]);
          console.error("Formato de resposta inesperado:", response);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar imóveis inativos");
        console.error("Erro ao carregar imóveis inativos:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  // Manipular alterações de filtro
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value === "all" ? undefined : value,
      page: name !== 'page' ? 1 : value, // Resetar para página 1 se qualquer filtro mudar (exceto a própria página)
      status: "inactive" // Manter sempre o filtro de status como inativo
    }));
  };

  // Manipular alterações na ordenação
  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_direction: prev.sort_by === field && prev.sort_direction === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  // Navegar para página de detalhes
  const handleViewProperty = (id: number) => {
    navigate(`/admin/imoveis/${id}`);
  };

  // Navegar para página de edição
  const handleEditProperty = (id: number) => {
    navigate(`/admin/imoveis/${id}/editar`);
  };

  // Remover imóvel
  const handleDeleteProperty = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      try {
        await propertyService.delete(id);
        // Atualizar lista após exclusão
        setProperties(properties.filter(p => p.id !== id));
        alert("Imóvel excluído com sucesso!");
      } catch (err: any) {
        setError(err.message || "Erro ao excluir imóvel");
        console.error("Erro ao excluir imóvel:", err);
      }
    }
  };

  // Reativar imóvel
  const handleActivateProperty = async (id: number) => {
    if (window.confirm("Deseja reativar este imóvel?")) {
      try {
        await propertyService.updateStatus(id, 'active');
        // Atualizar lista após reativação
        setProperties(properties.filter(p => p.id !== id));
        alert("Imóvel reativado com sucesso!");
      } catch (err: any) {
        setError(err.message || "Erro ao reativar imóvel");
        console.error("Erro ao reativar imóvel:", err);
      }
    }
  };

  // Função para renderizar o tipo com ícone adequado
  const renderPurpose = (purpose: string) => {
    switch (purpose) {
      case 'sale':
        return "Venda";
      case 'rent':
        return "Aluguel";
      case 'both':
        return "Venda/Aluguel";
      default:
        return purpose || "-";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Imóveis Inativos</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine sua busca de imóveis inativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Busca</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por título, endereço..."
                  className="pl-8"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Finalidade</Label>
              <Select
                value={filters.purpose || 'all'}
                onValueChange={(value) => handleFilterChange('purpose', value)}
              >
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                  <SelectItem value="both">Venda/Aluguel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="per_page">Itens por página</Label>
              <Select
                value={String(filters.per_page)}
                onValueChange={(value) => handleFilterChange('per_page', Number(value))}
              >
                <SelectTrigger id="per_page">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFilters({
            page: 1,
            per_page: 10,
            search: "",
            purpose: undefined,
            property_type_id: undefined,
            status: "inactive",
            sort_by: "updated_at",
            sort_direction: "desc"
          })}>
            Limpar Filtros
          </Button>
          <Button onClick={() => handleFilterChange('page', 1)}>Aplicar</Button>
        </CardFooter>
      </Card>

      {/* Tabela de Imóveis */}
      <Card>
        <CardHeader>
          <CardTitle>Imóveis Inativos</CardTitle>
          <CardDescription>
            {pagination.total_count} imóveis encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : !properties || properties.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Nenhum imóvel inativo encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Código</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('title')}>
                      <div className="flex items-center">
                        Título
                        {filters.sort_by === 'title' && (
                          <ArrowDownUp className={`ml-1 h-4 w-4 ${filters.sort_direction === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Finalidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('updated_at')}>
                      <div className="flex items-center">
                        Última Atualização
                        {filters.sort_by === 'updated_at' && (
                          <ArrowDownUp className={`ml-1 h-4 w-4 ${filters.sort_direction === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>{property.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                          {property.title}
                        </div>
                      </TableCell>
                      <TableCell>{renderPurpose(property.purpose)}</TableCell>
                      <TableCell>{property.property_type?.name || '-'}</TableCell>
                      <TableCell>{new Date(property.updated_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewProperty(property.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditProperty(property.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100"
                          onClick={() => handleActivateProperty(property.id)}
                        >
                          Reativar
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDeleteProperty(property.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={pagination.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  onClick={() => pagination.current_page > 1 && handleFilterChange('page', pagination.current_page - 1)}
                />
              </PaginationItem>
              
              {[...Array(pagination.total_pages)].map((_, i) => {
                // Limitar número de páginas exibidas
                if (
                  i === 0 || // Primeira página
                  i === pagination.total_pages - 1 || // Última página
                  (i >= pagination.current_page - 2 && i <= pagination.current_page + 1) // Páginas próximas à atual
                ) {
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={pagination.current_page === i + 1}
                        onClick={() => handleFilterChange('page', i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Adicionar elipses para indicar páginas omitidas
                if (
                  (i === 1 && pagination.current_page > 3) ||
                  (i === pagination.total_pages - 2 && pagination.current_page < pagination.total_pages - 3)
                ) {
                  return <PaginationItem key={i}>...</PaginationItem>;
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext
                  className={pagination.current_page >= pagination.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  onClick={() => pagination.current_page < pagination.total_pages && handleFilterChange('page', pagination.current_page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PropertiesInactive;
