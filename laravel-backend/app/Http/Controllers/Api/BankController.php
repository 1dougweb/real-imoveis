<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BankController extends Controller
{
    /**
     * Display a listing of the banks.
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

        $query = Bank::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        $banks = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $banks->items(),
            'meta' => [
                'current_page' => $banks->currentPage(),
                'last_page' => $banks->lastPage(),
                'per_page' => $banks->perPage(),
                'total' => $banks->total(),
            ],
        ]);
    }

    /**
     * Store a newly created bank in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:banks',
            'code' => 'required|string|max:10|unique:banks',
            'logo' => 'nullable|string|max:255',
        ], [
            'name.required' => 'O nome do banco é obrigatório',
            'name.string' => 'O nome deve ser um texto',
            'name.max' => 'O nome não pode ter mais de 100 caracteres',
            'name.unique' => 'Já existe um banco com este nome',
            'code.required' => 'O código do banco é obrigatório',
            'code.string' => 'O código deve ser um texto',
            'code.max' => 'O código não pode ter mais de 10 caracteres',
            'code.unique' => 'Já existe um banco com este código',
            'logo.string' => 'O logo deve ser um texto',
            'logo.max' => 'O logo não pode ter mais de 255 caracteres',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $bank = Bank::create($request->all());

            return response()->json([
                'message' => 'Banco criado com sucesso',
                'data' => $bank
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar banco',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified bank.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $bank = Bank::findOrFail($id);

            return response()->json([
                'data' => $bank
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Banco não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified bank in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $bank = Bank::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:banks,name,' . $id,
                'code' => 'required|string|max:10|unique:banks,code,' . $id,
                'logo' => 'nullable|string|max:255',
            ], [
                'name.required' => 'O nome do banco é obrigatório',
                'name.string' => 'O nome deve ser um texto',
                'name.max' => 'O nome não pode ter mais de 100 caracteres',
                'name.unique' => 'Já existe um banco com este nome',
                'code.required' => 'O código do banco é obrigatório',
                'code.string' => 'O código deve ser um texto',
                'code.max' => 'O código não pode ter mais de 10 caracteres',
                'code.unique' => 'Já existe um banco com este código',
                'logo.string' => 'O logo deve ser um texto',
                'logo.max' => 'O logo não pode ter mais de 255 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $bank->update($request->all());

            return response()->json([
                'message' => 'Banco atualizado com sucesso',
                'data' => $bank
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar banco',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }

    /**
     * Remove the specified bank from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $bank = Bank::findOrFail($id);
            
            // Check if bank has any accounts
            if ($bank->accounts()->count() > 0) {
                return response()->json([
                    'message' => 'Não é possível excluir o banco pois existem contas bancárias associadas'
                ], 422);
            }

            $bank->delete();

            return response()->json([
                'message' => 'Banco excluído com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir banco',
                'error' => $e->getMessage()
            ], $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException ? 404 : 500);
        }
    }
} 