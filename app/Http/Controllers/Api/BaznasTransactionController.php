<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaznasTransaction;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class BaznasTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = BaznasTransaction::with('creator')->orderByDesc('date');
        if ($request->date_from) $query->where('date', '>=', $request->date_from);
        if ($request->date_to) $query->where('date', '<=', $request->date_to);
        return response()->json($query->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:setor,pengembalian',
            'category' => 'nullable|string',
            'amount' => 'required|numeric|min:1',
            'source_payment_method' => 'nullable|in:tunai,bank',
            'source_bank_account' => 'nullable|string',
            'bank_account' => 'required|string',
            'description' => 'required|string',
            'split_amil' => 'nullable|boolean',
            'amil_percentage' => 'nullable|numeric',
            'amil_amount' => 'nullable|numeric',
            'mustahik_amount' => 'nullable|numeric',
        ]);
        $data['created_by'] = $request->user()->id;
        $b = BaznasTransaction::create($data);
        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE',
            'entity' => 'BaznasTransaction',
            'entity_id' => $b->id,
            'details' => "Setoran BAZNAS Rp " . number_format($b->amount),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        return response()->json($b, 201);
    }

    public function update(Request $request, BaznasTransaction $baznasTransaction)
    {
        $baznasTransaction->update($request->all());
        return response()->json($baznasTransaction);
    }

    public function approve(Request $request, BaznasTransaction $baznasTransaction)
    {
        $baznasTransaction->update(['status' => 'Disetujui']);
        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'STATUS_CHANGE',
            'entity' => 'BaznasTransaction',
            'entity_id' => $baznasTransaction->id,
            'details' => 'Setoran BAZNAS disetujui',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        return response()->json($baznasTransaction);
    }

    public function destroy(BaznasTransaction $baznasTransaction)
    {
        $baznasTransaction->delete();
        return response()->json(['message' => 'Transaksi BAZNAS berhasil dihapus.']);
    }
}
