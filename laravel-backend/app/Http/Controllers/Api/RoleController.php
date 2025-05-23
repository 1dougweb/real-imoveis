<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    /**
     * Display a listing of the roles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'name');
        $sortDirection = $request->input('sort_direction', 'asc');
        $withTrashed = $request->boolean('with_trashed', false);

        $query = Role::query()
            ->where('guard_name', 'web');
            
        if ($withTrashed) {
            $query->withTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $roles = $query->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $roles->items(),
            'meta' => [
                'current_page' => $roles->currentPage(),
                'last_page' => $roles->lastPage(),
                'per_page' => $roles->perPage(),
                'total' => $roles->total(),
            ],
        ]);
    }

    /**
     * Store a newly created role in storage.
     *
     * @param  \App\Http\Requests\RoleRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(RoleRequest $request): JsonResponse
    {
        Log::info('RoleController store request data:', $request->all());
        
        try {
            // Check if a role with this name already exists (including soft-deleted ones)
            $existingRole = Role::withTrashed()->where('name', $request->name)->first();
            
            if ($existingRole) {
                Log::warning('Role creation failed - name already exists:', [
                    'requested_name' => $request->name,
                    'existing_role' => $existingRole->toArray(),
                    'is_trashed' => $existingRole->trashed()
                ]);
                
                return response()->json([
                    'message' => 'Já existe um cargo com este nome',
                    'errors' => [
                        'name' => ['Já existe um cargo com este nome']
                    ]
                ], 422);
            }
            
            $data = $request->validated();
            Log::info('RoleController validated data:', $data);
            
            $role = Role::create($data);

            return response()->json([
                'data' => $role,
                'message' => 'Cargo criado com sucesso',
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Role creation validation error:', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Role creation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Erro ao criar cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified role.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'data' => $role,
        ]);
    }

    /**
     * Update the specified role in storage.
     *
     * @param  \App\Http\Requests\RoleRequest  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(RoleRequest $request, Role $role): JsonResponse
    {
        try {
            $data = $request->validated();
            $role->update($data);

            return response()->json([
                'data' => $role,
                'message' => 'Cargo atualizado com sucesso',
            ]);
        } catch (\Exception $e) {
            Log::error('Role update error:', [
                'message' => $e->getMessage(),
                'role_id' => $role->id,
                'data' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Erro ao atualizar cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified role from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            $role->delete();

            return response()->json([
                'message' => 'Cargo excluído com sucesso',
            ], 204);
        } catch (\Exception $e) {
            Log::error('Role deletion error:', [
                'message' => $e->getMessage(),
                'role_id' => $role->id
            ]);
            
            return response()->json([
                'message' => 'Erro ao excluir cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get permissions for a role.
     *
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function permissions(Role $role): JsonResponse
    {
        try {
            return response()->json([
                'data' => $role->permissions,
            ]);
        } catch (\Exception $e) {
            Log::error('Role permissions retrieval error:', [
                'message' => $e->getMessage(),
                'role_id' => $role->id
            ]);
            
            return response()->json([
                'message' => 'Erro ao obter permissões do cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign permissions to a role.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Role  $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignPermissions(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);
        
        try {
            // Sync permissions
            $role->syncPermissions($request->input('permissions'));
            
            return response()->json([
                'message' => 'Permissões atribuídas com sucesso',
                'data' => $role->permissions,
            ]);
        } catch (\Exception $e) {
            Log::error('Role permissions assignment error:', [
                'message' => $e->getMessage(),
                'role_id' => $role->id,
                'permissions' => $request->input('permissions')
            ]);
            
            return response()->json([
                'message' => 'Erro ao atribuir permissões ao cargo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 