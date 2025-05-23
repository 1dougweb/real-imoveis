<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Person;
use Illuminate\Support\Str;

class PersonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem pessoas
        if (Person::count() > 0) {
            $this->command->info('Já existem pessoas no banco de dados. Pulando seeder...');
            return;
        }

        $this->command->info('Criando pessoas (proprietários e corretores)...');

        // Criar 10 proprietários
        for ($i = 1; $i <= 10; $i++) {
            $firstName = $this->getRandomFirstName();
            $lastName = $this->getRandomLastName();
            $name = "{$firstName} {$lastName}";
            $email = strtolower(Str::slug($firstName)) . '.' . strtolower(Str::slug($lastName)) . '@example.com';
            
            Person::create([
                'name' => $name,
                'type' => 'owner',
                'email' => $email,
                'phone' => $this->generatePhone(),
                'mobile' => $this->generateMobile(),
                'document_type' => 'cpf',
                'document' => $this->generateCPF(),
                'address' => "Rua dos Proprietários, {$i}",
                'address_number' => (string)rand(1, 1000),
                'address_complement' => rand(0, 1) ? "Apto " . rand(1, 100) : null,
                'state' => 'SP',
                'zip_code' => '01000-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'notes' => "Observações sobre o proprietário {$i}",
            ]);
        }

        // Criar 5 corretores
        for ($i = 1; $i <= 5; $i++) {
            $firstName = $this->getRandomFirstName();
            $lastName = $this->getRandomLastName();
            $name = "{$firstName} {$lastName}";
            $email = strtolower(Str::slug($firstName)) . '.' . strtolower(Str::slug($lastName)) . '@imobiliaria.com';
            
            Person::create([
                'name' => $name,
                'type' => 'broker',
                'email' => $email,
                'phone' => $this->generatePhone(),
                'mobile' => $this->generateMobile(),
                'document_type' => 'cpf',
                'document' => $this->generateCPF(),
                'address' => "Rua dos Corretores, {$i}",
                'address_number' => (string)rand(1, 1000),
                'address_complement' => rand(0, 1) ? "Apto " . rand(1, 100) : null,
                'state' => 'SP',
                'zip_code' => '01400-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'notes' => "Observações sobre o corretor {$i}",
            ]);
        }

        // Criar 3 pessoas que são ambos (proprietário e corretor)
        for ($i = 1; $i <= 3; $i++) {
            $firstName = $this->getRandomFirstName();
            $lastName = $this->getRandomLastName();
            $name = "{$firstName} {$lastName}";
            $email = strtolower(Str::slug($firstName)) . '.' . strtolower(Str::slug($lastName)) . '@dual.com';
            
            Person::create([
                'name' => $name,
                'type' => 'both',
                'email' => $email,
                'phone' => $this->generatePhone(),
                'mobile' => $this->generateMobile(),
                'document_type' => 'cpf',
                'document' => $this->generateCPF(),
                'address' => "Avenida Principal, {$i}",
                'address_number' => (string)rand(1, 1000),
                'address_complement' => rand(0, 1) ? "Apto " . rand(1, 100) : null,
                'state' => 'SP',
                'zip_code' => '04500-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'notes' => "Observações sobre a pessoa {$i} (proprietário e corretor)",
            ]);
        }

        $this->command->info('Pessoas criadas com sucesso!');
    }

    /**
     * Gera um número de CPF aleatório
     */
    private function generateCPF(): string
    {
        $n1 = rand(0, 9);
        $n2 = rand(0, 9);
        $n3 = rand(0, 9);
        $n4 = rand(0, 9);
        $n5 = rand(0, 9);
        $n6 = rand(0, 9);
        $n7 = rand(0, 9);
        $n8 = rand(0, 9);
        $n9 = rand(0, 9);
        
        $d1 = $n9 * 2 + $n8 * 3 + $n7 * 4 + $n6 * 5 + $n5 * 6 + $n4 * 7 + $n3 * 8 + $n2 * 9 + $n1 * 10;
        $d1 = 11 - (($d1 % 11) > 9 ? 0 : ($d1 % 11));
        
        $d2 = $d1 * 2 + $n9 * 3 + $n8 * 4 + $n7 * 5 + $n6 * 6 + $n5 * 7 + $n4 * 8 + $n3 * 9 + $n2 * 10 + $n1 * 11;
        $d2 = 11 - (($d2 % 11) > 9 ? 0 : ($d2 % 11));
        
        return "{$n1}{$n2}{$n3}.{$n4}{$n5}{$n6}.{$n7}{$n8}{$n9}-{$d1}{$d2}";
    }

    /**
     * Gera um número de telefone fixo aleatório
     */
    private function generatePhone(): string
    {
        return '(11) ' . rand(2000, 5999) . '-' . rand(1000, 9999);
    }

    /**
     * Gera um número de celular aleatório
     */
    private function generateMobile(): string
    {
        return '(11) 9' . rand(1000, 9999) . '-' . rand(1000, 9999);
    }

    /**
     * Retorna um nome aleatório
     */
    private function getRandomFirstName(): string
    {
        $firstNames = [
            'Ana', 'Bruno', 'Carlos', 'Daniel', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena',
            'Igor', 'Julia', 'Karina', 'Lucas', 'Mariana', 'Nelson', 'Olivia', 'Paulo',
            'Quiteria', 'Rafael', 'Sofia', 'Thiago', 'Ursula', 'Victor', 'Wanda', 'Xavier',
            'Yasmin', 'Zelia', 'Antonio', 'Beatriz', 'Caio', 'Daniela', 'Elias', 'Flavia',
            'Gustavo', 'Heloisa', 'Ivan', 'Juliana', 'Kevin', 'Larissa', 'Marcelo', 'Natalia'
        ];
        
        return $firstNames[array_rand($firstNames)];
    }

    /**
     * Retorna um sobrenome aleatório
     */
    private function getRandomLastName(): string
    {
        $lastNames = [
            'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
            'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
            'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade',
            'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos',
            'Goncalves', 'Araujo', 'Pinto', 'Teixeira', 'Amaral', 'Barros', 'Peixoto', 'Correia'
        ];
        
        return $lastNames[array_rand($lastNames)];
    }
} 