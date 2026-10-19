<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashRegisterAccount;
use App\Models\CashRegisterShift;
use App\Models\CashRegisterTransaction;
use App\Models\User;
use App\Services\CashRegisterLedger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CashRegisterController extends Controller
{
    public function dashboard()
    {
        $account = CashRegisterAccount::query()->findOrFail(1);
        $totals = CashRegisterTransaction::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'CASH_IN' THEN amount ELSE 0 END), 0) as cash_in")
            ->selectRaw("COALESCE(SUM(CASE WHEN type IN ('CASH_OUT', 'EXPENSE', 'SUPPLIER_PAYMENT') THEN amount ELSE 0 END), 0) as cash_out")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'SALE' THEN amount ELSE 0 END), 0) as cash_sales")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'RETURN' THEN amount ELSE 0 END), 0) as cash_returns")
            ->selectRaw("COALESCE(SUM(CASE WHEN type IN ('ADJUSTMENT', 'SHIFT_ADJUSTMENT') THEN amount ELSE 0 END), 0) as adjustments")
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $account->balance,
                'cash_in' => $totals->cash_in,
                'cash_out' => $totals->cash_out,
                'cash_sales' => $totals->cash_sales,
                'cash_returns' => $totals->cash_returns,
                'adjustments' => $totals->adjustments,
                'active_shift' => CashRegisterShift::query()->with('opener:id,name')->whereNotNull('active_slot')->first(),
                'recent_transactions' => $this->transactionQuery(request())->limit(10)->get(),
            ],
        ]);
    }

    public function transactions(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'type' => 'nullable|in:CASH_IN,CASH_OUT,SALE,RETURN,CUSTOMER_PAYMENT,SUPPLIER_PAYMENT,EXPENSE,ADJUSTMENT,SHIFT_ADJUSTMENT',
            'user_id' => 'nullable|integer|exists:users,id',
            'search' => 'nullable|string|max:100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $transactions = $this->transactionQuery($request)
            ->paginate((int) $request->input('per_page', 25))
            ->withQueryString();

        return response()->json(['success' => true, 'data' => $transactions]);
    }

    public function users()
    {
        return response()->json([
            'success' => true,
            'data' => User::query()->where('status', 'ACTIVE')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'type' => 'nullable|in:CASH_IN,CASH_OUT,SALE,RETURN,CUSTOMER_PAYMENT,SUPPLIER_PAYMENT,EXPENSE,ADJUSTMENT,SHIFT_ADJUSTMENT',
            'user_id' => 'nullable|integer|exists:users,id',
            'search' => 'nullable|string|max:100',
        ]);

        return response()->streamDownload(function () use ($request): void {
            $stream = fopen('php://output', 'w');
            if ($stream === false) {
                throw new \RuntimeException('Unable to create cash-register export stream.');
            }

            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, [
                'transaction_number', 'type', 'direction', 'amount', 'balance_before',
                'balance_after', 'reason', 'user', 'created_at', 'status',
            ]);
            $this->transactionQuery($request)->orderByDesc('id')->chunk(500, function ($transactions) use ($stream): void {
                foreach ($transactions as $transaction) {
                    fputcsv($stream, [
                        $transaction->transaction_number,
                        $transaction->type,
                        $transaction->direction,
                        $transaction->amount,
                        $transaction->balance_before,
                        $transaction->balance_after,
                        $transaction->reason,
                        $transaction->user?->name,
                        $transaction->created_at?->toIso8601String(),
                        'COMPLETED',
                    ]);
                }
            });
            fclose($stream);
        }, 'cash-register-transactions.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request, CashRegisterLedger $ledger)
    {
        $data = $request->validate([
            'type' => 'required|in:CASH_IN,CASH_OUT',
            'amount' => 'required|numeric|gt:0|max:999999999999.99|decimal:0,2',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:5000',
            'idempotency_key' => 'required|uuid|max:64',
        ]);

        $transaction = DB::transaction(fn () => $ledger->record(
            $data['type'],
            $data['type'] === 'CASH_IN' ? 'IN' : 'OUT',
            (string) $data['amount'],
            (int) $request->user()->id,
            $data['reason'],
            $data['notes'] ?? null,
            idempotencyKey: $data['idempotency_key'],
        ));

        return response()->json(['success' => true, 'data' => $transaction], 201);
    }

    public function openShift(Request $request, CashRegisterLedger $ledger)
    {
        $data = $request->validate([
            'opening_balance' => 'required|numeric|min:0|max:999999999999.99|decimal:0,2',
            'notes' => 'nullable|string|max:5000',
        ]);
        $userId = (int) $request->user()->id;

        $shift = DB::transaction(function () use ($data, $ledger, $userId) {
            $account = CashRegisterAccount::query()->lockForUpdate()->findOrFail(1);
            if (CashRegisterShift::query()->whereNotNull('active_slot')->lockForUpdate()->exists()) {
                throw ValidationException::withMessages(['shift' => 'A cash-register shift is already open.']);
            }

            $hasHistory = CashRegisterTransaction::query()->exists();
            $openingCents = $ledger->toCents((string) $data['opening_balance']);
            $currentCents = $ledger->toCents((string) $account->balance);
            if ($hasHistory && $openingCents !== $currentCents) {
                throw ValidationException::withMessages([
                    'opening_balance' => 'The opening count must match the current cash-register balance.',
                ]);
            }

            $shift = CashRegisterShift::create([
                'opened_by' => $userId,
                'active_slot' => 1,
                'opening_balance' => $data['opening_balance'],
                'opening_notes' => $data['notes'] ?? null,
                'opened_at' => now(),
            ]);

            if (! $hasHistory && $openingCents > 0) {
                $ledger->record(
                    'CASH_IN',
                    'IN',
                    (string) $data['opening_balance'],
                    $userId,
                    'Opening cash balance',
                    $data['notes'] ?? null,
                    'SHIFT_OPEN',
                    $shift->id,
                    shiftId: $shift->id,
                );
            }

            return $shift->load('opener:id,name');
        });

        return response()->json(['success' => true, 'data' => $shift], 201);
    }

    public function closeShift(Request $request, CashRegisterLedger $ledger)
    {
        $data = $request->validate([
            'counted_balance' => 'required|numeric|min:0|max:999999999999.99|decimal:0,2',
            'notes' => 'nullable|string|max:5000',
        ]);
        $user = $request->user();

        $shift = DB::transaction(function () use ($data, $ledger, $user) {
            $account = CashRegisterAccount::query()->lockForUpdate()->findOrFail(1);
            $shift = CashRegisterShift::query()->whereNotNull('active_slot')->lockForUpdate()->first();
            if (! $shift) {
                throw ValidationException::withMessages(['shift' => 'There is no open cash-register shift to close.']);
            }
            if ($shift->opened_by !== $user->id && ! $user->hasPermission('cash.manage')) {
                abort(403, 'Only the shift opener or a user with cash-management permission may close this shift.');
            }

            $expectedCents = $ledger->toCents((string) $account->balance);
            $countedCents = $ledger->toCents((string) $data['counted_balance']);
            $varianceCents = $countedCents - $expectedCents;

            $shift->update([
                'closed_by' => $user->id,
                'expected_balance' => (string) $account->balance,
                'counted_balance' => $data['counted_balance'],
                'variance' => number_format($varianceCents / 100, 2, '.', ''),
                'closing_notes' => $data['notes'] ?? null,
            ]);

            if ($varianceCents !== 0) {
                $ledger->record(
                    'SHIFT_ADJUSTMENT',
                    $varianceCents > 0 ? 'IN' : 'OUT',
                    (string) abs($varianceCents / 100),
                    (int) $user->id,
                    'Cash count variance at shift close',
                    $data['notes'] ?? null,
                    'SHIFT_CLOSE',
                    $shift->id,
                    shiftId: $shift->id,
                );
            }

            $shift->update([
                'active_slot' => null,
                'closed_at' => now(),
            ]);

            return $shift->load(['opener:id,name', 'closer:id,name']);
        });

        return response()->json(['success' => true, 'data' => $shift]);
    }

    private function transactionQuery(Request $request): Builder
    {
        return CashRegisterTransaction::query()
            ->with('user:id,name')
            ->when($request->filled('from'), fn (Builder $query) => $query->whereDate('created_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn (Builder $query) => $query->whereDate('created_at', '<=', $request->input('to')))
            ->when($request->filled('type'), fn (Builder $query) => $query->where('type', $request->input('type')))
            ->when($request->filled('user_id'), fn (Builder $query) => $query->where('user_id', $request->integer('user_id')))
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $term = $request->input('search');
                $query->where(function (Builder $nested) use ($term) {
                    $nested->where('transaction_number', 'like', "%{$term}%")
                        ->orWhere('reason', 'like', "%{$term}%");
                });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }
}
