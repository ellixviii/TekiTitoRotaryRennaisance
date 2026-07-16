<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OperationsController extends Controller
{
    private const MODULES = ['projects', 'awards', 'meetings', 'assets', 'payables', 'receivables', 'reminders'];

    public function index(Request $request, string $module): Response
    {
        $this->module($module);

        return Inertia::render('operations/index', [
            'module' => $module,
            'records' => OperationRecord::where('module', $module)->with('assignee:id,name')->latest('starts_at')->latest('id')->get(),
            'members' => User::orderBy('name')->get(['id', 'name']),
            'canManage' => Gate::allows('manage-operations'),
        ]);
    }

    public function store(Request $request, string $module): RedirectResponse
    {
        $this->module($module);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['open', 'planned', 'in_progress', 'completed', 'cancelled', 'paid', 'recognized'])],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'amount' => ['nullable', 'decimal:0,2', 'min:0'],
            'assigned_to' => ['nullable', 'exists:users,id'],
            'description' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:50000'],
        ]);
        $record = OperationRecord::create([...$data, 'module' => $module, 'created_by' => $request->user()->id]);
        AuditEvent::record($request, "{$module}.created", $record);

        return back()->with('success', 'Record created.');
    }

    public function update(Request $request, string $module, OperationRecord $record): RedirectResponse
    {
        abort_unless($record->module === $module, 404);
        $data = $request->validate(['status' => ['required', Rule::in(['open', 'planned', 'in_progress', 'completed', 'cancelled', 'paid', 'recognized'])], 'notes' => ['nullable', 'string', 'max:50000']]);
        $record->update($data);
        AuditEvent::record($request, "{$module}.updated", $record, $data);

        return back()->with('success', 'Record updated.');
    }

    public function destroy(Request $request, string $module, OperationRecord $record): RedirectResponse
    {
        abort_unless($record->module === $module, 404);
        AuditEvent::record($request, "{$module}.deleted", $record, ['title' => $record->title]);
        $record->delete();

        return back()->with('success', 'Record deleted.');
    }

    public function export(string $module): StreamedResponse
    {
        $this->module($module);

        return response()->streamDownload(function () use ($module) {
            $out = fopen('php://output', 'w');
            throw_if($out === false, new \RuntimeException('Unable to open export stream.'));
            fputcsv($out, ['Title', 'Category', 'Status', 'Start', 'End', 'Amount', 'Assignee', 'Description', 'Notes']);
            foreach (OperationRecord::where('module', $module)->with('assignee:id,name')->orderBy('id')->get() as $record) {
                fputcsv($out, [$record->title, $record->category, $record->status, $record->starts_at?->toDateTimeString(), $record->ends_at?->toDateTimeString(), $record->amount, $record->assignee?->name, $record->description, $record->notes]);
            }
            fclose($out);
        }, "{$module}.csv", ['Content-Type' => 'text/csv']);
    }

    private function module(string $module): void
    {
        abort_unless(in_array($module, self::MODULES, true), 404);
    }
}
