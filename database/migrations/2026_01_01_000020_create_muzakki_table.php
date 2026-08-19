<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('muzakki', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 20)->nullable()->index();
            $table->string('name');
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->enum('type', ['individu', 'badan_usaha'])->default('individu');
            $table->string('nip', 20)->nullable();
            $table->string('unit_kerja')->nullable();
            $table->string('golongan', 10)->nullable();
            $table->enum('status', ['Muzakki', 'Munfiq', 'Keduanya'])->default('Muzakki');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('muzakki');
    }
};
