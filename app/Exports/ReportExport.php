<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ReportExport implements FromArray, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    private array $data;
    private string $type;

    public function __construct(array $data, string $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function title(): string
    {
        return match($this->type) {
            'posisi-keuangan' => 'Posisi Keuangan',
            'perubahan-dana' => 'Perubahan Dana',
            'arus-kas' => 'Arus Kas',
            'buku-kas' => 'Buku Kas',
            'buku-besar' => 'Buku Besar',
            'neraca-saldo' => 'Neraca Saldo',
            'mutasi-kas-bank' => 'Mutasi Kas Bank',
            'jurnal-umum' => 'Jurnal Umum',
            default => 'Laporan',
        };
    }

    public function headings(): array
    {
        return match($this->type) {
            'posisi-keuangan' => ['Kelompok Dana', 'Penerimaan (Rp)', 'Penyaluran (Rp)', 'Saldo (Rp)'],
            'perubahan-dana' => ['Kelompok Dana', 'Saldo Awal', 'Penerimaan', 'Penyaluran', 'Operasional', 'Saldo Akhir'],
            'buku-kas' => ['Tanggal', 'No. Ref', 'Keterangan', 'Pihak', 'Debit (Rp)', 'Kredit (Rp)'],
            'buku-besar' => ['Tanggal', 'Ref', 'Keterangan', 'Akun Debit', 'Akun Kredit', 'Debit (Rp)', 'Kredit (Rp)'],
            'neraca-saldo' => ['Nama Akun', 'Debit (Rp)', 'Kredit (Rp)', 'Saldo Debit (Rp)', 'Saldo Kredit (Rp)'],
            'jurnal-umum' => ['Tanggal', 'No. Ref', 'Keterangan', 'Pihak', 'Dana', 'Jenis', 'Debit (Rp)', 'Kredit (Rp)', 'Status'],
            'arus-kas' => ['Keterangan', 'Kas Tunai (Rp)', 'Kas Bank (Rp)'],
            'mutasi-kas-bank' => ['Keterangan', 'Kas Tunai (Rp)', 'Kas Bank (Rp)'],
            default => ['Keterangan', 'Nilai'],
        };
    }

    public function array(): array
    {
        $fundLabels = ['zakat'=>'Dana Zakat','infaq_terikat'=>'Dana Infak Terikat','infaq_tidak_terikat'=>'Dana Infak Tidak Terikat','amil'=>'Dana Amil','non_halal'=>'Dana Non Halal'];

        return match($this->type) {
            'posisi-keuangan' => collect($fundLabels)->map(function($label, $key) {
                $b = $this->data['balances'][$key] ?? ['in'=>0,'out'=>0,'balance'=>0];
                return [$label, $b['in'], $b['out'], $b['balance']];
            })->values()->toArray(),

            'perubahan-dana' => collect($fundLabels)->map(function($label, $key) {
                $r = $this->data['report'][$key] ?? [];
                return [$label, $r['saldo_awal']??0, $r['penerimaan']??0, $r['penyaluran']??0, $r['operasional']??0, $r['saldo_akhir']??0];
            })->values()->toArray(),

            'buku-kas' => collect($this->data['transactions'] ?? [])->map(fn($tx) => [
                $tx['date'] ?? '', $tx['reference_number'] ?? '', $tx['description'] ?? '',
                $tx['party_name'] ?? '', $tx['type']==='penerimaan'?$tx['amount']:0, $tx['type']!=='penerimaan'?$tx['amount']:0,
            ])->toArray(),

            'buku-besar' => collect($this->data['entries'] ?? [])->map(fn($e) => [
                $e['date']??'', $e['ref']??'', $e['description']??'', $e['debit_account']??'', $e['credit_account']??'', $e['debit']??0, $e['credit']??0,
            ])->toArray(),

            'neraca-saldo' => collect($this->data['accounts'] ?? [])->map(fn($a) => [
                $a['account']??'', $a['debit']??0, $a['kredit']??0, $a['saldo_debit']??0, $a['saldo_kredit']??0,
            ])->toArray(),

            'jurnal-umum' => collect($this->data['transactions'] ?? [])->map(fn($tx) => [
                $tx['date']??'', $tx['reference_number']??'', $tx['description']??'', $tx['party_name']??'',
                $tx['fund_type']??'', $tx['type']??'',
                $tx['type']==='penerimaan'?$tx['amount']:0, $tx['type']!=='penerimaan'?$tx['amount']:0, $tx['status']??'',
            ])->toArray(),

            'arus-kas' => [
                ['Kas Masuk (Penerimaan)', $this->data['kas_masuk_tunai']??0, $this->data['kas_masuk_bank']??0],
                ['Kas Keluar (Penyaluran)', $this->data['kas_keluar_tunai']??0, $this->data['kas_keluar_bank']??0],
                ['Arus Kas Bersih', $this->data['net_tunai']??0, $this->data['net_bank']??0],
            ],

            'mutasi-kas-bank' => [
                ['Saldo Awal', $this->data['tunai']['saldo_awal']??0, $this->data['bank']['saldo_awal']??0],
                ['Kas Masuk', $this->data['tunai']['masuk']??0, $this->data['bank']['masuk']??0],
                ['Kas Keluar', $this->data['tunai']['keluar']??0, $this->data['bank']['keluar']??0],
                ['Saldo Akhir', $this->data['tunai']['saldo_akhir']??0, $this->data['bank']['saldo_akhir']??0],
            ],

            default => [['Tidak ada data']],
        };
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1a5c42']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }
}
