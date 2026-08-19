@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Nama Akun</th>
            <th class="text-right">Debit (Rp)</th>
            <th class="text-right">Kredit (Rp)</th>
            <th class="text-right">Saldo Debit (Rp)</th>
            <th class="text-right">Saldo Kredit (Rp)</th>
        </tr>
    </thead>
    <tbody>
        @forelse($accounts ?? [] as $a)
            <tr>
                <td>{{ $a['account'] }}</td>
                <td class="text-right">{{ $a['debit'] > 0 ? number_format($a['debit'], 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $a['kredit'] > 0 ? number_format($a['kredit'], 0, ',', '.') : '-' }}</td>
                <td class="text-right font-bold">{{ $a['saldo_debit'] > 0 ? number_format($a['saldo_debit'], 0, ',', '.') : '-' }}</td>
                <td class="text-right font-bold">{{ $a['saldo_kredit'] > 0 ? number_format($a['saldo_kredit'], 0, ',', '.') : '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="5" class="text-center">Tidak ada data neraca saldo</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td>TOTAL</td>
            <td class="text-right">{{ number_format($total_debit ?? 0, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($total_kredit ?? 0, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($total_debit ?? 0, 0, ',', '.') }}</td>
            <td class="text-right">{{ number_format($total_kredit ?? 0, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endsection
