<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
{
    /**
     * Display a listing of bank accounts.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $bankId = $request->input('bank_id');
        $personId = $request->input('person_id');
        $isDefault = $request->has('is_default') ? $request->boolean('is_default') : null;

        $query = BankAccount::query()
            ->with(['bank', 'person']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('branch', 'like', "%{$search}%")
                    ->orWhere('account', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('bank', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('person', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($bankId) {
            $query->where('bank_id', $bankId);
        }

        if ($personId) {
            $query->where('person_id', $personId);
        }

        if ($isDefault !== null) {
            $query->where('is_default', $isDefault);
        }

        $bankAccounts = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $bankAccounts->items(),
            'meta' => [
                'current_page' => $bankAccounts->currentPage(),
                'last_page' => $bankAccounts->lastPage(),
                'per_page' => $bankAccounts->perPage(),
                'total' => $bankAccounts->total(),
            ],
        ]);
    }

    /**
     * Get bank accounts by person.
     *
     * @param int $personId
     * @param Request $request
     * @return JsonResponse
     */
    public function getByPerson(int $personId, Request $request): JsonResponse
    {
        try {
            $person = Person::findOrFail($personId);
            
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');
            $sortBy = $request->input('sort_by', 'created_at');
            $sortDirection = $request->input('sort_direction', 'desc');

            $query = BankAccount::where('person_id', $personId)
                ->with('bank');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('branch', 'like', "%{$search}%")
                        ->orWhere('account', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('bank', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $bankAccounts = $query->orderBy($sortBy, $sortDirection)
                ->paginate($perPage);

            return response()->json([
                'data' => $bankAccounts->items(),
                'meta' => [
                    'current_page' => $bankAccounts->currentPage(),
                    'last_page' => $bankAccounts->lastPage(),
                    'per_page' => $bankAccounts->perPage(),
                    'total' => $bankAccounts->total(),
                    'person' => $person->name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Pessoa não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created bank account in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bank_id' => 'required|exists:banks,id',
            'person_id' => 'nullable|exists:people,id',
            'branch' => 'required|string|max:20',
            'account' => 'required|string|max:20',
            'account_type' => 'required|string|in:corrente,poupança,salário,investimento',
            'description' => 'nullable|string|max:255',
            'is_default' => 'boolean',
        ], [
            'bank_id.required' => 'O banco é obrigatório',
            'bank_id.exists' => 'O banco selecionado não existe',
            'person_id.exists' => 'A pessoa selecionada não existe',
            'branch.required' => 'A agência é obrigatória',
            'branch.string' => 'A agência deve ser um texto',
            'branch.max' => 'A agência não pode ter mais de 20 caracteres',
            'account.required' => 'O número da conta é obrigatório',
            'account.string' => 'O número da conta deve ser um texto',
            'account.max' => 'O número da conta não pode ter mais de 20 caracteres',
            'account_type.required' => 'O tipo de conta é obrigatório',
            'account_type.string' => 'O tipo de conta deve ser um texto',
            'account_type.in' => 'O tipo de conta deve ser: corrente, poupança, salário ou investimento',
            'description.string' => 'A descrição deve ser um texto',
            'description.max' => 'A descrição não pode ter mais de 255 caracteres',
            'is_default.boolean' => 'O campo padrão deve ser verdadeiro ou falso',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // If this is set as default, unset all other default accounts for this person
            if ($request->boolean('is_default', false) && $request->has('person_id')) {
                BankAccount::where('person_id', $request->person_id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $bankAccount = BankAccount::create($request->all());
            
            // Load relationships for the response
            $bankAccount->load(['bank', 'person']);

            return response()->json([
                'message' => 'Conta bancária criada com sucesso',
                'data' => $bankAccount
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar conta bancária',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified bank account.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $bankAccount = BankAccount::with(['bank', 'person'])->findOrFail($id);

            return response()->json([
                'data' => $bankAccount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Conta bancária não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified bank account in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bank_id' => 'sometimes|required|exists:banks,id',
            'person_id' => 'sometimes|nullable|exists:people,id',
            'branch' => 'sometimes|required|string|max:20',
            'account' => 'sometimes|required|string|max:20',
            'account_type' => 'sometimes|required|string|in:corrente,poupança,salário,investimento',
            'description' => 'nullable|string|max:255',
            'is_default' => 'sometimes|boolean',
        ], [
            'bank_id.required' => 'O banco é obrigatório',
            'bank_id.exists' => 'O banco selecionado não existe',
            'person_id.exists' => 'A pessoa selecionada não existe',
            'branch.required' => 'A agência é obrigatória',
            'branch.string' => 'A agência deve ser um texto',
            'branch.max' => 'A agência não pode ter mais de 20 caracteres',
            'account.required' => 'O número da conta é obrigatório',
            'account.string' => 'O número da conta deve ser um texto',
            'account.max' => 'O número da conta não pode ter mais de 20 caracteres',
            'account_type.required' => 'O tipo de conta é obrigatório',
            'account_type.string' => 'O tipo de conta deve ser um texto',
            'account_type.in' => 'O tipo de conta deve ser: corrente, poupança, salário ou investimento',
            'description.string' => 'A descrição deve ser um texto',
            'description.max' => 'A descrição não pode ter mais de 255 caracteres',
            'is_default.boolean' => 'O campo padrão deve ser verdadeiro ou falso',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $bankAccount = BankAccount::findOrFail($id);
            
            // If this is set as default, unset all other default accounts for this person
            $personId = $request->input('person_id', $bankAccount->person_id);
            if ($request->boolean('is_default', false) && $personId) {
                BankAccount::where('person_id', $personId)
                    ->where('id', '!=', $id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
            
            $bankAccount->update($request->all());
            
            // Load relationships for the response
            $bankAccount->load(['bank', 'person']);

            return response()->json([
                'message' => 'Conta bancária atualizada com sucesso',
                'data' => $bankAccount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar conta bancária',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified bank account from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $bankAccount = BankAccount::findOrFail($id);
            
            // Check if the bank account is being used in any transaction
            // This needs to be implemented based on your data structure
            // For example:
            // if ($bankAccount->transactions()->count() > 0) {
            //     return response()->json([
            //         'message' => 'Não é possível excluir uma conta bancária que possui transações',
            //     ], 422);
            // }

            $bankAccount->delete();

            return response()->json([
                'message' => 'Conta bancária excluída com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir conta bancária',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 