import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const RelatóriodeContasaReceber = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular carregamento para demonstração
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatório de Contas a Receber</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatório de Contas a Receber</CardTitle>
          <CardDescription>
            Relatórios detalhados de contas a receber
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              Esta página está em desenvolvimento. Em breve você poderá gerenciar relatório de contas a receber aqui.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatóriodeContasaReceber;
