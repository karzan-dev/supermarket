<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50',
            'password' => 'required|string|max:256',
        ]);

        $user = User::with('role')->where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password) || $user->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials or inactive account',
            ], 401);
        }

        $user->update(['last_login' => now()]);

        ActivityLog::log('LOGIN', 'USER', $user->id, "User {$user->username} logged in successfully", $user->id);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role ? $user->role->name : 'CASHIER',
                'role_display' => $user->role ? $user->role->display_name_ku : '',
                'language_pref' => $user->language_pref ?? 'ku',
                'phone' => $user->phone,
                'email' => $user->email,
                'permissions' => $user->permissions(),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
            ActivityLog::log('LOGOUT', 'USER', $user->id, "User {$user->username} logged out", $user->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role');

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'role' => $user->role ? $user->role->name : 'CASHIER',
                'role_display' => $user->role ? $user->role->display_name_ku : '',
                'language_pref' => $user->language_pref,
                'phone' => $user->phone,
                'email' => $user->email,
                'permissions' => $user->permissions(),
            ],
        ]);
    }
}
