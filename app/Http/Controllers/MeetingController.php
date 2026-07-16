<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\MeetingAgendaItem;
use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeetingController extends Controller
{
    public function show(OperationRecord $meeting): Response
    {
        abort_unless($meeting->module === 'meetings', 404);

        return Inertia::render('meetings/show', [
            'meeting' => $meeting,
            'items' => MeetingAgendaItem::where('meeting_id', $meeting->id)->with('owner:id,name')->orderBy('position')->get(),
            'members' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, OperationRecord $meeting): RedirectResponse
    {
        abort_unless($meeting->module === 'meetings', 404);
        $data = $request->validate(['title' => ['required', 'string', 'max:255']]);
        $item = MeetingAgendaItem::create([...$data, 'meeting_id' => $meeting->id, 'position' => ((int) MeetingAgendaItem::where('meeting_id', $meeting->id)->max('position')) + 1]);
        AuditEvent::record($request, 'meeting.agenda-created', $item);

        return back()->with('success', 'Agenda item added.');
    }

    public function update(Request $request, OperationRecord $meeting, MeetingAgendaItem $item): RedirectResponse
    {
        abort_unless($meeting->module === 'meetings' && $item->meeting_id === $meeting->id, 404);
        $data = $request->validate(['discussion' => ['nullable', 'string', 'max:20000'], 'decision' => ['nullable', 'string', 'max:10000'], 'action_owner_id' => ['nullable', 'exists:users,id'], 'due_on' => ['nullable', 'date']]);
        $item->update($data);
        AuditEvent::record($request, 'meeting.minutes-updated', $item);

        return back()->with('success', 'Minutes saved.');
    }
}
