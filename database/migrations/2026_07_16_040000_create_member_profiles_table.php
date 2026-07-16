<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('membership_number')->nullable()->unique();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->date('birth_date')->nullable();
            $table->date('joined_at')->nullable();
            $table->string('classification')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->timestamps();
        });

        DB::table('users')->orderBy('id')->each(fn (object $user) => DB::table('member_profiles')->insert([
            'user_id' => $user->id,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]));
    }

    public function down(): void
    {
        Schema::dropIfExists('member_profiles');
    }
};
