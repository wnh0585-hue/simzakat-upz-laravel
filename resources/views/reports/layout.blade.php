<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report_type ?? 'Laporan Keuangan' }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            margin: 0;
            padding: 15px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0d5c3a;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header h2 {
            margin: 0;
            font-size: 15px;
            color: #0d5c3a;
            text-transform: uppercase;
        }
        .header h3 {
            margin: 3px 0;
            font-size: 13px;
            color: #333;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #0d5c3a;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            font-size: 10px;
            text-transform: uppercase;
        }
        td {
            padding: 5px 8px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 10px;
        }
        tr:nth-child(even) td {
            background-color: #f9fbf9;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        tfoot td {
            background-color: #eaf4ee !important;
            font-weight: bold;
            border-top: 2px solid #0d5c3a;
            border-bottom: 2px solid #0d5c3a;
        }
        .signatures {
            margin-top: 30px;
            width: 100%;
        }
        .signatures td {
            border: none;
            background: none !important;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>UPZ P Kankemenag Kab. Kebumen</h2>
        <h3>{{ $report_type ?? 'Laporan Keuangan PSAK 109' }}</h3>
        <p>Alamat: Jl. Pahlawan No. 123, Kebumen, Jawa Tengah | Telp: (0287) 381101</p>
        @if(isset($date))
            <p><strong>Per Tanggal:</strong> {{ \Carbon\Carbon::parse($date)->translatedFormat('d F Y') }}</p>
        @elseif(isset($date_from) && isset($date_to))
            <p><strong>Periode:</strong> {{ \Carbon\Carbon::parse($date_from)->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($date_to)->translatedFormat('d F Y') }}</p>
        @endif
    </div>

    @yield('content')

    <table class="signatures">
        <tr>
            <td class="text-center" style="width: 50%;">
                Mengetahui,<br>
                <strong>Ketua UPZ Kemenag Kebumen</strong>
                <br><br><br><br>
                ( .................................................. )<br>
                NIP. ..........................................
            </td>
            <td class="text-center" style="width: 50%;">
                Kebumen, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}<br>
                <strong>Bendahara / Amil Pelaksana</strong>
                <br><br><br><br>
                ( .................................................. )<br>
                NIP. ..........................................
            </td>
        </tr>
    </table>
</body>
</html>
