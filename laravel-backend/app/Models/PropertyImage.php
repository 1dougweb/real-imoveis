<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\URL;

class PropertyImage extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'property_id',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'order',
        'is_featured',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'file_size' => 'integer',
        'order' => 'integer',
        'is_featured' => 'boolean',
    ];

    /**
     * Obter o imóvel associado a esta imagem.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Obter o URL da imagem.
     */
    public function getUrl(): string
    {
        if (empty($this->file_path)) {
            return '';
        }
        
        // Ensure path has correct directory separators
        $path = str_replace('\\', '/', $this->file_path);
        
        // Check if path already starts with storage/
        if (strpos($path, 'storage/') === 0) {
            $path = substr($path, 8); // Remove 'storage/' prefix
        }
        
        // Create a full URL to the storage path
        $url = url('/storage/' . $path);
        
        // Log for debugging
        \Log::debug("Generated URL for image {$this->id}", [
            'file_path' => $this->file_path,
            'url' => $url
        ]);
        
        return $url;
    }

    /**
     * Obter o URL da miniatura da imagem.
     */
    public function getThumbnailUrl(): string
    {
        if (empty($this->file_path)) {
            return '';
        }
        
        // Ensure path has correct directory separators
        $path = str_replace('\\', '/', $this->file_path);
        
        $pathInfo = pathinfo($path);
        $thumbnailPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
        
        // Check if path already starts with storage/
        if (strpos($thumbnailPath, 'storage/') === 0) {
            $thumbnailPath = substr($thumbnailPath, 8); // Remove 'storage/' prefix
        }
        
        // Create a full URL to the storage path
        $url = url('/storage/' . $thumbnailPath);
        
        // Log for debugging
        \Log::debug("Generated thumbnail URL for image {$this->id}", [
            'file_path' => $this->file_path,
            'thumbnail_path' => $thumbnailPath,
            'url' => $url
        ]);
        
        return $url;
    }
} 