import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { TransactionForm } from "@/components/ui/forms/TransactionForm";
import { financialService } from "@/lib/services";

export default function NovaTransacaoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const type = searchParams.get("type") as "receivable" | "payable" || "receivable";

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await financialService.createTransaction(data);
      toast({
        title: "Sucesso!",
        description: "Transação criada com sucesso.",
      });
      navigate("/admin/financeiro/movimentacoes");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro!",
        description: "Ocorreu um erro ao criar a transação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {type === "payable" ? "Nova Conta a Pagar" : "Nova Conta a Receber"}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <TransactionForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            initialData={{ type }}
          />
        </div>
      </div>
    </div>
  );
} 