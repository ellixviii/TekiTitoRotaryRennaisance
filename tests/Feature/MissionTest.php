<?php

namespace Tests\Feature;

use App\Models\OperationRecord;
use App\Models\RotaryYear;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_record_project_impact_service_and_responsibility(): void
    {
        $admin = $this->user('Super Administrator');
        $member = $this->user('Member');
        $year = RotaryYear::create(['name' => '2026–2027', 'starts_on' => '2026-07-01', 'ends_on' => '2027-06-30']);
        $project = OperationRecord::create(['module' => 'projects', 'title' => 'Nutrition', 'status' => 'planned', 'created_by' => $admin->id]);

        $this->actingAs($admin)->patch("/mission/projects/{$project->id}", ['rotary_year_id' => $year->id, 'beneficiaries_actual' => 80, 'outcome_unit' => 'meals', 'outcome_actual' => 400])->assertRedirect();
        $this->actingAs($admin)->post('/mission/service-hours', ['project_id' => $project->id, 'member_id' => $member->id, 'served_on' => '2026-07-16', 'hours' => '3.5'])->assertRedirect();
        $this->actingAs($admin)->post('/mission/assignments', ['rotary_year_id' => $year->id, 'member_id' => $member->id, 'responsibility' => 'Service Committee', 'assignment_type' => 'committee'])->assertRedirect();

        $this->assertDatabaseHas('operation_records', ['id' => $project->id, 'beneficiaries_actual' => 80]);
        $this->assertDatabaseHas('service_hours', ['project_id' => $project->id, 'hours' => 3.5]);
        $this->assertDatabaseHas('club_assignments', ['member_id' => $member->id]);
    }

    public function test_member_cannot_access_private_engagement_report(): void
    {
        $this->actingAs($this->user('Member'))->get('/mission')->assertForbidden();
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
