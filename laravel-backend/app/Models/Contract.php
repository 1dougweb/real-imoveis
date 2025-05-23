<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Contract extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'contract_number',
        'type',
        'property_id',
        'owner_id',
        'client_id',
        'agent_id',
        'value',
        'commission_rate',
        'commission_value',
        'start_date',
        'end_date',
        'terms',
        'status',
        'signed_at',
        'payment_method',
        'payment_terms',
        'notes',
        'created_by'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_value' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'signed_at' => 'date'
    ];

    /**
     * Registra as coleções de mídia disponíveis para o contrato.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
             ->useDisk('private');
    }

    /**
     * Obtém o imóvel associado ao contrato.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Obtém o proprietário associado ao contrato.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'owner_id');
    }

    /**
     * Obtém o cliente (comprador/locatário) associado ao contrato.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'client_id');
    }

    /**
     * Obtém o corretor associado ao contrato.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'agent_id');
    }

    /**
     * Obtém as transações financeiras associadas a este contrato.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Obtém o usuário que criou este contrato.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
