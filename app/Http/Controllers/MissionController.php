<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\ClubAssignment;
use App\Models\JournalEntry;
use App\Models\MemberOnboardingItem;
use App\Models\OperationRecord;
use App\Models\RotaryYear;
use App\Models\ServiceHour;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function index(Request $request): Response
    {
        $year = RotaryYear::find($request->integer('year')) ?? RotaryYear::where('archived', false)->latest('starts_on')->first();
        $projects = OperationRecord::where('module', 'projects')->when($year, fn ($q) => $q->where('rotary_year_id', $year->id))->with('assignee:id,name')->get()->map(fn ($project) => [
            ...$project->toArray(),
            'service_hours' => ServiceHour::where('project_id', $project->id)->sum('hours'),
            'cost' => JournalEntry::where('project_id', $project->id)->whereIn('status', ['posted', 'reversed'])->withSum('lines as debit_total', 'debit')->get()->sum('debit_total'),
        ]);
        $members = User::orderBy('name')->get(['id', 'name'])->map(fn ($member) => [
            ...$member->toArray(),
            'service_hours' => ServiceHour::where('member_id', $member->id)->where('served_on', '>=', now()->subMonths(3))->sum('hours'),
            'recent_attendance' => DB::table('attendance_entries')->where('member_id', $member->id)->where('time_in', '>=', now()->subMonths(3))->count(),
            'assignments_count' => ClubAssignment::where('member_id', $member->id)->count(),
        ]);

        return Inertia::render('mission/index', ['years' => RotaryYear::latest('starts_on')->get(), 'year' => $year, 'projects' => $projects, 'members' => $members, 'assignments' => ClubAssignment::with('member:id,name')->when($year, fn ($q) => $q->where('rotary_year_id', $year->id))->get(), 'onboarding' => MemberOnboardingItem::latest()->get()]);
    }

    public function year(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:50', 'unique:rotary_years'], 'starts_on' => ['required', 'date'], 'ends_on' => ['required', 'date', 'after:starts_on']]);
        $year = RotaryYear::create($data);
        AuditEvent::record($request, 'rotary-year.created', $year);

        return back()->with('success', 'Rotary year created.');
    }

    public function archive(Request $request, RotaryYear $year): RedirectResponse
    {
        $year->update(['archived' => ! $year->archived]);
        AuditEvent::record($request, 'rotary-year.archive-toggled', $year, ['archived' => $year->archived]);

        return back();
    }

    public function outcome(Request $request, OperationRecord $project): RedirectResponse
    {
        abort_unless($project->module === 'projects', 404);
        $data = $request->validate(['rotary_year_id' => ['nullable', 'exists:rotary_years,id'], 'beneficiaries_target' => ['nullable', 'integer', 'min:0'], 'beneficiaries_actual' => ['nullable', 'integer', 'min:0'], 'outcome_unit' => ['nullable', 'string', 'max:100'], 'outcome_target' => ['nullable', 'decimal:0,2', 'min:0'], 'outcome_actual' => ['nullable', 'decimal:0,2', 'min:0']]);
        $project->update($data);
        AuditEvent::record($request, 'project.impact-updated', $project, $data);

        return back()->with('success', 'Project impact updated.');
    }

    public function service(Request $request): RedirectResponse
    {
        $data = $request->validate(['project_id' => ['required', 'exists:operation_records,id'], 'member_id' => ['required', 'exists:users,id'], 'served_on' => ['required', 'date'], 'hours' => ['required', 'decimal:0,2', 'gt:0', 'max:24'], 'description' => ['nullable', 'string', 'max:1000']]);
        $hour = ServiceHour::create([...$data, 'recorded_by' => $request->user()->id]);
        AuditEvent::record($request, 'service-hours.logged', $hour);

        return back()->with('success', 'Service hours logged.');
    }

    public function assignment(Request $request): RedirectResponse
    {
        $data = $request->validate(['rotary_year_id' => ['required', 'exists:rotary_years,id'], 'member_id' => ['required', 'exists:users,id'], 'responsibility' => ['required', 'string', 'max:255'], 'assignment_type' => ['required', 'in:officer,committee']]);
        $item = ClubAssignment::firstOrCreate($data);
        AuditEvent::record($request, 'club-assignment.created', $item);

        return back()->with('success', 'Responsibility assigned.');
    }

    public function onboarding(Request $request): RedirectResponse
    {
        $data = $request->validate(['member_id' => ['required', 'exists:users,id'], 'mentor_id' => ['nullable', 'exists:users,id', 'different:member_id'], 'item' => ['required', 'string', 'max:255']]);
        $item = MemberOnboardingItem::create($data);
        AuditEvent::record($request, 'onboarding-item.created', $item);

        return back()->with('success', 'Onboarding item added.');
    }

    public function completeOnboarding(Request $request, MemberOnboardingItem $item): RedirectResponse
    {
        $item->update(['completed_at' => $item->completed_at ? null : now()]);
        AuditEvent::record($request, 'onboarding-item.toggled', $item);

        return back();
    }
}
