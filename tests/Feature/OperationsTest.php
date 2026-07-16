<?php

namespace Tests\Feature;

use App\Models\AwardCategory;
use App\Models\MeetingAgendaItem;
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
        $member = $this->user('Member');
        $event = OperationRecord::create(['module' => 'attendance', 'title' => 'Meeting', 'status' => 'planned', 'created_by' => $admin->id]);
        $this->actingAs($admin)->post(route('members.cards.store', $member), ['card_id' => 'CARD-123'])->assertRedirect();
        $this->actingAs($admin)->post("/attendance/{$event->id}/tap", ['card_id' => 'CARD-123'])->assertRedirect();
        $this->assertDatabaseMissing('attendance_entries', ['card_hash' => 'CARD-123']);
        $this->actingAs($admin)->post("/attendance/{$event->id}/tap", ['card_id' => 'CARD-123'])->assertRedirect();
        $this->assertNotNull($event->attendanceEntries()->first()->time_out);
        $this->assertSame($member->id, $event->attendanceEntries()->first()->member_id);
    }

    public function test_unregistered_rfid_card_is_rejected(): void
    {
        $admin = $this->user('Super Administrator');
        $event = OperationRecord::create(['module' => 'attendance', 'title' => 'Meeting', 'status' => 'planned', 'created_by' => $admin->id]);

        $this->actingAs($admin)->post("/attendance/{$event->id}/tap", ['card_id' => 'UNKNOWN'])->assertUnprocessable();
        $this->assertDatabaseCount('attendance_entries', 0);
    }

    public function test_structured_meeting_minutes_and_awards_are_audited(): void
    {
        $admin = $this->user('Super Administrator');
        $meeting = OperationRecord::create(['module' => 'meetings', 'title' => 'Board meeting', 'status' => 'planned', 'created_by' => $admin->id]);
        $this->actingAs($admin)->post(route('meetings.agenda.store', $meeting), ['title' => 'Call to order'])->assertRedirect();
        $item = MeetingAgendaItem::firstOrFail();
        $this->actingAs($admin)->patch(route('meetings.agenda.update', [$meeting, $item]), ['discussion' => 'Quorum confirmed.', 'decision' => 'Meeting opened.'])->assertRedirect();
        $this->actingAs($admin)->post(route('awards.categories.store'), ['name' => 'Service'])->assertRedirect();
        $this->actingAs($admin)->post(route('awards.store'), ['category_id' => AwardCategory::first()->id, 'recipient_id' => $admin->id, 'award_name' => 'Service Above Self', 'awarded_on' => '2026-07-16'])->assertRedirect();

        $this->assertDatabaseHas('meeting_agenda_items', ['decision' => 'Meeting opened.']);
        $this->assertDatabaseHas('award_entries', ['award_name' => 'Service Above Self']);
        $this->assertDatabaseHas('audit_events', ['action' => 'award.created']);
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
