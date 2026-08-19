<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('fund_type', ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'zakat_dan_infaq', 'amil']);
            $table->decimal('target_amount', 18, 2)->default(0);
            $table->decimal('unit_amount', 18, 2)->nullable();
            $table->decimal('multiplier', 10, 2)->nullable();
            $table->string('multiplier_label')->nullable();
            $table->text('description')->nullable();
            $table->enum('bidang', ['Pendidikan', 'Kesehatan', 'Kemanusiaan', 'Ekonomi', 'Dakwah-Advokasi'])->nullable();
            $table->string('pic')->nullable();
            $table->string('waktu_kegiatan')->nullable();
            $table->boolean('is_multi_fund')->default(false);
            $table->decimal('zakat_percentage', 5, 2)->nullable();
            $table->decimal('infaq_percentage', 5, 2)->nullable();
            $table->decimal('zakat_target_amount', 18, 2)->nullable();
            $table->decimal('infaq_target_amount', 18, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
