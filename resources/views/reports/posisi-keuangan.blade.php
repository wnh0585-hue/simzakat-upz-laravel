@extends('reports.layout')

@section('content')
<!-- 1. ASET KELOLAAN (KAS & BANK) -->
<h4 style="margin-bottom: 8px; color: #0d5c3a;">1. ASET LANCAR (KAS & SETARA KAS)</h4>
<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th>Pos Kas & Rekening Bank</th>
            <th>Peruntukan Pos Dana</th>
            <th class="text-right">Saldo Per Pelaporan (Rp)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Kas Tunai di Bendahara (Brankas UPZ)</strong></td>
            <td>Kas Fisik / Operasional</td>
            <td class="text-right font-bold">{{ number_format($kas_tunai ?? 0, 0, ',', '.') }}</td>
        </tr>
        @if(!empty($bank_accounts))
            @foreach($bank_accounts as $b)
                <tr>
                    <td style="padding-left: 20px;">
                        ↳ Bank {{ $b['bank_name'] }} - {{ $b['account_number'] }} ({{ $b['account_holder'] }})
                    </td>
                    <td>
                        {{ $b['fund_type'] ? 'Pos ' . strtoupper(str_replace('_', ' ', $b['fund_type'])) : 'Semua Pos Dana' }}
                    </td>
                    <td class="text-right">{{ number_format($b['balance'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        @endif
    </tbody>
    <tfoot>
        <tr style="background: #eaf4ee;">
            <td colspan="2"><strong>TOTAL KAS & SETARA KAS (ASET LANCAR)</strong></td>
            <td class="text-right font-bold" style="color: #0d5c3a; font-size: 13px;">
                <strong>Rp {{ number_format($total_aset ?? 0, 0, ',', '.') }}</strong>
            </td>
        </tr>
    </tfoot>
</table>

<!-- 2. SALDO DANA PSAK 109 -->
<h4 style="margin-bottom: 8px; color: #0d5c3a;">2. SALDO DANA KELOLAAN (PSAK 109)</h4>
<table>
    <thead>
        <tr>
            <th>Kelompok Dana</th>
            <th class="text-right">Penerimaan Akumulasi (Rp)</th>
            <th class="text-right">Penyaluran Akumulasi (Rp)</th>
            <th class="text-right">Saldo Akhir Dana (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @php
            $labels = [
                'zakat' => 'Dana Zakat',
                'infaq_terikat' => 'Dana Infak Terikat',
                'infaq_tidak_terikat' => 'Dana Infak Tidak Terikat',
                'amil' => 'Dana Amil',
                'non_halal' => 'Dana Non Halal',
            ];
            $totalIn = 0;
            $totalOut = 0;
            $totalSaldo = 0;
        @endphp
        @foreach($labels as $key => $label)
            @php
                $b = $balances[$key] ?? ['in' => 0, 'out' => 0, 'balance' => 0];
                $totalIn += $b['in'];
                $totalOut += $b['out'];
                $totalSaldo += $b['balance'];
            @endphp
            <tr>
                <td><strong>{{ $label }}</strong></td>
                <td class="text-right">{{ number_format($b['in'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($b['out'], 0, ',', '.') }}</td>
                <td class="text-right font-bold">{{ number_format($b['balance'], 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr style="background: #eaf4ee;">
            <td><strong>TOTAL SALDO DANA KELOLAAN</strong></td>
            <td class="text-right font-bold">{{ number_format($totalIn, 0, ',', '.') }}</td>
            <td class="text-right font-bold">{{ number_format($totalOut, 0, ',', '.') }}</td>
            <td class="text-right font-bold" style="color: #0d5c3a; font-size: 13px;">
                <strong>Rp {{ number_format($totalSaldo, 0, ',', '.') }}</strong>
            </td>
        </tr>
    </tfoot>
</table>

<div style="margin-top: 15px; font-size: 11px; color: #444; font-style: italic;">
    * Laporan Posisi Keuangan (Neraca) disusun berdasarkan kaidah PSAK 109. Total Kas & Setara Kas berimbang secara penuh dengan Total Saldo Dana Kelolaan.
</div>
@endsection
