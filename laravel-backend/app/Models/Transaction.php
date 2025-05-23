<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Transaction extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array
     */
    protected $fillable = [
        'type',
        'description',
        'amount',
        'due_date',
        'payment_date',
        'status',
        'category',
        'person_id',
        'contract_id',
        'bank_account_id',
        'payment_type_id',
        'property_id',
        'notes',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
    ];

    protected $appends = [
        'receipt_url',
    ];

    /**
     * Constantes para os tipos de transação.
     */
    public const TYPE_RECEIVABLE = 'receivable';
    public const TYPE_PAYABLE = 'payable';

    /**
     * Constantes para os status de transação.
     */
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Inicialização do modelo.
     */
    protected static function boot()
    {
        parent::boot();

        // Registra coleções de mídia ao inicializar o modelo
        static::created(function (Transaction $transaction) {
            $transaction->registerMediaCollections();
        });
    }

    /**
     * Registra as coleções de mídia para o modelo.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('receipts')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'application/pdf']);
    }

    /**
     * Relacionamento com a pessoa (cliente, proprietário, etc.).
     *
     * @return BelongsTo
     */
    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    /**
     * Relacionamento com o contrato.
     *
     * @return BelongsTo
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    /**
     * Relacionamento com a conta bancária.
     *
     * @return BelongsTo
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    /**
     * Relacionamento com o tipo de pagamento.
     *
     * @return BelongsTo
     */
    public function paymentType(): BelongsTo
    {
        return $this->belongsTo(PaymentType::class);
    }

    /**
     * Relacionamento com a propriedade.
     *
     * @return BelongsTo
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Verifica se a transação está pendente.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verifica se a transação está paga.
     *
     * @return bool
     */
    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /**
     * Verifica se a transação está cancelada.
     *
     * @return bool
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Verifica se a transação é do tipo a receber.
     *
     * @return bool
     */
    public function isReceivable(): bool
    {
        return $this->type === self::TYPE_RECEIVABLE;
    }

    /**
     * Verifica se a transação é do tipo a pagar.
     *
     * @return bool
     */
    public function isPayable(): bool
    {
        return $this->type === self::TYPE_PAYABLE;
    }

    /**
     * Escopo para filtrar transações a receber.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeReceivables($query)
    {
        return $query->where('type', self::TYPE_RECEIVABLE);
    }

    /**
     * Escopo para filtrar transações a pagar.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePayables($query)
    {
        return $query->where('type', self::TYPE_PAYABLE);
    }

    /**
     * Escopo para filtrar transações pendentes.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Escopo para filtrar transações pagas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePaid($query)
    {
        return $query->where('status', self::STATUS_PAID);
    }

    /**
     * Escopo para filtrar transações canceladas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    /**
     * Escopo para filtrar transações vencidas.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('due_date', '<', now());
    }

    /**
     * Escopo para filtrar transações a vencer.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Número de dias para considerar
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDueInDays($query, int $days = 7)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->whereBetween('due_date', [now()->format('Y-m-d'), now()->addDays($days)->format('Y-m-d')]);
    }

    /**
     * Escopo para filtrar transações vencidas no mês atual.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDueThisMonth($query)
    {
        return $query->where('due_date', '>=', now()->startOfMonth())
            ->where('due_date', '<=', now()->endOfMonth());
    }

    /**
     * Escopo para filtrar transações vencidas no mês seguinte.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDueNextMonth($query)
    {
        return $query->where('due_date', '>=', now()->addMonth()->startOfMonth())
            ->where('due_date', '<=', now()->addMonth()->endOfMonth());
    }

    /**
     * Escopo para filtrar transações por categoria.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $category Categoria da transação
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Escopo para filtrar transações por pessoa.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $personId ID da pessoa associada à transação
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByPerson($query, int $personId)
    {
        return $query->where('person_id', $personId);
    }

    /**
     * Escopo para filtrar transações por contrato.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $contractId ID do contrato associada à transação
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByContract($query, int $contractId)
    {
        return $query->where('contract_id', $contractId);
    }

    /**
     * Escopo para filtrar transações por propriedade.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $propertyId ID da propriedade associada à transação
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByProperty($query, int $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    /**
     * Escopo para filtrar transações por data.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $startDate Data de início
     * @param string $endDate Data de término
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('due_date', [$startDate, $endDate]);
    }

    /**
     * Escopo para filtrar transações por descrição ou pessoa associada.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search Termo de busca
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('description', 'like', "%{$search}%")
                ->orWhereHas('person', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        });
    }

    /**
     * Acessador para obter a URL do recibo.
     *
     * @return string|null
     */
    public function getReceiptUrlAttribute()
    {
        $media = $this->getFirstMedia('receipts');
        return $media ? $media->getUrl() : null;
    }
}
