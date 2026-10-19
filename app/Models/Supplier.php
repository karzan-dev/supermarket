<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'phone',
        'address',
        'notes',
        'total_purchases',
        'total_paid',
        'debt',
    ];

    protected $casts = [
        'total_purchases' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'debt' => 'decimal:2',
    ];

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
