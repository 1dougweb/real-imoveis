<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Person;
use App\Models\Contract;
use App\Models\Property;
use App\Models\BankAccount;
use App\Models\PaymentType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FinancialTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Transaction $transaction;

    public function setUp(): void
    {
        parent::setUp();

        // Criar um usuário com permissões
        $this->user = User::factory()->create();
        $this->user->givePermissionTo('manage_financial');

        // Criar uma transação para testes
        $this->transaction = Transaction::factory()->create();
    }

    /** @test */
    public function it_can_list_transactions()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/transactions');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'description',
                        'amount',
                        'due_date',
                        'payment_date',
                        'status',
                        'category',
                    ],
                ],
                'meta',
                'links',
            ]);
    }

    /** @test */
    public function it_can_filter_transactions()
    {
        // Criar algumas transações com diferentes tipos e status
        Transaction::factory()->receivable()->create();
        Transaction::factory()->payable()->create();
        Transaction::factory()->paid()->create();
        Transaction::factory()->pending()->create();

        // Testar filtro por tipo
        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/transactions?type=receivable');

        $response->assertOk()
            ->assertJsonCount(1, 'data');

        // Testar filtro por status
        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/transactions?status=paid');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    /** @test */
    public function it_can_get_financial_summary()
    {
        // Criar algumas transações para testar o resumo
        Transaction::factory()->count(3)->receivable()->create();
        Transaction::factory()->count(2)->payable()->create();
        Transaction::factory()->count(2)->paid()->create();
        Transaction::factory()->count(1)->pending()->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/transactions/summary');

        $response->assertOk()
            ->assertJsonStructure([
                'total',
                'count',
                'pending_amount',
                'paid_amount',
                'receivables' => ['total', 'pending'],
                'payables' => ['total', 'pending'],
            ]);
    }

    /** @test */
    public function it_can_create_transaction()
    {
        $data = [
            'type' => 'receivable',
            'description' => 'Test transaction',
            'amount' => 1000.00,
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'status' => 'pending',
            'category' => 'rent',
            'person_id' => Person::factory()->create()->id,
            'contract_id' => Contract::factory()->create()->id,
            'bank_account_id' => BankAccount::factory()->create()->id,
            'property_id' => Property::factory()->create()->id,
            'notes' => 'Test notes',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', $data);

        $response->assertCreated()
            ->assertJsonFragment($data);
    }

    /** @test */
    public function it_can_update_transaction()
    {
        $data = [
            'description' => 'Updated description',
            'amount' => 2000.00,
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/financial/transactions/{$this->transaction->id}", $data);

        $response->assertOk()
            ->assertJsonFragment($data);
    }

    /** @test */
    public function it_can_mark_transaction_as_paid()
    {
        Storage::fake('public');

        $data = [
            'payment_date' => now()->format('Y-m-d'),
            'notes' => 'Payment received',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/financial/transactions/{$this->transaction->id}/mark-as-paid", $data);

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'paid',
                'payment_date' => $data['payment_date'],
                'notes' => $data['notes'],
            ]);

        $this->assertNotNull($response->json('receipt_url'));
        Storage::disk('public')->assertExists($response->json('receipt_url'));
    }

    /** @test */
    public function it_can_cancel_transaction()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/financial/transactions/{$this->transaction->id}/cancel", [
                'notes' => 'Cancelled due to error',
            ]);

        $response->assertOk()
            ->assertJsonFragment([
                'status' => 'cancelled',
                'notes' => 'Cancelled due to error',
            ]);
    }

    /** @test */
    public function it_can_get_commissions()
    {
        Transaction::factory()->count(3)->commission()->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/commissions');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'description',
                        'amount',
                        'category',
                        'contract_id',
                        'person_id',
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_get_rentals()
    {
        Transaction::factory()->count(3)->rent()->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/rentals');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'description',
                        'amount',
                        'category',
                        'contract_id',
                        'property_id',
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_get_sales()
    {
        Transaction::factory()->count(3)->sale()->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/sales');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'type',
                        'description',
                        'amount',
                        'category',
                        'contract_id',
                        'property_id',
                    ],
                ],
            ]);
    }

    /** @test */
    public function it_can_get_cash_flow()
    {
        // Criar transações para diferentes datas
        Transaction::factory()->count(5)->thisMonth()->create();
        Transaction::factory()->count(3)->nextMonth()->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/financial/cash-flow?' . http_build_query([
                'start_date' => now()->startOfMonth()->format('Y-m-d'),
                'end_date' => now()->endOfMonth()->format('Y-m-d'),
            ]));

        $response->assertOk()
            ->assertJsonStructure([
                '*' => [
                    'date',
                    'income',
                    'expense',
                    'balance',
                ],
            ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_transaction()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'type',
                'description',
                'amount',
                'due_date',
                'status',
                'category',
            ]);
    }

    /** @test */
    public function it_validates_transaction_type()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', [
                'type' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    /** @test */
    public function it_validates_transaction_status()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', [
                'status' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    /** @test */
    public function it_validates_transaction_category()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', [
                'category' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['category']);
    }

    /** @test */
    public function it_requires_property_for_rent_and_sale_transactions()
    {
        $data = [
            'type' => 'receivable',
            'description' => 'Test transaction',
            'amount' => 1000.00,
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'status' => 'pending',
            'category' => 'rent',
            'person_id' => Person::factory()->create()->id,
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'property_id',
                'contract_id',
            ]);
    }

    /** @test */
    public function it_requires_person_for_commission_transactions()
    {
        $data = [
            'type' => 'receivable',
            'description' => 'Test commission',
            'amount' => 1000.00,
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'status' => 'pending',
            'category' => 'commission',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/financial/transactions', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'person_id',
                'contract_id',
            ]);
    }

    /** @test */
    public function unauthorized_user_cannot_access_financial_data()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/financial/transactions');

        $response->assertForbidden();
    }
} 