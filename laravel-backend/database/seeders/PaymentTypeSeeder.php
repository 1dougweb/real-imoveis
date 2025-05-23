<?php

namespace Database\Seeders;

use App\Models\PaymentType;
use Illuminate\Database\Seeder;

class PaymentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $paymentTypes = [
            [
                'name' => 'Dinheiro',
                'description' => 'Pagamento em dinheiro',
            ],
            [
                'name' => 'Cartão de Crédito',
                'description' => 'Pagamento por cartão de crédito',
            ],
            [
                'name' => 'Cartão de Débito',
                'description' => 'Pagamento por cartão de débito',
            ],
            [
                'name' => 'Transferência Bancária',
                'description' => 'Pagamento por transferência bancária',
            ],
            [
                'name' => 'Boleto Bancário',
                'description' => 'Pagamento por boleto bancário',
            ],
            [
                'name' => 'PIX',
                'description' => 'Pagamento por PIX',
            ],
            [
                'name' => 'Cheque',
                'description' => 'Pagamento por cheque',
            ],
            [
                'name' => 'Financiamento Bancário',
                'description' => 'Pagamento por financiamento bancário',
            ],
        ];

        foreach ($paymentTypes as $paymentType) {
            PaymentType::updateOrCreate(
                ['name' => $paymentType['name']],
                $paymentType
            );
        }
    }
} 