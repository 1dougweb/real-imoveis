<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\TransactionRequest;

class FinancialController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:api', 'permission:manage_financial']);
    }

    /**
     * Lista transações com filtros
     */
    public function index(Request $request)
    {
        $query = Transaction::query()
            ->with(['person', 'contract', 'bankAccount', 'paymentType']);

        // Filtros
        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->start_date) {
            $query->whereDate('due_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('due_date', '<=', $request->end_date);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', "%{$request->search}%")
                  ->orWhereHas('person', function ($q) use ($request) {
                      $q->where('name', 'like', "%{$request->search}%");
                  });
            });
        }

        // Ordenação
        $query->orderBy($request->sort_by ?? 'due_date', $request->sort_order ?? 'asc');

        return $query->paginate($request->per_page ?? 15);
    }

    /**
     * Retorna resumo financeiro
     */
    public function summary(Request $request)
    {
        $query = Transaction::query();

        // Aplicar filtros de data se fornecidos
        if ($request->start_date) {
            $query->whereDate('due_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('due_date', '<=', $request->end_date);
        }

        // Filtrar por tipo se especificado
        if ($request->type) {
            $query->where('type', $request->type);
        }

        $summary = [
            'total' => $query->sum('amount'),
            'count' => $query->count(),
            'pending_amount' => $query->where('status', 'pending')->sum('amount'),
            'paid_amount' => $query->where('status', 'paid')->sum('amount'),
            'receivables' => [
                'total' => $query->where('type', 'receivable')->sum('amount'),
                'pending' => $query->where('type', 'receivable')->where('status', 'pending')->sum('amount'),
            ],
            'payables' => [
                'total' => $query->where('type', 'payable')->sum('amount'),
                'pending' => $query->where('type', 'payable')->where('status', 'pending')->sum('amount'),
            ],
        ];

        return response()->json($summary);
    }

    /**
     * Cria uma nova transação
     */
    public function store(TransactionRequest $request)
    {
        try {
            DB::beginTransaction();

            $transaction = Transaction::create($request->validated());

            // Processa anexos se houver
            if ($request->hasFile('receipt')) {
                $transaction->addMediaFromRequest('receipt')
                    ->toMediaCollection('receipts');
            }

            DB::commit();
            return response()->json($transaction->load(['person', 'contract', 'bankAccount', 'paymentType']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao criar transação', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Atualiza uma transação existente
     */
    public function update(TransactionRequest $request, Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $transaction->update($request->validated());

            // Atualiza anexos se houver
            if ($request->hasFile('receipt')) {
                $transaction->clearMediaCollection('receipts');
                $transaction->addMediaFromRequest('receipt')
                    ->toMediaCollection('receipts');
            }

            DB::commit();
            return response()->json($transaction->load(['person', 'contract', 'bankAccount', 'paymentType']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao atualizar transação', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Marca uma transação como paga
     */
    public function markAsPaid(Request $request, Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $transaction->update([
                'status' => 'paid',
                'payment_date' => $request->payment_date ?? now(),
                'notes' => $request->notes ? $transaction->notes . "\n" . $request->notes : $transaction->notes
            ]);

            if ($request->hasFile('receipt')) {
                $transaction->addMediaFromRequest('receipt')
                    ->toMediaCollection('receipts');
            }

            DB::commit();
            return response()->json($transaction->load(['person', 'contract', 'bankAccount', 'paymentType']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao marcar como pago', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cancela uma transação
     */
    public function cancel(Request $request, Transaction $transaction)
    {
        try {
            DB::beginTransaction();

            $transaction->update([
                'status' => 'cancelled',
                'notes' => $request->notes ? $transaction->notes . "\n" . $request->notes : $transaction->notes
            ]);

            DB::commit();
            return response()->json($transaction->load(['person', 'contract', 'bankAccount', 'paymentType']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erro ao cancelar transação', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna relatório de comissões
     */
    public function commissions(Request $request)
    {
        try {
            $query = Transaction::query()
                ->where('category', 'commission')
                ->with(['person', 'contract', 'property', 'bankAccount', 'paymentType']);

            // Filtros de data
            if ($request->start_date) {
                $query->whereDate('due_date', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->whereDate('due_date', '<=', $request->end_date);
            }

            // Filtros adicionais
            if ($request->person_id) {
                $query->where('person_id', $request->person_id);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->property_id) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->contract_id) {
                $query->where('contract_id', $request->contract_id);
            }

            // Ordenação
            $query->orderBy($request->sort_by ?? 'due_date', $request->sort_order ?? 'desc');

            // Paginação
            $commissions = $query->paginate($request->per_page ?? 15);

            // Estatísticas
            $stats = [
                'total_count' => Transaction::where('category', 'commission')->count(),
                'total_amount' => Transaction::where('category', 'commission')->sum('amount'),
                'paid_amount' => Transaction::where('category', 'commission')
                    ->where('status', Transaction::STATUS_PAID)
                    ->sum('amount'),
                'pending_amount' => Transaction::where('category', 'commission')
                    ->where('status', Transaction::STATUS_PENDING)
                    ->sum('amount'),
                'by_agent' => Transaction::where('category', 'commission')
                    ->selectRaw('person_id, SUM(amount) as total_amount, COUNT(*) as count')
                    ->groupBy('person_id')
                    ->with('person:id,name')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'agent_id' => $item->person_id,
                            'agent_name' => $item->person->name ?? 'Desconhecido',
                            'total_amount' => $item->total_amount,
                            'count' => $item->count
                        ];
                    })
            ];

            return response()->json([
                'commissions' => $commissions,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao buscar comissões', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna relatório de aluguéis
     */
    public function rentals(Request $request)
    {
        try {
            $query = Transaction::query()
                ->where('category', 'rent')
                ->with(['person', 'contract', 'property', 'bankAccount', 'paymentType']);

            // Filtros de data
            if ($request->start_date) {
                $query->whereDate('due_date', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->whereDate('due_date', '<=', $request->end_date);
            }

            // Filtros adicionais
            if ($request->property_id) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->person_id) {
                $query->where('person_id', $request->person_id);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->min_amount) {
                $query->where('amount', '>=', $request->min_amount);
            }

            if ($request->max_amount) {
                $query->where('amount', '<=', $request->max_amount);
            }

            // Ordenação
            $query->orderBy($request->sort_by ?? 'due_date', $request->sort_order ?? 'desc');

            // Paginação
            $rentals = $query->paginate($request->per_page ?? 15);

            // Estatísticas
            $stats = [
                'total_count' => Transaction::where('category', 'rent')->count(),
                'total_amount' => Transaction::where('category', 'rent')->sum('amount'),
                'paid_amount' => Transaction::where('category', 'rent')
                    ->where('status', Transaction::STATUS_PAID)
                    ->sum('amount'),
                'pending_amount' => Transaction::where('category', 'rent')
                    ->where('status', Transaction::STATUS_PENDING)
                    ->sum('amount'),
                'monthly_income' => Transaction::where('category', 'rent')
                    ->selectRaw('DATE_FORMAT(due_date, "%Y-%m") as month, SUM(amount) as total_amount, COUNT(*) as count')
                    ->groupBy('month')
                    ->orderBy('month', 'desc')
                    ->limit(12)
                    ->get(),
                'by_neighborhood' => Transaction::where('category', 'rent')
                    ->join('properties', 'transactions.property_id', '=', 'properties.id')
                    ->join('neighborhoods', 'properties.neighborhood_id', '=', 'neighborhoods.id')
                    ->selectRaw('neighborhoods.id, neighborhoods.name, SUM(transactions.amount) as total_amount, COUNT(*) as count')
                    ->groupBy('neighborhoods.id', 'neighborhoods.name')
                    ->orderBy('total_amount', 'desc')
                    ->limit(10)
                    ->get(),
                'by_property_type' => Transaction::where('category', 'rent')
                    ->join('properties', 'transactions.property_id', '=', 'properties.id')
                    ->join('property_types', 'properties.property_type_id', '=', 'property_types.id')
                    ->selectRaw('property_types.id, property_types.name, SUM(transactions.amount) as total_amount, COUNT(*) as count')
                    ->groupBy('property_types.id', 'property_types.name')
                    ->get()
            ];

            // Cálculo de média de aluguéis por tipo de imóvel
            $averageRentals = Transaction::where('category', 'rent')
                ->join('properties', 'transactions.property_id', '=', 'properties.id')
                ->join('property_types', 'properties.property_type_id', '=', 'property_types.id')
                ->selectRaw('property_types.id, property_types.name, AVG(transactions.amount) as average_amount')
                ->groupBy('property_types.id', 'property_types.name')
                ->get();

            $stats['average_by_property_type'] = $averageRentals;

            return response()->json([
                'rentals' => $rentals,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao buscar aluguéis', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna relatório de vendas
     */
    public function sales(Request $request)
    {
        try {
            $query = Transaction::query()
                ->where('category', 'sale')
                ->with(['person', 'contract', 'property', 'bankAccount', 'paymentType']);

            // Filtros de data
            if ($request->start_date) {
                $query->whereDate('due_date', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->whereDate('due_date', '<=', $request->end_date);
            }

            // Filtros adicionais
            if ($request->property_id) {
                $query->where('property_id', $request->property_id);
            }

            if ($request->person_id) {
                $query->where('person_id', $request->person_id);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->min_amount) {
                $query->where('amount', '>=', $request->min_amount);
            }

            if ($request->max_amount) {
                $query->where('amount', '<=', $request->max_amount);
            }

            // Ordenação
            $query->orderBy($request->sort_by ?? 'due_date', $request->sort_order ?? 'desc');

            // Paginação
            $sales = $query->paginate($request->per_page ?? 15);

            // Estatísticas
            $stats = [
                'total_count' => Transaction::where('category', 'sale')->count(),
                'total_amount' => Transaction::where('category', 'sale')->sum('amount'),
                'paid_amount' => Transaction::where('category', 'sale')
                    ->where('status', Transaction::STATUS_PAID)
                    ->sum('amount'),
                'pending_amount' => Transaction::where('category', 'sale')
                    ->where('status', Transaction::STATUS_PENDING)
                    ->sum('amount'),
                'monthly_trend' => Transaction::where('category', 'sale')
                    ->selectRaw('DATE_FORMAT(due_date, "%Y-%m") as month, SUM(amount) as total_amount, COUNT(*) as count')
                    ->groupBy('month')
                    ->orderBy('month', 'desc')
                    ->limit(12)
                    ->get(),
                'by_property_type' => Transaction::where('category', 'sale')
                    ->join('properties', 'transactions.property_id', '=', 'properties.id')
                    ->join('property_types', 'properties.property_type_id', '=', 'property_types.id')
                    ->selectRaw('property_types.id, property_types.name, SUM(transactions.amount) as total_amount, COUNT(*) as count')
                    ->groupBy('property_types.id', 'property_types.name')
                    ->get()
            ];

            return response()->json([
                'sales' => $sales,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao buscar vendas', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Retorna fluxo de caixa
     */
    public function cashFlow(Request $request)
    {
        $query = Transaction::query()
            ->selectRaw('
                DATE(due_date) as date,
                SUM(CASE WHEN type = "receivable" THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = "payable" THEN amount ELSE 0 END) as expense,
                SUM(CASE WHEN type = "receivable" THEN amount ELSE -amount END) as balance
            ')
            ->groupBy('date');

        if ($request->start_date) {
            $query->whereDate('due_date', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('due_date', '<=', $request->end_date);
        }

        return $query->get();
    }

    /**
     * Retorna extrato de caixa detalhado
     */
    public function bankStatement(Request $request)
    {
        // Validação dos parâmetros
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
        ]);

        try {
            // Obtém o saldo inicial (saldo antes da data inicial)
            $initialBalance = Transaction::query()
                ->when($request->bank_account_id, function ($query) use ($request) {
                    $query->where('bank_account_id', $request->bank_account_id);
                })
                ->whereDate('due_date', '<', $request->start_date)
                ->where('status', Transaction::STATUS_PAID)
                ->selectRaw('SUM(CASE WHEN type = "receivable" THEN amount ELSE -amount END) as balance')
                ->first()
                ->balance ?? 0;

            // Obtém as transações no período
            $transactions = Transaction::query()
                ->with(['person', 'bankAccount', 'paymentType', 'property', 'contract'])
                ->when($request->bank_account_id, function ($query) use ($request) {
                    $query->where('bank_account_id', $request->bank_account_id);
                })
                ->whereDate('due_date', '>=', $request->start_date)
                ->whereDate('due_date', '<=', $request->end_date)
                ->where('status', Transaction::STATUS_PAID)
                ->orderBy('due_date')
                ->get();

            // Calcula saldo acumulado para cada transação
            $runningBalance = $initialBalance;
            $transactions->each(function ($transaction) use (&$runningBalance) {
                $amount = $transaction->isReceivable() ? $transaction->amount : -$transaction->amount;
                $runningBalance += $amount;
                $transaction->running_balance = $runningBalance;
            });

            // Prepara o resultado
            $result = [
                'initial_balance' => $initialBalance,
                'final_balance' => $runningBalance,
                'period' => [
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                ],
                'total_income' => $transactions->where('type', Transaction::TYPE_RECEIVABLE)->sum('amount'),
                'total_expense' => $transactions->where('type', Transaction::TYPE_PAYABLE)->sum('amount'),
                'transactions' => $transactions,
            ];

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao gerar extrato', 'error' => $e->getMessage()], 500);
        }
    }
} 