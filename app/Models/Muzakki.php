<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Muzakki extends Model
{
    use HasFactory;

    protected $table = 'muzakki';

    protected $fillable = [
        'nik', 'name', 'phone', 'email', 'address',
        'type', 'nip', 'unit_kerja', 'golongan', 'status',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
