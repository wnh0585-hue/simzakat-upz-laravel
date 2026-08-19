<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'category', 'target_amount', 'unit_amount', 'multiplier',
        'multiplier_label', 'period', 'description', 'setor_baznas',
        'baznas_return_percentage', 'baznas_return_amount',
    ];

    protected $casts = ['setor_baznas' => 'boolean', 'target_amount' => 'float'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getRealisasiAttribute()
    {
        return $this->transactions()
            ->whereIn('status', ['Disetujui', 'Tersalurkan'])
            ->where('type', 'penerimaan')
            ->sum('amount');
    }
}
