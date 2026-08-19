@extends('reports.layout')

@section('content')
<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th colspan="2">1. Arus Kas Dari Aktivitas Penerimaan & Penyaluran Tunai</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Total Kas Masuk (Penerimaan Tunai)</td>
            <td class="text-right font-bold">{{ number_format($kas_masuk_tunai ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Total Kas Keluar (Penyaluran / Beban Tunai)</td>
            <td class="text-right font-bold">({{ number_format($kas_keluar_tunai ?? 0, 0, ',', '.') }})</td>
        </tr>
        <tr style="background: #f0f7f3;">
            <td><strong>Kenaikan / (Penurunan) Kas Tunai Bersih</strong></td>
            <td class="text-right font-bold"><strong>Rp {{ number_format($net_tunai ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tbody>
</table>

<table style="margin-bottom: 20px;">
    <thead>
        <tr>
            <th colspan="2">2. Arus Kas Dari Aktivitas Penerimaan & Penyaluran Rekening Bank</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Total Kas Masuk (Penerimaan Bank)</td>
            <td class="text-right font-bold">{{ number_format($kas_masuk_bank ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Total Kas Keluar (Penyaluran / Beban Bank)</td>
            <td class="text-right font-bold">({{ number_format($kas_keluar_bank ?? 0, 0, ',', '.') }})</td>
        </tr>
        <tr style="background: #f0f7f3;">
            <td><strong>Kenaikan / (Penurunan) Kas Bank Bersih</strong></td>
            <td class="text-right font-bold"><strong>Rp {{ number_format($net_bank ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tbody>
</table>

<table>
    <tfoot>
        <tr>
            <td><strong>TOTAL ARUS KAS BERSIH PERIODE INI</strong></td>
            <td class="text-right font-bold" style="font-size: 12px;"><strong>Rp {{ number_format($net_total ?? 0, 0, ',', '.') }}</strong></td>
        </tr>
    </tfoot>
</table>
@endsection
