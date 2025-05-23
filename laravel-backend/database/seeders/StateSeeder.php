<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\State;
use Illuminate\Support\Str;

class StateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem estados
        if (State::count() > 0) {
            $this->command->info('Já existem estados no banco de dados. Pulando seeder...');
            return;
        }

        $this->command->info('Criando estados...');

        $states = [
            ['name' => 'Acre', 'abbreviation' => 'AC'],
            ['name' => 'Alagoas', 'abbreviation' => 'AL'],
            ['name' => 'Amapá', 'abbreviation' => 'AP'],
            ['name' => 'Amazonas', 'abbreviation' => 'AM'],
            ['name' => 'Bahia', 'abbreviation' => 'BA'],
            ['name' => 'Ceará', 'abbreviation' => 'CE'],
            ['name' => 'Distrito Federal', 'abbreviation' => 'DF'],
            ['name' => 'Espírito Santo', 'abbreviation' => 'ES'],
            ['name' => 'Goiás', 'abbreviation' => 'GO'],
            ['name' => 'Maranhão', 'abbreviation' => 'MA'],
            ['name' => 'Mato Grosso', 'abbreviation' => 'MT'],
            ['name' => 'Mato Grosso do Sul', 'abbreviation' => 'MS'],
            ['name' => 'Minas Gerais', 'abbreviation' => 'MG'],
            ['name' => 'Pará', 'abbreviation' => 'PA'],
            ['name' => 'Paraíba', 'abbreviation' => 'PB'],
            ['name' => 'Paraná', 'abbreviation' => 'PR'],
            ['name' => 'Pernambuco', 'abbreviation' => 'PE'],
            ['name' => 'Piauí', 'abbreviation' => 'PI'],
            ['name' => 'Rio de Janeiro', 'abbreviation' => 'RJ'],
            ['name' => 'Rio Grande do Norte', 'abbreviation' => 'RN'],
            ['name' => 'Rio Grande do Sul', 'abbreviation' => 'RS'],
            ['name' => 'Rondônia', 'abbreviation' => 'RO'],
            ['name' => 'Roraima', 'abbreviation' => 'RR'],
            ['name' => 'Santa Catarina', 'abbreviation' => 'SC'],
            ['name' => 'São Paulo', 'abbreviation' => 'SP'],
            ['name' => 'Sergipe', 'abbreviation' => 'SE'],
            ['name' => 'Tocantins', 'abbreviation' => 'TO']
        ];

        foreach ($states as $state) {
            State::create([
                'name' => $state['name'],
                'abbreviation' => $state['abbreviation'],
                'slug' => Str::slug($state['name']),
                'active' => true
            ]);
        }

        $this->command->info('Estados criados com sucesso!');
    }
} 