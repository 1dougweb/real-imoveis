<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Transações a receber
        // Aluguéis
        Transaction::factory()
            ->count(20)
            ->receivable()
            ->rent()
            ->create();

        // Vendas
        Transaction::factory()
            ->count(10)
            ->receivable()
            ->sale()
            ->create();

        // Comissões
        Transaction::factory()
            ->count(15)
            ->receivable()
            ->commission()
            ->create();

        // Transações a pagar
        // Manutenções
        Transaction::factory()
            ->count(15)
            ->payable()
            ->maintenance()
            ->create();

        // Impostos
        Transaction::factory()
            ->count(10)
            ->payable()
            ->tax()
            ->create();

        // Outras despesas
        Transaction::factory()
            ->count(10)
            ->payable()
            ->state(['category' => 'other'])
            ->create();

        // Transações vencidas
        Transaction::factory()
            ->count(10)
            ->overdue()
            ->create();

        // Transações do mês atual
        Transaction::factory()
            ->count(20)
            ->thisMonth()
            ->create();

        // Transações do próximo mês
        Transaction::factory()
            ->count(15)
            ->nextMonth()
            ->create();

        // Transações pagas
        Transaction::factory()
            ->count(30)
            ->paid()
            ->create();

        // Transações canceladas
        Transaction::factory()
            ->count(5)
            ->cancelled()
            ->create();
    }
} 