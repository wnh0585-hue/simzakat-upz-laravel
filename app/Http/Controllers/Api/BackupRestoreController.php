<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Muzakki;
use App\Models\Mustahik;
use App\Models\Program;
use App\Models\CollectionPlan;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\BaznasTransaction;
use App\Models\AuditLog;

class BackupRestoreController extends Controller
{
    /**
     * Export complete database to JSON
     */
    public function export(Request $request)
    {
        $muzakki = Muzakki::all();
        $mustahik = Mustahik::all();
        $programs = Program::all();
        $collectionPlans = CollectionPlan::all();
        $bankAccounts = BankAccount::all();
        $transactions = Transaction::all();
        $baznasTransactions = BaznasTransaction::all();
        $auditLogs = AuditLog::latest()->take(500)->get();

        $payload = [
            'app' => 'SIMZAKAT UPZ Kemenag Kebumen',
            'version' => '1.0.0',
            'exportedAt' => now()->toIso8601String(),
            'exportedBy' => $request->user()?->email ?? 'admin@kemenag.go.id',
            'summary' => [
                'muzakkiCount' => $muzakki->count(),
                'mustahikCount' => $mustahik->count(),
                'programsCount' => $programs->count(),
                'collectionPlansCount' => $collectionPlans->count(),
                'bankAccountsCount' => $bankAccounts->count(),
                'transactionsCount' => $transactions->count(),
                'baznasTransactionsCount' => $baznasTransactions->count(),
                'auditLogsCount' => $auditLogs->count(),
            ],
            'data' => [
                'muzakki' => $muzakki,
                'mustahik' => $mustahik,
                'programs' => $programs,
                'collectionPlans' => $collectionPlans,
                'bankAccounts' => $bankAccounts,
                'transactions' => $transactions,
                'baznasTransactions' => $baznasTransactions,
                'auditLogs' => $auditLogs,
            ]
        ];

        return response()->json($payload);
    }

