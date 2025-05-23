import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface FinancialSummaryProps {
  title: string;
  total: number;
  count: number;
  pendingAmount?: number;
  paidAmount?: number;
  period?: string;
}

export function FinancialSummary({
  title,
  total,
  count,
  pendingAmount = 0,
  paidAmount = 0,
  period,
}: FinancialSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total {title}</CardTitle>
          {period && <span className="text-xs text-muted-foreground">{period}</span>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(total)}</div>
          <p className="text-xs text-muted-foreground">
            {count} {count === 1 ? "registro" : "registros"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(pendingAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Aguardando pagamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(paidAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Pagamentos confirmados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Recebimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {total > 0 ? ((paidAmount / total) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Do total previsto
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 