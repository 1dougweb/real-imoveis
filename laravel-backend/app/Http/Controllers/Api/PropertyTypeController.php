<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PropertyTypeRequest;
use App\Models\PropertyType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class PropertyTypeController extends Controller
{
    /**
     * Lista todos os tipos de imóveis cadastrados.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Como ainda não temos um modelo PropertyType, vamos retornar dados mockados
        $propertyTypes = [
            ['id' => 1, 'name' => 'Casa'],
            ['id' => 2, 'name' => 'Apartamento'],
            ['id' => 3, 'name' => 'Terreno'],
            ['id' => 4, 'name' => 'Sala Comercial'],
            ['id' => 5, 'name' => 'Galpão'],
            ['id' => 6, 'name' => 'Chácara'],
            ['id' => 7, 'name' => 'Fazenda'],
            ['id' => 8, 'name' => 'Sítio'],
            ['id' => 9, 'name' => 'Cobertura'],
            ['id' => 10, 'name' => 'Flat'],
        ];

        return response()->json($propertyTypes);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\PropertyTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(PropertyTypeRequest $request)
    {
        $propertyType = new PropertyType();
        $propertyType->name = $request->name;
        $propertyType->slug = Str::slug($request->name);
        $propertyType->description = $request->description;
        $propertyType->active = $request->has('active') ? $request->active : true;
        $propertyType->icon = $request->icon;
        $propertyType->save();

        return response()->json([
            'success' => true,
            'data' => $propertyType,
            'message' => 'Property type created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $propertyType = PropertyType::find($id);

        if (!$propertyType) {
            return response()->json([
                'success' => false,
                'message' => 'Property type not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $propertyType,
            'message' => 'Property type retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\PropertyTypeRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(PropertyTypeRequest $request, $id)
    {
        $propertyType = PropertyType::find($id);

        if (!$propertyType) {
            return response()->json([
                'success' => false,
                'message' => 'Property type not found'
            ], 404);
        }

        $propertyType->name = $request->name;
        $propertyType->slug = Str::slug($request->name);
        $propertyType->description = $request->description;
        $propertyType->active = $request->has('active') ? $request->active : $propertyType->active;
        $propertyType->icon = $request->icon;
        $propertyType->save();

        return response()->json([
            'success' => true,
            'data' => $propertyType,
            'message' => 'Property type updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $propertyType = PropertyType::find($id);

        if (!$propertyType) {
            return response()->json([
                'success' => false,
                'message' => 'Property type not found'
            ], 404);
        }

        // Check if there are properties using this type
        if ($propertyType->properties()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete property type because it is being used by properties'
            ], 409);
        }

        $propertyType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property type deleted successfully'
        ]);
    }
} 