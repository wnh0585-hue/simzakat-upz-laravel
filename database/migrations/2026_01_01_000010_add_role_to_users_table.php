<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Operator')->after('email'); // Operator, Admin, Pimpinan, Auditor
            $table->boolean('active')->default(true)->after('role');
            $table->string('nip')->nullable()->after('active');
            $table->string('unit_kerja')->nullable()->after('nip');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'active', 'nip', 'unit_kerja']);
        });
    }
};
