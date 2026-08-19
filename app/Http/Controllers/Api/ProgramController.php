<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $query = Program::query();
        if ($request->search) $query->where('name', 'like', "%{$request->search}%");
        if ($request->fund_type) $query->where('fund_type', $request->fund_type);
        return response()->json($query->orderBy('name')->get()->map(fn($p) => $p->append('realisasi')));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'fund_type' => 'required|in:zakat,infaq_terikat,infaq_tidak_terikat,zakat_dan_infaq,amil',
            'target_amount' => 'required|numeric|min:0',
            'unit_amount' => 'nullable|numeric',
            'multiplier' => 'nullable|numeric',
            'multiplier_label' => 'nullable|string',
            'description' => 'nullable|string',
            'bidang' => 'nullable|in:Pendidikan,Kesehatan,Kemanusiaan,Ekonomi,Dakwah-Advokasi',
            'pic' => 'nullable|string',
            'waktu_kegiatan' => 'nullable|string',
            'is_multi_fund' => 'nullable|boolean',
            'zakat_percentage' => 'nullable|numeric',
            'infaq_percentage' => 'nullable|numeric',
        ]);
        $p = Program::create($data);
        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE',
            'entity' => 'Program',
            'entity_id' => $p->id,
            'details' => "Program: {$p->name}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        return response()->json($p, 201);
    }

    public function show(Program $program)
    {
        return response()->json($program->append('realisasi'));
    }

    public function update(Request $request, Program $program)
    {
        $program->update($request->all());
        return response()->json($program);
    }

    public function destroy(Program $program)
    {
        $program->delete();
        return response()->json(['message' => 'Program berhasil dihapus.']);
    }
}
