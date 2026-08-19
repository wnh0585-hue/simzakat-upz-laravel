<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number', 'date', 'type', 'fund_type', 'amount',
        'payment_method', 'bank_name', 'bank_account_id', 'category',
        'muzakki_id', 'mustahik_id', 'party_name',
        'program_id', 'program_name', 'collection_plan_id', 'collection_plan_name',
        'asnaf', 'zakat_type', 'description', 'amil_allocation_amount',
        'status', 'created_by', 'verified_by', 'approved_by',
        'notes', 'proof_file_name', 'proof_file_path',
    ];

    protected $casts = ['date' => 'date', 'amount' => 'float'];

    public function muzakki() { return $this->belongsTo(Muzakki::class); }
    public function mustahik() { return $this->belongsTo(Mustahik::class); }
    public function program() { return $this->belongsTo(Program::class); }
    public function collectionPlan() { return $this->belongsTo(CollectionPlan::class); }
    public function bankAccount() { return $this->belongsTo(BankAccount::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function verifier() { return $this->belongsTo(User::class, 'verified_by'); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }

    public function scopeApproved($query) { return $query->whereIn('status', ['Disetujui', 'Tersalurkan']); }
    public function scopePenerimaan($query) { return $query->where('type', 'penerimaan'); }
    public function scopePenyaluran($query) { return $query->where('type', 'penyaluran'); }

    public static function generateReferenceNumber(string $type): string
    {
        $prefix = match($type) {
            'penerimaan' => 'BKM',
            'penyaluran' => 'BKK',
            default => 'OPS',
        };
        $year = date('Y');
        $count = self::where('reference_number', 'like', "{$prefix}-{$year}%")->count() + 1;
        return sprintf('%s-%s-%04d', $prefix, $year, $count);
    }
}
