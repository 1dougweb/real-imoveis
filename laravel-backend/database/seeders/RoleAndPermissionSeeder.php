<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Criar permissões para propriedades
        $propertyPermissions = [
            'view properties',
            'create properties',
            'edit properties',
            'delete properties',
        ];

        // Criar permissões para contratos
        $contractPermissions = [
            'view contracts',
            'create contracts',
            'edit contracts',
            'delete contracts',
        ];

        // Criar permissões para usuários
        $userPermissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
        ];

        // Criar permissões para relatórios
        $reportPermissions = [
            'view reports',
            'create reports',
        ];

        // Criar permissões financeiras
        $financialPermissions = [
            'view financial',
            'create financial',
            'edit financial',
            'delete financial',
        ];

        // Criar permissões para configurações
        $settingsPermissions = [
            'view settings',
            'edit settings',
        ];

        $allPermissions = array_merge(
            $propertyPermissions,
            $contractPermissions,
            $userPermissions,
            $reportPermissions,
            $financialPermissions,
            $settingsPermissions
        );

        // Criar permissões se não existirem
        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Criar papéis e atribuir permissões
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        $managerPermissions = [
            'view properties', 'create properties', 'edit properties',
            'view contracts', 'create contracts', 'edit contracts',
            'view users',
            'view reports', 'create reports',
            'view financial', 'create financial', 'edit financial',
            'view settings'
        ];
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $managerRole->syncPermissions($managerPermissions);

        $agentPermissions = [
            'view properties', 'create properties', 'edit properties',
            'view contracts', 'create contracts',
            'view reports',
            'view financial'
        ];
        $agentRole = Role::firstOrCreate(['name' => 'agent']);
        $agentRole->syncPermissions($agentPermissions);

        $clientPermissions = [
            'view properties',
            'view contracts'
        ];
        $clientRole = Role::firstOrCreate(['name' => 'client']);
        $clientRole->syncPermissions($clientPermissions);
    }
} 