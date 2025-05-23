<?php

namespace Database\Seeders;

use App\Models\Frequency;
use Illuminate\Database\Seeder;

class FrequencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $frequencies = [
            [
                'name' => 'Diária',
                'days' => 1,
                'description' => 'Frequência diária',
            ],
            [
                'name' => 'Semanal',
                'days' => 7,
                'description' => 'Frequência semanal',
            ],
            [
                'name' => 'Quinzenal',
                'days' => 15,
                'description' => 'Frequência quinzenal',
            ],
            [
                'name' => 'Mensal',
                'days' => 30,
                'description' => 'Frequência mensal',
            ],
            [
                'name' => 'Bimestral',
                'days' => 60,
                'description' => 'Frequência bimestral',
            ],
            [
                'name' => 'Trimestral',
                'days' => 90,
                'description' => 'Frequência trimestral',
            ],
            [
                'name' => 'Semestral',
                'days' => 180,
                'description' => 'Frequência semestral',
            ],
            [
                'name' => 'Anual',
                'days' => 365,
                'description' => 'Frequência anual',
            ],
        ];

        foreach ($frequencies as $frequency) {
            Frequency::updateOrCreate(
                ['name' => $frequency['name']],
                $frequency
            );
        }
    }
} 