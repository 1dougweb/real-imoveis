<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Neighborhood;
use App\Models\City;
use Illuminate\Support\Str;

class NeighborhoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem bairros
        if (Neighborhood::count() > 0) {
            $this->command->info('Já existem bairros no banco de dados. Pulando seeder...');
            return;
        }

        // Verificar se existem cidades
        $cities = City::all();
        if ($cities->isEmpty()) {
            $this->command->error('Não existem cidades no banco de dados. Execute o CitySeeder primeiro.');
            return;
        }

        $this->command->info('Criando bairros...');

        // Bairros para São Paulo
        $saoPaulo = City::where('name', 'São Paulo')->first();
        if ($saoPaulo) {
            $neighborhoods = [
                'Jardins', 'Moema', 'Vila Mariana', 'Pinheiros', 'Itaim Bibi', 
                'Vila Olímpia', 'Morumbi', 'Brooklin', 'Campo Belo', 'Perdizes',
                'Higienópolis', 'Consolação', 'Bela Vista', 'Liberdade', 'Aclimação',
                'Vila Madalena', 'Butantã', 'Lapa', 'Santana', 'Tatuapé'
            ];

            foreach ($neighborhoods as $name) {
                Neighborhood::create([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'city_id' => $saoPaulo->id,
                    'active' => true
                ]);
            }
        }

        // Bairros para Rio de Janeiro
        $rioDeJaneiro = City::where('name', 'Rio de Janeiro')->first();
        if ($rioDeJaneiro) {
            $neighborhoods = [
                'Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo',
                'Flamengo', 'Tijuca', 'Recreio dos Bandeirantes', 'Laranjeiras', 'Jardim Botânico'
            ];

            foreach ($neighborhoods as $name) {
                Neighborhood::create([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'city_id' => $rioDeJaneiro->id,
                    'active' => true
                ]);
            }
        }

        // Bairros para Belo Horizonte
        $beloHorizonte = City::where('name', 'Belo Horizonte')->first();
        if ($beloHorizonte) {
            $neighborhoods = [
                'Savassi', 'Lourdes', 'Funcionários', 'Sion', 'Mangabeiras',
                'Buritis', 'Belvedere', 'Santo Agostinho', 'Serra', 'Cidade Nova'
            ];

            foreach ($neighborhoods as $name) {
                Neighborhood::create([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'city_id' => $beloHorizonte->id,
                    'active' => true
                ]);
            }
        }

        // Adicionar alguns bairros para outras cidades
        foreach ($cities as $city) {
            if (!in_array($city->name, ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'])) {
                // Adicionar 5 bairros genéricos para cada cidade
                for ($i = 1; $i <= 5; $i++) {
                    $name = "Bairro {$i} - {$city->name}";
                    Neighborhood::create([
                        'name' => $name,
                        'slug' => Str::slug($name),
                        'city_id' => $city->id,
                        'active' => true
                    ]);
                }
            }
        }

        $this->command->info('Bairros criados com sucesso!');
    }
} 