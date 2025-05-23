<?php

declare(strict_types=1);

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Role extends SpatieRole
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_active',
        'guard_name',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Boot function from Laravel.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!isset($model->guard_name)) {
                $model->guard_name = 'web';
            }
            if (!isset($model->is_active)) {
                $model->is_active = true;
            }
        });

        // Add global scope to only get roles with guard_name = 'web'
        static::addGlobalScope('web_guard', function (Builder $builder) {
            $builder->where('guard_name', 'web');
        });
    }

    /**
     * Override the newQuery method to include soft deleted records in some cases
     */
    public function newQuery()
    {
        // Get the parent query builder instance
        $query = parent::newQuery();

        // If we're checking for uniqueness (like in validation), include soft deleted records
        if (request()->is('*roles*') && request()->isMethod('post')) {
            return $query->withTrashed();
        }

        return $query;
    }

    /**
     * Scope a query to only include active roles.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
} 