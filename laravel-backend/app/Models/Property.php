<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Property extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'title',
        'slug',
        'description',
        'property_type_id',
        'purpose',
        'sale_price',
        'rent_price',
        'condominium_fee',
        'iptu',
        'address',
        'address_number',
        'address_complement',
        'neighborhood_id',
        'city_id',
        'state',
        'zip_code',
        'latitude',
        'longitude',
        'bedrooms',
        'bathrooms',
        'suites',
        'parking_spaces',
        'area',
        'total_area',
        'floor',
        'furnished',
        'facing',
        'owner_id',
        'agent_id',
        'status',
        'available_from',
        'available_until',
        'featured',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'views',
        'favorites',
        'active',
        'created_by'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sale_price' => 'decimal:2',
        'rent_price' => 'decimal:2',
        'condominium_fee' => 'decimal:2',
        'iptu' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'area' => 'decimal:2',
        'total_area' => 'decimal:2',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'suites' => 'integer',
        'parking_spaces' => 'integer',
        'floor' => 'integer',
        'furnished' => 'boolean',
        'featured' => 'boolean',
        'active' => 'boolean',
        'views' => 'integer',
        'favorites' => 'integer',
        'available_from' => 'date',
        'available_until' => 'date',
    ];

    /**
     * Registra as coleções de mídia disponíveis para o imóvel.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')
             ->useDisk('public');
        
        $this->addMediaCollection('documents')
             ->useDisk('private');
    }

    /**
     * Obtém o tipo de imóvel.
     */
    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    /**
     * Obtém o bairro do imóvel.
     */
    public function neighborhood(): BelongsTo
    {
        return $this->belongsTo(Neighborhood::class);
    }

    /**
     * Obtém a cidade do imóvel.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Obtém o proprietário do imóvel.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'owner_id');
    }

    /**
     * Obtém o corretor responsável pelo imóvel.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Person::class, 'agent_id');
    }

    /**
     * Obtém as características do imóvel.
     */
    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'property_feature')
                    ->withTimestamps();
    }

    /**
     * Obtém as imagens associadas a este imóvel.
     */
    public function propertyImages(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    /**
     * Obtém a imagem de capa do imóvel.
     */
    public function featuredImage()
    {
        return $this->hasMany(PropertyImage::class)->where('is_featured', true)->first();
    }

    /**
     * Obtém as visitas associadas a este imóvel.
     */
    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    /**
     * Obtém os contratos associados a este imóvel.
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    /**
     * Obtém as transações financeiras associadas a este imóvel.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Obtém o usuário que criou este imóvel.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
