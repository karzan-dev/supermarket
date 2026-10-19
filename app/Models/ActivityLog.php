<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'entity',
        'entity_id',
        'ip_address',
        'description',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function log($action, $entity, $entityId, $description, $userId = null)
    {
        return static::create([
            'user_id' => $userId ?? auth()->id() ?? 1,
            'action' => $action,
            'entity' => $entity,
            'entity_id' => $entityId,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'description' => $description,
            'created_at' => now(),
        ]);
    }
}
