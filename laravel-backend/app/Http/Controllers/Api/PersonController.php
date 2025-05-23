<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PersonController extends Controller
{
    /**
     * Lista todas as pessoas cadastradas.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Como ainda não temos um modelo Person, vamos retornar dados mockados
        $people = [
            ['id' => 1, 'name' => 'João Silva', 'is_owner' => true, 'is_broker' => false],
            ['id' => 2, 'name' => 'Maria Oliveira', 'is_owner' => true, 'is_broker' => false],
            ['id' => 3, 'name' => 'Carlos Santos', 'is_owner' => false, 'is_broker' => true],
            ['id' => 4, 'name' => 'Ana Pereira', 'is_owner' => false, 'is_broker' => true],
            ['id' => 5, 'name' => 'Roberto Almeida', 'is_owner' => true, 'is_broker' => false],
            ['id' => 6, 'name' => 'Fernanda Lima', 'is_owner' => false, 'is_broker' => true],
            ['id' => 7, 'name' => 'Paulo Costa', 'is_owner' => true, 'is_broker' => false],
            ['id' => 8, 'name' => 'Juliana Martins', 'is_owner' => false, 'is_broker' => true],
            ['id' => 9, 'name' => 'Ricardo Souza', 'is_owner' => true, 'is_broker' => false],
            ['id' => 10, 'name' => 'Camila Ferreira', 'is_owner' => false, 'is_broker' => true],
        ];

        return response()->json($people);
    }
} 