<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.is_admin', false));
    }

    public function test_administrator_role_is_shared_with_the_frontend(): void
    {
        Role::findOrCreate('Club Administrator');
        $user = User::factory()->create();
        $user->assignRole('Club Administrator');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.is_admin', true));
    }

    public function test_unverified_super_administrator_bypasses_email_verification(): void
    {
        Role::findOrCreate('Super Administrator');
        $user = User::factory()->unverified()->create();
        $user->assignRole('Super Administrator');

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
    }

    public function test_unverified_regular_member_still_requires_email_verification(): void
    {
        Role::findOrCreate('Member');
        $user = User::factory()->unverified()->create();
        $user->assignRole('Member');

        $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('verification.notice'));
    }
}
