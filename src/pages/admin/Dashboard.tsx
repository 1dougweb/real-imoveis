import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building, 
  Home, 
  Users, 
  DollarSign, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardService } from "@/lib/services";
import { formatCurrency } from "@/lib/utils";

const AdminDashboard = () => {
  // Estados para armazenar os dados do dashboard
  const [loading, setLoading] = useState(true);
  const [propertyCounts, setPropertyCounts] = useState({
    total: 0,
    for_sale: 0,
    for_rent: 0,
    sold: 0,
    rented: 0,
    inactive: 0,
    featured: 0
  });
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
  const [peopleCount, setPeopleCount] = useState({
    total: 0,
    clients: 0,
    owners: 0,
    agents: 0,
    employees: 0
  });
  const [contractCount, setContractCount] = useState({
    total: 0,
    sale: 0,
    rent: 0,
    active: 0,
    pending: 0,
    expired: 0,
    cancelled: 0
  });

  // Busca os dados ao carregar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Busca de dados em paralelo
        const [propertyCountData, financialData, peopleData, contractData] = await Promise.all([
          dashboardService.getPropertyCount(),
          dashboardService.getFinancialSummary(),
          dashboardService.getPeopleCount(),
          dashboardService.getContractCount()
        ]);

        setPropertyCounts(propertyCountData);
        setFinancialSummary(financialData);
        setPeopleCount(peopleData);
        setContractCount(contractData);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6">
      {/* Header - Responsive design with stacked layout on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard Administrativo</h1>
        <div className="flex w-full sm:w-auto space-x-2 justify-end">
          <Button variant="outline" className="text-xs sm:text-sm">Exportar Relatórios</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm">Novo Imóvel</Button>
        </div>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
      
      {!loading && (
        <>
          {/* Estatísticas principais - Improved responsive grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total de Imóveis</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">{propertyCounts.total}</div>
                    <div className="flex items-center text-xs sm:text-sm text-green-500">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>Ativos: {propertyCounts.for_sale + propertyCounts.for_rent}</span>
                    </div>
                  </div>
                  <Building className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Vendas este mês</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">{formatCurrency(financialSummary.sales_this_month)}</div>
                    <div className="flex items-center text-xs sm:text-sm text-green-500">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>Contratos: {contractCount.sale}</span>
                    </div>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">{peopleCount.clients}</div>
                    <div className="flex items-center text-xs sm:text-sm text-green-500">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>Total: {peopleCount.total}</span>
                    </div>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xl sm:text-2xl font-bold">{contractCount.active}</div>
                    <div className="flex items-center text-xs sm:text-sm text-orange-500">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>Pendentes: {contractCount.pending}</span>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Imóveis por status - Better responsive grid */}
          <Card className="overflow-hidden">
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Visão Geral de Imóveis</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
                <div className="p-2 sm:p-4 border rounded-lg bg-green-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">À Venda</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.for_sale}</div>
                </div>
                <div className="p-2 sm:p-4 border rounded-lg bg-blue-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Para Locação</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.for_rent}</div>
                </div>
                <div className="p-2 sm:p-4 border rounded-lg bg-purple-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Vendidos</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.sold}</div>
                </div>
                <div className="p-2 sm:p-4 border rounded-lg bg-yellow-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Alugados</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.rented}</div>
                </div>
                <div className="p-2 sm:p-4 border rounded-lg bg-red-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Inativos</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.inactive}</div>
                </div>
                <div className="p-2 sm:p-4 border rounded-lg bg-orange-50">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Destaques</div>
                  <div className="text-lg sm:text-xl font-semibold">{propertyCounts.featured}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Resumo Financeiro */}
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-2 sm:p-4 border rounded-lg bg-green-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">A Receber</div>
                      <div className="text-lg sm:text-xl font-semibold">{formatCurrency(financialSummary.receivable)}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-red-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">A Pagar</div>
                      <div className="text-lg sm:text-xl font-semibold">{formatCurrency(financialSummary.payable)}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-blue-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Saldo Geral</div>
                      <div className="text-lg sm:text-xl font-semibold">{formatCurrency(financialSummary.balance)}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-purple-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Saldo do Mês</div>
                      <div className="text-lg sm:text-xl font-semibold">{formatCurrency(financialSummary.month_balance)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Distribuição de Contratos */}
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Distribuição de Contratos</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-2 sm:p-4 border rounded-lg bg-indigo-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Vendas</div>
                      <div className="text-lg sm:text-xl font-semibold">{contractCount.sale}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-amber-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Aluguéis</div>
                      <div className="text-lg sm:text-xl font-semibold">{contractCount.rent}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-emerald-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Ativos</div>
                      <div className="text-lg sm:text-xl font-semibold">{contractCount.active}</div>
                    </div>
                    <div className="p-2 sm:p-4 border rounded-lg bg-rose-50">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Pendentes</div>
                      <div className="text-lg sm:text-xl font-semibold">{contractCount.pending}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

