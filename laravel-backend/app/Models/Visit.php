<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visit extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'property_id',
        'client_id',
        'agent_id',
        'scheduled_at',
        'completed_at',
        'status',
        'notes',
        'feedback',
        'interest_level',
        'created_by'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    /**
     * Obtém o imóvel associado à visita.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Obtém o cliente associado à visita.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'client_id');
    }

    /**
     * Obtém o corretor associado à visita.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'agent_id');
    }

    /**
     * Obtém o usuário que criou esta visita.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
