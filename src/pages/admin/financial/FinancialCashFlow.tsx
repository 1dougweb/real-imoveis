import { useState, useEffect } from "react";
import { financialService, Transaction } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, CircleDollarSign, Banknote, ArrowRightLeft, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const FinancialCashFlow = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para os dados financeiros
  const [financialSummary, setFinancialSummary] = useState({
    receivable: 0,
    payable: 0,
    sales_this_month: 0,
    rentals_this_month: 0,
    received_this_month: 0,
    paid_this_month: 0,
    balance: 0,
    month_balance: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  const [selectedTab, setSelectedTab] = useState("all");

  // Buscar resumo financeiro
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        // Buscar resumo financeiro do dashboard
        const financialSummaryData = await financialService.getFinancialReport({
          start_date: format(dateRange.from, 'yyyy-MM-dd'),
          end_date: format(dateRange.to, 'yyyy-MM-dd'),
          type: selectedTab === 'all' ? 'all' : 
                selectedTab === 'receivables' ? 'receivable' : 'payable'
        });
        
        setFinancialSummary({
          receivable: financialSummaryData.total_receivable,
          payable: financialSummaryData.total_payable,
          received_this_month: financialSummaryData.total_received,
          paid_this_month: financialSummaryData.total_paid,
          balance: financialSummaryData.balance,
          sales_this_month: 0, // Estes dados não vêm do relatório
          rentals_this_month: 0, 
          month_balance: financialSummaryData.balance
        });
        
        // Transformar as transações para o formato necessário
        setTransactions(financialSummaryData.transactions.map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          status: t.status,
          due_date: t.due_date,
          paid_at: t.paid_at,
          category: {
            id: 0,
            name: t.category_name || 'Sem categoria'
          },
          person: t.person_name ? {
            id: 0,
            name: t.person_name
          } : undefined,
          created_at: t.due_date, // Usamos a data de vencimento como criação
          updated_at: t.due_date
        })));
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados financeiros");
        console.error("Erro ao carregar dados financeiros:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [dateRange, selectedTab]);

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

  // Renderizar tipo de transação
  const renderTransactionType = (type: string) => {
    if (type === 'receivable') {
      return (
        <div className="flex items-center">
          <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
          <span>A Receber</span>
        </div>
      );
    } else if (type === 'payable') {
      return (
        <div className="flex items-center">
          <ArrowDownRight className="h-4 w-4 mr-1 text-red-600" />
          <span>A Pagar</span>
        </div>
      );
    }
    return <span>{type}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Extrato de Caixa</h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center w-[280px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>
                  {dateRange.from ? (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data inicial"
                  )}
                </span>
                <span className="mx-2">até</span>
                <span>
                  {dateRange.to ? (
                    format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    "Data final"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({
                      from: range.from,
                      to: range.to,
                    });
                  }
                }}
                locale={ptBR}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{formatCurrency(financialSummary.receivable)}</div>
                <div className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>Entradas futuras</span>
                </div>
              </div>
              <CircleDollarSign className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{formatCurrency(financialSummary.payable)}</div>
                <div className="text-sm text-red-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>Saídas futuras</span>
                </div>
              </div>
              <Banknote className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebido no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{formatCurrency(financialSummary.received_this_month)}</div>
                <div className="text-sm text-blue-600 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>Total recebido</span>
                </div>
              </div>
              <ArrowUpRight className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pago no Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{formatCurrency(financialSummary.paid_this_month)}</div>
                <div className="text-sm text-purple-600 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>Total pago</span>
                </div>
              </div>
              <ArrowDownRight className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saldo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo do Período</CardTitle>
          <CardDescription>
            {format(dateRange.from, "dd 'de' MMMM", { locale: ptBR })} até {format(dateRange.to, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <ArrowRightLeft className="h-10 w-10 mr-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Saldo do Período</p>
                <p className={cn(
                  "text-2xl font-bold",
                  financialSummary.balance >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(financialSummary.balance)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Entradas vs Saídas</p>
              <p className="text-xl">
                <span className="text-green-600">{formatCurrency(financialSummary.received_this_month)}</span>
                <span className="mx-2 text-gray-400">vs</span>
                <span className="text-red-600">{formatCurrency(financialSummary.paid_this_month)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações do Período</CardTitle>
          <CardDescription>
            Lista de todas as transações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="receivables">Recebimentos</TabsTrigger>
              <TabsTrigger value="payables">Pagamentos</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Nenhuma transação encontrada no período selecionado</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Pessoa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.category?.name || '-'}</TableCell>
                      <TableCell>{transaction.person?.name || '-'}</TableCell>
                      <TableCell>{renderTransactionType(transaction.type)}</TableCell>
                      <TableCell>{renderTransactionStatus(transaction.status)}</TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        transaction.type === 'receivable' ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(transaction.amount)}
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

export default FinancialCashFlow; 