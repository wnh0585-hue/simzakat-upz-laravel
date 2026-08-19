@extends('reports.layout')

@section('content')
<p><strong>Buku Kas:</strong> {{ ucfirst($payment_method ?? 'tunai') }} | <strong>Saldo Awal:</strong> Rp {{ number_format($saldo_awal ?? 0, 0, ',', '.') }}</p>
<table>
    <thead>
        <tr>
            <th>Tgl</th>
            <th>No. Referensi</th>
            <th>Keterangan</th>
            <th>Pihak Terkait</th>
            <th class="text-right">Debit (Rp)</th>
            <th class="text-right">Kredit (Rp)</th>
            <th class="text-right">Saldo (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @php
            $curr = $saldo_awal ?? 0;
            $totD = 0;
            $totK = 0;
        @endphp
        @forelse($transactions ?? [] as $tx)
            @php
                $isD = ($tx->type === 'penerimaan');
                if ($isD) {
                    $curr += $tx->amount;
                    $totD += $tx->amount;
                } else {
                    $curr -= $tx->amount;
                    $totK += $tx->amount;
                }
            @endphp
            <tr>
                <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                <td>{{ $tx->reference_number }}</td>
                <td>{{ $tx->description }}</td>
                <td>{{ $tx->party_name }}</td>
                <td class="text-right">{{ $isD ? number_format($tx->amount, 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ !$isD ? number_format($tx->amount, 0, ',', '.') : '-' }}</td>
                <td class="text-right font-bold">{{ number_format($curr, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7" class="text-center">Tidak ada transaksi pada periode ini</td>
            </tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="4">TOTAL MUTASI & SALDO AKHIR</td>
            <td class="text-right">{{ number_format($totD, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($totK, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($curr, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
