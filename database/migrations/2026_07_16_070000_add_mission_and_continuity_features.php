<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotary_years', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });
        Schema::table('operation_records', function (Blueprint $table) {
            $table->foreignId('rotary_year_id')->nullable()->after('module')->constrained()->nullOnDelete();
            $table->unsignedInteger('beneficiaries_target')->nullable();
            $table->unsignedInteger('beneficiaries_actual')->nullable();
            $table->string('outcome_unit')->nullable();
            $table->decimal('outcome_target', 18, 2)->nullable();
            $table->decimal('outcome_actual', 18, 2)->nullable();
        });
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->constrained('operation_records')->nullOnDelete();
        });
        Schema::create('service_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('operation_records')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->date('served_on');
            $table->decimal('hours', 7, 2);
            $table->text('description')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('club_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rotary_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->string('responsibility');
            $table->string('assignment_type')->default('committee');
            $table->timestamps();
            $table->unique(['rotary_year_id', 'member_id', 'responsibility']);
        });
        Schema::create('member_onboarding_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mentor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('item');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_onboarding_items');
        Schema::dropIfExists('club_assignments');
        Schema::dropIfExists('service_hours');
        Schema::table('journal_entries', fn (Blueprint $table) => $table->dropConstrainedForeignId('project_id'));
        Schema::table('operation_records', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rotary_year_id');
            $table->dropColumn(['beneficiaries_target', 'beneficiaries_actual', 'outcome_unit', 'outcome_target', 'outcome_actual']);
        });
        Schema::dropIfExists('rotary_years');
    }
};
