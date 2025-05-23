<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('setup:fresh', function () {
    $this->info('Configurando banco de dados e criando usuários...');
    
    // Executa as migrations e seeds com dados iniciais
    $this->call('migrate:fresh', ['--seed' => true]);
    
    // Exibe as credenciais de acesso
    $this->info('');
    $this->info('===================================================');
    $this->info('CREDENCIAIS DOS USUÁRIOS CRIADOS');
    $this->info('===================================================');
    $this->info('');
    
    $users = [
        'Administrador' => [
            'Email:' => 'admin@laranjarealimoveis.com.br',
            'Senha:' => 'admin123',
            'Papel:' => 'admin'
        ],
        'Gerente' => [
            'Email:' => 'gerente@laranjarealimoveis.com.br',
            'Senha:' => 'gerente123',
            'Papel:' => 'manager'
        ],
        'Corretor' => [
            'Email:' => 'corretor@laranjarealimoveis.com.br',
            'Senha:' => 'corretor123',
            'Papel:' => 'agent'
        ],
        'Cliente' => [
            'Email:' => 'cliente@exemplo.com',
            'Senha:' => 'cliente123',
            'Papel:' => 'client'
        ]
    ];
    
    foreach ($users as $name => $details) {
        $this->info($name);
        $this->line('-------------------------');
        foreach ($details as $key => $value) {
            $this->line("$key $value");
        }
        $this->info('');
    }
    
    // Informações adicionais geradas
    $this->info('Também foram gerados 5 usuários cliente aleatórios');
    $this->info('');
    
    $this->info('===================================================');
    $this->info('Configuração concluída com sucesso!');
    $this->info('===================================================');
    
})->purpose('Configure o sistema com dados iniciais e exibe credenciais de login');
