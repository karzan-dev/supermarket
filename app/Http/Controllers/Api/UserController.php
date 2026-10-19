<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['role.permissions', 'customPermissions'])->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'role' => $u->role ? $u->role->name : 'CASHIER',
                'role_display' => $u->role ? $u->role->display_name_ku : '',
                'role_id' => $u->role_id,
                'permissions' => $u->permissions(),
                'permissions_customized' => $u->permissions_customized,
                'status' => $u->status,
                'language_pref' => $u->language_pref,
                'phone' => $u->phone,
                'email' => $u->email,
                'last_login' => $u->last_login ? $u->last_login->format('Y-m-d H:i:s') : null,
                'created_at' => $u->created_at->format('Y-m-d H:i:s'),
            ];
        });

        $roles = Role::all();
        $permissions = Permission::query()->orderBy('module')->orderBy('name')->get(['name', 'module']);

        return response()->json([
            'success' => true,
            'data' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:50|regex:/^[a-zA-Z0-9._@+-]+$/|unique:users,username',
            'password' => ['required', Password::min(12)->letters()->numbers()],
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'present|array',
            'permissions.*' => 'required|string|distinct|exists:permissions,name',
            'status' => 'nullable|in:ACTIVE,INACTIVE,SUSPENDED',
            'language_pref' => 'nullable|in:ku,en,ar',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ], [
            'username.regex' => 'ناوی بەکارهێنەر تەنها پیتی ئینگلیزی، ژمارە، ئیمەیڵ یان . _ - @ + دەتوانێت لەخۆ بگرێت (بێ بۆشایی).',
            'username.unique' => 'ئەم ناوی بەکارهێنەرە پێشتر بەکارهاتووە.',
            'email.email' => 'ئیمەیڵەکە دروست نییە.',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $actor = $request->user();
        if (! $actor?->isAdmin() && $role->name === 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Only an administrator can assign the administrator role.',
            ], 403);
        }
        if (! $actor?->isAdmin() && array_diff($validated['permissions'], $actor?->permissions() ?? [])) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot assign permissions you do not have.',
            ], 403);
        }

        $permissionIds = Permission::query()->whereIn('name', $validated['permissions'])->pluck('id')->all();
        $user = DB::transaction(function () use ($validated, $role, $permissionIds) {
            unset($validated['permissions']);
            $user = User::create($validated + ['permissions_customized' => $role->name !== 'ADMIN']);
            if ($role->name !== 'ADMIN') {
                $user->customPermissions()->sync($permissionIds);
            }

            return $user;
        });

        ActivityLog::log('CREATE', 'USER', $user->id, "دروستکردنی بەکارهێنەری نوێ: {$user->username}");

        return response()->json(['success' => true, 'data' => $user->load('role', 'customPermissions')], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'username' => "required|string|max:50|regex:/^[a-zA-Z0-9._@+-]+$/|unique:users,username,{$id}",
            'password' => ['nullable', Password::min(12)->letters()->numbers()],
            'role_id' => 'required|exists:roles,id',
            'permissions' => 'present|array',
            'permissions.*' => 'required|string|distinct|exists:permissions,name',
            'status' => 'nullable|in:ACTIVE,INACTIVE,SUSPENDED',
            'language_pref' => 'nullable|in:ku,en,ar',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ], [
            'username.regex' => 'ناوی بەکارهێنەر تەنها پیتی ئینگلیزی، ژمارە، ئیمەیڵ یان . _ - @ + دەتوانێت لەخۆ بگرێت (بێ بۆشایی).',
            'username.unique' => 'ئەم ناوی بەکارهێنەرە پێشتر بەکارهاتووە.',
            'email.email' => 'ئیمەیڵەکە دروست نییە.',
        ]);

        $nextRole = Role::findOrFail($validated['role_id']);
        $actor = $request->user();
        if (! $actor?->isAdmin() && $nextRole->name === 'ADMIN') {
            return response()->json([
                'success' => false,
                'message' => 'Only an administrator can assign the administrator role.',
            ], 403);
        }
        if (! $actor?->isAdmin() && array_diff($validated['permissions'], $actor?->permissions() ?? [])) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot assign permissions you do not have.',
            ], 403);
        }

        $remainsActiveAdmin = $nextRole->name === 'ADMIN' && ($validated['status'] ?? $user->status) === 'ACTIVE';
        if ($user->id === $request->user()?->id && ! $remainsActiveAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot remove administrator access from your own account.',
            ], 422);
        }
        if ($user->isAdmin() && ! $remainsActiveAdmin && User::where('status', 'ACTIVE')->whereHas('role', fn ($query) => $query->where('name', 'ADMIN'))->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'The last active administrator cannot be demoted or deactivated.',
            ], 422);
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $permissionIds = Permission::query()->whereIn('name', $validated['permissions'])->pluck('id')->all();
        DB::transaction(function () use ($user, $validated, $nextRole, $permissionIds) {
            unset($validated['permissions']);
            $user->update($validated + ['permissions_customized' => $nextRole->name !== 'ADMIN']);
            if ($nextRole->name === 'ADMIN') {
                $user->customPermissions()->detach();
            } else {
                $user->customPermissions()->sync($permissionIds);
            }
        });
        ActivityLog::log('UPDATE', 'USER', $user->id, "نوێکردنەوەی بەکارهێنەر: {$user->username}");

        return response()->json(['success' => true, 'data' => $user->load('role', 'customPermissions')]);
    }

    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        if ($user->id === $request->user()?->id) {
            return response()->json(['success' => false, 'message' => 'You cannot delete your own account.'], 422);
        }
        if ($user->isAdmin() && ! $request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only an administrator can delete another administrator.',
            ], 403);
        }
        if ($user->isAdmin() && $user->status === 'ACTIVE' && User::where('status', 'ACTIVE')->whereHas('role', fn ($query) => $query->where('name', 'ADMIN'))->count() <= 1) {
            return response()->json(['success' => false, 'message' => 'The last active administrator cannot be deleted.'], 422);
        }

        $user->delete();
        ActivityLog::log('DELETE', 'USER', $id, "سڕینەوەی بەکارهێنەر: {$user->username}");

        return response()->json(['success' => true, 'message' => 'User deleted']);
    }
}
