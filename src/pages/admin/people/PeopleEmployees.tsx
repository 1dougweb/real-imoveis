import { useState, useEffect } from "react";
import { peopleService, catalogService, Person, PersonFilter, Role } from "@/lib/services";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Trash, Eye, Search, Plus, Phone, Mail, Briefcase, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const PeopleEmployees = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Person[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    total_count: 0
  });
  
  // Filtros
  const [filters, setFilters] = useState<PersonFilter>({
    page: 1,
    per_page: 10,
    search: "",
    type: "employee",
    status: undefined,
    role_id: undefined,
    sort_by: "name",
    sort_direction: "asc"
  });

  // Buscar dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [employeesResponse, rolesResponse] = await Promise.all([
          peopleService.getAll(filters),
          catalogService.getRoles()
        ]);
        
        if (employeesResponse.success) {
          setEmployees(employeesResponse.data || []);
          setPagination(employeesResponse.pagination);
        }
        
        if (rolesResponse.success) {
          setRoles(rolesResponse.data || []);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar funcionários");
        console.error("Erro ao carregar funcionários:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Manipular alterações de filtro
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: name !== 'page' ? 1 : value // Resetar para página 1 se qualquer filtro mudar (exceto a própria página)
    }));
  };

  // Navegar para página de detalhes
  const handleViewPerson = (id: number) => {
    navigate(`/admin/pessoas/funcionarios/${id}`);
  };

  // Navegar para página de edição
  const handleEditPerson = (id: number) => {
    navigate(`/admin/pessoas/funcionarios/${id}/editar`);
  };

  // Remover pessoa
  const handleDeletePerson = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        const response = await peopleService.delete(id);
        
        if (response.success) {
          toast({
            title: "Funcionário excluído",
            description: "O funcionário foi excluído com sucesso"
          });
          
          // Atualizar lista após exclusão
          setEmployees(employees.filter(p => p.id !== id));
        } else {
          toast({
            title: "Erro",
            description: response.message || "Não foi possível excluir o funcionário",
            variant: "destructive"
          });
        }
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir funcionário",
          variant: "destructive"
        });
      }
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => navigate('/admin/pessoas/funcionarios/novo')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Utilize os filtros abaixo para refinar sua busca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Busca</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por nome, email..."
                  className="pl-8"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Cargo</Label>
              <Select
                value={filters.role_id ? String(filters.role_id) : ''}
                onValueChange={(value) => handleFilterChange('role_id', value ? Number(value) : undefined)}
              >
                <SelectTrigger id="role_id">
                  <SelectValue placeholder="Todos os cargos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os cargos</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
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
            type: "employee",
            status: undefined,
            role_id: undefined,
            sort_by: "name",
            sort_direction: "asc"
          })}>
            Limpar Filtros
          </Button>
          <Button onClick={() => handleFilterChange('page', 1)}>Aplicar</Button>
        </CardFooter>
      </Card>

      {/* Tabela de Funcionários */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionários</CardTitle>
          <CardDescription>
            {pagination.total_count} funcionários encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : employees.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {filters.search || filters.role_id || filters.status
                ? "Nenhum funcionário encontrado com os filtros atuais"
                : "Nenhum funcionário cadastrado"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`} />
                            <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.document_number}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{employee.role?.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{employee.phone || employee.cell_phone || '-'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.status === 'active' ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge className="bg-gray-500">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewPerson(employee.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditPerson(employee.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-red-500" onClick={() => handleDeletePerson(employee.id)}>
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

export default PeopleEmployees; 