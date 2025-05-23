
import { FileText, Download, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Contracts = () => {
  // Mock contracts data
  const activeContracts = [
    {
      id: 1,
      title: "Contrato de Locação - Apartamento 502",
      property: "Apartamento 502 - Residencial Mirante",
      startDate: "15/10/2022",
      endDate: "15/10/2024",
      monthlyValue: 3800,
      status: "Ativo",
      progressPercent: 57,
      remainingMonths: 10,
      totalMonths: 24,
    },
  ];

  const historicalContracts = [
    {
      id: 2,
      title: "Contrato de Locação - Studio 405",
      property: "Studio 405 - Edifício Central",
      startDate: "05/03/2020",
      endDate: "05/03/2022",
      monthlyValue: 2200,
      status: "Finalizado",
      progressPercent: 100,
      remainingMonths: 0,
      totalMonths: 24,
    },
    {
      id: 3,
      title: "Contrato de Venda - Lote 15",
      property: "Lote 15 - Residencial Bosque Verde",
      date: "10/01/2021",
      value: 280000,
      status: "Concluído",
      type: "Venda",
    },
  ];

  const pendingContracts = [
    {
      id: 4,
      title: "Contrato de Locação - Casa 78",
      property: "Casa em Condomínio Fechado",
      status: "Pendente de Assinatura",
      deadline: "30/05/2023",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "Finalizado":
        return <Badge className="bg-blue-500">Finalizado</Badge>;
      case "Concluído":
        return <Badge className="bg-blue-500">Concluído</Badge>;
      case "Pendente de Assinatura":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meus Contratos</h1>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-8">
          <TabsTrigger value="active">Contratos Ativos ({activeContracts.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes de Assinatura ({pendingContracts.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico ({historicalContracts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeContracts.map((contract) => (
            <Card key={contract.id} className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{contract.title}</CardTitle>
                    <CardDescription>{contract.property}</CardDescription>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Período</p>
                    <p className="font-medium">{contract.startDate} - {contract.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Valor Mensal</p>
                    <p className="font-medium">{formatCurrency(contract.monthlyValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total do Contrato</p>
                    <p className="font-medium">{formatCurrency(contract.monthlyValue * contract.totalMonths)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso do Contrato</span>
                    <span>{contract.progressPercent}%</span>
                  </div>
                  <Progress value={contract.progressPercent} className="h-2" />
                  <p className="text-sm text-gray-500">Restam {contract.remainingMonths} meses de um total de {contract.totalMonths} meses.</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> Ver Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-orange-500 border-orange-500 hover:bg-orange-50"
                  >
                    <Download className="h-4 w-4 mr-1" /> Baixar Contrato
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="pending">
          {pendingContracts.map((contract) => (
            <Card key={contract.id} className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{contract.title}</CardTitle>
                    <CardDescription>{contract.property}</CardDescription>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="text-sm">
                    Este contrato requer sua assinatura até <strong>{contract.deadline}</strong>. 
                    Por favor, revise e assine o quanto antes para evitar atrasos.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> Revisar Contrato
                  </Button>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Assinar Contrato
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="history">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Contrato</th>
                  <th className="px-6 py-3">Imóvel</th>
                  <th className="px-6 py-3">Período / Data</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody>
                {historicalContracts.map((contract) => (
                  <tr key={contract.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{contract.title}</td>
                    <td className="px-6 py-4">{contract.property}</td>
                    <td className="px-6 py-4">
                      {"startDate" in contract 
                        ? `${contract.startDate} - ${contract.endDate}`
                        : contract.date
                      }
                    </td>
                    <td className="px-6 py-4">
                      {"monthlyValue" in contract 
                        ? `${formatCurrency(contract.monthlyValue)}/mês`
                        : formatCurrency(contract.value)
                      }
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" /> Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-orange-500 border-orange-500 hover:bg-orange-50"
                        >
                          <Download className="h-4 w-4 mr-1" /> Baixar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contracts;
