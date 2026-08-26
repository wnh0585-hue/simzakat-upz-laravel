<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['muzakki', 'mustahik', 'program', 'bankAccount', 'creator', 'verifier', 'approver']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', "%{$request->search}%")
                  ->orWhere('party_name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        if ($request->type) $query->where('type', $request->type);
        if ($request->fund_type) $query->where('fund_type', $request->fund_type);
        if ($request->status) $query->where('status', $request->status);
        if ($request->asnaf) $query->where('asnaf', $request->asnaf);
        if ($request->date_from) $query->where('date', '>=', $request->date_from);
        if ($request->date_to) $query->where('date', '<=', $request->date_to);
        if ($request->year) $query->whereYear('date', $request->year);
        if ($request->month) $query->whereMonth('date', $request->month);

        return response()->json($query->orderByDesc('date')->orderByDesc('id')->paginate($request->get('per_page', 50)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:penerimaan,penyaluran,amil_operasional',
            'fund_type' => 'required|in:zakat,infaq_terikat,infaq_tidak_terikat,amil,non_halal',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|in:tunai,bank',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'bank_name' => 'nullable|string',
            'muzakki_id' => 'nullable|exists:muzakki,id',
            'mustahik_id' => 'nullable|exists:mustahik,id',
            'party_name' => 'required|string|max:255',
            'program_id' => 'nullable|exists:programs,id',
            'program_name' => 'nullable|string',
            'collection_plan_id' => 'nullable|exists:collection_plans,id',
            'collection_plan_name' => 'nullable|string',
            'asnaf' => 'nullable|in:fakir,miskin,amil,muallaf,riqab,gharim,fisabilillah,ibnu_sabil',
            'zakat_type' => 'nullable|in:fitrah,mal_penghasilan,mal_emas_perak,mal_perdagangan,mal_tpg_tukin,lainnya',
            'description' => 'required|string',
            'amil_allocation_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $validated['reference_number'] = Transaction::generateReferenceNumber($validated['type']);
        $user = $request->user();
        $validated['created_by'] = $user->id;

        // Auto-approve if created by Admin or Pimpinan
        if ($user->role === 'Admin' || $user->role === 'Pimpinan') {
            $validated['status'] = 'Disetujui';
            $validated['verified_by'] = $user->id;
            $validated['approved_by'] = $user->id;
        } else {
            $validated['status'] = 'Draft';
        }

        $transaction = Transaction::create($validated);

        // Handle file upload
        if ($request->hasFile('proof_file')) {
            $file = $request->file('proof_file');
            $path = $file->store('proofs', 'public');
            $transaction->update(['proof_file_name' => $file->getClientOriginalName(), 'proof_file_path' => $path]);
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'CREATE', 'entity' => 'Transaction',
            'entity_id' => $transaction->id,
            'details' => "Transaksi {$transaction->reference_number}: {$transaction->type} {$transaction->fund_type} Rp " . number_format($transaction->amount),
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json($transaction->load(['muzakki', 'mustahik', 'program', 'bankAccount', 'creator']), 201);
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load(['muzakki', 'mustahik', 'program', 'bankAccount', 'creator', 'verifier', 'approver']));
    }

    public function update(Request $request, Transaction $transaction)
    {
        if (!in_array($transaction->status, ['Draft', 'Ditolak'])) {
            return response()->json(['message' => 'Hanya transaksi Draft/Ditolak yang bisa diubah.'], 422);
        }

        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'fund_type' => 'sometimes|required|in:zakat,infaq_terikat,infaq_tidak_terikat,amil,non_halal',
            'amount' => 'sometimes|required|numeric|min:1',
            'payment_method' => 'nullable|in:tunai,bank',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'bank_name' => 'nullable|string',
            'muzakki_id' => 'nullable|exists:muzakki,id',
            'mustahik_id' => 'nullable|exists:mustahik,id',
            'party_name' => 'sometimes|required|string|max:255',
            'program_id' => 'nullable|exists:programs,id',
            'program_name' => 'nullable|string',
            'collection_plan_id' => 'nullable|exists:collection_plans,id',
            'collection_plan_name' => 'nullable|string',
            'asnaf' => 'nullable|in:fakir,miskin,amil,muallaf,riqab,gharim,fisabilillah,ibnu_sabil',
            'zakat_type' => 'nullable|in:fitrah,mal_penghasilan,mal_emas_perak,mal_perdagangan,mal_tpg_tukin,lainnya',
            'description' => 'sometimes|required|string',
            'amil_allocation_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $transaction->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'UPDATE', 'entity' => 'Transaction',
            'entity_id' => $transaction->id,
            'details' => "Update transaksi {$transaction->reference_number}",
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json($transaction->load(['muzakki', 'mustahik', 'program', 'bankAccount', 'creator']));
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if (!in_array($transaction->status, ['Draft', 'Ditolak'])) {
            return response()->json(['message' => 'Hanya transaksi Draft/Ditolak yang bisa dihapus.'], 422);
        }

        $ref = $transaction->reference_number;
        $transaction->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_email' => $request->user()->email,
            'user_role' => $request->user()->role,
            'action' => 'DELETE', 'entity' => 'Transaction',
            'entity_id' => $transaction->id,
            'details' => "Hapus transaksi {$ref}",
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json(['message' => 'Transaksi berhasil dihapus.']);
    }

    public function updateStatus(Request $request, Transaction $transaction)
    {
        $request->validate([
            'status' => 'required|in:Diajukan,Terverifikasi,Disetujui,Ditolak,Tersalurkan',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $newStatus = $request->status;

        // Role-based approval checks
        $allowedTransitions = [
            'Operator' => [
                'Diajukan' => ['Draft', 'Ditolak']
            ],
            'Admin' => [
                'Disetujui' => ['Draft', 'Diajukan', 'Terverifikasi', 'Ditolak', 'Tersalurkan'],
                'Terverifikasi' => ['Draft', 'Diajukan'],
                'Ditolak' => ['Draft', 'Diajukan', 'Terverifikasi', 'Disetujui'],
                'Tersalurkan' => ['Draft', 'Diajukan', 'Terverifikasi', 'Disetujui'],
                'Draft' => ['Diajukan', 'Ditolak', 'Disetujui']
            ],
            'Pimpinan' => [
                'Disetujui' => ['Draft', 'Diajukan', 'Terverifikasi'],
                'Ditolak' => ['Diajukan', 'Terverifikasi', 'Disetujui'],
                'Tersalurkan' => ['Disetujui']
            ],
        ];

        $roleAllowed = $allowedTransitions[$user->role] ?? [];
        $allowed = $roleAllowed[$newStatus] ?? [];

        if (!empty($allowed) && !in_array($transaction->status, $allowed)) {
            return response()->json(['message' => "Tidak bisa mengubah dari '{$transaction->status}' ke '{$newStatus}'."], 422);
        }

        $updates = ['status' => $newStatus, 'notes' => $request->notes];

        if ($newStatus === 'Terverifikasi') $updates['verified_by'] = $user->id;
        if ($newStatus === 'Disetujui' || $newStatus === 'Tersalurkan') {
            $updates['verified_by'] = $transaction->verified_by ?? $user->id;
            $updates['approved_by'] = $user->id;
        }

        $transaction->update($updates);

        AuditLog::create([
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role,
            'action' => 'STATUS_CHANGE', 'entity' => 'Transaction',
            'entity_id' => $transaction->id,
            'details' => "Transaksi {$transaction->reference_number} → {$newStatus}. Catatan: " . ($request->notes ?? '-'),
            'ip_address' => $request->ip(), 'created_at' => now(),
        ]);

        return response()->json($transaction->fresh()->load(['creator', 'verifier', 'approver']));
    }
}
