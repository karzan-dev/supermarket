<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'password',
        'role_id',
        'permissions_customized',
        'status',
        'language_pref',
        'phone',
        'email',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'permissions_customized' => 'boolean',
            'last_login' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function customPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'user_permissions');
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $permissions = $this->permissions_customized
            ? $this->customPermissions()
            : $this->role?->permissions();
        if (! $permissions) {
            return false;
        }

        $grantedPermissions = [$permission];
        if (str_ends_with($permission, '.view')) {
            $grantedPermissions[] = str_replace('.view', '.manage', $permission);
        }

        return $permissions->whereIn('name', $grantedPermissions)->exists();
    }

    public function permissions(): array
    {
        if ($this->isAdmin()) {
            return Permission::query()->orderBy('name')->pluck('name')->all();
        }

        if ($this->permissions_customized) {
            if ($this->relationLoaded('customPermissions')) {
                return $this->customPermissions->sortBy('name')->pluck('name')->all();
            }

            return $this->customPermissions()->orderBy('name')->pluck('name')->all();
        }

        if ($this->relationLoaded('role') && $this->role?->relationLoaded('permissions')) {
            return $this->role->permissions->sortBy('name')->pluck('name')->all();
        }

        return $this->role?->permissions()->orderBy('name')->pluck('name')->all() ?? [];
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function isAdmin(): bool
    {
        return $this->role && $this->role->name === 'ADMIN';
    }

    public function isManager(): bool
    {
        return $this->role && in_array($this->role->name, ['ADMIN', 'MANAGER']);
    }

    public function isCashier(): bool
    {
        return $this->role && in_array($this->role->name, ['ADMIN', 'MANAGER', 'CASHIER']);
    }
}
