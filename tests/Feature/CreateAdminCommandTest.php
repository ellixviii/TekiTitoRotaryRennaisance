<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_verified_super_administrator(): void
    {
        $this->artisan('app:create-admin')
            ->expectsQuestion('Full name', 'Initial Administrator')
            ->expectsQuestion('Email address', 'admin@example.com')
            ->expectsQuestion('Password', 'Strong-Admin-2026!')
            ->expectsOutput('Super Administrator created for admin@example.com.')
            ->assertSuccessful();

        $user = User::where('email', 'admin@example.com')->firstOrFail();

        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($user->memberProfile);
        $this->assertTrue($user->hasRole('Super Administrator'));
        $this->assertNotSame('Strong-Admin-2026!', $user->password);
    }
}
