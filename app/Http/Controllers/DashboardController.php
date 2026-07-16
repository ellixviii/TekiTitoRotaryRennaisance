<?php

namespace App\Http\Controllers;

use App\Models\AttendanceEntry;
use App\Models\JournalEntry;
use App\Models\OperationRecord;
use App\Models\ServiceHour;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $days = in_array($request->integer('days'), [30, 90, 365], true) ? $request->integer('days') : 90;
        $since = now()->subDays($days);
        $user = $request->user();
        $operations = Gate::allows('view-operations');
        $manageOperations = Gate::allows('manage-operations');
        $finance = Gate::allows('view-finance');
        $selfHref = "/members/{$user->id}";
        $stats = [
            ['label' => 'My service hours', 'value' => ServiceHour::where('member_id', $user->id)->where('served_on', '>=', $since)->sum('hours'), 'href' => $operations ? '/mission' : $selfHref],
            ['label' => 'My attendance', 'value' => AttendanceEntry::where('member_id', $user->id)->where('time_in', '>=', $since)->count(), 'href' => $operations ? '/attendance' : $selfHref],
        ];

        if (Gate::allows('manage-members')) {
            $stats[] = ['label' => 'Active members', 'value' => User::whereHas('memberProfile', fn ($q) => $q->where('status', 'active'))->count(), 'href' => '/members'];
        }
        if ($operations) {
            $stats[] = ['label' => 'Open projects', 'value' => OperationRecord::where('module', 'projects')->whereNotIn('status', ['completed', 'cancelled'])->count(), 'href' => '/operations/projects'];
        }
        if ($finance) {
            $stats[] = ['label' => 'Posted journals', 'value' => JournalEntry::where('status', 'posted')->where('entry_date', '>=', $since)->count(), 'href' => '/finance'];
        }

        $attention = [];
        if (Gate::allows('approve-finance')) {
            $attention[] = ['label' => 'Journals awaiting approval', 'count' => JournalEntry::where('status', 'submitted')->count(), 'href' => '/finance?status=submitted'];
        }
        if ($operations) {
            $attention[] = ['label' => 'Overdue obligations', 'count' => OperationRecord::whereIn('module', ['payables', 'receivables'])->whereNotIn('status', ['paid', 'cancelled'])->where('ends_at', '<', now())->count(), 'href' => '/operations/payables'];
            $attention[] = ['label' => 'Projects missing outcomes', 'count' => OperationRecord::where('module', 'projects')->where('status', 'completed')->whereNull('beneficiaries_actual')->count(), 'href' => '/mission'];
        }

        return Inertia::render('dashboard', [
            'days' => $days,
            'manilaTime' => now()->format('M j, Y · g:i A'),
            'stats' => $stats,
            'attention' => array_values(array_filter($attention, fn ($item) => $item['count'] > 0)),
            'projects' => $operations ? OperationRecord::where('module', 'projects')->with('assignee:id,name')->latest()->limit(6)->get() : [],
            'upcoming' => $operations ? OperationRecord::whereIn('module', $manageOperations ? ['attendance', 'meetings', 'reminders'] : ['meetings', 'reminders'])->where('starts_at', '>=', now())->orderBy('starts_at')->limit(6)->get() : [],
            'permissions' => ['members' => Gate::allows('manage-members'), 'finance' => $finance, 'operations' => $operations, 'manageOperations' => $manageOperations, 'audit' => Gate::allows('view-audit')],
        ]);
    }
}