    /**
     * Restore from JSON (Supports both Firebase JSON and Laravel JSON)
     */
    public function restore(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'mode' => 'nullable|in:merge,overwrite'
        ]);

        $mode = $request->input('mode', 'merge');
        $backupData = $request->input('data');

        // Extract collections
        $muzakkiList = $backupData['muzakki'] ?? [];
        $mustahikList = $backupData['mustahik'] ?? [];
        $programsList = $backupData['programs'] ?? [];
        $collectionPlansList = $backupData['collectionPlans'] ?? $backupData['collection_plans'] ?? [];
        $bankAccountsList = $backupData['bankAccounts'] ?? $backupData['bank_accounts'] ?? [];
        $transactionsList = $backupData['transactions'] ?? [];
        $baznasList = $backupData['baznasTransactions'] ?? $backupData['baznas_transactions'] ?? [];

        $counts = [
            'muzakki' => 0,
            'mustahik' => 0,
            'programs' => 0,
            'collection_plans' => 0,
            'bank_accounts' => 0,
            'transactions' => 0,
            'baznas_transactions' => 0,
        ];

        DB::beginTransaction();
        try {
            if ($mode === 'overwrite') {
                // Use DELETE queries instead of TRUNCATE to avoid MySQL implicit commit
                Transaction::query()->delete();
                BaznasTransaction::query()->delete();
                Program::query()->delete();
                CollectionPlan::query()->delete();
                BankAccount::query()->delete();
                Muzakki::query()->delete();
                Mustahik::query()->delete();
            }

            // 1. Restore Muzakki
            foreach ($muzakkiList as $item) {
                Muzakki::updateOrCreate(
                    ['name' => $item['name'] ?? 'Donatur Tanpa Nama', 'nik' => $item['nik'] ?? null],
                    [
                        'phone' => $item['phone'] ?? null,
                        'email' => $item['email'] ?? null,
                        'address' => $item['address'] ?? null,
                        'type' => $item['type'] ?? 'individu',
                        'nip' => $item['nip'] ?? null,
                        'unit_kerja' => $item['unit_kerja'] ?? $item['unitKerja'] ?? null,
                        'golongan' => $item['golongan'] ?? null,
                        'status' => $item['status'] ?? 'Muzakki',
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['muzakki']++;
            }

            // 2. Restore Mustahik
            foreach ($mustahikList as $item) {
                Mustahik::updateOrCreate(
                    ['name' => $item['name'] ?? 'Penerima Tanpa Nama', 'nik' => $item['nik'] ?? null],
                    [
                        'phone' => $item['phone'] ?? null,
                        'address' => $item['address'] ?? null,
                        'asnaf' => strtolower($item['asnaf'] ?? 'fakir'),
                        'type' => $item['type'] ?? 'individu',
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['mustahik']++;
            }

            // 3. Restore Programs
            foreach ($programsList as $item) {
                Program::updateOrCreate(
                    ['name' => $item['name'] ?? 'Program Kerja'],
                    [
                        'fund_type' => $item['fund_type'] ?? $item['fundType'] ?? 'zakat',
                        'target_amount' => (float)($item['target_amount'] ?? $item['targetAmount'] ?? 0),
                        'unit_amount' => (float)($item['unit_amount'] ?? $item['unitAmount'] ?? 0),
                        'multiplier' => (int)($item['multiplier'] ?? 1),
                        'multiplier_label' => $item['multiplier_label'] ?? $item['multiplierLabel'] ?? 'Paket',
                        'description' => $item['description'] ?? null,
                        'bidang' => $item['bidang'] ?? 'Pendidikan',
                        'pic' => $item['pic'] ?? null,
                        'waktu_kegiatan' => $item['waktu_kegiatan'] ?? $item['waktuKegiatan'] ?? null,
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['programs']++;
            }

            // 4. Restore Collection Plans
            foreach ($collectionPlansList as $item) {
                CollectionPlan::updateOrCreate(
                    ['name' => $item['name'] ?? 'Rencana Target'],
                    [
                        'category' => $item['category'] ?? 'zakat_mal',
                        'target_amount' => (float)($item['target_amount'] ?? $item['targetAmount'] ?? 0),
                        'unit_amount' => (float)($item['unit_amount'] ?? $item['unitAmount'] ?? 0),
                        'multiplier' => (int)($item['multiplier'] ?? 1),
                        'period' => $item['period'] ?? 'Tahun Buku 2026',
                        'description' => $item['description'] ?? null,
                        'setor_baznas' => (bool)($item['setor_baznas'] ?? $item['setorBaznas'] ?? true),
                        'baznas_return_percentage' => (float)($item['baznas_return_percentage'] ?? $item['baznasReturnPercentage'] ?? 12.5),
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['collection_plans']++;
            }

            // 5. Restore Bank Accounts
            if (empty($bankAccountsList) && !empty($transactionsList)) {
                // Auto-detect bank accounts from transactions list
                $detected = [];
                foreach ($transactionsList as $t) {
                    $bn = $t['bank_name'] ?? $t['bankName'] ?? '';
                    if ($bn && !isset($detected[$bn])) {
                        $detected[$bn] = true;
                        // Try to extract account number and holder
                        preg_match('/(\d{7,15})/', $bn, $matches);
                        $accNo = $matches[1] ?? (string)rand(1000000000, 9999999999);
                        $bankName = 'Bank Jateng';
                        if (stripos($bn, 'BSI') !== false) $bankName = 'BSI';
                        else if (stripos($bn, 'BRI') !== false) $bankName = 'BRI';

                        $fundType = 'zakat';
                        if (stripos($bn, 'infak') !== false || stripos($bn, 'infaq') !== false) $fundType = 'infaq_tidak_terikat';
                        else if (stripos($bn, 'amil') !== false) $fundType = 'amil';

                        $holder = 'UPZ Kemenag Kebumen';
                        if (preg_match('/\((.*?)\)/', $bn, $hMatches)) {
                            $holder = str_replace('a.n.', '', $hMatches[1]);
                            $holder = trim($holder);
                        }

                        $bankAccountsList[] = [
                            'bank_name' => $bankName,
                            'account_number' => $accNo,
                            'account_holder' => $holder,
                            'fund_type' => $fundType,
                            'type' => 'upz',
                            'description' => $bn,
                        ];
                    }
                }
            }

            foreach ($bankAccountsList as $item) {
                BankAccount::updateOrCreate(
                    ['account_number' => $item['account_number'] ?? $item['accountNumber'] ?? '0000'],
                    [
                        'type' => $item['type'] ?? 'upz',
                        'fund_type' => $item['fund_type'] ?? $item['fundType'] ?? null,
                        'bank_name' => $item['bank_name'] ?? $item['bankName'] ?? 'Bank',
                        'account_holder' => $item['account_holder'] ?? $item['accountHolder'] ?? 'UPZ Kemenag',
                        'description' => $item['description'] ?? null,
                    ]
                );
                $counts['bank_accounts']++;
            }

            // Cache all bank accounts for fast ID linking
            $allBanks = BankAccount::all();

            // 6. Restore Transactions
            foreach ($transactionsList as $item) {
                $ref = $item['reference_number'] ?? $item['referenceNumber'] ?? $item['refNumber'] ?? ('ZIS-' . date('Ymd') . '-' . rand(1000, 9999));
                $bName = $item['bank_name'] ?? $item['bankName'] ?? null;
                $bankAccId = null;

                if ($bName) {
                    foreach ($allBanks as $ba) {
                        if (str_contains($bName, $ba->account_number)) {
                            $bankAccId = $ba->id;
                            break;
                        }
                    }
                    if (!$bankAccId && stripos($bName, 'BSI') !== false) {
                        $bsiAcc = $allBanks->first(fn($b) => stripos($b->bank_name, 'BSI') !== false);
                        if ($bsiAcc) $bankAccId = $bsiAcc->id;
                    }
                }
                
                Transaction::updateOrCreate(
                    ['reference_number' => $ref],
                    [
                        'date' => isset($item['date']) ? substr($item['date'], 0, 10) : now()->toDateString(),
                        'type' => $item['type'] ?? 'penerimaan',
                        'category' => $item['category'] ?? 'zakat_mal',
                        'fund_type' => $item['fund_type'] ?? $item['fundType'] ?? 'zakat',
                        'amount' => (float)($item['amount'] ?? 0),
                        'payment_method' => $item['payment_method'] ?? $item['paymentMethod'] ?? 'bank',
                        'bank_name' => $bName ?? 'BSI',
                        'bank_account_id' => $bankAccId,
                        'party_name' => $item['party_name'] ?? $item['partyName'] ?? 'Hamba Allah',
                        'asnaf' => isset($item['asnaf']) ? strtolower($item['asnaf']) : null,
                        'description' => $item['description'] ?? '-',
                        'status' => $item['status'] ?? 'Disetujui',
                        'verified_by' => $item['verified_by'] ?? $item['verifiedBy'] ?? null,
                        'approved_by' => $item['approved_by'] ?? $item['approvedBy'] ?? null,
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['transactions']++;
            }

            // 6. Restore Baznas Transactions
            foreach ($baznasList as $item) {
                BaznasTransaction::updateOrCreate(
                    [
                        'date' => isset($item['date']) ? substr($item['date'], 0, 10) : now()->toDateString(),
                        'amount' => (float)($item['amount'] ?? 0),
                        'description' => $item['description'] ?? 'Transaksi BAZNAS',
                    ],
                    [
                        'type' => $item['type'] ?? 'setor',
                        'category' => $item['category'] ?? 'Zakat Mal ASN',
                        'bank_account' => $item['bank_account'] ?? $item['bankAccount'] ?? 'Bank Jateng Syariah',
                        'status' => $item['status'] ?? 'Disetujui',
                        'created_at' => $item['created_at'] ?? $item['createdAt'] ?? now(),
                    ]
                );
                $counts['baznas_transactions']++;
            }

            // Log activity
            AuditLog::create([
                'user_id' => $request->user()?->id,
                'user_email' => $request->user()?->email ?? 'admin@kemenag.go.id',
                'user_role' => $request->user()?->role ?? 'Admin',
                'action' => 'RESTORE_DATABASE',
                'entity' => 'Database',
                'details' => "Restore data berhasil dari JSON ({$mode}): {$counts['muzakki']} Muzakki, {$counts['mustahik']} Mustahik, {$counts['transactions']} Transaksi dipulihkan ke MySQL.",
            ]);

            if (DB::transactionLevel() > 0) {
                DB::commit();
            }

            return response()->json([
                'success' => true,
                'message' => 'Pemulihan data berhasil! Seluruh data Firebase telah disinkronkan ke MySQL.',
                'restored_counts' => $counts,
            ]);
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulihkan database: ' . $e->getMessage(),
            ], 500);
        }
    }
}
