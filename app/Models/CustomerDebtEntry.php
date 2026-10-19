<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerDebtEntry extends Model
{
    protected $fillable = [
        'customer_id',
        'user_id',
        'amount',
        'debt_date',
        'due_date',
        'notes',
        'idempotency_key',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'debt_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
