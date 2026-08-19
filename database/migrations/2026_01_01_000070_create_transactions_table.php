<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 30)->unique()->index(); // BKM-20260001 / BKK-20260001
            $table->date('date');
            $table->enum('type', ['penerimaan', 'penyaluran', 'amil_operasional']);
            $table->enum('fund_type', ['zakat', 'infaq_terikat', 'infaq_tidak_terikat', 'amil', 'non_halal']);
            $table->decimal('amount', 18, 2);
            $table->enum('payment_method', ['tunai', 'bank'])->default('tunai');
            $table->string('bank_name')->nullable();
            $table->foreignId('bank_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
            $table->string('category')->nullable();
            $table->foreignId('muzakki_id')->nullable()->constrained('muzakki')->nullOnDelete();
            $table->foreignId('mustahik_id')->nullable()->constrained('mustahik')->nullOnDelete();
            $table->string('party_name'); // cached name
            $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->string('program_name')->nullable();
            $table->foreignId('collection_plan_id')->nullable()->constrained('collection_plans')->nullOnDelete();
            $table->string('collection_plan_name')->nullable();
            $table->enum('asnaf', ['fakir', 'miskin', 'amil', 'muallaf', 'riqab', 'gharim', 'fisabilillah', 'ibnu_sabil'])->nullable();
            $table->enum('zakat_type', ['fitrah', 'mal_penghasilan', 'mal_emas_perak', 'mal_perdagangan', 'mal_tpg_tukin', 'lainnya'])->nullable();
            $table->text('description');
            $table->decimal('amil_allocation_amount', 18, 2)->nullable();
            $table->enum('status', ['Draft', 'Diajukan', 'Terverifikasi', 'Disetujui', 'Ditolak', 'Tersalurkan'])->default('Draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('proof_file_name')->nullable();
            $table->string('proof_file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
