<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if (!$user->active) {
            return response()->json(['message' => 'Akun Anda dinonaktifkan. Hubungi Administrator.'], 403);
        }

        $token = $user->createToken('simzakat-token')->plainTextToken;

        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role,
            'action' => 'LOGIN',
            'entity' => 'User',
            'entity_id' => $user->id,
            'details' => "User {$user->name} berhasil login.",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'active' => $user->active,
                'nip' => $user->nip,
                'unit_kerja' => $user->unit_kerja,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'LOGOUT',
            'entity' => 'User',
            'entity_id' => $request->user()->id,
            'details' => "User {$request->user()->name} logout.",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->only([
            'id', 'name', 'email', 'role', 'active', 'nip', 'unit_kerja', 'created_at'
        ]));
    }
}
