<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\Supplier;
use App\Services\CashRegisterLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->boolean('debt_only')) {
            $query->where('debt', '>', 0);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('company', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        $suppliers = $query->orderByDesc('id')->get();

        return response()->json(['success' => true, 'data' => $suppliers]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'company' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier = Supplier::create($validated);
        ActivityLog::log('CREATE', 'SUPPLIER', $supplier->id, "Added supplier {$supplier->name}");

        return response()->json(['success' => true, 'data' => $supplier], 201);
    }

    public function show($id)
    {
        $supplier = Supplier::with(['purchases' => function ($q) {
            $q->latest()->limit(10);
        }])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $supplier]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'company' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $supplier->update($validated);
        ActivityLog::log('UPDATE', 'SUPPLIER', $supplier->id, "Updated supplier {$supplier->name}");

        return response()->json(['success' => true, 'data' => $supplier]);
    }

    public function destroy($id)
    {
        $result = DB::transaction(function () use ($id) {
            $supplier = Supplier::query()->lockForUpdate()->findOrFail($id);
            if ($supplier->debt > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'ناتوانرێت دابینکەر بسڕدرێتەوە لە کاتێکدا قەرزی دراوەی ماوە',
                ], 422);
            }
            if ($supplier->purchases()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'ناتوانرێت دابینکەر بسڕدرێتەوە چونکە پسوڵەی کڕینی پێوەبەستراوە. بۆ پاراستنی مێژووی کڕینەکان، دابینکەرەکە لەبری سڕینەوە دەستکاری بکە.',
                ], 422);
            }

            $supplierName = $supplier->name;
            $supplier->delete();
            ActivityLog::log('DELETE', 'SUPPLIER', $id, "Deleted supplier {$supplierName}");

            return null;
        });

        return $result ?? response()->json(['success' => true, 'message' => 'Supplier deleted']);
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
        [$supplier, $created] = DB::transaction(function () use ($id, $amount, $validated, $userId, $cashLedger) {
            $supplier = Supplier::query()->lockForUpdate()->findOrFail($id);
            $paymentMethod = $validated['payment_method'] ?? 'CASH';
            $notes = $validated['notes'] ?? 'دانەوەی قەرزی دابینکەر';
            $existing = Payment::query()->where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                if (
                    $existing->user_id !== $userId
                    || $existing->party_type !== 'SUPPLIER'
                    || $existing->party_id !== $supplier->id
                    || $existing->payment_type !== 'SUPPLIER_DEBT_PAYMENT'
                    || $cashLedger->toCents((string) $existing->amount) !== $cashLedger->toCents((string) $amount)
                    || $existing->payment_method !== $paymentMethod
                    || $existing->notes !== $notes
                ) {
                    abort(409, 'The idempotency key has already been used for a different payment.');
                }

                return [$supplier, false];
            }
            if ($amount > (float) $supplier->debt) {
                throw ValidationException::withMessages([
                    'amount' => 'بڕی پارەی دیاریکراو زیاترە لە قەرزی دابینکەر',
                ]);
            }

            $supplier->decrement('debt', $amount);
            $supplier->increment('total_paid', $amount);

            $payment = Payment::create([
                'payment_type' => 'SUPPLIER_DEBT_PAYMENT',
                'reference_id' => $supplier->id,
                'party_type' => 'SUPPLIER',
                'party_id' => $supplier->id,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'user_id' => $userId,
                'notes' => $notes,
                'created_at' => now(),
                'idempotency_key' => $validated['idempotency_key'],
            ]);

            if ($paymentMethod === 'CASH') {
                $cashLedger->record(
                    'SUPPLIER_PAYMENT',
                    'OUT',
                    (string) $amount,
                    $userId,
                    "Supplier debt payment to {$supplier->name}",
                    $validated['notes'] ?? null,
                    'PAYMENT',
                    $payment->id,
                );
            }

            ActivityLog::log('PAYMENT', 'SUPPLIER', $supplier->id, "دانەوەی قەرزی دابینکەر {$supplier->name} بە بڕی {$amount}", $userId);

            return [$supplier, true];
        });

        return response()->json([
            'success' => true,
            'message' => 'Supplier payment recorded successfully',
            'data' => $supplier->fresh(),
        ], $created ? 201 : 200);
    }
}
