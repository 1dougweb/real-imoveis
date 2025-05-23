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
import { Loader2, Download, Filter, Search, RefreshCw, FileText, Eye, Pencil, Trash2, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { financialService, Commission, CommissionFilter } from "@/lib/services/financialService";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

const formatPercentage = (value: number) => {
  return `${value}%`;
};

interface SummaryData {
  total_pending: number;
  total_approved: number;
  total_paid: number;
  total_cancelled: number;
  count_pending: number;
  count_approved: number;
  count_paid: number;
  count_cancelled: number;
}

const ReportsCommissions = () => {
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    total_pending: 0,
    total_approved: 0,
    total_paid: 0,
    total_cancelled: 0,
    count_pending: 0,
    count_approved: 0,
    count_paid: 0,
    count_cancelled: 0
  });
  const [filters, setFilters] = useState<CommissionFilter>({});
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Approve confirmation dialog state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [commissionToApprove, setCommissionToApprove] = useState<number | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commissionToDelete, setCommissionToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add categories state
  const [categories, setCategories] = useState<any[]>([]);

  // Definição das colunas da tabela
  const columns: ColumnDef<Commission>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
      accessorKey: "agent",
      header: "Corretor",
      cell: ({ row }) => <span>{row.original.agent?.name || '-'}</span>,
    },
    {
      accessorKey: "contract",
      header: "Contrato",
      cell: ({ row }) => <span>{row.original.contract?.code || `#${row.original.contract_id}`}</span>,
    },
    {
      accessorKey: "percentage",
      header: "Percentual",
      cell: ({ row }) => <span>{formatPercentage(row.original.percentage)}</span>,
    },
    {
      accessorKey: "value",
      header: "Valor",
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.value)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={
          row.original.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          row.original.status === 'approved' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'paid' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }>
          {row.original.status === 'pending' ? 'Pendente' : 
           row.original.status === 'approved' ? 'Aprovada' : 
           row.original.status === 'paid' ? 'Paga' : 'Cancelada'}
        </Badge>
      ),
    },
    {
      accessorKey: "paid_at",
      header: "Data Pagamento",
      cell: ({ row }) => formatDate(row.original.paid_at),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => viewCommissionDetails(row.original.id)}
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {row.original.status === 'pending' && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => confirmApproveCommission(row.original.id)}
                title="Aprovar"
                className="text-green-500 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => editCommission(row.original.id)}
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => confirmDeleteCommission(row.original.id)}
                title="Excluir"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {row.original.status === 'approved' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => markAsPaid(row.original.id)}
              title="Marcar como paga"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const loadCommissions = async () => {
    setLoading(true);
    try {
      const data = await financialService.getCommissions(filters);
      setCommissions(data);
      
      // Calcular o resumo dos dados
      const summary: SummaryData = {
        total_pending: 0,
        total_approved: 0,
        total_paid: 0,
        total_cancelled: 0,
        count_pending: 0,
        count_approved: 0,
        count_paid: 0,
        count_cancelled: 0
      };
      
      data.forEach(commission => {
        if (commission.status === 'pending') {
          summary.total_pending += commission.value;
          summary.count_pending++;
        } else if (commission.status === 'approved') {
          summary.total_approved += commission.value;
          summary.count_approved++;
        } else if (commission.status === 'paid') {
          summary.total_paid += commission.value;
          summary.count_paid++;
        } else if (commission.status === 'cancelled') {
          summary.total_cancelled += commission.value;
          summary.count_cancelled++;
        }
      });
      
      setSummaryData(summary);
    } catch (error) {
      console.error("Erro ao carregar comissões:", error);
      toast.error("Não foi possível carregar as comissões");
    } finally {
      setLoading(false);
    }
  };

  // Exportar para Excel
  const exportReport = async () => {
    setExportLoading(true);
    try {
      const response = await financialService.exportCommissionsExcel(filters);
      
      // Criar um URL blob para download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comissoes-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
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
      const response = await financialService.exportCommissionsPDF(filters);
      
      // Criar um URL blob para download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comissoes-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
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

  // Ver detalhes de uma comissão
  const viewCommissionDetails = (id: number) => {
    // Implementação real abriria um modal com detalhes
    const commission = commissions.find(c => c.id === id);
    if (commission) {
      toast.info(`Detalhes da comissão #${id}: ${formatCurrency(commission.value)}`);
    }
  };

  // Editar comissão
  const editCommission = (id: number) => {
    // Implementação real redirecionaria para uma página de edição
    window.location.href = `/admin/financeiro/comissoes?id=${id}`;
  };

  // Marcar comissão como paga
  const markAsPaid = (id: number) => {
    // Implementação real redirecionaria para formulário de pagamento
    window.location.href = `/admin/financeiro/comissoes/pagar?id=${id}`;
  };

  // Abrir diálogo de confirmação para aprovar
  const confirmApproveCommission = (id: number) => {
    setCommissionToApprove(id);
    setApproveDialogOpen(true);
  };

  // Aprovar comissão após confirmação
  const handleApproveCommission = async () => {
    if (!commissionToApprove) return;
    
    setApproveLoading(true);
    try {
      await financialService.approveCommission(commissionToApprove);
      
      // Atualizar o status no array local
      const updatedCommissions = commissions.map(c => 
        c.id === commissionToApprove 
          ? { ...c, status: 'approved', approved_at: new Date().toISOString() } 
          : c
      );
      
      setCommissions(updatedCommissions);
      toast.success("Comissão aprovada com sucesso!");
    } catch (error) {
      console.error("Erro ao aprovar comissão:", error);
      toast.error("Erro ao aprovar a comissão");
    } finally {
      setApproveLoading(false);
      setCommissionToApprove(null);
    }
  };

  // Abrir diálogo de confirmação para excluir
  const confirmDeleteCommission = (id: number) => {
    setCommissionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Excluir comissão após confirmação
  const handleDeleteCommission = async () => {
    if (!commissionToDelete) return;
    
    setDeleteLoading(true);
    try {
      // Na implementação real, chamaria a API para excluir
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remover do array local
      setCommissions(commissions.filter(c => c.id !== commissionToDelete));
      toast.success("Comissão excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir comissão:", error);
      toast.error("Erro ao excluir a comissão");
    } finally {
      setDeleteLoading(false);
      setCommissionToDelete(null);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({});
  };

  // Add loadCategories function
  const loadCategories = async () => {
    try {
      const data = await financialService.getCategories(undefined, true);
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // Efeito para carregar dados quando os filtros mudarem
  useEffect(() => {
    loadCommissions();
  }, [filters]);

  // Add useEffect to load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatório de Comissões</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
          <Button 
            onClick={exportReport} 
            disabled={exportLoading || commissions.length === 0}
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
            disabled={pdfLoading || commissions.length === 0}
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
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value as 'pending' | 'approved' | 'paid' | 'cancelled'})}
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
            
            <div className="space-y-2">
              <Label htmlFor="agent_id">Corretor</Label>
              <Select 
                value={filters.agent_id?.toString() || 'all'} 
                onValueChange={(value) => setFilters({...filters, agent_id: value === 'all' ? undefined : Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os corretores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os corretores</SelectItem>
                  {/* Aqui viria uma lista de corretores da API */}
                  <SelectItem value="1">João Silva</SelectItem>
                  <SelectItem value="2">Maria Souza</SelectItem>
                  <SelectItem value="3">Pedro Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data De</Label>
              <DatePicker
                className="w-full"
                selected={filters.date_from ? new Date(filters.date_from) : undefined}
                onSelect={(date) => setFilters({
                  ...filters, 
                  date_from: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data Até</Label>
              <DatePicker
                className="w-full"
                selected={filters.date_to ? new Date(filters.date_to) : undefined}
                onSelect={(date) => setFilters({
                  ...filters, 
                  date_to: date ? format(date, 'yyyy-MM-dd') : undefined
                })}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={loadCommissions} 
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Pendentes</CardTitle>
            <CardDescription>
              {summaryData.count_pending} comissões
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summaryData.total_pending)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Aprovadas</CardTitle>
            <CardDescription>
              {summaryData.count_approved} comissões
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summaryData.total_approved)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Pagas</CardTitle>
            <CardDescription>
              {summaryData.count_paid} comissões
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summaryData.total_paid)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium text-gray-500">Canceladas</CardTitle>
            <CardDescription>
              {summaryData.count_cancelled} comissões
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryData.total_cancelled)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Comissões */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comissões</CardTitle>
          <CardDescription>
            Todas as comissões de acordo com os filtros aplicados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhuma comissão encontrada com os filtros atuais.
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={commissions} 
              searchColumn="agent.name"
              searchPlaceholder="Buscar por corretor..."
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Total de registros: {commissions.length}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmação para aprovar */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Aprovar Comissão"
        description="Tem certeza que deseja aprovar esta comissão? O valor ficará disponível para pagamento."
        confirmText="Sim, aprovar"
        onConfirm={handleApproveCommission}
        variant="default"
        iconType="info"
        isLoading={approveLoading}
      />

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Comissão"
        description="Tem certeza que deseja excluir esta comissão? Esta ação não pode ser desfeita."
        confirmText="Sim, excluir"
        onConfirm={handleDeleteCommission}
        variant="delete"
        iconType="delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ReportsCommissions;
