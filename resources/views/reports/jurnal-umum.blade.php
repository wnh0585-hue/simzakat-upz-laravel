@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Tgl</th>
            <th>No. Ref</th>
            <th>Keterangan</th>
            <th>Pihak Terkait</th>
            <th>Dana</th>
            <th>Jenis</th>
            <th class="text-right">Debit (Rp)</th>
            <th class="text-right">Kredit (Rp)</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @php
            $totD = 0;
            $totK = 0;
            $fLabels = ['zakat'=>'Zakat','infaq_terikat'=>'Infak Terikat','infaq_tidak_terikat'=>'Infak T. Terikat','amil'=>'Amil','non_halal'=>'Non Halal'];
        @endphp
        @forelse($transactions ?? [] as $tx)
            @php
                $isD = ($tx->type === 'penerimaan');
                if ($isD) $totD += $tx->amount; else $totK += $tx->amount;
            @endphp
            <tr>
                <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}</td>
                <td>{{ $tx->reference_number }}</td>
                <td>{{ $tx->description }}</td>
                <td>{{ $tx->party_name }}</td>
                <td>{{ $fLabels[$tx->fund_type] ?? $tx->fund_type }}</td>
                <td>{{ ucfirst($tx->type) }}</td>
                <td class="text-right">{{ $isD ? number_format($tx->amount, 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ !$isD ? number_format($tx->amount, 0, ',', '.') : '-' }}</td>
                <td>{{ $tx->status }}</td>
            </tr>
        @empty
            <tr><td colspan="9" class="text-center">Belum ada data jurnal</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="6">TOTAL</td>
            <td class="text-right">{{ number_format($totD, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($totK, 0, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
