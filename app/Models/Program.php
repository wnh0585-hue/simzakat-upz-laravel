<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'fund_type', 'target_amount', 'unit_amount', 'multiplier',
        'multiplier_label', 'description', 'bidang', 'pic', 'waktu_kegiatan',
        'is_multi_fund', 'zakat_percentage', 'infaq_percentage',
        'zakat_target_amount', 'infaq_target_amount',
    ];

    protected $casts = ['is_multi_fund' => 'boolean', 'target_amount' => 'float'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getRealisasiAttribute()
    {
        return $this->transactions()
            ->where('status', 'Tersalurkan')
            ->sum('amount');
    }
}
