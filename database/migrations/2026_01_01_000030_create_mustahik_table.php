<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mustahik', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 20)->nullable()->index();
            $table->string('name');
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->enum('asnaf', ['fakir', 'miskin', 'amil', 'muallaf', 'riqab', 'gharim', 'fisabilillah', 'ibnu_sabil']);
            $table->enum('type', ['individu', 'lembaga'])->default('individu');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mustahik');
    }
};
