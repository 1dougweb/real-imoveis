import { useState, useEffect } from "react";
import { financialService, Commission } from "@/lib/services";
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
  Plus, 
  Search, 
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  Percent
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Agent {
  id: number;
  name: string;
  role: string;
}

const FinancialCommissions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    status: 'all',
    agent_id: 'all',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    }
  });

  // Carregar comissões e agentes
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
        
        // Carregar comissões
        await fetchCommissions();
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados");
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Função para buscar comissões com filtros
  const fetchCommissions = async () => {
    try {
      const response = await financialService.getCommissions({
        status: filters.status !== 'all' ? filters.status as any : undefined,
        agent_id: filters.agent_id !== 'all' ? parseInt(filters.agent_id) : undefined,
        date_from: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
        date_to: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        sort_by: 'created_at',
        sort_direction: 'desc'
      });
      
      setCommissions(response.data || []);
    } catch (err: any) {
      toast.error("Erro ao buscar comissões");
      console.error("Erro ao buscar comissões:", err);
    }
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    fetchCommissions();
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      agent_id: 'all',
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
      }
    });
    
    // Recarregar comissões sem filtros
    setTimeout(() => {
      fetchCommissions();
    }, 100);
  };

  // Função para aprovar comissão
  const handleApprove = async (id: number) => {
    try {
      const response = await financialService.approveCommission(id);
      
      // Atualiza o estado local imediatamente
      setCommissions(prevCommissions => 
        prevCommissions.map(commission => 
          commission.id === id 
            ? { ...commission, status: 'approved', approved_at: format(new Date(), 'yyyy-MM-dd') } 
            : commission
        )
      );
      
      toast.success("Comissão aprovada com sucesso");
    } catch (err) {
      toast.error("Erro ao aprovar comissão");
      console.error("Erro ao aprovar comissão:", err);
    }
  };

  // Função para pagar comissão
  const handlePay = async (id: number) => {
    try {
      const response = await financialService.payCommission(id, {
        paid_at: format(new Date(), 'yyyy-MM-dd'),
        payment_type_id: 1, // ID padrão para pagamento em dinheiro
      });
      
      // Atualiza o estado local imediatamente
      setCommissions(prevCommissions => 
        prevCommissions.map(commission => 
          commission.id === id 
            ? { ...commission, status: 'paid', paid_at: format(new Date(), 'yyyy-MM-dd') } 
            : commission
        )
      );
      
      toast.success("Comissão marcada como paga com sucesso");
    } catch (err) {
      toast.error("Erro ao marcar comissão como paga");
      console.error("Erro ao marcar comissão como paga:", err);
    }
  };

  // Função para cancelar comissão
  const handleCancel = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar esta comissão?")) return;
    
    try {
      await financialService.cancelCommission(id, "Cancelado pelo usuário");
      
      // Atualiza o estado local imediatamente
      setCommissions(prevCommissions => 
        prevCommissions.map(commission => 
          commission.id === id 
            ? { ...commission, status: 'cancelled' } 
            : commission
        )
      );
      
      toast.success("Comissão cancelada com sucesso");
    } catch (err) {
      toast.error("Erro ao cancelar comissão");
      console.error("Erro ao cancelar comissão:", err);
    }
  };

  // Renderizar status de comissão
  const renderCommissionStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500">Aprovada</Badge>;
      case 'paid':
        return <Badge className="bg-green-500">Paga</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Comissões</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comissão
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.value, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Aprovado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.value, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.value, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(commissions.filter(c => c.status !== 'cancelled').reduce((sum, c) => sum + c.value, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as comissões por período, status ou corretor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Lista de Comissões */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões</CardTitle>
          <CardDescription>
            Listagem de todas as comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : commissions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma comissão encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.agent?.name || "Corretor não especificado"}
                      </TableCell>
                      <TableCell>
                        {commission.contract?.code || "Contrato #" + commission.contract_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(commission.value)}
                      </TableCell>
                      <TableCell>
                        {commission.percentage}%
                      </TableCell>
                      <TableCell>
                        {format(new Date(commission.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {renderCommissionStatus(commission.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {commission.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(commission.id)}
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(commission.id)}
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {commission.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePay(commission.id)}
                              title="Marcar como paga"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            title="Detalhes"
                          >
                            <Eye className="h-4 w-4" />
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

export default FinancialCommissions;
