<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name_ku',
        'name_en',
        'name_ar',
        'short_code',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
