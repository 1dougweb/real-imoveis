<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrador',
                'description' => 'Acesso completo ao sistema',
                'is_active' => true,
            ],
            [
                'name' => 'Gerente',
                'description' => 'Gerenciamento de imóveis, pessoas, visitas e contratos',
                'is_active' => true,
            ],
            [
                'name' => 'Corretor',
                'description' => 'Gestão de visitas e cadastro de clientes',
                'is_active' => true,
            ],
            [
                'name' => 'Assistente',
                'description' => 'Auxílio em tarefas administrativas',
                'is_active' => true,
            ],
            [
                'name' => 'Financeiro',
                'description' => 'Gestão financeira e controle de pagamentos',
                'is_active' => true,
            ],
            [
                'name' => 'Cliente',
                'description' => 'Acesso limitado para clientes',
                'is_active' => true,
            ],
            [
                'name' => 'Proprietário',
                'description' => 'Acesso limitado para proprietários de imóveis',
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
} 