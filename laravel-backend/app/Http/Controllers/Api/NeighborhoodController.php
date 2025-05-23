<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Neighborhood;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class NeighborhoodController extends Controller
{
    /**
     * Lista todos os bairros cadastrados, com opção de filtrar por cidade.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Neighborhood::query();

        // Filtrar por city_id se fornecido
        if ($request->has('city_id') && !empty($request->city_id)) {
            $query->where('city_id', (int) $request->city_id);
        }

        $neighborhoods = $query->orderBy('name')->get();
        return response()->json($neighborhoods);
    }

    /**
     * Get neighborhoods by city.
     *
     * @param int $cityId
     * @param Request $request
     * @return JsonResponse
     */
    public function getByCity(int $cityId, Request $request): JsonResponse
    {
        try {
            $city = City::findOrFail($cityId);
            
            $perPage = $request->input('per_page', 10);
            $search = $request->input('search', '');
            $sortBy = $request->input('sort_by', 'name');
            $sortDirection = $request->input('sort_direction', 'asc');

            $query = Neighborhood::where('city_id', $cityId);

            if ($search) {
                $query->where('name', 'like', "%{$search}%");
            }

            $neighborhoods = $query->orderBy($sortBy, $sortDirection)
                ->paginate($perPage);

            return response()->json([
                'data' => $neighborhoods->items(),
                'meta' => [
                    'current_page' => $neighborhoods->currentPage(),
                    'last_page' => $neighborhoods->lastPage(),
                    'per_page' => $neighborhoods->perPage(),
                    'total' => $neighborhoods->total(),
                    'city' => $city->name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cidade não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created neighborhood in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validação básica
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('neighborhoods')->where(function ($query) use ($request) {
                    return $query->where('city_id', $request->city_id);
                }),
            ],
            'city_id' => 'required|integer|exists:cities,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $neighborhood = Neighborhood::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'city_id' => $request->city_id,
                'active' => $request->input('active', true),
                'zip_code' => $request->input('zip_code'),
            ]);

            return response()->json([
                'message' => 'Bairro criado com sucesso',
                'data' => $neighborhood
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar bairro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified neighborhood.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $neighborhood = Neighborhood::with('city.state')->findOrFail($id);

            return response()->json([
                'data' => $neighborhood
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Bairro não encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified neighborhood in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $neighborhood = Neighborhood::findOrFail($id);
            
            // Validação básica
            $validator = Validator::make($request->all(), [
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('neighborhoods')->where(function ($query) use ($request, $neighborhood) {
                        return $query->where('city_id', $request->city_id ?? $neighborhood->city_id);
                    })->ignore($neighborhood->id),
                ],
                'city_id' => 'sometimes|required|integer|exists:cities,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $request->only(['name', 'city_id', 'active', 'zip_code']);
            
            // Gerar slug se o nome foi alterado
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }
            
            $neighborhood->update($data);

            return response()->json([
                'message' => 'Bairro atualizado com sucesso',
                'data' => $neighborhood
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar bairro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified neighborhood from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $neighborhood = Neighborhood::findOrFail($id);
            $neighborhood->delete();
            
            return response()->json([
                'message' => 'Bairro excluído com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir bairro',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 