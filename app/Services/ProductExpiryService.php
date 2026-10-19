<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

class ProductExpiryService
{
    public function settings(): array
    {
        $storedSettings = Setting::query()
            ->whereIn('key_name', [
                'expiry_alerts_enabled',
                'expiry_warning_days',
                'expiry_urgent_days',
                'expiry_alerts_expired',
                'expiry_alerts_bell',
                'expiry_alerts_dashboard',
            ])
            ->pluck('key_value', 'key_name');
        $read = fn (string $key, string $default): string => (string) ($storedSettings[$key] ?? $default);

        $warningDays = (int) $read('expiry_warning_days', '7');
        if (! in_array($warningDays, [3, 7, 15, 30], true)) {
            $warningDays = 7;
        }

        $urgentDays = (int) $read('expiry_urgent_days', '3');
        if (! in_array($urgentDays, [1, 3, 7, 15, 30], true)) {
            $urgentDays = 3;
        }

        return [
            'enabled' => filter_var($read('expiry_alerts_enabled', '1'), FILTER_VALIDATE_BOOLEAN),
            'warning_days' => $warningDays,
            'urgent_days' => min($urgentDays, $warningDays),
            'include_expired' => filter_var($read('expiry_alerts_expired', '1'), FILTER_VALIDATE_BOOLEAN),
            'show_bell' => filter_var($read('expiry_alerts_bell', '1'), FILTER_VALIDATE_BOOLEAN),
            'show_dashboard' => filter_var($read('expiry_alerts_dashboard', '1'), FILTER_VALIDATE_BOOLEAN),
        ];
    }

    public function classify(?CarbonInterface $expiryDate, ?CarbonInterface $today = null): string
    {
        if ($expiryDate === null) {
            return 'no_expiry';
        }

        $today = ($today ?? Carbon::today())->copy()->startOfDay();
        $expiryDate = $expiryDate->copy()->startOfDay();
        $daysRemaining = (int) $today->diffInDays($expiryDate, false);

        if ($daysRemaining < 0) {
            return 'expired';
        }
        if ($daysRemaining === 0) {
            return 'today';
        }

        return $daysRemaining <= $this->settings()['warning_days'] ? 'soon' : 'safe';
    }

    public function applyFilter(Builder $query, string $filter): Builder
    {
        $today = Carbon::today()->toDateString();

        return match ($filter) {
            'expired' => $query->whereNotNull('expiry_date')->where('expiry_date', '<', $today),
            'today' => $query->where('expiry_date', '>=', $today)
                ->where('expiry_date', '<', Carbon::today()->addDay()->toDateString()),
            'urgent' => $query->whereNotNull('expiry_date')
                ->where('expiry_date', '<', Carbon::today()->addDays($this->settings()['urgent_days'] + 1)->toDateString()),
            'no_expiry' => $query->whereNull('expiry_date'),
            'within_3', 'within_7', 'within_15', 'within_30' => $query
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '>=', $today)
                ->where('expiry_date', '<', Carbon::today()->addDays((int) substr($filter, 7) + 1)->toDateString()),
            default => $query,
        };
    }

    public function summary(?array $settings = null): array
    {
        $today = Carbon::today()->toDateString();
        $settings ??= $this->settings();
        $active = fn () => Product::query()->active()->whereNotNull('expiry_date');

        return [
            'expired_products' => (clone $active())->where('expiry_date', '<', $today)->count(),
            'expiring_within_period' => (clone $active())
                ->where('expiry_date', '>=', $today)
                ->where('expiry_date', '<', Carbon::today()->addDays($settings['warning_days'] + 1)->toDateString())
                ->count(),
            'expired_stock_quantity' => (float) (clone $active())
                ->where('expiry_date', '<', $today)
                ->sum('quantity'),
            'urgent_expiry_products' => (clone $active())
                ->where('expiry_date', '<', Carbon::today()->addDays($settings['urgent_days'] + 1)->toDateString())
                ->count(),
        ];
    }

    public function notifications(?array $settings = null): array
    {
        $settings ??= $this->settings();
        if (! $settings['enabled']) {
            return [];
        }

        $today = Carbon::today();
        $query = Product::query()
            ->active()
            ->where('quantity', '>', 0)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', $today->copy()->addDays($settings['warning_days'] + 1)->toDateString());

        if (! $settings['include_expired']) {
            $query->where('expiry_date', '>=', $today->toDateString());
        }

        return $query
            ->orderBy('expiry_date')
            ->orderBy('id')
            ->limit(100)
            ->get(['id', 'name_ku', 'barcode', 'quantity', 'expiry_date'])
            ->map(function (Product $product) use ($settings, $today): array {
                $daysRemaining = (int) $today->diffInDays($product->expiry_date, false);
                $type = $daysRemaining < 0 ? 'expired' : ($daysRemaining === 0 ? 'today' : 'soon');

                return [
                    'id' => $product->id,
                    'name_ku' => $product->name_ku,
                    'barcode' => $product->barcode,
                    'quantity' => (float) $product->quantity,
                    'expiry_date' => $product->expiry_date->toDateString(),
                    'days_remaining' => $daysRemaining,
                    'alert_type' => $type,
                    'severity' => $type === 'expired' ? 'critical' : (($type === 'today' || $daysRemaining <= $settings['urgent_days']) ? 'high' : 'warning'),
                    'urgent' => $daysRemaining <= $settings['urgent_days'],
                    'filter_status' => $type === 'soon' ? 'within_'.$settings['warning_days'] : $type,
                ];
            })
            ->all();
    }
}
