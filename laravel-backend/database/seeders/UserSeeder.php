<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lista de usuários padrão
        $users = [
            [
                'name' => 'Administrador',
                'email' => 'admin@laranjarealimoveis.com.br',
                'password' => Hash::make('admin123'),
                'is_admin' => true,
                'role' => 'admin'
            ],
            [
                'name' => 'Gerente',
                'email' => 'gerente@laranjarealimoveis.com.br',
                'password' => Hash::make('gerente123'),
                'is_admin' => false,
                'role' => 'manager'
            ],
            [
                'name' => 'Corretor',
                'email' => 'corretor@laranjarealimoveis.com.br',
                'password' => Hash::make('corretor123'),
                'is_admin' => false,
                'role' => 'agent'
            ],
            [
                'name' => 'Cliente',
                'email' => 'cliente@exemplo.com',
                'password' => Hash::make('cliente123'),
                'is_admin' => false,
                'role' => 'client'
            ]
        ];

        // Criar ou atualizar cada usuário
        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
            
            // Garantir que o usuário tenha o papel correto
            $user->syncRoles([$role]);
        }

        // Criar mais 5 usuários aleatórios apenas se não existirem suficientes
        $clientCount = User::whereHas('roles', function($query) {
            $query->where('name', 'client');
        })->count();
        
        $additional = 5 - ($clientCount - 1); // -1 porque já criamos um cliente acima
        
        if ($additional > 0) {
            User::factory($additional)->create()->each(function ($user) {
                $user->assignRole('client');
            });
        }
    }
} 