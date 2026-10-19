<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PDO;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    private const TABLES = [
        'roles',
        'permissions',
        'role_permissions',
        'users',
        'user_permissions',
        'categories',
        'units',
        'products',
        'customers',
        'suppliers',
        'sales',
        'sale_items',
        'purchases',
        'purchase_items',
        'payments',
        'expense_categories',
        'expenses',
        'stock_movements',
        'returns',
        'return_items',
        'settings',
        'activity_logs',
        'cash_register_accounts',
        'cash_register_shifts',
        'cash_register_transactions',
    ];

    public function download(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);

        return response()->streamDownload(function (): void {
            $connection = DB::connection();
            $pdo = $connection->getPdo();

            echo "-- Supermarket data backup\n";
            echo '-- Generated at '.now()->toIso8601String()."\n";
            echo "-- Import into an empty database after running the application's migrations.\n\n";
            echo "SET NAMES utf8mb4;\n";
            echo "SET FOREIGN_KEY_CHECKS=0;\n";
            echo "START TRANSACTION;\n\n";

            foreach (self::TABLES as $table) {
                foreach ($connection->table($table)->cursor() as $row) {
                    $record = (array) $row;
                    if ($table === 'users') {
                        unset($record['remember_token']);
                    }

                    if ($record === []) {
                        continue;
                    }

                    $columns = array_keys($record);
                    $values = array_map(static function (mixed $value) use ($pdo): string {
                        if ($value === null) {
                            return 'NULL';
                        }

                        $quoted = $pdo->quote((string) $value, PDO::PARAM_STR);
                        if ($quoted === false) {
                            throw new \RuntimeException('Could not quote a database value for the SQL backup.');
                        }

                        return $quoted;
                    }, array_values($record));

                    echo 'INSERT INTO `'.$table.'` (`'.implode('`, `', $columns).'`) VALUES (';
                    echo implode(', ', $values).");\n";
                }

                echo "\n";
            }

            echo "COMMIT;\n";
            echo "SET FOREIGN_KEY_CHECKS=1;\n";
        }, 'supermarket-backup-'.now()->format('Y-m-d-His').'.sql', [
            'Content-Type' => 'application/sql; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }
}
