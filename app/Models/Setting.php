<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'key_name',
        'key_value',
        'group_name',
    ];

    public static function get($key, $default = null)
    {
        $setting = static::where('key_name', $key)->first();
        return $setting ? $setting->key_value : $default;
    }

    public static function set($key, $value, $group = 'general')
    {
        return static::updateOrCreate(
            ['key_name' => $key],
            ['key_value' => $value, 'group_name' => $group]
        );
    }
}
