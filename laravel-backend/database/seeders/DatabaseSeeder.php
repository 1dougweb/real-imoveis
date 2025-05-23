<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            StateSeeder::class,
            CitySeeder::class,
            NeighborhoodSeeder::class,
            PersonSeeder::class,
            PropertyTypeSeeder::class,
            PropertySeeder::class,
            // Comentando seeders para simplificar o processo inicial
            // ContractTypeSeeder::class,
            // ContractSeeder::class,
            // BankSeeder::class,
            // BankAccountSeeder::class,
            // PaymentTypeSeeder::class,
            // TransactionSeeder::class,
            // Seeders para imóveis
            // FeatureSeeder::class,
            // Seeders para configurações
            // SystemSettingSeeder::class,
            // Comentando seeders que não existem ainda
            // CommissionTypeSeeder::class,
        ]);
    }
}
