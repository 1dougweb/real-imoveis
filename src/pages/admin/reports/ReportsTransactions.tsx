import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, Filter, Calendar, Search, RefreshCw, FileText, Eye, Pencil, Trash2, FileDown, ListFilter } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { financialService, Transaction, TransactionFilter } from "@/lib/services/financialService";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

interface SummaryData {
  total_receivables: number;
  total_payables: number;
  total_received: number;
  total_paid: number;
  balance: number;
}

const ReportsTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    total_receivables: 0,
    total_payables: 0,
    total_received: 0,
    total_paid: 0,
    balance: 0
  });
  const [filters, setFilters] = useState<TransactionFilter>({
    due_date_from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    due_date_to: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'),
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status para o Badge
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Definição das colunas da tabela
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
      accessorKey: "description",
      header: "Descrição",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className={row.original.type === 'receivable' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
          {row.original.type === 'receivable' ? 'Recebimento' : 'Pagamento'}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.amount)}</span>,
    },
    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.category === 'rent' ? 'Aluguel' : 
           row.original.category === 'sale' ? 'Venda' : 
           row.original.category === 'commission' ? 'Comissão' : 
           row.original.category === 'maintenance' ? 'Manutenção' : 
           row.original.category === 'tax' ? 'Imposto' : 'Outro'}
        </span>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Data Vencimento",
      cell: ({ row }) => formatDate(row.original.due_date),
    },
    {
      accessorKey: "payment_date",
      header: "Data Pagamento",
      cell: ({ row }) => formatDate(row.original.payment_date || ''),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={
          row.original.status === 'pending' ? statusStyles.pending :
          row.original.status === 'paid' ? statusStyles.paid :
          statusStyles.cancelled
        }>
          {row.original.status === 'pending' ? 'Pendente' : 
           row.original.status === 'paid' ? 'Pago' : 'Cancelado'}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => viewTransactionDetails(row.original.id)}
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => editTransaction(row.original.id)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => confirmDeleteTransaction(row.original.id)}
            title="Excluir"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {row.original.status === 'paid' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => viewReceipt(row.original.id)}
              title="Baixar recibo"
            >
              <FileDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await financialService.getTransactions(filters);
      setTransactions(data);
      
      // Calcular o resumo dos dados
      const summary: SummaryData = {
        total_receivables: 0,
        total_payables: 0,
        total_received: 0,
        total_paid: 0,
        balance: 0
      };
      
      data.forEach(transaction => {
        if (transaction.type === 'receivable') {
          if (transaction.status === 'pending') {
            summary.total_receivables += transaction.amount;
          } else if (transaction.status === 'paid') {
            summary.total_received += transaction.amount;
          }
        } else if (transaction.type === 'payable') {
          if (transaction.status === 'pending') {
            summary.total_payables += transaction.amount;
          } else if (transaction.status === 'paid') {
            summary.total_paid += transaction.amount;
          }
        }
      });
      
      summary.balance = (summary.total_received - summary.total_paid);
      setSummaryData(summary);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Não foi possível carregar as transações");
    } finally {
      setLoading(false);
    }
  };

  // Exportar para Excel
  const exportReport = async () => {
    setExportLoading(true);
    try {
      // Implementação real da exportação para Excel
      const response = await financialService.exportTransactionsExcel(filters);
      
      // Criar um URL blob para download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transacoes-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatório Excel exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar relatório Excel");
    } finally {
      setExportLoading(false);
    }
  };

  // Gerar relatório em PDF
  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      // Implementação real da geração de PDF
      const response = await financialService.exportTransactionsPDF(filters);
      
      // Criar um URL blob para download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transacoes-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o relatório em PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  // Visualizar recibo
  const viewReceipt = async (transactionId: number) => {
    try {
      const receipt = await financialService.generatePaymentReceipt(transactionId);
      // Criar URL para o blob e abrir em nova janela
      const url = URL.createObjectURL(receipt);
      
      // Cria link para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-transacao-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Recibo gerado com sucesso");
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);
      toast.error("Não foi possível gerar o recibo");
    }
  };

  // Ver detalhes de uma transação
  const viewTransactionDetails = (id: number) => {
    // Em produção, abriria um modal ou redirecionaria para uma página de detalhes
    // Simulação para demonstração
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      toast.info(`Detalhes da transação #${id}: ${transaction.description}`);
    }
  };

  // Editar transação
  const editTransaction = (id: number) => {
    // Em produção, redirecionaria para uma página de edição
    window.location.href = `/admin/financeiro/nova-transacao?id=${id}`;
  };

  // Abrir diálogo de confirmação para excluir
  const confirmDeleteTransaction = (id: number) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Excluir transação após confirmação
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    setDeleteLoading(true);
    try {
      await financialService.deleteTransaction(transactionToDelete);
      toast.success("Transação excluída com sucesso!");
      // Recarregar dados
      loadTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir a transação");
    } finally {
      setDeleteLoading(false);
      setTransactionToDelete(null);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      due_date_from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
      due_date_to: format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd'),
    });
  };

  // Efeito para carregar dados quando os filtros mudarem
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatório de Movimentações</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
          <Link to="/admin/relatorios/categorias">
            <Button variant="outline">
              <ListFilter className="h-4 w-4 mr-2" />
              Gerenciar Categorias
            </Button>
          </Link>
          <Button 
            onClick={exportReport} 
            disabled={exportLoading || transactions.length === 0}
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar Excel
          </Button>
          <Button 
            onClick={generatePDF} 
            disabled={pdfLoading || transactions.length === 0}
            variant="secondary"
          >
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" /> 
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => setFilters({...filters, type: value === 'all' ? undefined : value as 'receivable' | 'payable'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="receivable">Recebimentos</SelectItem>
                  <SelectItem value="payable">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value as 'pending' | 'paid' | 'cancelled'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="description"
                  placeholder="Buscar por descrição"
                  className="pl-8"
                  value={filters.description || ''}
                  onChange={(e) => setFilters({...filters, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Data Vencimento De</Label>
              <DatePicker
                className="w-full"
                selected={filters.due_date_from ? new Date(filters.due_date_from) : undefined}
                onSelect={(date) => setFilters({
                  ...filters, 
                  due_date_from: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Vencimento Até</Label>
              <DatePicker
                className="w-full"
                selected={filters.due_date_to ? new Date(filters.due_date_to) : undefined}
                onSelect={(date) => setFilters({
                  ...filters, 
                  due_date_to: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={loadTransactions} 
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">A Receber</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summaryData.total_receivables)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">A Pagar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(summaryData.total_payables)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Recebido</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryData.total_received)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Pago</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryData.total_paid)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Saldo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-2xl font-bold ${summaryData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summaryData.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Movimentações</CardTitle>
          <CardDescription>
            Todas as transações financeiras de acordo com os filtros aplicados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma transação encontrada com os filtros atuais.
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={transactions} 
              searchColumn="description"
              searchPlaceholder="Buscar por descrição..."
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total de registros: {transactions.length}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Transação"
        description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        onConfirm={handleDeleteTransaction}
        variant="delete"
        iconType="delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ReportsTransactions;
