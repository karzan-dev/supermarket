<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\Payment;
use App\Services\CashRegisterLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->boolean('debt_only')) {
            $query->where('debt', '>', 0);
        }

        // Customers with at least one debt copied from the paper notebook.
        if ($request->boolean('notebook_only')) {
            $query->whereExists(function ($q) {
                $q->selectRaw('1')
                    ->from('customer_debt_entries')
                    ->whereColumn('customer_debt_entries.customer_id', 'customers.id');
            });
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        $customers = $query->orderByDesc('id')->get();

        return response()->json(['success' => true, 'data' => $customers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::create($validated);
        ActivityLog::log('CREATE', 'CUSTOMER', $customer->id, "Added customer {$customer->name}");

        return response()->json(['success' => true, 'data' => $customer], 201);
    }

    public function show($id)
    {
        $customer = Customer::with(['sales' => function ($q) {
            $q->latest()->limit(10);
        }])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customer->update($validated);
        ActivityLog::log('UPDATE', 'CUSTOMER', $customer->id, "Updated customer {$customer->name}");

        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        if ($customer->debt > 0) {
            return response()->json([
                'success' => false,
                'message' => 'ناتوانرێت کڕیار بسڕدرێتەوە کاتێک قەرزی کۆنی لەسەرە',
            ], 400);
        }

        $customer->delete();
        ActivityLog::log('DELETE', 'CUSTOMER', $id, "Deleted customer {$customer->name}");

        return response()->json(['success' => true, 'message' => 'Customer deleted']);
    }

    public function payDebt(Request $request, $id, CashRegisterLedger $cashLedger)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|decimal:0,2',
            'payment_method' => 'nullable|in:CASH,CARD,BANK',
            'notes' => 'nullable|string',
            'idempotency_key' => 'required|uuid|max:64',
        ]);

        $amount = (float) $validated['amount'];
        $userId = (int) $request->user()->id;
        [$customer, $created] = DB::transaction(function () use ($id, $amount, $validated, $userId, $cashLedger) {
            $customer = Customer::query()->lockForUpdate()->findOrFail($id);
            $paymentMethod = $validated['payment_method'] ?? 'CASH';
            $notes = $validated['notes'] ?? 'دانەوەی قەرزی کڕیار';
            $existing = Payment::query()->where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                if (
                    $existing->user_id !== $userId
                    || $existing->party_type !== 'CUSTOMER'
                    || $existing->party_id !== $customer->id
                    || $existing->payment_type !== 'DEBT_PAYMENT'
                    || $cashLedger->toCents((string) $existing->amount) !== $cashLedger->toCents((string) $amount)
                    || $existing->payment_method !== $paymentMethod
                    || $existing->notes !== $notes
                ) {
                    abort(409, 'The idempotency key has already been used for a different payment.');
                }

                return [$customer, false];
            }
            if ($amount > (float) $customer->debt) {
                throw ValidationException::withMessages([
                    'amount' => 'بڕی پارەی دراو زیاترە لە کۆی قەرزی کڕیار',
                ]);
            }

            $customer->decrement('debt', $amount);
            $customer->increment('total_paid', $amount);

            $payment = Payment::create([
                'payment_type' => 'DEBT_PAYMENT',
                'reference_id' => $customer->id,
                'party_type' => 'CUSTOMER',
                'party_id' => $customer->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'user_id' => $userId,
                'notes' => $notes,
                'created_at' => now(),
                'idempotency_key' => $validated['idempotency_key'],
            ]);

            if ($paymentMethod === 'CASH') {
                $cashLedger->record(
                    'CUSTOMER_PAYMENT',
                    'IN',
                    (string) $amount,
                    $userId,
                    "Customer debt payment from {$customer->name}",
                    $validated['notes'] ?? null,
                    'PAYMENT',
                    $payment->id,
                );
            }

            ActivityLog::log('PAYMENT', 'CUSTOMER', $customer->id, "دانەوەی قەرزی کڕیار {$customer->name} بە بڕی {$amount}", $userId);

            return [$customer, true];
        });

        return response()->json([
            'success' => true,
            'message' => 'Debt payment recorded successfully',
            'data' => $customer->fresh(),
        ], $created ? 201 : 200);
    }
}
