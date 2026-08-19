<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'bank_name', 'account_number', 'account_holder', 'fund_type', 'description'];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getLabelAttribute(): string
    {
        return "{$this->bank_name} - {$this->account_number} ({$this->account_holder})";
    }
}
