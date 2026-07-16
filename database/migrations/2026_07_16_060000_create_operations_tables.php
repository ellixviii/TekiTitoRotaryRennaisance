<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operation_records', function (Blueprint $table) {
            $table->id();
            $table->string('module', 30)->index();
            $table->string('title');
            $table->string('category')->nullable()->index();
            $table->string('status', 30)->default('open')->index();
            $table->dateTime('starts_at')->nullable()->index();
            $table->dateTime('ends_at')->nullable();
            $table->decimal('amount', 18, 2)->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->longText('description')->nullable();
            $table->longText('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('attendance_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('operation_records')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_name')->nullable();
            $table->string('card_hash', 64)->nullable()->index();
            $table->dateTime('time_in');
            $table->dateTime('time_out')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
            $table->index(['event_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_entries');
        Schema::dropIfExists('operation_records');
    }
};
