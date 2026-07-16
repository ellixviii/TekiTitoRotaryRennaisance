<?php

namespace Tests\Feature;

use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OperationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_project_and_member_cannot_access_operations(): void
    {
        $admin = $this->user('Super Administrator');
        $member = $this->user('Member');
        $this->actingAs($member)->get('/operations/projects')->assertForbidden();
        $this->actingAs($admin)->post('/operations/projects', ['title' => 'Water project', 'status' => 'planned'])->assertRedirect();
        $this->assertDatabaseHas('operation_records', ['module' => 'projects', 'title' => 'Water project']);
        $this->assertDatabaseHas('audit_events', ['action' => 'projects.created']);
    }

    public function test_rfid_tap_is_hashed_and_second_tap_records_time_out(): void
    {
        $admin = $this->user('Super Administrator');
        $event = OperationRecord::create(['module' => 'attendance', 'title' => 'Meeting', 'status' => 'planned', 'created_by' => $admin->id]);
        $this->actingAs($admin)->post("/attendance/{$event->id}/tap", ['card_id' => 'CARD-123'])->assertRedirect();
        $this->assertDatabaseMissing('attendance_entries', ['card_hash' => 'CARD-123']);
        $this->actingAs($admin)->post("/attendance/{$event->id}/tap", ['card_id' => 'CARD-123'])->assertRedirect();
        $this->assertNotNull($event->attendanceEntries()->first()->time_out);
    }

    public function test_auditor_can_view_audit_but_cannot_create_records(): void
    {
        $auditor = $this->user('Read-only Auditor');
        $this->actingAs($auditor)->get('/audit')->assertOk();
        $this->actingAs($auditor)->post('/operations/awards', ['title' => 'Service', 'status' => 'open'])->assertForbidden();
    }

    private function user(string $role): User
    {
        Role::findOrCreate($role);
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->memberProfile()->create(['status' => 'active']);
        $user->assignRole($role);

        return $user;
    }
}
