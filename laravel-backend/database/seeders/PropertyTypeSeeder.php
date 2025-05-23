<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PropertyType;
use Illuminate\Support\Str;

class PropertyTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Casa',
                'description' => 'Imóvel residencial independente, geralmente com um ou mais pavimentos.',
                'icon' => 'house'
            ],
            [
                'name' => 'Apartamento',
                'description' => 'Unidade residencial em prédio, com acesso a áreas comuns do condomínio.',
                'icon' => 'apartment'
            ],
            [
                'name' => 'Casa em Condomínio',
                'description' => 'Casa localizada em condomínio fechado, com segurança e áreas de lazer compartilhadas.',
                'icon' => 'house-condo'
            ],
            [
                'name' => 'Terreno',
                'description' => 'Lote de terra para construção ou investimento.',
                'icon' => 'terrain'
            ],
            [
                'name' => 'Comercial',
                'description' => 'Imóvel para fins comerciais, como loja, escritório ou galpão.',
                'icon' => 'commercial'
            ],
            [
                'name' => 'Rural',
                'description' => 'Propriedade rural, como sítio, chácara ou fazenda.',
                'icon' => 'farm'
            ],
            [
                'name' => 'Cobertura',
                'description' => 'Apartamento localizado no último andar de um edifício, geralmente com terraço.',
                'icon' => 'penthouse'
            ],
            [
                'name' => 'Flat',
                'description' => 'Apartamento compacto, geralmente com serviços de hotelaria.',
                'icon' => 'flat'
            ],
            [
                'name' => 'Loja',
                'description' => 'Imóvel comercial para varejo, geralmente no térreo de edifícios.',
                'icon' => 'store'
            ],
            [
                'name' => 'Sala Comercial',
                'description' => 'Espaço comercial para escritório ou consultório.',
                'icon' => 'office'
            ],
            [
                'name' => 'Galpão',
                'description' => 'Espaço amplo para fins industriais, logísticos ou armazenamento.',
                'icon' => 'warehouse'
            ],
        ];

        foreach ($types as $type) {
            PropertyType::updateOrCreate(
                ['name' => $type['name']],
                [
                    'slug' => Str::slug($type['name']),
                    'description' => $type['description'],
                    'icon' => $type['icon'],
                    'active' => true
                ]
            );
        }
    }
} 