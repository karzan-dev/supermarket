<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user:id,name,username')
            ->latest('id')
            ->limit(100)
            ->get();

        return response()->json(['success' => true, 'data' => $logs]);
    }
}
