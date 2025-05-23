<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\PropertyTypeController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\NeighborhoodController;
use App\Http\Controllers\Api\FeatureController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\VisitController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\FrequencyController;
use App\Http\Controllers\Api\PaymentTypeController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\CommissionTypeController;
use App\Http\Controllers\Api\PropertyImageController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentTypeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Models\Role;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\FinancialController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API Root
Route::get('/', function () {
    return response()->json([
        'name' => 'Laranja Real Imóveis API',
        'version' => '1.0.0'
    ]);
});

// Authentication Routes
Route::group(['prefix' => 'auth'], function () {
    // Public routes
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    
    // Protected routes
    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile', [AuthController::class, 'updateProfile']);
    });
});

// Dashboard routes (apenas para administradores e gerentes)
Route::group(['prefix' => 'dashboard', 'middleware' => ['auth:api', 'role:admin|manager']], function () {
    Route::get('properties/count', [DashboardController::class, 'propertiesCount']);
    Route::get('properties/status', [DashboardController::class, 'propertiesByStatus']);
    Route::get('properties/recent', [DashboardController::class, 'recentProperties']);
    Route::get('visits/count', [DashboardController::class, 'visitsCount']);
    Route::get('visits/upcoming', [DashboardController::class, 'upcomingVisits']);
    Route::get('contracts/count', [DashboardController::class, 'contractsCount']);
    Route::get('contracts/recent', [DashboardController::class, 'recentContracts']);
    Route::get('people/count', [DashboardController::class, 'peopleCount']);
    Route::get('financial/summary', [DashboardController::class, 'financialSummary']);
});

// Rotas para imóveis
Route::get('properties/search', [PropertyController::class, 'search']);

// Public property routes
Route::get('properties', [PropertyController::class, 'index']);
Route::get('properties/{id}', [PropertyController::class, 'show']);

// Protected property routes
Route::group(['middleware' => 'auth:api'], function () {
    Route::post('properties', [PropertyController::class, 'store']);
    Route::put('properties/{id}', [PropertyController::class, 'update']);
    Route::delete('properties/{id}', [PropertyController::class, 'destroy']);
    Route::put('properties/{id}/featured', [PropertyController::class, 'toggleFeatured']);
    Route::put('properties/{id}/status', [PropertyController::class, 'changeStatus']);
});

// Rotas para imagens de imóveis
Route::group(['middleware' => 'auth:api'], function () {
    Route::post('properties/{property}/images/upload', [PropertyImageController::class, 'upload']);
    Route::post('properties/{property}/images/reorder', [PropertyImageController::class, 'reorderImages']);
    Route::put('properties/images/{image}/featured', [PropertyImageController::class, 'toggleFeatured']);
    Route::put('properties/images/{image}/order', [PropertyImageController::class, 'updateOrder']);
    Route::delete('properties/images/{image}', [PropertyImageController::class, 'destroy']);
});

// Rotas para tipos de imóveis
// Public routes
Route::get('property-types', [PropertyTypeController::class, 'index']);
Route::get('property-types/{id}', [PropertyTypeController::class, 'show']);

// Protected routes
Route::group(['middleware' => 'auth:api'], function () {
    Route::post('property-types', [PropertyTypeController::class, 'store'])->middleware('permission:create property types');
    Route::put('property-types/{id}', [PropertyTypeController::class, 'update'])->middleware('permission:edit property types');
    Route::delete('property-types/{id}', [PropertyTypeController::class, 'destroy'])->middleware('permission:delete property types');
});

// Rotas para cidades e bairros
Route::apiResource('states', \App\Http\Controllers\Api\StateController::class, ['only' => ['index', 'show']]);
Route::get('states/{state}/cities', [\App\Http\Controllers\Api\StateController::class, 'cities']);
Route::apiResource('cities', CityController::class, ['only' => ['index', 'show']]);
Route::get('cities/{city}/neighborhoods', [CityController::class, 'neighborhoods']);
Route::apiResource('neighborhoods', NeighborhoodController::class);

// Rotas para características
Route::apiResource('features', FeatureController::class, ['only' => ['index', 'show']]);

// Rotas para pessoas (clientes, proprietários, corretores, etc.)
Route::apiResource('people', PersonController::class, ['only' => ['index', 'show']]);

// Rotas para cargos
Route::apiResource('roles', RoleController::class);
Route::get('roles/{role}/permissions', [RoleController::class, 'permissions']);
Route::post('roles/{role}/permissions', [RoleController::class, 'assignPermissions']);

