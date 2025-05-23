<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeatureController extends Controller
{
    /**
     * Lista todas as características disponíveis para imóveis.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Como ainda não temos um modelo Feature, vamos retornar dados mockados
        $features = [
            ['id' => 1, 'name' => 'Piscina'],
            ['id' => 2, 'name' => 'Churrasqueira'],
            ['id' => 3, 'name' => 'Jardim'],
            ['id' => 4, 'name' => 'Varanda'],
            ['id' => 5, 'name' => 'Garagem'],
            ['id' => 6, 'name' => 'Academia'],
            ['id' => 7, 'name' => 'Salão de Festas'],
            ['id' => 8, 'name' => 'Playground'],
            ['id' => 9, 'name' => 'Segurança 24h'],
            ['id' => 10, 'name' => 'Elevador'],
            ['id' => 11, 'name' => 'Mobiliado'],
            ['id' => 12, 'name' => 'Vista para o Mar'],
        ];

        return response()->json($features);
    }
} 