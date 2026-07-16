<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\AwardCategory;
use App\Models\AwardEntry;
use App\Models\OperationRecord;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AwardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('awards/index', ['categories' => AwardCategory::orderBy('name')->get(), 'entries' => AwardEntry::with(['category:id,name', 'recipient:id,name', 'event:id,title'])->latest('awarded_on')->get(), 'members' => User::orderBy('name')->get(['id', 'name']), 'events' => OperationRecord::where('module', 'awards')->orderBy('title')->get(['id', 'title'])]);
    }

    public function category(Request $request): RedirectResponse
    {
        $category = AwardCategory::create($request->validate(['name' => ['required', 'string', 'max:255', 'unique:award_categories'], 'description' => ['nullable', 'string', 'max:2000']]));
        AuditEvent::record($request, 'award-category.created', $category);

        return back()->with('success', 'Award category added.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['category_id' => ['required', 'exists:award_categories,id'], 'event_id' => ['nullable', 'exists:operation_records,id'], 'recipient_id' => ['nullable', 'exists:users,id', 'required_without:recipient_name'], 'recipient_name' => ['nullable', 'string', 'max:255', 'required_without:recipient_id'], 'award_name' => ['required', 'string', 'max:255'], 'awarded_on' => ['required', 'date'], 'citation' => ['nullable', 'string', 'max:10000']]);
        $entry = AwardEntry::create([...$data, 'created_by' => $request->user()->id]);
        AuditEvent::record($request, 'award.created', $entry);

        return back()->with('success', 'Recognition recorded.');
    }
}
