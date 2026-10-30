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

    public function transferKas(Request $request)
    {
        $validated = $request->validate([
            'mutasi_type' => 'required|in:penarikan,setoran,transfer_bank',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:1',
            'fund_type' => 'required|in:zakat,infaq_terikat,infaq_tidak_terikat,amil,non_halal',
            'source_bank_id' => 'nullable|exists:bank_accounts,id',
            'target_bank_id' => 'nullable|exists:bank_accounts,id',
            'description' => 'required|string',
            'proof_file' => 'nullable|file|max:10240',
        ]);

        $proofPath = null;
        $proofName = null;
        if ($request->hasFile('proof_file')) {
            $file = $request->file('proof_file');
            $proofPath = $file->store('proofs', 'public');
            $proofName = $file->getClientOriginalName();
        }

        $amount = (float)$validated['amount'];
        $todayStr = date('Ymd');
        $randomOut = rand(1000, 9999);
        $randomIn = rand(1000, 9999);

        return DB::transaction(function () use ($validated, $amount, $proofPath, $proofName, $todayStr, $randomOut, $randomIn, $request) {
            $user = $request->user();
            $userId = $user?->id;

            if ($validated['mutasi_type'] === 'penarikan') {
                $sourceBank = \App\Models\BankAccount::findOrFail($validated['source_bank_id']);
                $sourceBankName = "Bank {$sourceBank->bank_name} - {$sourceBank->account_number}";

                // 1. Pengeluaran dari Bank (Kredit di Bank)
                $txOut = Transaction::create([
                    'reference_number' => "MUT-OUT-{$todayStr}-{$randomOut}",
                    'date' => $validated['date'],
                    'type' => $validated['fund_type'] === 'amil' ? 'amil_operasional' : 'penyaluran',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'bank',
                    'bank_account_id' => $sourceBank->id,
                    'bank_name' => $sourceBankName,
                    'party_name' => 'Kas Tunai UPZ (Pemindahan Buku)',
                    'description' => "[MUTASI KAS] {$validated['description']} ({$sourceBankName} ➔ Kas Tunai)",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                // 2. Penerimaan ke Kas Tunai (Debet di Kas Tunai)
                $txIn = Transaction::create([
                    'reference_number' => "MUT-IN-{$todayStr}-{$randomIn}",
                    'date' => $validated['date'],
                    'type' => 'penerimaan',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'tunai',
                    'party_name' => "Penarikan dari {$sourceBankName}",
                    'description' => "[MUTASI KAS] {$validated['description']} (Kas Tunai ⬅️ {$sourceBankName})",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                return response()->json(['message' => 'Mutasi penarikan tunai berhasil diproses', 'out' => $txOut, 'in' => $txIn]);

            } else if ($validated['mutasi_type'] === 'setoran') {
                $targetBank = \App\Models\BankAccount::findOrFail($validated['target_bank_id']);
                $targetBankName = "Bank {$targetBank->bank_name} - {$targetBank->account_number}";

                // 1. Pengeluaran dari Kas Tunai (Kredit di Kas Tunai)
                $txOut = Transaction::create([
                    'reference_number' => "MUT-OUT-{$todayStr}-{$randomOut}",
                    'date' => $validated['date'],
                    'type' => $validated['fund_type'] === 'amil' ? 'amil_operasional' : 'penyaluran',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'tunai',
                    'party_name' => "Setoran ke {$targetBankName}",
                    'description' => "[MUTASI KAS] {$validated['description']} (Kas Tunai ➔ {$targetBankName})",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                // 2. Penerimaan ke Bank (Debet di Bank)
                $txIn = Transaction::create([
                    'reference_number' => "MUT-IN-{$todayStr}-{$randomIn}",
                    'date' => $validated['date'],
                    'type' => 'penerimaan',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'bank',
                    'bank_account_id' => $targetBank->id,
                    'bank_name' => $targetBankName,
                    'party_name' => 'Setoran dari Kas Tunai UPZ',
                    'description' => "[MUTASI KAS] {$validated['description']} ({$targetBankName} ⬅️ Kas Tunai)",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                return response()->json(['message' => 'Mutasi setoran tunai berhasil diproses', 'out' => $txOut, 'in' => $txIn]);

            } else { // transfer_bank
                $sourceBank = \App\Models\BankAccount::findOrFail($validated['source_bank_id']);
                $targetBank = \App\Models\BankAccount::findOrFail($validated['target_bank_id']);
                $sourceBankName = "Bank {$sourceBank->bank_name} - {$sourceBank->account_number}";
                $targetBankName = "Bank {$targetBank->bank_name} - {$targetBank->account_number}";

                // 1. Pengeluaran dari Bank Sumber (Kredit)
                $txOut = Transaction::create([
                    'reference_number' => "MUT-OUT-{$todayStr}-{$randomOut}",
                    'date' => $validated['date'],
                    'type' => $validated['fund_type'] === 'amil' ? 'amil_operasional' : 'penyaluran',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'bank',
                    'bank_account_id' => $sourceBank->id,
                    'bank_name' => $sourceBankName,
                    'party_name' => "Transfer ke {$targetBankName}",
                    'description' => "[MUTASI KAS] {$validated['description']} ({$sourceBankName} ➔ {$targetBankName})",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                // 2. Penerimaan ke Bank Tujuan (Debet)
                $txIn = Transaction::create([
                    'reference_number' => "MUT-IN-{$todayStr}-{$randomIn}",
                    'date' => $validated['date'],
                    'type' => 'penerimaan',
                    'category' => 'Pemindahan Buku / Mutasi Kas',
                    'fund_type' => $validated['fund_type'],
                    'amount' => $amount,
                    'payment_method' => 'bank',
                    'bank_account_id' => $targetBank->id,
                    'bank_name' => $targetBankName,
                    'party_name' => "Transfer dari {$sourceBankName}",
                    'description' => "[MUTASI KAS] {$validated['description']} ({$targetBankName} ⬅️ {$sourceBankName})",
                    'proof_file_path' => $proofPath,
                    'proof_file_name' => $proofName,
                    'status' => 'Disetujui',
                    'created_by' => $userId,
                    'verified_by' => $userId,
                    'approved_by' => $userId,
                ]);

                return response()->json(['message' => 'Mutasi transfer antar bank berhasil diproses', 'out' => $txOut, 'in' => $txIn]);
            }
        });
    }
}
