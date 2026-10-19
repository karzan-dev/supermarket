<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('key_value', 'key_name')->toArray();
        unset($settings['tax_percentage']);

        return response()->json(['success' => true, 'data' => $settings]);
    }

    public function update(Request $request)
    {
        abort_unless($request->user()?->hasPermission('settings.manage'), 403, 'You are not authorized to manage settings.');

        $request->validate([
            'expiry_alerts_enabled' => 'required|boolean',
            'expiry_warning_days' => 'required|integer|in:3,7,15,30',
            'expiry_urgent_days' => 'required|integer|in:1,3,7,15,30',
            'expiry_alerts_expired' => 'required|boolean',
            'expiry_alerts_bell' => 'required|boolean',
            'expiry_alerts_dashboard' => 'required|boolean',
        ]);
        $data = $request->except(['_token', '_method']);

        if ((int) $data['expiry_urgent_days'] > (int) $data['expiry_warning_days']) {
            return response()->json([
                'success' => false,
                'message' => 'Urgent warning period cannot exceed the general warning period.',
                'errors' => ['expiry_urgent_days' => ['Urgent warning period cannot exceed the general warning period.']],
            ], 422);
        }

        $allowedSettings = [
            'store_name', 'store_name_en', 'store_name_ar', 'store_phone', 'store_address',
            'currency', 'invoice_prefix', 'receipt_footer', 'default_language',
            'allow_negative_stock', 'low_stock_threshold', 'expiry_alerts_enabled',
            'expiry_warning_days', 'expiry_urgent_days', 'expiry_alerts_expired',
            'expiry_alerts_bell', 'expiry_alerts_dashboard',
        ];

        foreach ($data as $key => $value) {
            if (! in_array($key, $allowedSettings, true)) {
                continue;
            }
            Setting::updateOrCreate(
                ['key_name' => $key],
                [
                    'key_value' => (string) $value,
                    'group_name' => str_starts_with($key, 'expiry_') ? 'expiry' : 'general',
                ]
            );
        }

        ActivityLog::log('UPDATE', 'SETTING', 0, 'نوێکردنەوەی رێکخستنەکانی سیستەم');

        $updated = Setting::all()->pluck('key_value', 'key_name')->toArray();
        unset($updated['tax_percentage']);

        return response()->json(['success' => true, 'message' => 'Settings saved successfully', 'data' => $updated]);
    }
}
