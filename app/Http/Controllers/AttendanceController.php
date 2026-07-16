<?php

namespace App\Http\Controllers;

use App\Models\AttendanceEntry;
use App\Models\AuditEvent;
use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('attendance/index', ['events' => OperationRecord::where('module', 'attendance')->withCount('attendanceEntries')->latest('starts_at')->get(), 'members' => User::orderBy('name')->get(['id', 'name'])]);
    }

    public function createEvent(Request $request): RedirectResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'starts_at' => ['required', 'date'], 'description' => ['nullable', 'string', 'max:2000']]);
        $event = OperationRecord::create([...$data, 'module' => 'attendance', 'status' => 'planned', 'created_by' => $request->user()->id]);
        AuditEvent::record($request, 'attendance.event.created', $event);

        return back()->with('success', 'Attendance event created.');
    }

    public function show(OperationRecord $event): Response
    {
        abort_unless($event->module === 'attendance', 404);

        return Inertia::render('attendance/show', ['event' => $event, 'entries' => $event->attendanceEntries()->with('member:id,name')->latest('time_in')->get(), 'members' => User::orderBy('name')->get(['id', 'name'])]);
    }

    public function tap(Request $request, OperationRecord $event): RedirectResponse
    {
        abort_unless($event->module === 'attendance', 404);
        $data = $request->validate(['member_id' => ['nullable', 'exists:users,id', 'required_without_all:guest_name,card_id'], 'guest_name' => ['nullable', 'string', 'max:255', 'required_without_all:member_id,card_id'], 'card_id' => ['nullable', 'string', 'max:255', 'required_without_all:member_id,guest_name']]);
        $cardHash = isset($data['card_id']) ? hash_hmac('sha256', $data['card_id'], config('app.key')) : null;
        $entry = AttendanceEntry::where('event_id', $event->id)->whereNull('time_out')->when($data['member_id'] ?? null, fn ($q, $id) => $q->where('member_id', $id))->when($cardHash, fn ($q) => $q->where('card_hash', $cardHash))->when($data['guest_name'] ?? null, fn ($q, $name) => $q->where('guest_name', $name))->latest()->first();
        if ($entry) {
            $entry->update(['time_out' => now()]);
        } else {
            $entry = AttendanceEntry::create(['event_id' => $event->id, 'member_id' => $data['member_id'] ?? null, 'guest_name' => $data['guest_name'] ?? ($cardHash ? 'RFID/NFC guest' : null), 'card_hash' => $cardHash, 'time_in' => now(), 'recorded_by' => $request->user()->id]);
        }
        AuditEvent::record($request, $entry->time_out ? 'attendance.time_out' : 'attendance.time_in', $entry);

        return back()->with('success', $entry->time_out ? 'Time out recorded.' : 'Time in recorded.');
    }

    public function export(OperationRecord $event): StreamedResponse
    {
        abort_unless($event->module === 'attendance', 404);

        return response()->streamDownload(function () use ($event) {
            $out = fopen('php://output', 'w');
            throw_if($out === false, new \RuntimeException('Unable to open export stream.'));
            fputcsv($out, ['Name', 'Time in (Manila)', 'Time out (Manila)']);
            foreach ($event->attendanceEntries()->with('member:id,name')->orderBy('time_in')->get() as $entry) {
                fputcsv($out, [$entry->member ? $entry->member->name : $entry->guest_name, $entry->time_in->toDateTimeString(), $entry->time_out?->toDateTimeString()]);
            }
            fclose($out);
        }, 'attendance-'.$event->id.'.csv', ['Content-Type' => 'text/csv']);
    }
}
