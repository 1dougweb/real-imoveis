<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Feature;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem características
        if (Feature::count() > 0) {
            $this->command->info('Já existem características no banco de dados. Pulando seeder...');
            return;
        }

        $this->command->info('Criando características...');

        $features = [
            // Características internas
            ['name' => 'Ar condicionado', 'category' => 'internal', 'icon' => 'air-conditioner'],
            ['name' => 'Aquecimento central', 'category' => 'internal', 'icon' => 'heating'],
            ['name' => 'Armários embutidos', 'category' => 'internal', 'icon' => 'wardrobe'],
            ['name' => 'Closet', 'category' => 'internal', 'icon' => 'closet'],
            ['name' => 'Cozinha americana', 'category' => 'internal', 'icon' => 'kitchen'],
            ['name' => 'Despensa', 'category' => 'internal', 'icon' => 'pantry'],
            ['name' => 'Escritório', 'category' => 'internal', 'icon' => 'office'],
            ['name' => 'Lareira', 'category' => 'internal', 'icon' => 'fireplace'],
            ['name' => 'Mobiliado', 'category' => 'internal', 'icon' => 'furniture'],
            ['name' => 'Piso aquecido', 'category' => 'internal', 'icon' => 'heated-floor'],
            ['name' => 'Varanda gourmet', 'category' => 'internal', 'icon' => 'balcony'],
            
            // Características externas
            ['name' => 'Área de lazer', 'category' => 'external', 'icon' => 'recreation'],
            ['name' => 'Churrasqueira', 'category' => 'external', 'icon' => 'barbecue'],
            ['name' => 'Elevador', 'category' => 'external', 'icon' => 'elevator'],
            ['name' => 'Espaço gourmet', 'category' => 'external', 'icon' => 'gourmet'],
            ['name' => 'Estacionamento para visitantes', 'category' => 'external', 'icon' => 'parking'],
            ['name' => 'Jardim', 'category' => 'external', 'icon' => 'garden'],
            ['name' => 'Piscina', 'category' => 'external', 'icon' => 'pool'],
            ['name' => 'Playground', 'category' => 'external', 'icon' => 'playground'],
            ['name' => 'Quadra esportiva', 'category' => 'external', 'icon' => 'sports'],
            ['name' => 'Salão de festas', 'category' => 'external', 'icon' => 'party'],
            ['name' => 'Sauna', 'category' => 'external', 'icon' => 'sauna'],
            ['name' => 'Academia', 'category' => 'external', 'icon' => 'gym'],
            
            // Segurança
            ['name' => 'Circuito de câmeras', 'category' => 'security', 'icon' => 'camera'],
            ['name' => 'Condomínio fechado', 'category' => 'security', 'icon' => 'gated'],
            ['name' => 'Interfone', 'category' => 'security', 'icon' => 'intercom'],
            ['name' => 'Portaria 24h', 'category' => 'security', 'icon' => 'security'],
            ['name' => 'Portão eletrônico', 'category' => 'security', 'icon' => 'gate'],
            ['name' => 'Sistema de alarme', 'category' => 'security', 'icon' => 'alarm'],
            
            // Acessibilidade
            ['name' => 'Adaptado para deficientes', 'category' => 'accessibility', 'icon' => 'wheelchair'],
            ['name' => 'Banheiro adaptado', 'category' => 'accessibility', 'icon' => 'accessible-bathroom'],
            ['name' => 'Rampas de acesso', 'category' => 'accessibility', 'icon' => 'ramp'],
        ];

        foreach ($features as $feature) {
            Feature::create([
                'name' => $feature['name'],
                'category' => $feature['category'],
                'icon' => $feature['icon'],
                'active' => true,
            ]);
        }

        $this->command->info('Características criadas com sucesso!');
    }
} 