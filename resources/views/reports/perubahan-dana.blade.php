@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Kelompok Dana</th>
            <th class="text-right">Saldo Awal (Rp)</th>
            <th class="text-right">Penerimaan (Rp)</th>
            <th class="text-right">Penyaluran (Rp)</th>
            <th class="text-right">Beban Operasional (Rp)</th>
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
            $tAwal = 0; $tIn = 0; $tOut = 0; $tOps = 0; $tAkhir = 0;
        @endphp
        @foreach($labels as $key => $label)
            @php
                $r = $report[$key] ?? ['saldo_awal' => 0, 'penerimaan' => 0, 'penyaluran' => 0, 'operasional' => 0, 'saldo_akhir' => 0];
                $tAwal += $r['saldo_awal'];
                $tIn += $r['penerimaan'];
                $tOut += $r['penyaluran'];
                $tOps += $r['operasional'];
                $tAkhir += $r['saldo_akhir'];
            @endphp
            <tr>
                <td>{{ $label }}</td>
                <td class="text-right">{{ number_format($r['saldo_awal'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($r['penerimaan'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($r['penyaluran'], 0, ',', '.') }}</td>
                <td class="text-right">{{ number_format($r['operasional'], 0, ',', '.') }}</td>
                <td class="text-right font-bold">{{ number_format($r['saldo_akhir'], 0, ',', '.') }}</td>
            </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td>TOTAL</td>
            <td class="text-right">{{ number_format($tAwal, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($tIn, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($tOut, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($tOps, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($tAkhir, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
