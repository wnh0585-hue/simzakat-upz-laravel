<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_email')->nullable();
            $table->string('user_role')->nullable();
            $table->string('action'); // CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, LOGOUT
            $table->string('entity'); // muzakki, mustahik, transaction, etc.
            $table->string('entity_id')->nullable();
            $table->text('details');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
