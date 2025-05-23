<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'document_type_id',
        'documentable_id',
        'documentable_type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'status',
        'expires_at',
        'is_visible_to_client',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
        'expires_at' => 'datetime',
        'is_visible_to_client' => 'boolean',
    ];

    /**
     * Status disponíveis para documentos.
     */
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_EXPIRED = 'expired';

    /**
     * Obter o tipo de documento associado a este documento.
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Obter a entidade documentável (polimórfica).
     */
    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Obter o URL do documento.
     */
    public function getUrl(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Verifica se o documento está pendente.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verifica se o documento foi aprovado.
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Verifica se o documento foi rejeitado.
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Verifica se o documento está expirado.
     */
    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || 
               ($this->expires_at && $this->expires_at->isPast());
    }
} 