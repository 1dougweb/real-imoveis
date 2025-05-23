import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowDownRight, 
  FileText,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface Category {
  id: number;
  name: string;
  type: string;
}

interface TransactionWithCategory extends Omit<Transaction, 'category'> {
  category: {
    name: string;
  };
}

const FinancialPayables = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
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
          const categoriesResponse = await financialService.getCategories('payable');
          setCategories(categoriesResponse.map(category => ({
            id: 1, // Temporary ID until backend provides proper category IDs
            name: category,
            type: 'payable'
          })));
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
        type: 'payable',
        status: filters.status !== 'all' ? filters.status as any : undefined,
        category_id: filters.category_id !== 'all' ? parseInt(filters.category_id) : undefined,
        due_date_from: filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
        due_date_to: filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
        sort_by: 'due_date',
        sort_direction: 'asc'
      });
      
      // Transform the response to match TransactionWithCategory type
      const transformedTransactions = response.map(transaction => ({
        ...transaction,
        category: {
          name: transaction.category
        }
      }));
      
      setTransactions(transformedTransactions);
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

  // Função para marcar como pago
  const handleMarkAsPaid = async (id: number) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) return;

      await financialService.markAsPaid(id, {
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        notes: 'Marcado como pago via interface'
      });
      
      // Atualiza o estado local imediatamente
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, status: 'paid', payment_date: format(new Date(), 'yyyy-MM-dd') } 
            : transaction
        )
      );
      
      toast.success("Conta marcada como paga com sucesso");
    } catch (err) {
      toast.error("Erro ao marcar como paga");
      console.error("Erro ao marcar como paga:", err);
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

  // Função para criar nova categoria
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    setIsCreatingCategory(true);
    try {
      console.log('Iniciando criação de categoria:', {
        name: newCategoryName.trim(),
        type: 'payable'
      });

      const response = await financialService.createCategory({
        name: newCategoryName.trim(),
        type: 'payable'
      });

      console.log('Categoria criada com sucesso:', response);
      
      // Recarregar categorias
      const categoriesResponse = await financialService.getCategories('payable');
      console.log('Categorias atualizadas:', categoriesResponse);

      setCategories(categoriesResponse.map(category => ({
        id: 1, // Temporary ID until backend provides proper category IDs
        name: category,
        type: 'payable'
      })));
      
      setNewCategoryName("");
      setShowNewCategoryDialog(false);
      toast.success("Categoria criada com sucesso");
    } catch (error: any) {
      console.error("Erro detalhado ao criar categoria:", {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = "Erro ao criar categoria";
      
      // Tentar extrair mensagem de erro mais específica
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Renderizar status de transação
  const renderTransactionStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Pago</Badge>;
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
        <h1 className="text-2xl font-bold">Contas a Pagar</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowNewCategoryDialog(true)}
            title="Nova Categoria"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
          <Button asChild>
            <Link to="/admin/financeiro/nova-transacao?type=payable">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as contas a pagar por período, status ou categoria
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
                  <SelectItem value="paid">Pago</SelectItem>
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

      {/* Modal de Nova Categoria */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para contas a pagar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria</Label>
              <Input
                id="categoryName"
                placeholder="Digite o nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCategoryDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isCreatingCategory}
            >
              {isCreatingCategory ? "Criando..." : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de Contas a Pagar */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Pagar</CardTitle>
          <CardDescription>
            Listagem de todas as contas a pagar
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
              Nenhuma conta a pagar encontrada.
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <ArrowDownRight className="h-4 w-4 mr-2 text-red-600" />
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
                                title="Marcar como pago"
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
                          <Button
                            size="sm"
                            variant="outline"
                            title="Recibo"
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

export default FinancialPayables;
