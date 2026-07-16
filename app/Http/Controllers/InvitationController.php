<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\Invitation;
use App\Notifications\MemberInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InvitationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['Club Administrator', 'Treasurer', 'Finance Approver', 'Secretary', 'Project Chair', 'Member', 'Read-only Auditor'])],
        ]);

        Invitation::where('email', $validated['email'])->whereNull('accepted_at')->delete();

        $token = Str::random(64);
        $invitation = Invitation::create([
            ...$validated,
            'email' => Str::lower($validated['email']),
            'token_hash' => hash('sha256', $token),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addHours(72),
        ]);

        Notification::route('mail', $invitation->email)
            ->notify(new MemberInvitationNotification(route('invitations.accept', $token)));

        AuditEvent::record($request, 'invitation.created', $invitation, ['email' => $invitation->email, 'role' => $invitation->role]);

        return back()->with('success', "Invitation sent to {$invitation->email}.");
    }
}
