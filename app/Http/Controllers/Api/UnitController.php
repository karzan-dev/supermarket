<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        $units = Unit::all();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ku' => 'required|string',
            'name_en' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'short_code' => 'required|string|max:10',
        ]);

        // English/Arabic names are optional in the form but required by the table: fall back to the Kurdish name.
        foreach (['name_en', 'name_ar'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? $validated[$field] : $validated['name_ku'];
        }

        $unit = Unit::create($validated);
        ActivityLog::log('CREATE', 'UNIT', $unit->id, "Added unit {$unit->name_ku}");

        return response()->json(['success' => true, 'data' => $unit], 201);
    }

    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'name_ku' => 'required|string',
            'name_en' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'short_code' => 'required|string|max:10',
        ]);

        // English/Arabic names are optional in the form but required by the table: fall back to the Kurdish name.
        foreach (['name_en', 'name_ar'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? $validated[$field] : $validated['name_ku'];
        }

        $unit->update($validated);
        ActivityLog::log('UPDATE', 'UNIT', $unit->id, "Updated unit {$unit->name_ku}");

        return response()->json(['success' => true, 'data' => $unit]);
    }

    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);
        $unit->delete();
        ActivityLog::log('DELETE', 'UNIT', $id, "Deleted unit {$unit->name_ku}");

        return response()->json(['success' => true, 'message' => 'Unit deleted']);
    }
}
