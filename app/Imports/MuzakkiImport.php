<?php

namespace App\Imports;

use App\Models\Muzakki;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;

class MuzakkiImport implements ToModel, WithHeadingRow, SkipsEmptyRows
{
    public function __construct(private User $importedBy) {}

    public function model(array $row): ?Muzakki
    {
        if (empty($row['nama']) && empty($row['name'])) return null;

        return new Muzakki([
            'name'       => $row['nama'] ?? $row['name'] ?? '',
            'nik'        => $row['nik'] ?? null,
            'nip'        => $row['nip'] ?? null,
            'phone'      => $row['telepon'] ?? $row['phone'] ?? null,
            'email'      => $row['email'] ?? null,
            'address'    => $row['alamat'] ?? $row['address'] ?? null,
            'type'       => in_array($row['tipe'] ?? '', ['individu','badan_usaha']) ? ($row['tipe'] ?? 'individu') : 'individu',
            'unit_kerja' => $row['unit_kerja'] ?? $row['satker'] ?? null,
            'golongan'   => $row['golongan'] ?? null,
            'status'     => in_array($row['status'] ?? '', ['Muzakki','Munfiq','Keduanya']) ? ($row['status'] ?? 'Muzakki') : 'Muzakki',
        ]);
    }
}
