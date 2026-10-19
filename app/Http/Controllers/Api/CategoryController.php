<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('status', 'ACTIVE');
        }])->get();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ku' => 'required|string',
            'name_en' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        // English/Arabic names are optional in the form but required by the table: fall back to the Kurdish name.
        foreach (['name_en', 'name_ar'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? $validated[$field] : $validated['name_ku'];
        }

        $category = Category::create($validated);
        ActivityLog::log('CREATE', 'CATEGORY', $category->id, "Added category {$category->name_ku}");

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name_ku' => 'required|string',
            'name_en' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'nullable|boolean',
        ]);

        // English/Arabic names are optional in the form but required by the table: fall back to the Kurdish name.
        foreach (['name_en', 'name_ar'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? $validated[$field] : $validated['name_ku'];
        }

        $category->update($validated);
        ActivityLog::log('UPDATE', 'CATEGORY', $category->id, "Updated category {$category->name_ku}");

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::withCount('products')->findOrFail($id);
        if ($category->products_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'ناتوانرێت بەش بسڕدرێتەوە لە کاتێکدا کاڵای تێدایە'
            ], 400);
        }

        $category->delete();
        ActivityLog::log('DELETE', 'CATEGORY', $id, "Deleted category {$category->name_ku}");

        return response()->json(['success' => true, 'message' => 'Category deleted']);
    }
}
