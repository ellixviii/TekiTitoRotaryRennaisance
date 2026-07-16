<?php

namespace Tests\Feature;

use App\Models\AuditEvent;
use App\Models\Invitation;
use App\Models\User;
use App\Notifications\MemberInvitationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_list_members_and_member_cannot(): void
    {
        $admin = $this->admin();
        $member = $this->member();

        $this->actingAs($admin)->get(route('members.index'))->assertOk();
        $this->actingAs($member)->get(route('members.index'))->assertForbidden();
    }

    public function test_member_can_view_self_but_not_another_member(): void
    {
        $member = $this->member();
        $other = $this->member('other@example.com');

        $this->actingAs($member)->get(route('members.show', $member))
            ->assertInertia(fn (Assert $page) => $page->component('members/show')->where('member.id', $member->id));
        $this->actingAs($member)->get(route('members.show', $other))->assertForbidden();
    }

    public function test_administrator_can_send_a_hashed_expiring_invitation(): void
    {
        Notification::fake();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('invitations.create'), [
            'email' => 'invitee@example.com',
            'role' => 'Member',
        ])->assertRedirect();

        $invitation = Invitation::firstOrFail();
        $this->assertSame(64, strlen($invitation->getRawOriginal('token_hash')));
        $this->assertTrue($invitation->expires_at->isFuture());
        Notification::assertSentOnDemand(MemberInvitationNotification::class);
        $this->assertDatabaseHas('audit_events', ['action' => 'invitation.created', 'actor_id' => $admin->id]);
    }

    public function test_valid_invitation_creates_account_and_cannot_be_reused(): void
    {
        Role::findOrCreate('Member');
        $token = str_repeat('a', 64);
        $invitation = Invitation::create([
            'email' => 'new@example.com',
            'role' => 'Member',
            'token_hash' => hash('sha256', $token),
            'invited_by' => $this->admin()->id,
            'expires_at' => now()->addHour(),
        ]);

        $this->post(route('invitations.store', $token), [
            'name' => 'New Member',
            'password' => 'Strong-Member-2026!',
            'password_confirmation' => 'Strong-Member-2026!',
        ])->assertRedirect();

        $user = User::where('email', 'new@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertTrue(Hash::check('Strong-Member-2026!', $user->password));
        $this->assertTrue($user->hasRole('Member'));
        $this->assertNotNull($user->memberProfile);
        $this->assertNotNull($invitation->fresh()->accepted_at);
        $this->post(route('logout'));
        $this->post(route('invitations.store', $token), [])->assertNotFound();
    }

    public function test_member_cannot_change_administrator_owned_profile_fields(): void
    {
        $member = $this->member();
        $member->memberProfile()->update(['membership_number' => 'ORIGINAL']);

        $this->actingAs($member)->patch(route('members.update', $member), [
            'name' => 'Updated Member',
            'email' => $member->email,
            'phone' => '09171234567',
            'membership_number' => 'FORGED',
            'classification' => 'Forged',
        ])->assertRedirect();

        $this->assertSame('Updated Member', $member->fresh()->name);
        $this->assertSame('09171234567', $member->memberProfile->fresh()->phone);
        $this->assertSame('ORIGINAL', $member->memberProfile->fresh()->membership_number);
        $this->assertSame('member.updated', AuditEvent::latest('id')->first()->action);
    }

    public function test_suspended_member_cannot_open_member_area(): void
    {
        $member = $this->member();
        $member->memberProfile()->update(['status' => 'suspended']);

        $this->actingAs($member)->get(route('dashboard'))->assertForbidden();
    }

    private function admin(): User
    {
        Role::findOrCreate('Club Administrator');
        $user = User::factory()->create();
        $user->assignRole('Club Administrator');

        return $user;
    }

    private function member(string $email = 'member@example.com'): User
    {
        Role::findOrCreate('Member');
        $user = User::factory()->create(['email' => $email]);
        $user->memberProfile()->create();
        $user->assignRole('Member');

        return $user;
    }
}
