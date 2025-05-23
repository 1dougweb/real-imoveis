import { useState, useEffect } from "react";
import { financialService, Transaction } from "@/lib/services";
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
  ArrowUpRight, 
  FileText,
  CheckCircle,
  XCircle,
  Download
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Category {
  id: number;
  name: string;
  type: string;
}

const FinancialReceivables = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    status: 'all',
    category_id: 'all',
    description: '',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }
  });

  // Carregar transações e categorias
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carregar categorias
        try {
          const categoriesResponse = await financialService.getCategories('receivable');
          if (categoriesResponse && categoriesResponse.data) {
            setCategories(categoriesResponse.data);
          } else {
            setCategories([]);
          }
        } catch (err) {
          console.error("Erro ao carregar categorias:", err);
          setCategories([]);
        }
        
        // Carregar transações
        await fetchTransactions();
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados");
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Função para buscar transações com filtros
  const fetchTransactions = async () => {
    try {
      const response = await financialService.getTransactions({
        type: 'receivable',
        status: filters.status !== 'all' ? filters.status as any : undefined,
        category_id: filters.category_id !== 'all' ? parseInt(filters.category_id) : undefined,
        due_date_from: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
        due_date_to: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        sort_by: 'due_date',
        sort_direction: 'asc'
      });
      
      setTransactions(response.data || []);
    } catch (err: any) {
      toast.error("Erro ao buscar transações");
      console.error("Erro ao buscar transações:", err);
    }
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    fetchTransactions();
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      category_id: 'all',
      description: '',
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      }
    });
    
    // Recarregar transações sem filtros
    setTimeout(() => {
      fetchTransactions();
    }, 100);
  };

  // Função para marcar como recebido
  const handleMarkAsPaid = async (id: number) => {
    try {
      const response = await financialService.payTransaction(id, {
        paid_at: format(new Date(), 'yyyy-MM-dd'),
        amount_paid: transactions.find(t => t.id === id)?.amount || 0,
        payment_type_id: 1, // ID padrão para pagamento em dinheiro
      });
      
      // Atualiza o estado local imediatamente
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, status: 'paid', paid_at: format(new Date(), 'yyyy-MM-dd') } 
            : transaction
        )
      );
      
      toast.success("Conta marcada como recebida com sucesso");
    } catch (err) {
      toast.error("Erro ao marcar como recebida");
      console.error("Erro ao marcar como recebida:", err);
    }
  };

  // Função para cancelar
  const handleCancel = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar esta conta?")) return;
    
    try {
      await financialService.cancelTransaction(id, "Cancelado pelo usuário");
      
      // Atualiza o estado local imediatamente
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, status: 'cancelled' } 
            : transaction
        )
      );
      
      toast.success("Conta cancelada com sucesso");
    } catch (err) {
      toast.error("Erro ao cancelar conta");
      console.error("Erro ao cancelar conta:", err);
    }
  };

  // Função para gerar recibo
  const handleGenerateReceipt = async (id: number) => {
    try {
      const response = await financialService.generatePaymentReceipt(id);
      
      // Criar um URL para o blob e fazer o download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Recibo gerado com sucesso");
    } catch (err) {
      toast.error("Erro ao gerar recibo");
      console.error("Erro ao gerar recibo:", err);
    }
  };

  // Renderizar status de transação
  const renderTransactionStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Recebido</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'partial':
        return <Badge className="bg-blue-500">Parcial</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contas a Receber</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as contas a receber por período, status ou categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro de período */}
            <div className="space-y-2">
              <Label>Período de Vencimento</Label>
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
                  <SelectItem value="paid">Recebido</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select 
                value={filters.category_id} 
                onValueChange={(value) => setFilters({...filters, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Buscar por descrição"
                  value={filters.description}
                  onChange={(e) => setFilters({...filters, description: e.target.value})}
                />
              </div>
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

      {/* Lista de Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>
            Listagem de todas as contas a receber
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma conta a receber encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Cliente/Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-2 text-green-600" />
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.due_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        {transaction.category?.name || "Sem categoria"}
                      </TableCell>
                      <TableCell>
                        {transaction.person?.name || "Não especificado"}
                      </TableCell>
                      <TableCell>
                        {renderTransactionStatus(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {transaction.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(transaction.id)}
                                title="Marcar como recebido"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancel(transaction.id)}
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {transaction.status === 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateReceipt(transaction.id)}
                              title="Gerar recibo"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
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

export default FinancialReceivables;
