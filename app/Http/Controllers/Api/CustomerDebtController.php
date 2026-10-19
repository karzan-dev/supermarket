<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\CustomerDebtEntry;
use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerDebtController extends Controller
{
    private const DUE_SOON_DAYS = 3;

    /**
     * Record a debt from the paper notebook. Adds to the customer's debt only:
     * no money moved, so the cash register is not touched.
     */
    public function store(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:999999999999|decimal:0,2',
            'debt_date' => 'required|date|before_or_equal:today',
            'due_date' => 'nullable|date|after_or_equal:debt_date',
            'notes' => 'nullable|string|max:1000',
            'idempotency_key' => 'required|uuid|max:64',
        ]);

        $userId = (int) $request->user()->id;

        [$customer, $entry, $created] = DB::transaction(function () use ($id, $validated, $userId) {
            $customer = Customer::query()->lockForUpdate()->findOrFail($id);

            $existing = CustomerDebtEntry::query()->where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                abort_if($existing->customer_id !== $customer->id || $existing->user_id !== $userId, 409, 'The idempotency key has already been used for a different debt entry.');

                return [$customer, $existing, false];
            }

            $amount = (float) $validated['amount'];
            $entry = CustomerDebtEntry::create([
                'customer_id' => $customer->id,
                'user_id' => $userId,
                'amount' => $amount,
                'debt_date' => $validated['debt_date'],
                'due_date' => $validated['due_date'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'idempotency_key' => $validated['idempotency_key'],
            ]);

            $customer->increment('debt', $amount);
            $customer->increment('total_purchases', $amount);

            ActivityLog::log('CREATE', 'CUSTOMER', $customer->id, "تۆمارکردنی قەرزی دەفتەر بۆ {$customer->name} بە بڕی {$amount}", $userId);

            return [$customer, $entry, true];
        });

        return response()->json([
            'success' => true,
            'message' => 'Notebook debt recorded successfully',
            'data' => ['customer' => $customer->fresh(), 'entry' => $entry],
        ], $created ? 201 : 200);
    }

    /** Remove a notebook entry typed by mistake (only while the customer still owes at least that much). */
    public function destroy(Request $request, $id, $entryId)
    {
        $userId = (int) $request->user()->id;

        $customer = DB::transaction(function () use ($id, $entryId, $userId) {
            $customer = Customer::query()->lockForUpdate()->findOrFail($id);
            $entry = CustomerDebtEntry::query()->where('customer_id', $customer->id)->findOrFail($entryId);
            $amount = (float) $entry->amount;

            abort_if($amount > (float) $customer->debt, 422, 'ناتوانرێت بسڕدرێتەوە: بڕێکی زیاتر لەم قەرزە دراوەتەوە');

            $customer->decrement('debt', $amount);
            $customer->decrement('total_purchases', min($amount, (float) $customer->total_purchases));
            $entry->delete();

            ActivityLog::log('DELETE', 'CUSTOMER', $customer->id, "سڕینەوەی قەرزی دەفتەر لە {$customer->name} بە بڕی {$amount}", $userId);

            return $customer;
        });

        return response()->json(['success' => true, 'data' => $customer->fresh()]);
    }

    /** One customer's debt timeline: notebook entries, credit sales and repayments. */
    public function history($id)
    {
        $customer = Customer::findOrFail($id);

        $notebook = CustomerDebtEntry::query()
            ->with('user:id,name')
            ->where('customer_id', $customer->id)
            ->get()
            ->map(fn (CustomerDebtEntry $entry) => [
                'type' => 'NOTEBOOK',
                'id' => $entry->id,
                'date' => $entry->debt_date->toDateString(),
                'due_date' => $entry->due_date?->toDateString(),
                'amount' => (float) $entry->amount,
                'reference' => null,
                'notes' => $entry->notes,
                'user_name' => $entry->user?->name,
            ]);

        $sales = Sale::query()
            ->where('customer_id', $customer->id)
            ->where('payment_method', 'CREDIT')
            ->get(['id', 'invoice_number', 'total', 'cash_received', 'created_at'])
            ->map(fn (Sale $sale) => [
                'type' => 'CREDIT_SALE',
                'id' => $sale->id,
                'date' => $sale->created_at?->toDateString(),
                'due_date' => null,
                'amount' => max(0, round((float) $sale->total - (float) $sale->cash_received, 2)),
                'reference' => $sale->invoice_number,
                'notes' => null,
                'user_name' => null,
            ])
            ->filter(fn (array $row) => $row['amount'] > 0);

        $payments = Payment::query()
            ->where('party_type', 'CUSTOMER')
            ->where('party_id', $customer->id)
            ->where('payment_type', 'DEBT_PAYMENT')
            ->get(['id', 'amount', 'payment_method', 'notes', 'created_at'])
            ->map(fn (Payment $payment) => [
                'type' => 'PAYMENT',
                'id' => $payment->id,
                'date' => $payment->created_at?->toDateString(),
                'due_date' => null,
                'amount' => -1 * (float) $payment->amount,
                'reference' => $payment->payment_method,
                'notes' => $payment->notes,
                'user_name' => null,
            ]);

        $rows = $notebook->concat($sales)->concat($payments)
            ->sortByDesc(fn (array $row) => $row['date'] . '|' . $row['type'] . '|' . str_pad((string) $row['id'], 10, '0', STR_PAD_LEFT))
            ->values();

        return response()->json([
            'success' => true,
            'data' => ['customer' => $customer, 'rows' => $rows],
        ]);
    }

    /** Overview for the debt alerts panel: totals, overdue and soon-due notebook debts, biggest debtors. */
    public function alerts()
    {
        $today = now()->toDateString();
        $soon = now()->addDays(self::DUE_SOON_DAYS)->toDateString();

        // A notebook debt stays open while its customer still owes money.
        $open = CustomerDebtEntry::query()
            ->join('customers', 'customers.id', '=', 'customer_debt_entries.customer_id')
            ->where('customers.debt', '>', 0)
            ->whereNotNull('customer_debt_entries.due_date')
            ->where('customer_debt_entries.due_date', '<=', $soon)
            ->orderBy('customer_debt_entries.due_date')
            ->get([
                'customer_debt_entries.id',
                'customer_debt_entries.customer_id',
                'customer_debt_entries.amount',
                'customer_debt_entries.debt_date',
                'customer_debt_entries.due_date',
                'customer_debt_entries.notes',
                'customers.name as customer_name',
                'customers.phone as customer_phone',
                'customers.debt as customer_debt',
            ])
            ->map(function ($row) use ($today) {
                $due = $row->due_date->toDateString();

                return [
                    'id' => $row->id,
                    'customer_id' => $row->customer_id,
                    'customer_name' => $row->customer_name,
                    'customer_phone' => $row->customer_phone,
                    'customer_debt' => (float) $row->customer_debt,
                    'amount' => (float) $row->amount,
                    'debt_date' => $row->debt_date->toDateString(),
                    'due_date' => $due,
                    'notes' => $row->notes,
                    'status' => $due < $today ? 'overdue' : ($due === $today ? 'today' : 'soon'),
                    'days' => (int) now()->startOfDay()->diffInDays($row->due_date->startOfDay(), false),
                ];
            })
            ->values();

        $debtors = Customer::query()->where('debt', '>', 0);

        return response()->json([
            'success' => true,
            'data' => [
                'total_debt' => (float) (clone $debtors)->sum('debt'),
                'debtors_count' => (clone $debtors)->count(),
                'notebook_total' => (float) CustomerDebtEntry::query()->sum('amount'),
                'overdue_count' => $open->where('status', 'overdue')->count(),
                'due_soon_count' => $open->whereIn('status', ['today', 'soon'])->count(),
                'alerts' => $open,
                'top_debtors' => (clone $debtors)->orderByDesc('debt')->limit(10)->get(['id', 'name', 'phone', 'debt']),
            ],
        ]);
    }
}
