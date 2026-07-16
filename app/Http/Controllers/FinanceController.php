<?php

namespace App\Http\Controllers;

use App\Models\AuditEvent;
use App\Models\Bank;
use App\Models\FinancialAccount;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\JournalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $journals = JournalEntry::with(['preparer:id,name', 'member:id,name', 'lines'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest('entry_date')->latest('id')->paginate(15)->withQueryString();

        return Inertia::render('finance/index', [
            'journals' => $journals,
            'filters' => ['status' => $status],
            'canCreate' => $request->user()->can('create-finance'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('finance/create', [
            'accounts' => FinancialAccount::where('active', true)->orderBy('code')->get(['id', 'code', 'name', 'type']),
            'banks' => Bank::where('active', true)->orderBy('name')->get(['id', 'name', 'account_name']),
            'members' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request, JournalService $journals): RedirectResponse
    {
        $validated = $request->validate([
            'entry_date' => ['required', 'date'],
            'type' => ['required', Rule::in(['revenue', 'expense', 'general'])],
            'document_number' => ['nullable', 'string', 'max:100'],
            'party_name' => ['nullable', 'string', 'max:255', 'required_without:member_id'],
            'member_id' => ['nullable', 'exists:users,id'],
            'bank_id' => ['nullable', 'exists:banks,id'],
            'description' => ['required', 'string', 'max:2000'],
            'amount' => ['required', 'decimal:0,2', 'gt:0', 'max:999999999999.99'],
            'debit_account_id' => ['required', 'exists:financial_accounts,id', 'different:credit_account_id'],
            'credit_account_id' => ['required', 'exists:financial_accounts,id'],
        ]);

        $entry = [
            'entry_date' => $validated['entry_date'],
            'type' => $validated['type'],
            'document_number' => $validated['document_number'] ?? null,
            'party_name' => $validated['party_name'] ?? null,
            'member_id' => $validated['member_id'] ?? null,
            'bank_id' => $validated['bank_id'] ?? null,
            'description' => $validated['description'],
        ];

        $journal = $journals->create($entry, [
            ['financial_account_id' => $validated['debit_account_id'], 'debit' => $validated['amount'], 'credit' => 0],
            ['financial_account_id' => $validated['credit_account_id'], 'debit' => 0, 'credit' => $validated['amount']],
        ], $request->user());
        AuditEvent::record($request, 'journal.created', $journal, ['reference' => $journal->reference]);

        return redirect()->route('finance.show', $journal)->with('success', 'Draft journal created.');
    }

    public function show(JournalEntry $journal): Response
    {
        return Inertia::render('finance/show', [
            'journal' => $journal->load(['lines.account', 'preparer:id,name', 'approver:id,name', 'member:id,name', 'bank:id,name,account_name']),
            'permissions' => [
                'submit' => auth()->user()->can('create-finance'),
                'approve' => auth()->user()->can('approve-finance') && auth()->id() !== $journal->prepared_by,
                'post' => auth()->user()->can('post-finance'),
                'reverse' => auth()->user()->can('post-finance'),
            ],
        ]);
    }

    public function submit(Request $request, JournalEntry $journal, JournalService $service): RedirectResponse
    {
        $service->submit($journal);
        AuditEvent::record($request, 'journal.submitted', $journal);

        return back()->with('success', 'Journal submitted for approval.');
    }

    public function approve(Request $request, JournalEntry $journal, JournalService $service): RedirectResponse
    {
        $service->approve($journal, $request->user());
        AuditEvent::record($request, 'journal.approved', $journal);

        return back()->with('success', 'Journal approved.');
    }

    public function post(Request $request, JournalEntry $journal, JournalService $service): RedirectResponse
    {
        $service->post($journal);
        AuditEvent::record($request, 'journal.posted', $journal);

        return back()->with('success', 'Journal posted.');
    }

    public function reverse(Request $request, JournalEntry $journal, JournalService $service): RedirectResponse
    {
        $reversal = $service->reverse($journal, $request->user());
        AuditEvent::record($request, 'journal.reversed', $journal, ['reversal_id' => $reversal->id]);

        return redirect()->route('finance.show', $reversal)->with('success', 'Reversal posted.');
    }

    public function incomeStatement(Request $request): Response
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);
        $from = $validated['from'] ?? now()->startOfYear()->toDateString();
        $to = $validated['to'] ?? now()->toDateString();
        $rows = DB::table('financial_accounts as accounts')
            ->join('journal_lines as lines', 'lines.financial_account_id', '=', 'accounts.id')
            ->join('journal_entries as journals', 'journals.id', '=', 'lines.journal_entry_id')
            ->where('journals.status', 'posted')->whereBetween('journals.entry_date', [$from, $to])
            ->whereIn('accounts.type', ['revenue', 'expense'])
            ->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')
            ->selectRaw('accounts.code, accounts.name, accounts.type, SUM(lines.debit) as debits, SUM(lines.credit) as credits')
            ->orderBy('accounts.code')->get()->map(fn ($row) => [
                'code' => $row->code, 'name' => $row->name, 'type' => $row->type,
                'amount' => $row->type === 'revenue' ? (float) $row->credits - (float) $row->debits : (float) $row->debits - (float) $row->credits,
            ]);

        return Inertia::render('finance/income-statement', ['rows' => $rows, 'from' => $from, 'to' => $to]);
    }
}
