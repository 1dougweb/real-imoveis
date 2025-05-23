<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentTypeController extends Controller
{
    /**
     * Display a listing of payment types.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');

        $query = PaymentType::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $paymentTypes = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $paymentTypes->items(),
            'meta' => [
                'current_page' => $paymentTypes->currentPage(),
                'last_page' => $paymentTypes->lastPage(),
                'per_page' => $paymentTypes->perPage(),
                'total' => $paymentTypes->total(),
            ],
        ]);
    }

    /**
     * Store a newly created payment type in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:payment_types',
            'description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ], [
            'name.required' => 'O nome do tipo de pagamento é obrigatório',
            'name.string' => 'O nome deve ser um texto',
            'name.max' => 'O nome não pode ter mais de 100 caracteres',
            'name.unique' => 'Já existe um tipo de pagamento com este nome',
            'description.string' => 'A descrição deve ser um texto',
            'description.max' => 'A descrição não pode ter mais de 255 caracteres',
            'is_active.boolean' => 'O campo ativo deve ser verdadeiro ou falso',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $paymentType = PaymentType::create($request->all());

            return response()->json([
                'message' => 'Tipo de pagamento criado com sucesso',
                'data' => $paymentType
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar tipo de pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified payment type.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $paymentType = PaymentType::findOrFail($id);

            return response()->json([
                'data' => $paymentType
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Tipo de pagamento não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified payment type in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $paymentType = PaymentType::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:payment_types,name,' . $id,
                'description' => 'nullable|string|max:255',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'O nome do tipo de pagamento é obrigatório',
                'name.string' => 'O nome deve ser um texto',
                'name.max' => 'O nome não pode ter mais de 100 caracteres',
                'name.unique' => 'Já existe um tipo de pagamento com este nome',
                'description.string' => 'A descrição deve ser um texto',
                'description.max' => 'A descrição não pode ter mais de 255 caracteres',
                'is_active.boolean' => 'O campo ativo deve ser verdadeiro ou falso',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $paymentType->update($request->all());

            return response()->json([
                'message' => 'Tipo de pagamento atualizado com sucesso',
                'data' => $paymentType
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar tipo de pagamento',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Remove the specified payment type from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $paymentType = PaymentType::findOrFail($id);
            
            // Check if payment type is being used
            if ($paymentType->transactions()->count() > 0) {
                return response()->json([
                    'message' => 'Não é possível excluir o tipo de pagamento pois está sendo utilizado em transações'
                ], 422);
            }

            $paymentType->delete();

            return response()->json([
                'message' => 'Tipo de pagamento excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir tipo de pagamento',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }
} 