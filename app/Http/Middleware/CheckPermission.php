<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        if (! $user || ! $user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to perform this action.',
            ], $user ? 403 : 401);
        }

        return $next($request);
    }
}
