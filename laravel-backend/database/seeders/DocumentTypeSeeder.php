<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documentTypes = [
            [
                'name' => 'RG',
                'description' => 'Registro Geral de Identidade',
                'is_active' => true,
            ],
            [
                'name' => 'CPF',
                'description' => 'Cadastro de Pessoa Física',
                'is_active' => true,
            ],
            [
                'name' => 'CNPJ',
                'description' => 'Cadastro Nacional de Pessoa Jurídica',
                'is_active' => true,
            ],
            [
                'name' => 'Comprovante de Residência',
                'description' => 'Documento que comprova o endereço de residência',
                'is_active' => true,
            ],
            [
                'name' => 'Certidão de Casamento',
                'description' => 'Documento que comprova o estado civil',
                'is_active' => true,
            ],
            [
                'name' => 'Contrato de Compra e Venda',
                'description' => 'Documento que formaliza a compra e venda de imóvel',
                'is_active' => true,
            ],
            [
                'name' => 'Contrato de Locação',
                'description' => 'Documento que formaliza a locação de imóvel',
                'is_active' => true,
            ],
            [
                'name' => 'Escritura',
                'description' => 'Documento que formaliza a transferência de propriedade',
                'is_active' => true,
            ],
            [
                'name' => 'Matrícula do Imóvel',
                'description' => 'Documento que registra o histórico do imóvel',
                'is_active' => true,
            ],
            [
                'name' => 'IPTU',
                'description' => 'Imposto Predial e Territorial Urbano',
                'is_active' => true,
            ],
            [
                'name' => 'Certidão Negativa de Débitos',
                'description' => 'Documento que comprova a inexistência de débitos',
                'is_active' => true,
            ],
            [
                'name' => 'Procuração',
                'description' => 'Documento que autoriza um representante legal',
                'is_active' => true,
            ],
            [
                'name' => 'Outros',
                'description' => 'Outros tipos de documentos',
                'is_active' => true,
            ],
        ];

        foreach ($documentTypes as $documentType) {
            DocumentType::updateOrCreate(
                ['name' => $documentType['name']],
                $documentType
            );
        }
    }
} 