<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\BankAccount;
use App\Models\PaymentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'due_date');
        $sortDirection = $request->input('sort_direction', 'asc');
        $type = $request->input('type'); // receivable, payable
        $status = $request->input('status'); // pending, paid, cancelled
        $category = $request->input('category');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $personId = $request->input('person_id');
        $contractId = $request->input('contract_id');
        $bankAccountId = $request->input('bank_account_id');
        $paymentTypeId = $request->input('payment_type_id');

        $query = Transaction::query()
            ->with(['person', 'contract', 'bankAccount', 'paymentType']);

        // Filtros
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%")
                    ->orWhereHas('person', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($startDate && $endDate) {
            $query->whereBetween('due_date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->where('due_date', '>=', $startDate);
        } elseif ($endDate) {
            $query->where('due_date', '<=', $endDate);
        }

        if ($personId) {
            $query->where('person_id', $personId);
        }

        if ($contractId) {
            $query->where('contract_id', $contractId);
        }

        if ($bankAccountId) {
            $query->where('bank_account_id', $bankAccountId);
        }

        if ($paymentTypeId) {
            $query->where('payment_type_id', $paymentTypeId);
        }

        $transactions = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Store a newly created transaction in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:receivable,payable',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'category' => 'required|string|max:100',
            'reference' => 'nullable|string|max:100',
            'status' => 'required|in:pending,paid,cancelled',
            'person_id' => 'nullable|exists:people,id',
            'contract_id' => 'nullable|exists:contracts,id',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'payment_type_id' => 'nullable|exists:payment_types,id',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ], [
            'type.required' => 'O tipo de transação é obrigatório',
            'type.in' => 'O tipo de transação deve ser: receivable ou payable',
            'description.required' => 'A descrição é obrigatória',
            'description.string' => 'A descrição deve ser um texto',
            'description.max' => 'A descrição não pode ter mais de 255 caracteres',
            'amount.required' => 'O valor é obrigatório',
            'amount.numeric' => 'O valor deve ser um número',
            'amount.min' => 'O valor deve ser maior que zero',
            'due_date.required' => 'A data de vencimento é obrigatória',
            'due_date.date' => 'A data de vencimento deve ser uma data válida',
            'category.required' => 'A categoria é obrigatória',
            'category.string' => 'A categoria deve ser um texto',
            'category.max' => 'A categoria não pode ter mais de 100 caracteres',
            'reference.string' => 'A referência deve ser um texto',
            'reference.max' => 'A referência não pode ter mais de 100 caracteres',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser: pending, paid ou cancelled',
            'person_id.exists' => 'A pessoa selecionada não existe',
            'contract_id.exists' => 'O contrato selecionado não existe',
            'bank_account_id.exists' => 'A conta bancária selecionada não existe',
            'payment_type_id.exists' => 'O tipo de pagamento selecionado não existe',
            'paid_at.date' => 'A data de pagamento deve ser uma data válida',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Se o status for "paid", garantir que a data de pagamento está preenchida
            if ($request->status === 'paid' && !$request->has('paid_at')) {
                $request->merge(['paid_at' => Carbon::now()]);
            }

            DB::beginTransaction();
            
            $transaction = Transaction::create($request->all());
            
            DB::commit();

            // Carregar relacionamentos
            $transaction->load(['person', 'contract', 'bankAccount', 'paymentType']);

            return response()->json([
                'success' => true,
                'message' => 'Transação criada com sucesso',
                'data' => $transaction
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar transação',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified transaction.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $transaction = Transaction::with(['person', 'contract', 'bankAccount', 'paymentType'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transação não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified transaction in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $transaction = Transaction::findOrFail($id);

            // Não permitir alterações em transações já pagas ou canceladas
            if ($transaction->status === 'paid' && !$request->has('status')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível alterar uma transação já paga'
                ], 422);
            }

            if ($transaction->status === 'cancelled' && !$request->has('status')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível alterar uma transação cancelada'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'type' => 'sometimes|in:receivable,payable',
                'description' => 'sometimes|string|max:255',
                'amount' => 'sometimes|numeric|min:0.01',
                'due_date' => 'sometimes|date',
                'category' => 'sometimes|string|max:100',
                'reference' => 'nullable|string|max:100',
                'status' => 'sometimes|in:pending,paid,cancelled',
                'person_id' => 'nullable|exists:people,id',
                'contract_id' => 'nullable|exists:contracts,id',
                'bank_account_id' => 'nullable|exists:bank_accounts,id',
                'payment_type_id' => 'nullable|exists:payment_types,id',
                'paid_at' => 'nullable|date',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Se o status estiver mudando para "paid", garantir que a data de pagamento está preenchida
            if ($request->has('status') && $request->status === 'paid' && !$request->has('paid_at')) {
                $request->merge(['paid_at' => Carbon::now()]);
            }

            DB::beginTransaction();
            
            $transaction->update($request->all());
            
            DB::commit();

            // Carregar relacionamentos
            $transaction->load(['person', 'contract', 'bankAccount', 'paymentType']);

            return response()->json([
                'success' => true,
                'message' => 'Transação atualizada com sucesso',
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar transação',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Remove the specified transaction from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $transaction = Transaction::findOrFail($id);

            // Não permitir exclusão de transações já pagas
            if ($transaction->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir uma transação já paga'
                ], 422);
            }

            $transaction->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transação excluída com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir transação',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Mark a transaction as paid.
     *
     * @param int $id
     * @param Request $request
     * @return JsonResponse
     */
    public function markAsPaid(int $id, Request $request): JsonResponse
    {
        try {
            $transaction = Transaction::findOrFail($id);

            if ($transaction->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta transação já está paga'
                ], 422);
            }

            if ($transaction->status === 'cancelled') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível marcar como paga uma transação cancelada'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'paid_at' => 'nullable|date',
                'bank_account_id' => 'nullable|exists:bank_accounts,id',
                'payment_type_id' => 'nullable|exists:payment_types,id',
                'notes' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();
            
            $transaction->status = 'paid';
            $transaction->paid_at = $request->input('paid_at', Carbon::now());
            
            if ($request->has('bank_account_id')) {
                $transaction->bank_account_id = $request->bank_account_id;
            }
            
            if ($request->has('payment_type_id')) {
                $transaction->payment_type_id = $request->payment_type_id;
            }
            
            if ($request->has('notes')) {
                $transaction->notes = $request->notes;
            }
            
            $transaction->save();
            
            DB::commit();

            // Carregar relacionamentos
            $transaction->load(['person', 'contract', 'bankAccount', 'paymentType']);

            return response()->json([
                'success' => true,
                'message' => 'Transação marcada como paga com sucesso',
                'data' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao marcar transação como paga',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Get transaction categories by type.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getCategories(Request $request): JsonResponse
    {
        $type = $request->input('type'); // receivable, payable

        try {
            $query = Transaction::select('category')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->distinct();
                
            if ($type) {
                $query->where('type', $type);
            }
            
            $categories = $query->orderBy('category')
                ->pluck('category')
                ->toArray();
                
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar categorias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new transaction category.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function createCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'type' => 'required|in:receivable,payable',
        ], [
            'name.required' => 'O nome da categoria é obrigatório',
            'name.string' => 'O nome da categoria deve ser um texto',
            'name.max' => 'O nome da categoria não pode ter mais de 100 caracteres',
            'type.required' => 'O tipo é obrigatório',
            'type.in' => 'O tipo deve ser: receivable ou payable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar se a categoria já existe
            $exists = Transaction::where('category', $request->name)
                ->where('type', $request->type)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta categoria já existe'
                ], 422);
            }

            DB::beginTransaction();

            // Criar uma transação dummy para estabelecer a categoria
            $transaction = new Transaction([
                'type' => $request->type,
                'description' => 'Categoria criada via sistema',
                'amount' => 0,
                'due_date' => now(),
                'category' => $request->name,
                'status' => 'cancelled'
            ]);
            
            $transaction->save();

            // Buscar todas as categorias existentes do mesmo tipo
            $categories = Transaction::where('type', $request->type)
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->toArray();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Categoria criada com sucesso',
                'data' => $request->name,
                'categories' => $categories
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar categoria',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 