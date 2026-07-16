<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AcceptInvitationController extends Controller
{
    public function show(string $token): Response
    {
        $invitation = $this->invitation($token);

        return Inertia::render('auth/accept-invitation', [
            'email' => $invitation->email,
            'token' => $token,
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->invitation($token);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($invitation, $validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $invitation->email,
                'password' => Hash::make($validated['password']),
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $user->memberProfile()->create();
            $user->assignRole($invitation->role);
            $invitation->update(['accepted_at' => now()]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();
        AuditEvent::record($request, 'invitation.accepted', $invitation, ['user_id' => $user->id]);

        return redirect()->route('members.show', $user)->with('success', 'Your account is ready.');
    }

    private function invitation(string $token): Invitation
    {
        return Invitation::where('token_hash', hash('sha256', $token))
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();
    }
}
