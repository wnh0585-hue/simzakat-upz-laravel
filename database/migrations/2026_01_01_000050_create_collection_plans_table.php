<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('collection_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', ['zakat_mal', 'zakat_fitrah', 'infaq_umum', 'infaq_terikat']);
            $table->decimal('target_amount', 18, 2)->default(0);
            $table->decimal('unit_amount', 18, 2)->nullable();
            $table->decimal('multiplier', 10, 2)->nullable();
            $table->string('multiplier_label')->nullable();
            $table->string('period')->nullable(); // e.g. "Tahun Buku 2026"
            $table->text('description')->nullable();
            $table->boolean('setor_baznas')->default(false);
            $table->decimal('baznas_return_percentage', 5, 2)->nullable();
            $table->decimal('baznas_return_amount', 18, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_plans');
    }
};
