<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Person;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Construtor que aplica middleware de autenticação.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:admin|manager');
    }

    /**
     * Retorna contagem de imóveis por tipo (venda, locação, etc.).
     *
     * @return JsonResponse
     */
    public function propertiesCount(): JsonResponse
    {
        $data = [
            'total' => Property::count(),
            'for_sale' => Property::where('purpose', 'sale')->where('status', 'available')->count(),
            'for_rent' => Property::where('purpose', 'rent')->where('status', 'available')->count(),
            'sold' => Property::where('status', 'sold')->count(),
            'rented' => Property::where('status', 'rented')->count(),
            'inactive' => Property::where('status', 'inactive')->count(),
            'featured' => Property::where('is_featured', true)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Retorna dados de imóveis agrupados por status.
     *
     * @return JsonResponse
     */
    public function propertiesByStatus(): JsonResponse
    {
        $data = [
            'available' => Property::where('status', 'available')->count(),
            'reserved' => Property::where('status', 'reserved')->count(),
            'sold' => Property::where('status', 'sold')->count(),
            'rented' => Property::where('status', 'rented')->count(),
            'inactive' => Property::where('status', 'inactive')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Retorna os imóveis adicionados recentemente.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function recentProperties(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        
        $properties = Property::with(['propertyType', 'city', 'neighborhood'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $properties
        ]);
    }

    /**
     * Retorna contagem de visitas por status.
     *
     * @return JsonResponse
     */
    public function visitsCount(): JsonResponse
    {
        $data = [
            'total' => Visit::count(),
            'pending' => Visit::where('status', 'pending')->count(),
            'completed' => Visit::where('status', 'completed')->count(),
            'cancelled' => Visit::where('status', 'cancelled')->count(),
            'today' => Visit::whereDate('visit_date', Carbon::today())->count(),
            'this_week' => Visit::whereBetween('visit_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])->count(),
            'this_month' => Visit::whereMonth('visit_date', Carbon::now()->month)
                ->whereYear('visit_date', Carbon::now()->year)
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Retorna as próximas visitas agendadas.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upcomingVisits(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        
        $visits = Visit::with(['property', 'client', 'agent'])
            ->where('status', 'pending')
            ->where('visit_date', '>=', Carbon::now())
            ->orderBy('visit_date')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $visits
        ]);
    }

    /**
     * Retorna contagem de contratos por tipo.
     *
     * @return JsonResponse
     */
    public function contractsCount(): JsonResponse
    {
        $data = [
            'total' => Contract::count(),
            'sale' => Contract::where('type', 'sale')->count(),
            'rent' => Contract::where('type', 'rent')->count(),
            'active' => Contract::where('status', 'active')->count(),
            'pending' => Contract::where('status', 'pending')->count(),
            'expired' => Contract::where('status', 'expired')->count(),
            'cancelled' => Contract::where('status', 'cancelled')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Retorna os contratos recentes.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function recentContracts(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 5);
        
        $contracts = Contract::with(['property', 'client', 'agent'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    /**
     * Retorna contagem de pessoas por tipo.
     *
     * @return JsonResponse
     */
    public function peopleCount(): JsonResponse
    {
        $data = [
            'total' => Person::count(),
            'clients' => Person::where('type', 'client')->count(),
            'owners' => Person::where('type', 'owner')->count(),
            'agents' => Person::where('type', 'agent')->count(),
            'employees' => Person::where('type', 'employee')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Retorna resumo financeiro.
     *
     * @return JsonResponse
     */
    public function financialSummary(): JsonResponse
    {
        // Valores a receber (contas a receber)
        $receivable = Transaction::where('type', 'receivable')
            ->where('status', 'pending')
            ->sum('amount');

        // Valores a pagar (contas a pagar)
        $payable = Transaction::where('type', 'payable')
            ->where('status', 'pending')
            ->sum('amount');

        // Vendas do mês
        $salesThisMonth = Contract::where('type', 'sale')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('value');

        // Aluguéis do mês
        $rentalsThisMonth = Contract::where('type', 'rent')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('value');

        // Total recebido no mês
        $receivedThisMonth = Transaction::where('type', 'receivable')
            ->where('status', 'paid')
            ->whereMonth('paid_at', Carbon::now()->month)
            ->whereYear('paid_at', Carbon::now()->year)
            ->sum('amount');

        // Total pago no mês
        $paidThisMonth = Transaction::where('type', 'payable')
            ->where('status', 'paid')
            ->whereMonth('paid_at', Carbon::now()->month)
            ->whereYear('paid_at', Carbon::now()->year)
            ->sum('amount');

        $data = [
            'receivable' => $receivable,
            'payable' => $payable,
            'sales_this_month' => $salesThisMonth,
            'rentals_this_month' => $rentalsThisMonth,
            'received_this_month' => $receivedThisMonth,
            'paid_this_month' => $paidThisMonth,
            'balance' => $receivable - $payable,
            'month_balance' => $receivedThisMonth - $paidThisMonth,
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
} 