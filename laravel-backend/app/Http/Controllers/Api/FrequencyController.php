<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Frequency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FrequencyController extends Controller
{
    /**
     * Display a listing of the resource.
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

        $query = Frequency::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $frequencies = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $frequencies->items(),
            'meta' => [
                'current_page' => $frequencies->currentPage(),
                'last_page' => $frequencies->lastPage(),
                'per_page' => $frequencies->perPage(),
                'total' => $frequencies->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:frequencies,name',
            'days' => 'required|integer|min:1',
        ], [
            'name.required' => 'O nome da frequência é obrigatório',
            'name.string' => 'O nome da frequência deve ser um texto',
            'name.max' => 'O nome da frequência não pode ter mais de 255 caracteres',
            'name.unique' => 'Já existe uma frequência com este nome',
            'days.required' => 'O número de dias é obrigatório',
            'days.integer' => 'O número de dias deve ser um número inteiro',
            'days.min' => 'O número de dias deve ser no mínimo 1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $frequency = Frequency::create($request->all());

            return response()->json([
                'message' => 'Frequência criada com sucesso',
                'data' => $frequency
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar frequência',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $frequency = Frequency::findOrFail($id);

            return response()->json([
                'data' => $frequency
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Frequência não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => "sometimes|required|string|max:255|unique:frequencies,name,{$id}",
            'days' => 'sometimes|required|integer|min:1',
        ], [
            'name.required' => 'O nome da frequência é obrigatório',
            'name.string' => 'O nome da frequência deve ser um texto',
            'name.max' => 'O nome da frequência não pode ter mais de 255 caracteres',
            'name.unique' => 'Já existe uma frequência com este nome',
            'days.required' => 'O número de dias é obrigatório',
            'days.integer' => 'O número de dias deve ser um número inteiro',
            'days.min' => 'O número de dias deve ser no mínimo 1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $frequency = Frequency::findOrFail($id);
            $frequency->update($request->all());

            return response()->json([
                'message' => 'Frequência atualizada com sucesso',
                'data' => $frequency
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar frequência',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $frequency = Frequency::findOrFail($id);
            
            // Check if the frequency is being used in any transaction or schedule
            // This needs to be implemented based on your data structure
            // For example:
            // if ($frequency->transactions()->count() > 0) {
            //     return response()->json([
            //         'message' => 'Não é possível excluir uma frequência que está sendo utilizada',
            //     ], 422);
            // }

            $frequency->delete();

            return response()->json([
                'message' => 'Frequência excluída com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir frequência',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 