@extends('reports.layout')

@section('content')
<h4 style="margin-bottom: 8px; color: #0d5c3a;">1. Rekonsiliasi Mutasi Kas Tunai (Bendahara)</h4>
<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th>Uraian Rekonsiliasi</th>
            <th class="text-right">Nominal (Rp)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Saldo Awal Kas Tunai</td>
            <td class="text-right font-bold">{{ number_format($tunai['saldo_awal'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Penerimaan Kas Tunai (+)</td>
            <td class="text-right">{{ number_format($tunai['masuk'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Pengeluaran / Penyaluran Kas Tunai (-)</td>
            <td class="text-right">({{ number_format($tunai['keluar'] ?? 0, 0, ',', '.') }})</td>
        </tr>
        <tr style="background: #eaf4ee;">
            <td><strong>Saldo Akhir Kas Tunai</strong></td>
            <td class="text-right font-bold" style="color: #0d5c3a;"><strong>Rp {{ number_format($tunai['saldo_akhir'] ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tbody>
</table>

<h4 style="margin-bottom: 8px; color: #0d5c3a;">2. Rekonsiliasi Mutasi Per Rekening Bank UPZ</h4>
<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th>Bank & No. Rekening</th>
            <th>Pos Peruntukan</th>
            <th class="text-right">Saldo Awal</th>
            <th class="text-right">Penerimaan (+)</th>
            <th class="text-right">Penyaluran (-)</th>
            <th class="text-right">Saldo Akhir</th>
        </tr>
    </thead>
    <tbody>
        @if(!empty($bank_accounts))
            @foreach($bank_accounts as $b)
                <tr>
                    <td><strong>Bank {{ $b['bank_name'] }}</strong><br><small>{{ $b['account_number'] }} ({{ $b['account_holder'] }})</small></td>
                    <td>{{ $b['fund_type'] ? 'Pos ' . strtoupper(str_replace('_', ' ', $b['fund_type'])) : 'Semua Pos' }}</td>
                    <td class="text-right">{{ number_format($b['saldo_awal'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($b['masuk'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">({{ number_format($b['keluar'] ?? 0, 0, ',', '.') }})</td>
                    <td class="text-right font-bold">{{ number_format($b['saldo_akhir'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        @else
            <tr>
                <td colspan="6" class="text-center">Belum ada rekening bank terdaftar</td>
            </tr>
        @endif
    </tbody>
    <tfoot>
        <tr style="background: #eaf4ee;">
            <td colspan="2"><strong>TOTAL SELURUH KAS BANK</strong></td>
            <td class="text-right font-bold">{{ number_format($bank['saldo_awal'] ?? 0, 0, ',', '.') }}</td>
            <td class="text-right font-bold">{{ number_format($bank['masuk'] ?? 0, 0, ',', '.') }}</td>
            <td class="text-right font-bold">({{ number_format($bank['keluar'] ?? 0, 0, ',', '.') }})</td>
            <td class="text-right font-bold" style="color: #0d5c3a;"><strong>Rp {{ number_format($bank['saldo_akhir'] ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tfoot>
</table>
@endsection
