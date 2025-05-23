<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Resetar as permissões em cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissões para imóveis
        $propertyPermissions = [
            'view properties',
            'create properties',
            'edit properties',
            'delete properties',
        ];

        // Permissões para pessoas
        $personPermissions = [
            'view people',
            'create people',
            'edit people',
            'delete people',
        ];

        // Permissões para visitas
        $visitPermissions = [
            'view visits',
            'create visits',
            'edit visits',
            'delete visits',
            'complete visits',
        ];

        // Permissões para contratos
        $contractPermissions = [
            'view contracts',
            'create contracts',
            'edit contracts',
            'delete contracts',
            'generate contract pdf',
        ];

        // Permissões para transações financeiras
        $transactionPermissions = [
            'view transactions',
            'create transactions',
            'edit transactions',
            'delete transactions',
            'mark transactions as paid',
        ];

        // Permissões para relatórios
        $reportPermissions = [
            'view reports',
        ];

        // Permissões para configurações
        $settingPermissions = [
            'view settings',
            'edit settings',
        ];

        // Permissões para usuários
        $userPermissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
        ];

        // Criar permissões
        $allPermissions = array_merge(
            $propertyPermissions,
            $personPermissions,
            $visitPermissions,
            $contractPermissions,
            $transactionPermissions,
            $reportPermissions,
            $settingPermissions,
            $userPermissions
        );

        foreach ($allPermissions as $permission) {
            // Verificar se a permissão já existe
            if (!Permission::where('name', $permission)->exists()) {
                Permission::create(['name' => $permission]);
            }
        }

        // Criar papéis e atribuir permissões
        $roles = [
            'admin' => $allPermissions,
            'manager' => array_merge(
                $propertyPermissions,
                $personPermissions,
                $visitPermissions,
                $contractPermissions,
                $transactionPermissions,
                $reportPermissions
            ),
            'agent' => array_merge(
                ['view properties', 'edit properties'],
                ['view people', 'create people', 'edit people'],
                $visitPermissions,
                ['view contracts', 'create contracts']
            ),
            'client' => [
                'view properties',
                'view visits',
                'create visits',
            ],
        ];

        foreach ($roles as $roleName => $permissions) {
            // Verificar se o papel já existe
            $role = Role::where('name', $roleName)->first();
            
            if (!$role) {
                $role = Role::create(['name' => $roleName]);
            }
            
            // Sincronizar permissões
            $role->syncPermissions($permissions);
        }
    }
} 