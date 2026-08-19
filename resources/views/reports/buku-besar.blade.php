@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Tgl</th>
            <th>No. Ref</th>
            <th>Keterangan</th>
            <th>Akun Debit</th>
            <th>Akun Kredit</th>
            <th class="text-right">Debit (Rp)</th>
            <th class="text-right">Kredit (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @php $tD = 0; $tK = 0; @endphp
        @forelse($entries ?? [] as $e)
            @php
                $tD += $e['debit'];
                $tK += $e['credit'];
            @endphp
            <tr>
                <td>{{ $e['date'] }}</td>
                <td>{{ $e['ref'] }}</td>
                <td>{{ $e['description'] }}</td>
                <td>{{ $e['debit_account'] }}</td>
                <td>{{ $e['credit_account'] }}</td>
                <td class="text-right">{{ $e['debit'] > 0 ? number_format($e['debit'], 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $e['credit'] > 0 ? number_format($e['credit'], 0, ',', '.') : '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="7" class="text-center">Belum ada jurnal transaksi</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="5">TOTAL</td>
            <td class="text-right">{{ number_format($tD, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($tK, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
