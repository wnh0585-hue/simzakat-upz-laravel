<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaznasTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'date', 'type', 'category', 'amount',
        'source_payment_method', 'source_bank_account', 'bank_account',
        'description', 'proof_name', 'proof_path', 'status',
        'split_amil', 'amil_percentage', 'amil_amount', 'mustahik_amount',
        'created_by',
    ];

    protected $casts = ['date' => 'date', 'amount' => 'float', 'split_amil' => 'boolean'];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
