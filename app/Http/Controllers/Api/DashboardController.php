<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Muzakki;
use App\Models\Mustahik;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->get('year', date('Y'));

        // Fund balances from approved/distributed transactions
        $approved = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan']);

        $balances = [
            'zakat' => 0,
            'infaq_terikat' => 0,
            'infaq_tidak_terikat' => 0,
            'amil' => 0,
            'non_halal' => 0,
        ];

        foreach (array_keys($balances) as $fund) {
            $in = (clone $approved)->where('fund_type', $fund)->where('type', 'penerimaan')->sum('amount');
            $out = (clone $approved)->where('fund_type', $fund)->whereIn('type', ['penyaluran', 'amil_operasional'])->sum('amount');
            $balances[$fund] = $in - $out;
        }

        // Monthly income for chart (current year)
        $monthlyIncome = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penerimaan')
            ->whereYear('date', $year)
            ->selectRaw('MONTH(date) as month, fund_type, SUM(amount) as total')
            ->groupBy('month', 'fund_type')
            ->orderBy('month')
            ->get();

        // Monthly distribution for chart
        $monthlyDist = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penyaluran')
            ->whereYear('date', $year)
            ->selectRaw('MONTH(date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // KPI
        $totalPenerimaan = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penerimaan')->whereYear('date', $year)->sum('amount');
        $totalPenyaluran = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penyaluran')->whereYear('date', $year)->sum('amount');

        // Distribution by asnaf
        $asnafDist = Transaction::whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penyaluran')
            ->whereNotNull('asnaf')
            ->whereYear('date', $year)
            ->selectRaw('asnaf, SUM(amount) as total')
            ->groupBy('asnaf')
            ->get();

        // Pending transactions count
        $pendingCount = Transaction::whereIn('status', ['Draft', 'Diajukan', 'Terverifikasi'])->count();

        // Recent transactions
        $recent = Transaction::with(['creator'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'fund_balances' => $balances,
            'total_penerimaan' => $totalPenerimaan,
            'total_penyaluran' => $totalPenyaluran,
            'saldo_bersih' => $totalPenerimaan - $totalPenyaluran,
            'monthly_income' => $monthlyIncome,
            'monthly_distribution' => $monthlyDist,
            'asnaf_distribution' => $asnafDist,
            'pending_count' => $pendingCount,
            'muzakki_count' => Muzakki::count(),
            'mustahik_count' => Mustahik::count(),
            'program_count' => Program::count(),
            'recent_transactions' => $recent,
        ]);
    }
}
