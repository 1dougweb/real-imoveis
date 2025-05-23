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
import { Building, Edit, Trash, Eye, Search, Plus, ArrowDownUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

const PropertiesRentals = () => {
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
  
  // Filtros - pré-configurado para imóveis para aluguel
  const [filters, setFilters] = useState<PropertyFilter>({
    page: 1,
    per_page: 10,
    search: "",
    purpose: "rent", // Filtro fixo para imóveis para aluguel
    property_type_id: undefined,
    status: "active", // Por padrão, mostrar apenas imóveis ativos
    sort_by: "created_at",
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
        setError(err.message || "Erro ao carregar imóveis para aluguel");
        console.error("Erro ao carregar imóveis para aluguel:", err);
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
      purpose: "rent" // Manter sempre o filtro de propósito como aluguel
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Imóveis para Aluguel</h1>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate('/admin/imoveis/novo?purpose=rent')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Imóvel para Aluguel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine sua busca de imóveis para aluguel</CardDescription>
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="rented">Alugado</SelectItem>
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
            purpose: "rent", // Manter filtro fixo
            property_type_id: undefined,
            status: "active",
            sort_by: "created_at",
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
          <CardTitle>Imóveis para Aluguel</CardTitle>
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
            <div className="text-center p-8 text-gray-500">Nenhum imóvel para aluguel encontrado</div>
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
                    <TableHead>Tipo</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('rent_price')}>
                      <div className="flex items-center">
                        Valor Mensal
                        {filters.sort_by === 'rent_price' && (
                          <ArrowDownUp className={`ml-1 h-4 w-4 ${filters.sort_direction === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSortChange('created_at')}>
                      <div className="flex items-center">
                        Data
                        {filters.sort_by === 'created_at' && (
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
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>{property.property_type?.name || '-'}</TableCell>
                      <TableCell>{formatCurrency(property.rent_price || 0)}/mês</TableCell>
                      <TableCell>
                        {property.status === 'active' ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : property.status === 'inactive' ? (
                          <Badge className="bg-gray-500">Inativo</Badge>
                        ) : property.status === 'rented' ? (
                          <Badge className="bg-blue-500">Alugado</Badge>
                        ) : (
                          <Badge>{property.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(property.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewProperty(property.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditProperty(property.id)}>
                          <Edit className="h-4 w-4" />
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

export default PropertiesRentals;
