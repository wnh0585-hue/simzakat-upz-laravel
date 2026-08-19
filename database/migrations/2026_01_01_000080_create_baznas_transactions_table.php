<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('baznas_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->enum('type', ['setor', 'pengembalian'])->default('setor');
            $table->string('category')->nullable(); // Zakat, Infak, Bagian Amil UPZ
            $table->decimal('amount', 18, 2);
            $table->enum('source_payment_method', ['tunai', 'bank'])->default('bank');
            $table->string('source_bank_account')->nullable();
            $table->string('bank_account'); // Rekening BAZNAS tujuan
            $table->text('description');
            $table->string('proof_name')->nullable();
            $table->string('proof_path')->nullable();
            $table->enum('status', ['Draft', 'Disetujui'])->default('Draft');
            $table->boolean('split_amil')->default(false);
            $table->decimal('amil_percentage', 5, 2)->nullable();
            $table->decimal('amil_amount', 18, 2)->nullable();
            $table->decimal('mustahik_amount', 18, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baznas_transactions');
    }
};
