<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\State;
use Illuminate\Support\Str;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem cidades
        if (City::count() > 0) {
            $this->command->info('Já existem cidades no banco de dados. Pulando seeder...');
            return;
        }

        // Verificar se existem estados
        $states = State::all();
        if ($states->isEmpty()) {
            $this->command->error('Não existem estados no banco de dados. Execute o StateSeeder primeiro.');
            return;
        }

        $this->command->info('Criando cidades...');

        // Criar mapeamento de siglas de estados para IDs
        $stateMap = [];
        foreach ($states as $state) {
            $stateMap[$state->abbreviation] = $state->id;
        }

        $cities = [
            ['name' => 'São Paulo', 'state_abbr' => 'SP'],
            ['name' => 'Rio de Janeiro', 'state_abbr' => 'RJ'],
            ['name' => 'Belo Horizonte', 'state_abbr' => 'MG'],
            ['name' => 'Brasília', 'state_abbr' => 'DF'],
            ['name' => 'Salvador', 'state_abbr' => 'BA'],
            ['name' => 'Fortaleza', 'state_abbr' => 'CE'],
            ['name' => 'Recife', 'state_abbr' => 'PE'],
            ['name' => 'Porto Alegre', 'state_abbr' => 'RS'],
            ['name' => 'Curitiba', 'state_abbr' => 'PR'],
            ['name' => 'Manaus', 'state_abbr' => 'AM'],
            ['name' => 'Belém', 'state_abbr' => 'PA'],
            ['name' => 'Goiânia', 'state_abbr' => 'GO'],
            ['name' => 'Guarulhos', 'state_abbr' => 'SP'],
            ['name' => 'Campinas', 'state_abbr' => 'SP'],
            ['name' => 'São Bernardo do Campo', 'state_abbr' => 'SP'],
            ['name' => 'Santo André', 'state_abbr' => 'SP'],
            ['name' => 'São José dos Campos', 'state_abbr' => 'SP'],
            ['name' => 'Ribeirão Preto', 'state_abbr' => 'SP'],
            ['name' => 'Osasco', 'state_abbr' => 'SP'],
            ['name' => 'Sorocaba', 'state_abbr' => 'SP']
        ];

        foreach ($cities as $city) {
            // Verificar se o estado existe no mapeamento
            if (!isset($stateMap[$city['state_abbr']])) {
                $this->command->warn("Estado {$city['state_abbr']} não encontrado. Pulando cidade {$city['name']}.");
                continue;
            }

            City::create([
                'name' => $city['name'],
                'slug' => Str::slug($city['name']),
                'state_id' => $stateMap[$city['state_abbr']],
                'active' => true
            ]);
        }

        $this->command->info('Cidades criadas com sucesso!');
    }
} 