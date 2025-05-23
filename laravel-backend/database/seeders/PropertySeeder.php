<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\City;
use App\Models\Neighborhood;
use App\Models\Person;
use App\Models\Feature;
use App\Models\User;
use Illuminate\Support\Str;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem imóveis
        if (Property::count() > 0) {
            $this->command->info('Já existem imóveis no banco de dados. Pulando seeder...');
            return;
        }

        // Verificar se existem tipos de imóveis, cidades, bairros, pessoas e características
        $propertyTypesCount = PropertyType::count();
        $citiesCount = City::count();
        $neighborhoodsCount = Neighborhood::count();
        $peopleCount = Person::count();
        $featuresCount = Feature::count();
        $usersCount = User::count();

        if ($propertyTypesCount === 0 || $citiesCount === 0 || $neighborhoodsCount === 0 || $peopleCount === 0) {
            $this->command->error('Não existem todos os registros necessários para criar imóveis. Execute os outros seeders primeiro.');
            return;
        }

        $this->command->info('Criando imóveis...');

        // Obter IDs necessários
        $propertyTypeIds = PropertyType::pluck('id')->toArray();
        $cityIds = City::pluck('id')->toArray();
        $neighborhoodIds = Neighborhood::pluck('id')->toArray();
        $ownerIds = Person::where('type', 'owner')->orWhere('type', 'both')->pluck('id')->toArray();
        $agentIds = Person::where('type', 'broker')->orWhere('type', 'both')->pluck('id')->toArray();
        $featureIds = Feature::pluck('id')->toArray();
        $userId = User::first()->id ?? null;

        // Se não houver proprietários ou corretores, usar qualquer pessoa
        if (empty($ownerIds)) {
            $ownerIds = Person::pluck('id')->toArray();
        }

        if (empty($agentIds)) {
            $agentIds = Person::pluck('id')->toArray();
        }

        // Criar 10 imóveis
        for ($i = 1; $i <= 10; $i++) {
            $purpose = ['sale', 'rent', 'both'][array_rand(['sale', 'rent', 'both'])];
            $propertyTypeId = $propertyTypeIds[array_rand($propertyTypeIds)];
            $cityId = $cityIds[array_rand($cityIds)];
            
            // Obter bairros da cidade selecionada
            $cityNeighborhoods = Neighborhood::where('city_id', $cityId)->pluck('id')->toArray();
            $neighborhoodId = !empty($cityNeighborhoods) ? $cityNeighborhoods[array_rand($cityNeighborhoods)] : $neighborhoodIds[array_rand($neighborhoodIds)];
            
            $ownerId = $ownerIds[array_rand($ownerIds)];
            $agentId = $agentIds[array_rand($agentIds)];
            
            $title = "Imóvel Teste {$i}";
            $slug = Str::slug($title) . '-' . rand(1000, 9999);
            
            // Gerar código único para o imóvel
            $prefix = strtoupper(substr($purpose, 0, 1)); // S, R ou B
            $uniqueNumber = mt_rand(10000, 99999);
            $code = $prefix . '-' . $uniqueNumber;
            
            // Criar o imóvel
            $property = Property::create([
                'code' => $code,
                'title' => $title,
                'slug' => $slug,
                'description' => "Esta é uma descrição de teste para o imóvel {$i}. Um ótimo imóvel com excelente localização.",
                'property_type_id' => $propertyTypeId,
                'purpose' => $purpose,
                'sale_price' => $purpose === 'sale' || $purpose === 'both' ? rand(100000, 1000000) : null,
                'rent_price' => $purpose === 'rent' || $purpose === 'both' ? rand(1000, 5000) : null,
                'condominium_fee' => rand(200, 1000),
                'iptu' => rand(500, 2000),
                'address' => "Rua Teste {$i}",
                'address_number' => (string)rand(1, 1000),
                'address_complement' => "Apto " . rand(1, 100),
                'neighborhood_id' => $neighborhoodId,
                'city_id' => $cityId,
                'state' => 'SP',
                'zip_code' => '01000-000',
                'latitude' => -23.550520 + (rand(-1000, 1000) / 10000),
                'longitude' => -46.633309 + (rand(-1000, 1000) / 10000),
                'bedrooms' => rand(1, 5),
                'bathrooms' => rand(1, 4),
                'suites' => rand(0, 3),
                'parking_spaces' => rand(0, 3),
                'area' => rand(50, 300),
                'total_area' => rand(60, 350),
                'floor' => rand(0, 20),
                'furnished' => (bool)rand(0, 1),
                'facing' => ['Norte', 'Sul', 'Leste', 'Oeste'][array_rand(['Norte', 'Sul', 'Leste', 'Oeste'])],
                'owner_id' => $ownerId,
                'agent_id' => $agentId,
                'status' => ['available', 'sold', 'rented', 'reserved'][array_rand(['available', 'sold', 'rented', 'reserved'])],
                'featured' => (bool)rand(0, 1),
                'active' => true,
                'created_by' => $userId,
            ]);
            
            // Adicionar características aleatórias
            if (!empty($featureIds)) {
                $selectedFeatures = array_rand(array_flip($featureIds), min(count($featureIds), rand(3, 8)));
                $property->features()->attach(is_array($selectedFeatures) ? $selectedFeatures : [$selectedFeatures]);
            }
            
            $this->command->info("Imóvel {$i} criado: {$property->title}");
        }
        
        $this->command->info('Imóveis criados com sucesso!');
    }
} 