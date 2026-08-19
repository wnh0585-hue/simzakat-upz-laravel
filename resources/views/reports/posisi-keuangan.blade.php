@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Kelompok Dana</th>
            <th class="text-right">Penerimaan (Rp)</th>
            <th class="text-right">Penyaluran (Rp)</th>
            <th class="text-right">Saldo Akhir (Rp)</th>
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
        @endphp
        @foreach($labels as $key => $label)
            @php
                $b = $balances[$key] ?? ['in' => 0, 'out' => 0, 'balance' => 0];
                $totalIn += $b['in'];
                $totalOut += $b['out'];
            @endphp
            <tr>
                <td>{{ $label }}</td>
                <td class="text-right">{{ number_format($b['in'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($b['out'], 0, ',', '.') }}</td>
                <td class="text-right font-bold">{{ number_format($b['balance'], 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td>TOTAL ASET KELOLAAN</td>
            <td class="text-right">{{ number_format($totalIn, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($totalOut, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($total_aset ?? 0, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
