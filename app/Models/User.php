<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'active', 'nip', 'unit_kerja'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
        ];
    }

    public function isAdmin(): bool { return $this->role === 'Admin'; }
    public function isOperator(): bool { return $this->role === 'Operator'; }
    public function isPimpinan(): bool { return $this->role === 'Pimpinan'; }
    public function isAuditor(): bool { return $this->role === 'Auditor'; }

    public function transactions() { return $this->hasMany(Transaction::class, 'created_by'); }
    public function auditLogs() { return $this->hasMany(AuditLog::class); }
}
