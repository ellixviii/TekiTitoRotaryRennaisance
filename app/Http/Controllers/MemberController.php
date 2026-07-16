<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\JournalEntry;
use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemberController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $members = User::query()
            ->with(['memberProfile', 'roles:id,name'])
            ->when($search, fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhereHas('memberProfile', fn ($query) => $query->where('membership_number', 'like', "%{$search}%"))))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('members/index', [
            'members' => $members,
            'filters' => ['search' => $search],
            'roles' => ['Club Administrator', 'Treasurer', 'Finance Approver', 'Secretary', 'Project Chair', 'Member', 'Read-only Auditor'],
        ]);
    }

    public function show(Request $request, User $member): Response
    {
        Gate::authorize('view-member', $member);
        $member->load(['memberProfile', 'roles:id,name']);
        $member->memberProfile()->firstOrCreate();
        $member->load('memberProfile');
        AuditEvent::record($request, 'member.viewed', $member);

        return Inertia::render('members/show', [
            'member' => $member,
            'canManage' => Gate::allows('manage-members'),
            'transactions' => JournalEntry::where('member_id', $member->id)->whereIn('status', ['posted', 'reversed'])->with('lines')->latest('entry_date')->get(),
            'outstanding' => OperationRecord::whereIn('module', ['receivables', 'payables'])->where('assigned_to', $member->id)->whereNotIn('status', ['paid', 'cancelled'])->get(),
        ]);
    }

    public function update(Request $request, User $member): RedirectResponse
    {
        Gate::authorize('update-member', $member);
        $managesMembers = Gate::allows('manage-members');
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($member)],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'joined_at' => ['nullable', 'date'],
            'membership_number' => ['nullable', 'string', 'max:100', Rule::unique('member_profiles')->ignore($member->memberProfile?->id)],
            'classification' => ['nullable', 'string', 'max:255'],
        ]);

        $before = ['user' => $member->only('name', 'email'), 'profile' => $member->memberProfile?->toArray()];
        DB::transaction(function () use ($member, $validated, $managesMembers) {
            $emailChanged = $member->email !== $validated['email'];
            $member->update(['name' => $validated['name'], 'email' => $validated['email']]);
            if ($emailChanged) {
                $member->forceFill(['email_verified_at' => null])->save();
                $member->sendEmailVerificationNotification();
            }

            $profile = Arr::except($validated, ['name', 'email']);
            if (! $managesMembers) {
                $profile = Arr::except($profile, ['joined_at', 'membership_number', 'classification']);
            }
            $member->memberProfile()->updateOrCreate([], $profile);
        });

        AuditEvent::record($request, 'member.updated', $member, ['before' => $before]);

        return back()->with('success', 'Member profile updated.');
    }

    public function status(Request $request, User $member): RedirectResponse
    {
        abort_if($member->is($request->user()), 422, 'You cannot change your own status.');
        $validated = $request->validate(['status' => ['required', Rule::in(['active', 'suspended', 'archived'])]]);
        $profile = $member->memberProfile()->firstOrCreate();
        $oldStatus = $profile->status;
        $profile->update($validated);
        AuditEvent::record($request, 'member.status_changed', $member, ['from' => $oldStatus, 'to' => $profile->status]);

        return back()->with('success', 'Member status updated.');
    }

    public function export(Request $request): StreamedResponse
    {
        AuditEvent::record($request, 'members.exported');

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            throw_if($handle === false, \RuntimeException::class, 'Unable to open CSV output stream.');
            fputcsv($handle, ['Membership No.', 'Name', 'Email', 'Phone', 'Classification', 'Status', 'Joined']);
            User::with('memberProfile')->orderBy('name')->each(function (User $user) use ($handle) {
                $profile = $user->memberProfile;
                fputcsv($handle, [
                    self::safeCsv($profile?->membership_number),
                    self::safeCsv($user->name),
                    self::safeCsv($user->email),
                    self::safeCsv($profile?->phone),
                    self::safeCsv($profile?->classification),
                    $profile->status,
                    $profile?->joined_at?->toDateString(),
                ]);
            });
            fclose($handle);
        }, 'members-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    private static function safeCsv(?string $value): string
    {
        return preg_match('/^[=+\-@]/', $value ?? '') ? "'{$value}" : ($value ?? '');
    }
}
