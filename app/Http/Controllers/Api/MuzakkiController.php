<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Muzakki;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MuzakkiImport;

class MuzakkiController extends Controller
{
    public function index(Request $request)
    {
        $query = Muzakki::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%")
                  ->orWhere('nip', 'like', "%{$request->search}%")
                  ->orWhere('unit_kerja', 'like', "%{$request->search}%");
            });
        }

        if ($request->type) $query->where('type', $request->type);
        if ($request->status) $query->where('status', $request->status);

        $perPage = $request->get('per_page', 999);
        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'type' => 'required|in:individu,badan_usaha',
            'nip' => 'nullable|string|max:20',
            'unit_kerja' => 'nullable|string|max:255',
            'golongan' => 'nullable|string|max:10',
            'status' => 'nullable|in:Muzakki,Munfiq,Keduanya',
        ]);

        $muzakki = Muzakki::create($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE',
            'entity' => 'Muzakki',
            'entity_id' => $muzakki->id,
            'details' => "Muzakki baru: {$muzakki->name}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json($muzakki, 201);
    }

    public function show(Muzakki $muzakki)
    {
        return response()->json($muzakki->load('transactions'));
    }

    public function update(Request $request, Muzakki $muzakki)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'type' => 'sometimes|required|in:individu,badan_usaha',
            'nip' => 'nullable|string|max:20',
            'unit_kerja' => 'nullable|string|max:255',
            'golongan' => 'nullable|string|max:10',
            'status' => 'nullable|in:Muzakki,Munfiq,Keduanya',
        ]);

        $muzakki->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'UPDATE',
            'entity' => 'Muzakki',
            'entity_id' => $muzakki->id,
            'details' => "Update data Muzakki: {$muzakki->name}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json($muzakki);
    }

    public function destroy(Request $request, Muzakki $muzakki)
    {
        $name = $muzakki->name;
        $muzakki->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'DELETE',
            'entity' => 'Muzakki',
            'entity_id' => $muzakki->id,
            'details' => "Hapus Muzakki: {$name}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Muzakki berhasil dihapus.']);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:5120']);

        Excel::import(new MuzakkiImport($request->user()), $request->file('file'));

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'IMPORT',
            'entity' => 'Muzakki',
            'details' => 'Import data Muzakki dari file Excel.',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Import berhasil.']);
    }
}
