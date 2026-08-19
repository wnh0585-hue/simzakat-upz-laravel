<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->string('fund_type')->nullable()->after('type'); // zakat, infaq_terikat, infaq_tidak_terikat, amil, non_halal, umum
        });
    }

    public function down(): void
    {
        Schema::table('bank_accounts', function (Blueprint $table) {
            $table->dropColumn('fund_type');
        });
    }
};
