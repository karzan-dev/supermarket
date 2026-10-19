<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashRegisterTransaction extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_number',
        'shift_id',
        'type',
        'direction',
        'amount',
        'balance_before',
        'balance_after',
        'reason',
        'notes',
        'source_type',
        'source_id',
        'idempotency_key',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashRegisterShift::class, 'shift_id');
    }
}
