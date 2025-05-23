<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Person extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * O nome da tabela associada ao modelo.
     *
     * @var string
     */
    protected $table = 'people';

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'document_type',
        'document',
        'email',
        'phone',
        'mobile',
        'birthdate',
        'address',
        'address_number',
        'address_complement',
        'neighborhood_id',
        'city_id',
        'state',
        'zip_code',
        'notes',
        'created_by'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'birthdate' => 'date',
    ];

    /**
     * Obtém o bairro associado à pessoa.
     */
    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    /**
     * Obtém a cidade associada à pessoa.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Obtém os imóveis em que a pessoa é proprietária.
     */
    public function ownedProperties(): HasMany
    {
        return $this->hasMany(Property::class, 'owner_id');
    }

    /**
     * Obtém os imóveis em que a pessoa é corretora.
     */
    public function managedProperties(): HasMany
    {
        return $this->hasMany(Property::class, 'agent_id');
    }

    /**
     * Obtém as visitas agendadas para esta pessoa como cliente.
     */
    public function clientVisits(): HasMany
    {
        return $this->hasMany(Visit::class, 'client_id');
    }

    /**
     * Obtém as visitas que esta pessoa conduziu como corretor.
     */
    public function agentVisits(): HasMany
    {
        return $this->hasMany(Visit::class, 'agent_id');
    }

    /**
     * Obtém os contratos em que a pessoa é proprietária/vendedora.
     */
    public function ownerContracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'owner_id');
    }

    /**
     * Obtém os contratos em que a pessoa é cliente/compradora/locatária.
     */
    public function clientContracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'client_id');
    }

    /**
     * Obtém as transações financeiras associadas a esta pessoa.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'person_id');
    }

    /**
     * Obtém o usuário que criou esta pessoa.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
