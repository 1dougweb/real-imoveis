<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CityController extends Controller
{
    /**
     * Display a listing of the cities.
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
        $stateId = $request->input('state_id');

        $query = City::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($stateId) {
            $query->where('state_id', $stateId);
        }

        $cities = $query->orderBy($sortBy, $sortDirection)
            ->with('state')
            ->paginate($perPage);

        return response()->json([
            'data' => $cities->items(),
            'meta' => [
                'current_page' => $cities->currentPage(),
                'last_page' => $cities->lastPage(),
                'per_page' => $cities->perPage(),
                'total' => $cities->total(),
            ],
        ]);
    }

    /**
     * Store a newly created city in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cities')->where(function ($query) use ($request) {
                    return $query->where('state_id', $request->state_id);
                }),
            ],
            'state_id' => 'required|exists:states,id',
            'active' => 'boolean',
        ], [
            'name.required' => 'O nome da cidade é obrigatório',
            'name.string' => 'O nome da cidade deve ser um texto',
            'name.max' => 'O nome da cidade não pode ter mais de 255 caracteres',
            'name.unique' => 'Já existe uma cidade com este nome neste estado',
            'state_id.required' => 'O estado é obrigatório',
            'state_id.exists' => 'O estado selecionado não existe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            
            // Generate slug from name
            $data['slug'] = Str::slug($data['name']);
            
            $city = City::create($data);

            return response()->json([
                'message' => 'Cidade criada com sucesso',
                'data' => $city
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar cidade',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified city.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $city = City::with('state')->findOrFail($id);

            return response()->json([
                'data' => $city
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cidade não encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified city in storage.
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('cities')->where(function ($query) use ($request) {
                    return $query->where('state_id', $request->state_id);
                })->ignore($id),
            ],
            'state_id' => 'sometimes|required|exists:states,id',
            'active' => 'boolean',
        ], [
            'name.required' => 'O nome da cidade é obrigatório',
            'name.string' => 'O nome da cidade deve ser um texto',
            'name.max' => 'O nome da cidade não pode ter mais de 255 caracteres',
            'name.unique' => 'Já existe uma cidade com este nome neste estado',
            'state_id.required' => 'O estado é obrigatório',
            'state_id.exists' => 'O estado selecionado não existe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $city = City::findOrFail($id);
            $data = $request->all();
            
            // Update slug if name is changed
            if (isset($data['name']) && $data['name'] !== $city->name) {
                $data['slug'] = Str::slug($data['name']);
            }
            
            $city->update($data);

            return response()->json([
                'message' => 'Cidade atualizada com sucesso',
                'data' => $city
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar cidade',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified city from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $city = City::findOrFail($id);

            // Check if the city has related neighborhoods
            if ($city->neighborhoods()->count() > 0) {
                return response()->json([
                    'message' => 'Não é possível excluir uma cidade que possui bairros',
                ], 422);
            }

            $city->delete();

            return response()->json([
                'message' => 'Cidade excluída com sucesso'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir cidade',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lista todos os bairros de uma cidade específica.
     *
     * @param int $cityId
     * @return JsonResponse
     */
    public function neighborhoods(int $cityId): JsonResponse
    {
        // Dados mockados de bairros para cada cidade
        $neighborhoodsByCityId = [
            1 => [ // São Paulo
                ['id' => 1, 'name' => 'Jardins', 'city_id' => 1],
                ['id' => 2, 'name' => 'Moema', 'city_id' => 1],
                ['id' => 3, 'name' => 'Itaim Bibi', 'city_id' => 1],
                ['id' => 4, 'name' => 'Vila Mariana', 'city_id' => 1],
                ['id' => 5, 'name' => 'Pinheiros', 'city_id' => 1],
            ],
            2 => [ // Rio de Janeiro
                ['id' => 6, 'name' => 'Copacabana', 'city_id' => 2],
                ['id' => 7, 'name' => 'Ipanema', 'city_id' => 2],
                ['id' => 8, 'name' => 'Leblon', 'city_id' => 2],
                ['id' => 9, 'name' => 'Barra da Tijuca', 'city_id' => 2],
                ['id' => 10, 'name' => 'Botafogo', 'city_id' => 2],
            ],
            3 => [ // Belo Horizonte
                ['id' => 11, 'name' => 'Savassi', 'city_id' => 3],
                ['id' => 12, 'name' => 'Lourdes', 'city_id' => 3],
                ['id' => 13, 'name' => 'Funcionários', 'city_id' => 3],
                ['id' => 14, 'name' => 'Buritis', 'city_id' => 3],
                ['id' => 15, 'name' => 'Mangabeiras', 'city_id' => 3],
            ],
            // Adicione mais bairros para outras cidades conforme necessário
        ];

        // Retorna os bairros da cidade especificada ou um array vazio se a cidade não existir
        return response()->json($neighborhoodsByCityId[$cityId] ?? []);
    }
} 