<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(User::orderBy('name')->get(['id','name','email','role','active','nip','unit_kerja','created_at']));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role' => 'required|in:Operator,Admin,Pimpinan,Auditor',
            'nip' => 'nullable|string',
            'unit_kerja' => 'nullable|string',
        ]);
        $data['password'] = Hash::make($data['password']);
        $data['active'] = true;
        return response()->json(User::create($data)->only(['id','name','email','role','active','nip','unit_kerja','created_at']), 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => 'sometimes|in:Operator,Admin,Pimpinan,Auditor',
            'active' => 'sometimes|boolean',
            'nip' => 'nullable|string',
            'unit_kerja' => 'nullable|string',
        ]);
        if ($request->filled('password')) $data['password'] = Hash::make($request->password);
        $user->update($data);
        return response()->json($user->only(['id','name','email','role','active','nip','unit_kerja']));
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
