<?php

namespace Database\Seeders;

use App\Models\Bank;
use Illuminate\Database\Seeder;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            [
                'name' => 'Banco do Brasil',
                'code' => '001',
            ],
            [
                'name' => 'Caixa Econômica Federal',
                'code' => '104',
            ],
            [
                'name' => 'Bradesco',
                'code' => '237',
            ],
            [
                'name' => 'Itaú Unibanco',
                'code' => '341',
            ],
            [
                'name' => 'Santander',
                'code' => '033',
            ],
            [
                'name' => 'Banco Inter',
                'code' => '077',
            ],
            [
                'name' => 'Nubank',
                'code' => '260',
            ],
            [
                'name' => 'BTG Pactual',
                'code' => '208',
            ],
            [
                'name' => 'Banco Original',
                'code' => '212',
            ],
            [
                'name' => 'C6 Bank',
                'code' => '336',
            ],
            [
                'name' => 'PagBank',
                'code' => '290',
            ],
            [
                'name' => 'Banrisul',
                'code' => '041',
            ],
            [
                'name' => 'Sicoob',
                'code' => '756',
            ],
            [
                'name' => 'Sicredi',
                'code' => '748',
            ],
        ];

        foreach ($banks as $bank) {
            Bank::updateOrCreate(
                ['code' => $bank['code']],
                $bank
            );
        }
    }
} 