// Rotas para bancos e contas bancárias
Route::apiResource('banks', BankController::class);
Route::apiResource('bank-accounts', BankAccountController::class);
Route::get('people/{person}/bank-accounts', [BankAccountController::class, 'getByPerson']);

// Rotas para frequências
Route::apiResource('frequencies', FrequencyController::class);

// Rotas para tipos de pagamento
Route::apiResource('payment-types', PaymentTypeController::class);

// Rotas para tipos de comissão
Route::apiResource('commission-types', CommissionTypeController::class);

// Rotas para comissões
Route::apiResource('commissions', CommissionController::class);
Route::put('commissions/{id}/approve', [CommissionController::class, 'approve']);
Route::put('commissions/{id}/pay', [CommissionController::class, 'pay']);
Route::put('commissions/{id}/cancel', [CommissionController::class, 'cancel']);
Route::get('people/{person}/commissions', [CommissionController::class, 'getByPerson']);

// Rotas para tipos de documentos
Route::apiResource('document-types', DocumentTypeController::class);

// Rotas para documentos
Route::post('documents/upload', [DocumentController::class, 'upload']);
Route::put('documents/{id}/approve', [DocumentController::class, 'approve']);
Route::put('documents/{id}/reject', [DocumentController::class, 'reject']);
Route::apiResource('documents', DocumentController::class);

// Rotas para visitas
Route::put('visits/{id}/complete', [VisitController::class, 'complete']);
Route::put('visits/{id}/cancel', [VisitController::class, 'cancel']);
Route::apiResource('visits', VisitController::class);

// Rotas para contratos
Route::get('contracts/{id}/generate-pdf', [ContractController::class, 'generatePdf']);
Route::apiResource('contracts', ContractController::class);

// Rotas para transações
Route::middleware(['auth:api'])->group(function () {
    Route::get('transaction-categories', [TransactionController::class, 'getCategories']);
    Route::post('transaction-categories', [TransactionController::class, 'createCategory']);
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store']);
    Route::get('transactions/{id}', [TransactionController::class, 'show']);
    Route::put('transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('transactions/{id}', [TransactionController::class, 'destroy']);
    Route::put('transactions/{id}/pay', [TransactionController::class, 'markAsPaid']);
});

// Rotas para relatórios (apenas para administradores)
Route::group(['prefix' => 'reports', 'middleware' => ['auth:api', 'role:admin']], function () {
    Route::get('financial', [ReportController::class, 'financial']);
    Route::get('properties', [ReportController::class, 'properties']);
    Route::get('commissions', [ReportController::class, 'commissions']);
    Route::get('visits', [ReportController::class, 'visits']);
    Route::get('contracts', [ReportController::class, 'contracts']);
    Route::get('sales', [ReportController::class, 'sales']);
    Route::get('rentals', [ReportController::class, 'rentals']);
    Route::get('accounts-payable', [ReportController::class, 'accountsPayable']);
    Route::get('accounts-receivable', [ReportController::class, 'accountsReceivable']);
});

// Rotas para permissões
Route::apiResource('permissions', PermissionController::class, ['only' => ['index', 'show']]);

// System Settings Routes
Route::get('/settings', [SystemSettingController::class, 'index']);
Route::get('/settings/check-migration', [SystemSettingController::class, 'checkMigration']);
Route::post('/settings/run-migration', [SystemSettingController::class, 'runMigration']);

// Rotas de configurações protegidas
Route::middleware('auth:api')->group(function () {
    Route::post('/settings', [SystemSettingController::class, 'update']);
    Route::post('/settings/test-smtp', [SystemSettingController::class, 'testSmtp']);
});

// Rotas financeiras
Route::prefix('financial')->group(function () {
    Route::get('transactions', [FinancialController::class, 'index']);
    Route::get('transactions/summary', [FinancialController::class, 'summary']);
    Route::post('transactions', [FinancialController::class, 'store']);
    Route::put('transactions/{transaction}', [FinancialController::class, 'update']);
    Route::post('transactions/{transaction}/mark-as-paid', [FinancialController::class, 'markAsPaid']);
    Route::post('transactions/{transaction}/cancel', [FinancialController::class, 'cancel']);
    
    // Relatórios específicos
    Route::get('commissions', [FinancialController::class, 'commissions']);
    Route::get('rentals', [FinancialController::class, 'rentals']);
    Route::get('sales', [FinancialController::class, 'sales']);
    Route::get('cash-flow', [FinancialController::class, 'cashFlow']);
    Route::get('bank-statement', [FinancialController::class, 'bankStatement']);
});

// End of API routes 