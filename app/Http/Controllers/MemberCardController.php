<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\MemberCard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MemberCardController extends Controller
{
    public function store(Request $request, User $member): RedirectResponse
    {
        $data = $request->validate(['card_id' => ['required', 'string', 'max:255'], 'label' => ['nullable', 'string', 'max:100']]);
        $hash = hash_hmac('sha256', $data['card_id'], config('app.key'));
        abort_if(MemberCard::where('card_hash', $hash)->whereNull('revoked_at')->exists(), 422, 'This card is already registered.');
        $card = MemberCard::create(['member_id' => $member->id, 'card_hash' => $hash, 'label' => $data['label'] ?? null, 'registered_by' => $request->user()->id]);
        AuditEvent::record($request, 'member-card.registered', $card, ['member_id' => $member->id]);

        return back()->with('success', 'Card registered.');
    }

    public function destroy(Request $request, User $member, MemberCard $card): RedirectResponse
    {
        abort_unless($card->member_id === $member->id, 404);
        $card->update(['revoked_at' => now()]);
        AuditEvent::record($request, 'member-card.revoked', $card);

        return back()->with('success', 'Card revoked.');
    }
}
