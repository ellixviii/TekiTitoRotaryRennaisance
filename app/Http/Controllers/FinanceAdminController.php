<?php

namespace App\Http\Controllers;

use App\Models\AccountingPeriod;
use App\Models\AuditEvent;
use App\Models\Bank;
use App\Models\FinancialAccount;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class FinanceAdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('finance/admin', ['banks' => Bank::orderBy('name')->get(), 'accounts' => FinancialAccount::orderBy('code')->get(), 'periods' => AccountingPeriod::latest('starts_on')->get()]);
    }

    public function bank(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'account_name' => ['required', 'string', 'max:255'], 'account_number' => ['nullable', 'string', 'max:100']]);
        $bank = Bank::create([...$data, 'active' => true]);
        AuditEvent::record($request, 'bank.created', $bank);

        return back()->with('success', 'Bank account added.');
    }

    public function account(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:30', 'unique:financial_accounts'], 'name' => ['required', 'string', 'max:255'], 'type' => ['required', Rule::in(['asset', 'liability', 'equity', 'revenue', 'expense'])]]);
        $account = FinancialAccount::create([...$data, 'active' => true]);
        AuditEvent::record($request, 'financial-account.created', $account);

        return back()->with('success', 'Account added.');
    }

    public function period(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100'], 'starts_on' => ['required', 'date'], 'ends_on' => ['required', 'date', 'after:starts_on']]);
        $period = AccountingPeriod::create($data);
        AuditEvent::record($request, 'accounting-period.created', $period);

        return back()->with('success', 'Accounting period added.');
    }

    public function togglePeriod(Request $request, AccountingPeriod $period): RedirectResponse
    {
        $period->update(['closed' => ! $period->closed]);
        AuditEvent::record($request, 'accounting-period.toggled', $period, ['closed' => $period->closed]);

        return back()->with('success', $period->closed ? 'Period closed.' : 'Period reopened.');
    }

    public function incomeStatementPdf(Request $request): HttpResponse
    {
        $data = $request->validate(['from' => ['nullable', 'date'], 'to' => ['nullable', 'date', 'after_or_equal:from']]);
        $from = $data['from'] ?? now()->startOfYear()->toDateString();
        $to = $data['to'] ?? now()->toDateString();
        $rows = DB::table('financial_accounts as accounts')->join('journal_lines as lines', 'lines.financial_account_id', '=', 'accounts.id')->join('journal_entries as journals', 'journals.id', '=', 'lines.journal_entry_id')->where('journals.status', 'posted')->whereBetween('journals.entry_date', [$from, $to])->whereIn('accounts.type', ['revenue', 'expense'])->groupBy('accounts.id', 'accounts.code', 'accounts.name', 'accounts.type')->selectRaw('accounts.code, accounts.name, accounts.type, SUM(lines.debit) as debits, SUM(lines.credit) as credits')->orderBy('accounts.code')->get();
        AuditEvent::record($request, 'finance.income-statement-pdf', null, ['from' => $from, 'to' => $to]);

        return Pdf::loadView('reports.income-statement', compact('rows', 'from', 'to'))->download("income-statement-{$from}-{$to}.pdf");
    }
}
