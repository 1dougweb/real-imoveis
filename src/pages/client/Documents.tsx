
import { FileText, Download, Eye, File } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  // Mock documents data
  const documents = [
    {
      id: 1,
      name: "Contrato de Aluguel - Apartamento 301",
      type: "PDF",
      size: "2.3 MB",
      date: "15/03/2023",
      status: "Assinado",
    },
    {
      id: 2,
      name: "Declaração de Imposto de Renda",
      type: "PDF",
      size: "1.8 MB",
      date: "10/04/2023",
      status: "Pendente",
    },
    {
      id: 3,
      name: "Comprovante de Pagamento - Março/2023",
      type: "PDF",
      size: "1.2 MB",
      date: "05/04/2023",
      status: "Processado",
    },
    {
      id: 4,
      name: "Laudo de Vistoria - Entrada",
      type: "PDF",
      size: "3.5 MB",
      date: "02/02/2023",
      status: "Assinado",
    },
    {
      id: 5,
      name: "Comprovante de Pagamento - Abril/2023",
      type: "PDF",
      size: "1.1 MB",
      date: "05/05/2023",
      status: "Processado",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assinado":
        return "bg-green-500";
      case "Pendente":
        return "bg-yellow-500";
      case "Processado":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Meus Documentos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Documentos Disponíveis</CardTitle>
          <CardDescription>
            Visualize e baixe todos os seus documentos relacionados a imóveis e contratos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Documento</th>
                  <th className="px-6 py-3">Tipo</th>
                  <th className="px-6 py-3">Tamanho</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center">
                      <FileText className="h-5 w-5 text-orange-500 mr-3" />
                      {doc.name}
                    </td>
                    <td className="px-6 py-4">{doc.type}</td>
                    <td className="px-6 py-4">{doc.size}</td>
                    <td className="px-6 py-4">{doc.date}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        className={`${getStatusColor(doc.status)} hover:${getStatusColor(doc.status)}`}
                      >
                        {doc.status}
                      </Badge>
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
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Enviar Documento</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Arraste e solte arquivos aqui</p>
              <p className="text-gray-500 text-sm mb-4">ou</p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Selecionar Arquivo
              </Button>
              <p className="text-gray-500 text-xs mt-4">
                Formatos aceitos: PDF, JPG, PNG (máximo 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
