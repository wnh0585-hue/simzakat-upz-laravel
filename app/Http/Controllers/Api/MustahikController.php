<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Mustahik;
use Illuminate\Http\Request;

class MustahikController extends Controller
{
    public function index(Request $request)
    {
        $query = Mustahik::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%");
            });
        }
        if ($request->asnaf) $query->where('asnaf', $request->asnaf);
        if ($request->type) $query->where('type', $request->type);

        return response()->json($query->orderBy('name')->paginate($request->get('per_page', 999)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'asnaf' => 'required|in:fakir,miskin,amil,muallaf,riqab,gharim,fisabilillah,ibnu_sabil',
            'type' => 'required|in:individu,lembaga',
        ]);

        $mustahik = Mustahik::create($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE', 'entity' => 'Mustahik',
            'entity_id' => $mustahik->id,
            'details' => "Mustahik baru: {$mustahik->name} ({$mustahik->asnaf})",
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json($mustahik, 201);
    }

    public function show(Mustahik $mustahik)
    {
        return response()->json($mustahik->load('transactions'));
    }

    public function update(Request $request, Mustahik $mustahik)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'asnaf' => 'sometimes|required|in:fakir,miskin,amil,muallaf,riqab,gharim,fisabilillah,ibnu_sabil',
            'type' => 'sometimes|required|in:individu,lembaga',
        ]);

        $mustahik->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'UPDATE', 'entity' => 'Mustahik',
            'entity_id' => $mustahik->id,
            'details' => "Update Mustahik: {$mustahik->name}",
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json($mustahik);
    }

    public function destroy(Request $request, Mustahik $mustahik)
    {
        $name = $mustahik->name;
        $mustahik->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'DELETE', 'entity' => 'Mustahik',
            'entity_id' => $mustahik->id,
            'details' => "Hapus Mustahik: {$name}",
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json(['message' => 'Mustahik berhasil dihapus.']);
    }
}
