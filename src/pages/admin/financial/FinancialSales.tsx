import { useState, useEffect } from "react";
import { financialService } from "@/lib/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  Loader2, 
  Search, 
  FileText,
  Home,
  User,
  Building,
  Download,
  BarChart
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Sale {
  id: number;
  contract_id: number;
  contract_code: string;
  property_id: number;
  property_title: string;
  property_address: string;
  property_type: string;
  buyer_id: number;
  buyer_name: string;
  seller_id: number;
  seller_name: string;
  agent_id: number;
  agent_name: string;
  sale_date: string;
  sale_value: number;
  commission_value: number;
  status: string;
}

interface Agent {
  id: number;
  name: string;
}

interface PropertyType {
  id: number;
  name: string;
}

const FinancialSales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    agent_id: 'all',
    property_type_id: 'all',
    status: 'all',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
      to: new Date()
    }
  });

  // Carregar vendas e dados auxiliares
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carregar agentes (corretores)
        try {
          const peopleResponse = await financialService.getPeople({ type: 'agent' });
          if (peopleResponse && peopleResponse.data) {
            setAgents(peopleResponse.data || []);
          } else {
            setAgents([]);
          }
        } catch (err) {
          console.error("Erro ao carregar agentes:", err);
          setAgents([]);
        }
        
        // Carregar tipos de imóveis
        try {
          const propertyTypesResponse = await financialService.getPropertyTypes();
          if (propertyTypesResponse && propertyTypesResponse.data) {
            setPropertyTypes(propertyTypesResponse.data || []);
          } else {
            setPropertyTypes([]);
          }
        } catch (err) {
          console.error("Erro ao carregar tipos de imóveis:", err);
          setPropertyTypes([]);
        }
        
        // Carregar vendas
        await fetchSales();
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados");
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Função para buscar vendas com filtros
  const fetchSales = async () => {
    try {
      const response = await financialService.getSalesReport({
        start_date: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
        end_date: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        agent_id: filters.agent_id !== 'all' ? parseInt(filters.agent_id) : undefined,
        property_type_id: filters.property_type_id !== 'all' ? parseInt(filters.property_type_id) : undefined
      });
      
      setSales(response.data || []);
    } catch (err: any) {
      toast.error("Erro ao buscar vendas");
      console.error("Erro ao buscar vendas:", err);
    }
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    fetchSales();
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      agent_id: 'all',
      property_type_id: 'all',
      status: 'all',
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1),
        to: new Date()
      }
    });
    
    // Recarregar vendas sem filtros
    setTimeout(() => {
      fetchSales();
    }, 100);
  };

  // Função para gerar contrato
  const handleGenerateContract = async (id: number) => {
    try {
      const response = await financialService.generateSaleContract(id);
      
      // Criar um URL para o blob e fazer o download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-venda-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Contrato gerado com sucesso");
    } catch (err) {
      toast.error("Erro ao gerar contrato");
      console.error("Erro ao gerar contrato:", err);
    }
  };

  // Calcular totais
  const totalSales = sales.length;
  const totalValue = sales.reduce((sum, sale) => sum + sale.sale_value, 0);
  const totalCommission = sales.reduce((sum, sale) => sum + sale.commission_value, 0);
  const averageValue = totalSales > 0 ? totalValue / totalSales : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <Button>
          <BarChart className="h-4 w-4 mr-2" />
          Relatório Detalhado
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSales}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCommission)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as vendas por período, corretor ou tipo de imóvel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de período */}
            <div className="space-y-2">
              <Label>Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Data inicial"
                    )}
                    <span className="mx-2">até</span>
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Data final"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setFilters({
                          ...filters,
                          dateRange: {
                            from: range.from,
                            to: range.to,
                          }
                        });
                      }
                    }}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de corretor */}
            <div className="space-y-2">
              <Label>Corretor</Label>
              <Select 
                value={filters.agent_id} 
                onValueChange={(value) => setFilters({...filters, agent_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os corretores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os corretores</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de tipo de imóvel */}
            <div className="space-y-2">
              <Label>Tipo de Imóvel</Label>
              <Select 
                value={filters.property_type_id} 
                onValueChange={(value) => setFilters({...filters, property_type_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={handleApplyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas</CardTitle>
          <CardDescription>
            Listagem de todas as vendas realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : sales.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma venda encontrada no período selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.contract_code}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          <div>
                            <div className="font-medium">{sale.property_title}</div>
                            <div className="text-xs text-gray-500">{sale.property_type}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {sale.buyer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          {sale.seller_name}
                        </div>
                      </TableCell>
                      <TableCell>{sale.agent_name}</TableCell>
                      <TableCell>
                        {format(new Date(sale.sale_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.sale_value)}
                      </TableCell>
                      <TableCell>
                        {sale.status === 'completed' ? (
                          <Badge className="bg-green-500">Concluído</Badge>
                        ) : sale.status === 'pending' ? (
                          <Badge className="bg-yellow-500">Pendente</Badge>
                        ) : (
                          <Badge className="bg-red-500">Cancelado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateContract(sale.contract_id)}
                            title="Gerar contrato"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Detalhes"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSales;
