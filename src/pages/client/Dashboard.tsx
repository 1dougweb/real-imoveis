import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Home, FileText } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Imóveis Associados</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">3</div>
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Documentos Pendentes</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">2</div>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Documentos Aprovados</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">5</div>
              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Contratos Ativos</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">1</div>
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Últimas Atualizações</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="border-b pb-2 sm:pb-3">
                <p className="text-xs sm:text-sm font-medium">Documento aprovado: Comprovante de Renda</p>
                <p className="text-xs text-muted-foreground mt-1">Há 2 dias</p>
              </div>
              <div className="border-b pb-2 sm:pb-3">
                <p className="text-xs sm:text-sm font-medium">Contrato de locação assinado</p>
                <p className="text-xs text-muted-foreground mt-1">Há 1 semana</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Vistoria agendada: Apartamento Leblon</p>
                <p className="text-xs text-muted-foreground mt-1">Há 2 semanas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="border-b pb-2 sm:pb-3">
                <p className="text-xs sm:text-sm font-medium">Renovação de contrato</p>
                <p className="text-xs text-muted-foreground mt-1">Em 15 dias</p>
              </div>
              <div className="border-b pb-2 sm:pb-3">
                <p className="text-xs sm:text-sm font-medium">Pagamento mensal</p>
                <p className="text-xs text-muted-foreground mt-1">Em 5 dias</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Vistoria semestral</p>
                <p className="text-xs text-muted-foreground mt-1">Em 30 dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
