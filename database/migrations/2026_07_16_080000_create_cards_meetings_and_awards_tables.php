<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->string('card_hash', 64)->unique();
            $table->string('label')->nullable();
            $table->dateTime('revoked_at')->nullable();
            $table->foreignId('registered_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('meeting_agenda_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained('operation_records')->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->string('title');
            $table->longText('discussion')->nullable();
            $table->longText('decision')->nullable();
            $table->foreignId('action_owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('due_on')->nullable();
            $table->timestamps();
            $table->unique(['meeting_id', 'position']);
        });
        Schema::create('award_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
        Schema::create('award_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('award_categories')->restrictOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('operation_records')->nullOnDelete();
            $table->foreignId('recipient_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recipient_name')->nullable();
            $table->string('award_name');
            $table->date('awarded_on');
            $table->text('citation')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('award_entries');
        Schema::dropIfExists('award_categories');
        Schema::dropIfExists('meeting_agenda_items');
        Schema::dropIfExists('member_cards');
    }
};
