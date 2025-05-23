<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Contract;
use App\Models\Person;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    /**
     * Construtor que aplica middleware de autenticação.
     */
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('permission:view commissions')->only(['index', 'show', 'getByPerson']);
        $this->middleware('permission:create commissions')->only(['store']);
        $this->middleware('permission:edit commissions')->only(['update', 'approve', 'pay', 'cancel']);
        $this->middleware('permission:delete commissions')->only(['destroy']);
    }

    /**
     * Listar todas as comissões.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Commission::with(['person', 'contract', 'commissionType']);

        // Filtros
        if ($request->has('person_id')) {
            $query->where('person_id', $request->person_id);
        }

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        if ($request->has('commission_type_id')) {
            $query->where('commission_type_id', $request->commission_type_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Ordenação
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        $query->orderBy($sortField, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $commissions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $commissions
        ]);
    }

    /**
     * Exibir uma comissão específica.
     *
     * @param Commission $commission
     * @return JsonResponse
     */
    public function show(Commission $commission): JsonResponse
    {
        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'data' => $commission
        ]);
    }

    /**
     * Criar uma nova comissão.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'person_id' => 'required|exists:people,id',
            'contract_id' => 'required|exists:contracts,id',
            'commission_type_id' => 'required|exists:commission_types,id',
            'amount' => 'required|numeric|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        // Verificar se a pessoa existe e é um corretor
        $person = Person::findOrFail($validated['person_id']);
        if ($person->type !== 'agent') {
            return response()->json([
                'success' => false,
                'message' => 'A pessoa selecionada não é um corretor'
            ], 422);
        }

        // Verificar se o contrato existe
        $contract = Contract::findOrFail($validated['contract_id']);

        // Criar a comissão
        $commission = Commission::create([
            'person_id' => $validated['person_id'],
            'contract_id' => $validated['contract_id'],
            'commission_type_id' => $validated['commission_type_id'],
            'amount' => $validated['amount'],
            'percentage' => $validated['percentage'] ?? null,
            'status' => Commission::STATUS_PENDING,
            'description' => $validated['description'] ?? null,
        ]);

        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'message' => 'Comissão criada com sucesso',
            'data' => $commission
        ], 201);
    }

    /**
     * Atualizar uma comissão existente.
     *
     * @param Request $request
     * @param Commission $commission
     * @return JsonResponse
     */
    public function update(Request $request, Commission $commission): JsonResponse
    {
        // Verificar se a comissão já foi paga
        if ($commission->isPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível atualizar uma comissão já paga'
            ], 422);
        }

        $validated = $request->validate([
            'person_id' => 'nullable|exists:people,id',
            'contract_id' => 'nullable|exists:contracts,id',
            'commission_type_id' => 'nullable|exists:commission_types,id',
            'amount' => 'nullable|numeric|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
        ]);

        // Verificar se a pessoa é um corretor
        if (isset($validated['person_id'])) {
            $person = Person::findOrFail($validated['person_id']);
            if ($person->type !== 'agent') {
                return response()->json([
                    'success' => false,
                    'message' => 'A pessoa selecionada não é um corretor'
                ], 422);
            }
        }

        // Atualizar a comissão
        $commission->update($validated);

        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'message' => 'Comissão atualizada com sucesso',
            'data' => $commission
        ]);
    }

    /**
     * Aprovar uma comissão.
     *
     * @param Commission $commission
     * @return JsonResponse
     */
    public function approve(Commission $commission): JsonResponse
    {
        // Verificar se a comissão está pendente
        if (!$commission->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas comissões pendentes podem ser aprovadas'
            ], 422);
        }

        $commission->status = Commission::STATUS_APPROVED;
        $commission->save();

        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'message' => 'Comissão aprovada com sucesso',
            'data' => $commission
        ]);
    }

    /**
     * Pagar uma comissão.
     *
     * @param Commission $commission
     * @return JsonResponse
     */
    public function pay(Commission $commission): JsonResponse
    {
        // Verificar se a comissão está aprovada
        if (!$commission->isApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas comissões aprovadas podem ser pagas'
            ], 422);
        }

        $commission->status = Commission::STATUS_PAID;
        $commission->paid_at = Carbon::now();
        $commission->save();

        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'message' => 'Comissão paga com sucesso',
            'data' => $commission
        ]);
    }

    /**
     * Cancelar uma comissão.
     *
     * @param Request $request
     * @param Commission $commission
     * @return JsonResponse
     */
    public function cancel(Request $request, Commission $commission): JsonResponse
    {
        // Verificar se a comissão já foi paga
        if ($commission->isPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível cancelar uma comissão já paga'
            ], 422);
        }

        $request->validate([
            'cancellation_reason' => 'nullable|string',
        ]);

        $commission->status = Commission::STATUS_CANCELLED;
        
        if ($request->has('cancellation_reason')) {
            $commission->description = $commission->description 
                ? $commission->description . "\n\nMotivo do cancelamento: " . $request->cancellation_reason
                : "Motivo do cancelamento: " . $request->cancellation_reason;
        }
        
        $commission->save();

        // Carregar os relacionamentos
        $commission->load(['person', 'contract', 'commissionType']);

        return response()->json([
            'success' => true,
            'message' => 'Comissão cancelada com sucesso',
            'data' => $commission
        ]);
    }

    /**
     * Remover uma comissão.
     *
     * @param Commission $commission
     * @return JsonResponse
     */
    public function destroy(Commission $commission): JsonResponse
    {
        // Verificar se a comissão já foi paga
        if ($commission->isPaid()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir uma comissão já paga'
            ], 422);
        }

        $commission->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comissão removida com sucesso'
        ]);
    }

    /**
     * Listar comissões por pessoa.
     *
     * @param Request $request
     * @param Person $person
     * @return JsonResponse
     */
    public function getByPerson(Request $request, Person $person): JsonResponse
    {
        $query = Commission::with(['contract', 'commissionType'])
            ->where('person_id', $person->id);

        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Ordenação
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        $query->orderBy($sortField, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 15);
        $commissions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $commissions
        ]);
    }
} 