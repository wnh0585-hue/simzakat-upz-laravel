<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollectionPlan;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class CollectionPlanController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(CollectionPlan::orderBy('name')->get()->map(fn($p) => $p->append('realisasi')));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'category' => 'required|in:zakat_mal,zakat_fitrah,infaq_umum,infaq_terikat',
            'target_amount' => 'required|numeric|min:0',
            'unit_amount' => 'nullable|numeric',
            'multiplier' => 'nullable|numeric',
            'multiplier_label' => 'nullable|string',
            'period' => 'nullable|string',
            'description' => 'nullable|string',
            'setor_baznas' => 'nullable|boolean',
            'baznas_return_percentage' => 'nullable|numeric',
            'baznas_return_amount' => 'nullable|numeric',
        ]);
        $p = CollectionPlan::create($data);
        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE',
            'entity' => 'CollectionPlan',
            'entity_id' => $p->id,
            'details' => "Rencana: {$p->name}",
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        return response()->json($p, 201);
    }

    public function show(CollectionPlan $collectionPlan)
    {
        return response()->json($collectionPlan->append('realisasi'));
    }

    public function update(Request $request, CollectionPlan $collectionPlan)
    {
        $collectionPlan->update($request->all());
        return response()->json($collectionPlan);
    }

    public function destroy(CollectionPlan $collectionPlan)
    {
        $collectionPlan->delete();
        return response()->json(['message' => 'Rencana penghimpunan berhasil dihapus.']);
    }
}
