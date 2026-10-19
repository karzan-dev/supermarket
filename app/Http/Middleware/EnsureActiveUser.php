<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'This account is inactive.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
