<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\CashRegisterAccount;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Services\CashRegisterLedger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::with(['category', 'user:id,name'])->latest('date')->get();

        return response()->json(['success' => true, 'data' => $expenses]);
    }

    public function categories()
    {
        $categories = ExpenseCategory::all();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name_ku' => 'required|string|max:100|unique:expense_categories,name_ku',
            'name_en' => 'nullable|string|max:100',
            'name_ar' => 'nullable|string|max:100',
        ], [
            'name_ku.required' => 'ناوی خەرجی پێویستە.',
            'name_ku.unique' => 'ئەم جۆرە خەرجییە پێشتر هەیە.',
        ]);

        // The table requires all three names; untranslated ones show the Kurdish name.
        foreach (['name_en', 'name_ar'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? $validated[$field] : $validated['name_ku'];
        }

        $category = ExpenseCategory::create($validated);
        ActivityLog::log('CREATE', 'EXPENSE_CATEGORY', $category->id, "زیادکردنی جۆری خەرجی {$category->name_ku}", (int) $request->user()->id);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function destroyCategory(Request $request, $id)
    {
        $category = ExpenseCategory::findOrFail($id);
        if ($category->expenses()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'ناتوانرێت ئەم جۆرە بسڕدرێتەوە چونکە خەرجی تێدا تۆمارکراوە.',
            ], 422);
        }

        $category->delete();
        ActivityLog::log('DELETE', 'EXPENSE_CATEGORY', (int) $id, "سڕینەوەی جۆری خەرجی {$category->name_ku}", (int) $request->user()->id);

        return response()->json(['success' => true, 'message' => 'Expense category deleted']);
    }

    public function store(Request $request, CashRegisterLedger $cashLedger)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string',
            'idempotency_key' => 'required|uuid|max:64',
        ]);

        $validated['user_id'] = (int) $request->user()->id;
        [$expense, $created] = DB::transaction(function () use ($validated, $cashLedger) {
            CashRegisterAccount::query()->lockForUpdate()->findOrFail(1);
            $existing = Expense::query()->where('idempotency_key', $validated['idempotency_key'])->first();
            if ($existing) {
                if (
                    $existing->user_id !== $validated['user_id']
                    || $existing->category_id !== $validated['category_id']
                    || $cashLedger->toCents((string) $existing->amount) !== $cashLedger->toCents((string) $validated['amount'])
                    || $existing->date->toDateString() !== $validated['date']
                    || $existing->description !== ($validated['description'] ?? null)
                ) {
                    abort(409, 'The idempotency key has already been used for a different expense.');
                }

                return [$existing, false];
            }

            $expense = Expense::create($validated);
            $cashLedger->record(
                'EXPENSE',
                'OUT',
                (string) $expense->amount,
                $validated['user_id'],
                $expense->description ?: 'Store expense',
                null,
                'EXPENSE',
                $expense->id,
                $validated['idempotency_key'],
            );
            ActivityLog::log('CREATE', 'EXPENSE', $expense->id, "تۆمارکردنی خەرجی بە بڕی {$expense->amount}", $validated['user_id']);

            return [$expense, true];
        });

        return response()->json(['success' => true, 'data' => $expense->load('category')], $created ? 201 : 200);
    }

    public function destroy(Request $request, $id)
    {
        DB::transaction(function () use ($id, $request) {
            $expense = Expense::query()->lockForUpdate()->findOrFail($id);
            $expense->delete();

            ActivityLog::log('DELETE', 'EXPENSE', $id, "سڕینەوەی خەرجی بە بڕی {$expense->amount}", (int) $request->user()->id);
        });

        return response()->json(['success' => true, 'message' => 'Expense deleted']);
    }
}
