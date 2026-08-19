<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Helper: get approved fund balances
    private function getFundBalances(?string $dateEnd = null): array
    {
        $funds = ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'amil', 'non_halal'];
        $balances = [];
        foreach ($funds as $fund) {
            $q = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])->where('fund_type', $fund);
            if ($dateEnd) $q->where('date', '<=', $dateEnd);
            $in = (clone $q)->where('type', 'penerimaan')->sum('amount');
            $out = (clone $q)->whereIn('type', ['penyaluran', 'amil_operasional'])->sum('amount');
            $balances[$fund] = ['in' => $in, 'out' => $out, 'balance' => $in - $out];
        }
        return $balances;
    }

    // Laporan Posisi Keuangan (Neraca) PSAK 109
    public function posisiKeuangan(Request $request)
    {
        $date = $request->get('date', date('Y-m-d'));
        $balances = $this->getFundBalances($date);

        $data = [
            'report_type' => 'Laporan Posisi Keuangan (Neraca)',
            'date' => $date,
            'balances' => $balances,
            'total_aset' => array_sum(array_column($balances, 'balance')),
        ];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.posisi-keuangan', $data)
                ->setPaper('a4', 'portrait');
            return $pdf->download("laporan-posisi-keuangan-{$date}.pdf");
        }

        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'posisi-keuangan'), "laporan-posisi-keuangan-{$date}.xlsx");
        }

        return response()->json($data);
    }

    // Laporan Perubahan Dana PSAK 109
    public function perubahanDana(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));

        $funds = ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'amil', 'non_halal'];
        $report = [];

        foreach ($funds as $fund) {
            $q = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
                ->where('fund_type', $fund)
                ->whereBetween('date', [$dateFrom, $dateTo]);

            $penerimaan = (clone $q)->where('type', 'penerimaan')->sum('amount');
            $penyaluran = (clone $q)->where('type', 'penyaluran')->sum('amount');
            $operasional = (clone $q)->where('type', 'amil_operasional')->sum('amount');

            // Saldo awal
            $qAwal = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
                ->where('fund_type', $fund)->where('date', '<', $dateFrom);
            $saldoAwal = $qAwal->where('type', 'penerimaan')->sum('amount')
                - $qAwal->where('type', '!=', 'penerimaan')->sum('amount');

            $report[$fund] = [
                'saldo_awal' => $saldoAwal,
                'penerimaan' => $penerimaan,
                'penyaluran' => $penyaluran,
                'operasional' => $operasional,
                'saldo_akhir' => $saldoAwal + $penerimaan - $penyaluran - $operasional,
            ];
        }

        $data = ['report_type' => 'Laporan Perubahan Dana', 'date_from' => $dateFrom, 'date_to' => $dateTo, 'report' => $report];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.perubahan-dana', $data)->setPaper('a4', 'landscape');
            return $pdf->download("laporan-perubahan-dana.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'perubahan-dana'), "laporan-perubahan-dana.xlsx");
        }

        return response()->json($data);
    }

    // Laporan Arus Kas
    public function arusKas(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));

        $q = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])->whereBetween('date', [$dateFrom, $dateTo]);

        $tunaiMasuk = (clone $q)->where('type', 'penerimaan')->where('payment_method', 'tunai')->sum('amount');
        $bankMasuk  = (clone $q)->where('type', 'penerimaan')->where('payment_method', 'bank')->sum('amount');
        $tunaiKeluar = (clone $q)->whereIn('type', ['penyaluran', 'amil_operasional'])->where('payment_method', 'tunai')->sum('amount');
        $bankKeluar  = (clone $q)->whereIn('type', ['penyaluran', 'amil_operasional'])->where('payment_method', 'bank')->sum('amount');

        $data = [
            'report_type' => 'Laporan Arus Kas',
            'date_from' => $dateFrom, 'date_to' => $dateTo,
            'kas_masuk_tunai' => $tunaiMasuk, 'kas_masuk_bank' => $bankMasuk,
            'kas_keluar_tunai' => $tunaiKeluar, 'kas_keluar_bank' => $bankKeluar,
            'net_tunai' => $tunaiMasuk - $tunaiKeluar,
            'net_bank' => $bankMasuk - $bankKeluar,
            'net_total' => ($tunaiMasuk + $bankMasuk) - ($tunaiKeluar + $bankKeluar),
        ];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.arus-kas', $data)->setPaper('a4', 'portrait');
            return $pdf->download("laporan-arus-kas.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'arus-kas'), "laporan-arus-kas.xlsx");
        }

        return response()->json($data);
    }

    // Buku Kas Umum
    public function bukuKas(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));
        $paymentMethod = $request->get('payment_method', 'tunai');
        $fundType = $request->get('fund_type');

        $query = Transaction::with(['muzakki', 'mustahik', 'creator'])
            ->whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->where('payment_method', $paymentMethod)
            ->orderBy('date')->orderBy('id');

        if ($fundType) $query->where('fund_type', $fundType);

        $transactions = $query->get();

        $saldoAwal = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('payment_method', $paymentMethod)
            ->where('date', '<', $dateFrom)
            ->selectRaw("SUM(CASE WHEN type='penerimaan' THEN amount ELSE -amount END) as saldo")
            ->value('saldo') ?? 0;

        $data = [
            'report_type' => "Buku Kas " . ucfirst($paymentMethod),
            'date_from' => $dateFrom, 'date_to' => $dateTo,
            'payment_method' => $paymentMethod, 'fund_type' => $fundType,
            'saldo_awal' => $saldoAwal, 'transactions' => $transactions,
        ];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.buku-kas', $data)->setPaper('a4', 'landscape');
            return $pdf->download("buku-kas-{$paymentMethod}.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'buku-kas'), "buku-kas-{$paymentMethod}.xlsx");
        }

        return response()->json($data);
    }

    // Buku Besar (General Ledger)
    public function bukuBesar(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));

        $entries = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->orderBy('date')->orderBy('id')
            ->get()
            ->map(function ($t) {
                return [
                    'date' => $t->date->format('d/m/Y'),
                    'ref' => $t->reference_number,
                    'description' => $t->description,
                    'debit_account' => $t->type === 'penerimaan' ? 'Kas/Bank ' . ucfirst($t->fund_type) : 'Beban Penyaluran ' . ucfirst($t->fund_type),
                    'credit_account' => $t->type === 'penerimaan' ? 'Dana ' . ucfirst($t->fund_type) : 'Kas/Bank',
                    'debit' => $t->type === 'penerimaan' ? $t->amount : 0,
                    'credit' => $t->type !== 'penerimaan' ? $t->amount : 0,
                    'fund_type' => $t->fund_type,
                    'type' => $t->type,
                ];
            });

        $data = ['report_type' => 'Buku Besar (Jurnal Umum)', 'date_from' => $dateFrom, 'date_to' => $dateTo, 'entries' => $entries];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.buku-besar', $data)->setPaper('a4', 'landscape');
            return $pdf->download("buku-besar.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'buku-besar'), "buku-besar.xlsx");
        }

        return response()->json($data);
    }

    // Neraca Saldo (Trial Balance)
    public function neracaSaldo(Request $request)
    {
        $dateTo = $request->get('date_to', date('Y-m-d'));

        $funds = ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'amil', 'non_halal'];
        $accounts = [];
        $totalDebit = 0; $totalKredit = 0;

        foreach ($funds as $fund) {
            $q = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
                ->where('fund_type', $fund)->where('date', '<=', $dateTo);

            $penerimaan = (clone $q)->where('type', 'penerimaan')->sum('amount');
            $pengeluaran = (clone $q)->whereIn('type', ['penyaluran', 'amil_operasional'])->sum('amount');

            $label = match($fund) {
                'zakat' => 'Dana Zakat', 'infaq_terikat' => 'Dana Infak Terikat',
                'infaq_tidak_terikat' => 'Dana Infak Tidak Terikat', 'amil' => 'Dana Amil', 'non_halal' => 'Dana Non Halal',
            };

            $accounts[] = [
                'account' => "Kas/Bank {$label}", 'debit' => $penerimaan, 'kredit' => $pengeluaran, 'saldo_debit' => max(0, $penerimaan - $pengeluaran), 'saldo_kredit' => 0,
            ];
            $accounts[] = [
                'account' => $label, 'debit' => $pengeluaran, 'kredit' => $penerimaan, 'saldo_debit' => 0, 'saldo_kredit' => max(0, $penerimaan - $pengeluaran),
            ];
            $totalDebit += $penerimaan; $totalKredit += $penerimaan;
        }

        $data = ['report_type' => 'Neraca Saldo', 'date_to' => $dateTo, 'accounts' => $accounts, 'total_debit' => $totalDebit, 'total_kredit' => $totalKredit];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.neraca-saldo', $data)->setPaper('a4', 'portrait');
            return $pdf->download("neraca-saldo.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'neraca-saldo'), "neraca-saldo.xlsx");
        }

        return response()->json($data);
    }

    // Mutasi Kas & Bank
    public function mutasiKasBank(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));

        $tunai = $this->getMutasiByMethod('tunai', $dateFrom, $dateTo);
        $bank = $this->getMutasiByMethod('bank', $dateFrom, $dateTo);

        $data = ['report_type' => 'Mutasi Kas & Bank', 'date_from' => $dateFrom, 'date_to' => $dateTo, 'tunai' => $tunai, 'bank' => $bank];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.mutasi-kas-bank', $data)->setPaper('a4', 'landscape');
            return $pdf->download("mutasi-kas-bank.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'mutasi-kas-bank'), "mutasi-kas-bank.xlsx");
        }

        return response()->json($data);
    }

    private function getMutasiByMethod(string $method, string $from, string $to): array
    {
        $q = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])->where('payment_method', $method);
        $saldoAwal = (clone $q)->where('date', '<', $from)
            ->selectRaw("SUM(CASE WHEN type='penerimaan' THEN amount ELSE -amount END) as s")->value('s') ?? 0;
        $masuk = (clone $q)->where('type', 'penerimaan')->whereBetween('date', [$from, $to])->sum('amount');
        $keluar = (clone $q)->where('type', '!=', 'penerimaan')->whereBetween('date', [$from, $to])->sum('amount');
        return ['saldo_awal' => $saldoAwal, 'masuk' => $masuk, 'keluar' => $keluar, 'saldo_akhir' => $saldoAwal + $masuk - $keluar];
    }

    // Jurnal Umum (General Ledger entries list)
    public function jurnalUmum(Request $request)
    {
        $dateFrom = $request->get('date_from', date('Y-01-01'));
        $dateTo = $request->get('date_to', date('Y-12-31'));

        $transactions = Transaction::with(['muzakki', 'mustahik', 'bankAccount'])
            ->whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->orderBy('date')->orderBy('id')
            ->get();

        $data = ['report_type' => 'Jurnal Umum', 'date_from' => $dateFrom, 'date_to' => $dateTo, 'transactions' => $transactions];

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('reports.jurnal-umum', $data)->setPaper('a4', 'landscape');
            return $pdf->download("jurnal-umum.pdf");
        }
        if ($request->format === 'excel') {
            return Excel::download(new ReportExport($data, 'jurnal-umum'), "jurnal-umum.xlsx");
        }

        return response()->json($data);
    }
}
