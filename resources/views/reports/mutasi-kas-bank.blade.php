@extends('reports.layout')

@section('content')
<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th colspan="2">Rekonsiliasi Mutasi Kas Tunai</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Saldo Awal</td>
            <td class="text-right font-bold">{{ number_format($tunai['saldo_awal'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Penerimaan Kas Tunai (+)</td>
            <td class="text-right">{{ number_format($tunai['masuk'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Pengeluaran Kas Tunai (-)</td>
            <td class="text-right">({{ number_format($tunai['keluar'] ?? 0, 0, ',', '.') }})</td>
        </tr>
        <tr style="background: #eaf4ee;">
            <td><strong>Saldo Akhir Kas Tunai</strong></td>
            <td class="text-right font-bold" style="color: #0d5c3a;"><strong>Rp {{ number_format($tunai['saldo_akhir'] ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tbody>
</table>

<table>
    <thead>
        <tr>
            <th colspan="2">Rekonsiliasi Mutasi Kas Bank</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Saldo Awal</td>
            <td class="text-right font-bold">{{ number_format($bank['saldo_awal'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Penerimaan Kas Bank (+)</td>
            <td class="text-right">{{ number_format($bank['masuk'] ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Pengeluaran Kas Bank (-)</td>
            <td class="text-right">({{ number_format($bank['keluar'] ?? 0, 0, ',', '.') }})</td>
        </tr>
        <tr style="background: #eaf4ee;">
            <td><strong>Saldo Akhir Kas Bank</strong></td>
            <td class="text-right font-bold" style="color: #0d5c3a;"><strong>Rp {{ number_format($bank['saldo_akhir'] ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tbody>
</table>
@endsection
