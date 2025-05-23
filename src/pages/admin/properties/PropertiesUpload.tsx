import { useState } from "react";
import { propertyService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Upload, FileType, AlertCircle, CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PropertiesUpload = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    total: number;
    success: number;
    errors: number;
    errorDetails: Array<{ row: number; message: string }>;
  } | null>(null);

  // Manipular seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Verificar se é um arquivo CSV ou Excel
      if (
        selectedFile.type === 'text/csv' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setFile(selectedFile);
        setUploadResults(null);
      } else {
        toast({
          title: "Formato de arquivo inválido",
          description: "Por favor, selecione um arquivo CSV ou Excel (.xlsx, .xls)",
          variant: "destructive"
        });
        e.target.value = '';
      }
    }
  };

  // Manipular upload de arquivo
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para fazer upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Enviar arquivo para API
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await propertyService.uploadProperties(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Processar resultados
      if (response.success) {
        setUploadResults({
          total: response.data.total || 0,
          success: response.data.success || 0,
          errors: response.data.errors || 0,
          errorDetails: response.data.errorDetails || []
        });
        
        toast({
          title: "Upload concluído",
          description: `${response.data.success} de ${response.data.total} imóveis importados com sucesso.`,
          variant: response.data.errors > 0 ? "destructive" : "default"
        });
      } else {
        toast({
          title: "Erro no upload",
          description: response.message || "Ocorreu um erro ao processar o arquivo",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Erro no upload",
        description: err.message || "Ocorreu um erro ao fazer o upload do arquivo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Download do modelo de planilha
  const handleDownloadTemplate = () => {
    // Na implementação real, isso seria um link para um arquivo ou uma chamada de API
    // Por enquanto, vamos apenas simular o download
    toast({
      title: "Download iniciado",
      description: "O modelo de planilha está sendo baixado"
    });
    
    // Em um caso real, seria algo como:
    // window.location.href = '/api/properties/template';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upload de Imóveis</h1>
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownloadTemplate}
        >
          <Download className="h-4 w-4" />
          Baixar Modelo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importação em Massa</CardTitle>
          <CardDescription>
            Faça upload de um arquivo CSV ou Excel contendo múltiplos imóveis para importação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileType className="h-4 w-4" />
            <AlertTitle>Instruções</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>O arquivo deve estar no formato CSV ou Excel (.xlsx, .xls)</li>
                <li>A primeira linha deve conter os cabeçalhos das colunas</li>
                <li>Campos obrigatórios: título, endereço, finalidade, tipo, valor</li>
                <li>Baixe o modelo para garantir a formatação correta</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecione o arquivo</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Importação</CardTitle>
            <CardDescription>
              Resumo do processamento do arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <div className="mr-4 bg-gray-200 p-2 rounded-full">
                  <FileType className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Registros</p>
                  <p className="text-2xl font-bold">{uploadResults.total}</p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg flex items-center">
                <div className="mr-4 bg-green-200 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Importados com Sucesso</p>
                  <p className="text-2xl font-bold">{uploadResults.success}</p>
                </div>
              </div>

              <div className={`${uploadResults.errors > 0 ? 'bg-red-50' : 'bg-gray-50'} p-4 rounded-lg flex items-center`}>
                <div className={`mr-4 ${uploadResults.errors > 0 ? 'bg-red-200' : 'bg-gray-200'} p-2 rounded-full`}>
                  <XCircle className={`h-5 w-5 ${uploadResults.errors > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Erros</p>
                  <p className="text-2xl font-bold">{uploadResults.errors}</p>
                </div>
              </div>
            </div>

            {uploadResults.errorDetails.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Detalhes dos Erros
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Linha</TableHead>
                        <TableHead>Mensagem de Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResults.errorDetails.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setFile(null);
                setUploadResults(null);
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
            >
              Limpar e Iniciar Novo Upload
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PropertiesUpload;
