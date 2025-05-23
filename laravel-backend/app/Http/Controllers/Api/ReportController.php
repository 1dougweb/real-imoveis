<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Contract;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Construtor que aplica middleware de autenticação.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:admin');
    }

    /**
     * Relatório financeiro.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function financial(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Receitas
        $receivables = Transaction::where('type', 'receivable')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Despesas
        $payables = Transaction::where('type', 'payable')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Totais
        $totalReceivables = $receivables->sum('total');
        $totalPayables = $payables->sum('total');
        $balance = $totalReceivables - $totalPayables;
        
        return response()->json([
            'success' => true,
            'data' => [
                'receivables' => $receivables,
                'payables' => $payables,
                'total_receivables' => $totalReceivables,
                'total_payables' => $totalPayables,
                'balance' => $balance,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de propriedades.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function properties(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Propriedades por status
        $propertiesByStatus = Property::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();
            
        // Propriedades por tipo
        $propertiesByType = Property::select('property_type_id', DB::raw('count(*) as total'))
            ->with('propertyType')
            ->groupBy('property_type_id')
            ->get();
            
        // Propriedades por cidade
        $propertiesByCity = Property::select('city_id', DB::raw('count(*) as total'))
            ->with('city')
            ->groupBy('city_id')
            ->get();
            
        // Propriedades adicionadas no período
        $newProperties = Property::whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        // Propriedades vendidas no período
        $soldProperties = Property::where('status', 'sold')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->count();
            
        // Propriedades alugadas no período
        $rentedProperties = Property::where('status', 'rented')
            ->whereBetween('updated_at', [$startDate, $endDate])
            ->count();
            
        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $propertiesByStatus,
                'by_type' => $propertiesByType,
                'by_city' => $propertiesByCity,
                'new_properties' => $newProperties,
                'sold_properties' => $soldProperties,
                'rented_properties' => $rentedProperties,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de comissões.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function commissions(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Comissões por status
        $commissionsByStatus = Commission::select('status', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->groupBy('status')
            ->get();
            
        // Comissões por tipo
        $commissionsByType = Commission::select('commission_type_id', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->with('commissionType')
            ->groupBy('commission_type_id')
            ->get();
            
        // Comissões por corretor
        $commissionsByAgent = Commission::select('person_id', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->with('person')
            ->groupBy('person_id')
            ->get();
            
        // Comissões pagas no período
        $paidCommissions = Commission::where('status', 'paid')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        $totalPaidCommissions = $paidCommissions->sum('total');
        
        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $commissionsByStatus,
                'by_type' => $commissionsByType,
                'by_agent' => $commissionsByAgent,
                'paid_commissions' => $paidCommissions,
                'total_paid_commissions' => $totalPaidCommissions,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de visitas.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function visits(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Visitas por status
        $visitsByStatus = Visit::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();
            
        // Visitas por corretor
        $visitsByAgent = Visit::select('agent_id', DB::raw('count(*) as total'))
            ->with('agent')
            ->groupBy('agent_id')
            ->get();
            
        // Visitas por imóvel
        $visitsByProperty = Visit::select('property_id', DB::raw('count(*) as total'))
            ->with('property')
            ->groupBy('property_id')
            ->get();
            
        // Visitas por dia no período
        $visitsByDate = Visit::whereBetween('visit_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(visit_date) as date'),
                DB::raw('count(*) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        $totalVisits = $visitsByDate->sum('total');
        
        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $visitsByStatus,
                'by_agent' => $visitsByAgent,
                'by_property' => $visitsByProperty,
                'by_date' => $visitsByDate,
                'total_visits' => $totalVisits,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de contratos.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function contracts(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Contratos por tipo
        $contractsByType = Contract::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get();
            
        // Contratos por status
        $contractsByStatus = Contract::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get();
            
        // Contratos por corretor
        $contractsByAgent = Contract::select('agent_id', DB::raw('count(*) as total'))
            ->with('agent')
            ->groupBy('agent_id')
            ->get();
            
        // Contratos criados no período
        $newContracts = Contract::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                'type',
                DB::raw('count(*) as total')
            )
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();
            
        // Valor total dos contratos no período
        $totalContractValue = Contract::whereBetween('created_at', [$startDate, $endDate])
            ->sum('value');
        
        return response()->json([
            'success' => true,
            'data' => [
                'by_type' => $contractsByType,
                'by_status' => $contractsByStatus,
                'by_agent' => $contractsByAgent,
                'new_contracts' => $newContracts,
                'total_contract_value' => $totalContractValue,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de vendas.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sales(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Vendas por dia no período
        $salesByDate = Contract::where('type', 'sale')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(value) as value')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Valor total das vendas no período
        $totalSalesValue = $salesByDate->sum('value');
        $totalSalesCount = $salesByDate->sum('total');
        
        // Vendas por tipo de imóvel
        $salesByPropertyType = Contract::where('type', 'sale')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->join('property_types', 'properties.property_type_id', '=', 'property_types.id')
            ->select(
                'property_types.id',
                'property_types.name',
                DB::raw('count(*) as total'),
                DB::raw('sum(contracts.value) as value')
            )
            ->groupBy('property_types.id', 'property_types.name')
            ->get();
            
        // Vendas por corretor
        $salesByAgent = Contract::where('type', 'sale')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('people', 'contracts.agent_id', '=', 'people.id')
            ->select(
                'people.id',
                'people.name',
                DB::raw('count(*) as total'),
                DB::raw('sum(contracts.value) as value')
            )
            ->groupBy('people.id', 'people.name')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => [
                'by_date' => $salesByDate,
                'by_property_type' => $salesByPropertyType,
                'by_agent' => $salesByAgent,
                'total_sales_value' => $totalSalesValue,
                'total_sales_count' => $totalSalesCount,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de aluguéis.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function rentals(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Aluguéis por dia no período
        $rentalsByDate = Contract::where('type', 'rent')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(value) as value')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Valor total dos aluguéis no período
        $totalRentalsValue = $rentalsByDate->sum('value');
        $totalRentalsCount = $rentalsByDate->sum('total');
        
        // Aluguéis por tipo de imóvel
        $rentalsByPropertyType = Contract::where('type', 'rent')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('properties', 'contracts.property_id', '=', 'properties.id')
            ->join('property_types', 'properties.property_type_id', '=', 'property_types.id')
            ->select(
                'property_types.id',
                'property_types.name',
                DB::raw('count(*) as total'),
                DB::raw('sum(contracts.value) as value')
            )
            ->groupBy('property_types.id', 'property_types.name')
            ->get();
            
        // Aluguéis por corretor
        $rentalsByAgent = Contract::where('type', 'rent')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('people', 'contracts.agent_id', '=', 'people.id')
            ->select(
                'people.id',
                'people.name',
                DB::raw('count(*) as total'),
                DB::raw('sum(contracts.value) as value')
            )
            ->groupBy('people.id', 'people.name')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => [
                'by_date' => $rentalsByDate,
                'by_property_type' => $rentalsByPropertyType,
                'by_agent' => $rentalsByAgent,
                'total_rentals_value' => $totalRentalsValue,
                'total_rentals_count' => $totalRentalsCount,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de contas a pagar.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function accountsPayable(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Contas a pagar por status
        $payablesByStatus = Transaction::where('type', 'payable')
            ->select('status', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->groupBy('status')
            ->get();
            
        // Contas a pagar por categoria
        $payablesByCategory = Transaction::where('type', 'payable')
            ->select('category', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->groupBy('category')
            ->get();
            
        // Contas a pagar pagas no período
        $paidPayables = Transaction::where('type', 'payable')
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(amount) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Contas a pagar pendentes
        $pendingPayables = Transaction::where('type', 'payable')
            ->where('status', 'pending')
            ->select(
                DB::raw('DATE(due_date) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(amount) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Totais
        $totalPaidAmount = $paidPayables->sum('amount');
        $totalPendingAmount = $pendingPayables->sum('amount');
        
        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $payablesByStatus,
                'by_category' => $payablesByCategory,
                'paid_payables' => $paidPayables,
                'pending_payables' => $pendingPayables,
                'total_paid_amount' => $totalPaidAmount,
                'total_pending_amount' => $totalPendingAmount,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de contas a receber.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function accountsReceivable(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Contas a receber por status
        $receivablesByStatus = Transaction::where('type', 'receivable')
            ->select('status', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->groupBy('status')
            ->get();
            
        // Contas a receber por categoria
        $receivablesByCategory = Transaction::where('type', 'receivable')
            ->select('category', DB::raw('count(*) as total'), DB::raw('sum(amount) as amount'))
            ->groupBy('category')
            ->get();
            
        // Contas a receber recebidas no período
        $paidReceivables = Transaction::where('type', 'receivable')
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(amount) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Contas a receber pendentes
        $pendingReceivables = Transaction::where('type', 'receivable')
            ->where('status', 'pending')
            ->select(
                DB::raw('DATE(due_date) as date'),
                DB::raw('count(*) as total'),
                DB::raw('sum(amount) as amount')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        // Totais
        $totalPaidAmount = $paidReceivables->sum('amount');
        $totalPendingAmount = $pendingReceivables->sum('amount');
        
        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $receivablesByStatus,
                'by_category' => $receivablesByCategory,
                'paid_receivables' => $paidReceivables,
                'pending_receivables' => $pendingReceivables,
                'total_paid_amount' => $totalPaidAmount,
                'total_pending_amount' => $totalPendingAmount,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }

    /**
     * Relatório de imóveis mais acessados.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function mostViewedProperties(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $limit = $request->get('limit', 20);
        
        // Imóveis mais visualizados
        $mostViewedProperties = Property::withCount(['visits' => function($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->having('visits_count', '>', 0)
            ->orderBy('visits_count', 'desc')
            ->limit($limit)
            ->with(['propertyType', 'city', 'neighborhood'])
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => [
                'properties' => $mostViewedProperties,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ]
        ]);
    }
} 