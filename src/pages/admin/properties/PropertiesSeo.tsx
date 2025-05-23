import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SEOdeImóveis = () => {
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
        <h1 className="text-2xl font-bold">SEO de Imóveis</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO de Imóveis</CardTitle>
          <CardDescription>
            Gerencie configurações de SEO para imóveis
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
              Esta página está em desenvolvimento. Em breve você poderá gerenciar seo de imóveis aqui.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOdeImóveis;
