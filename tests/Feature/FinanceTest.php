<?php

namespace Tests\Feature;

use App\Models\AccountingPeriod;
use App\Models\FinancialAccount;
use App\Models\JournalEntry;
use App\Models\User;
use App\Services\JournalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_cannot_access_finance_and_treasurer_can(): void
    {
        $this->actingAs($this->userWithRole('Member'))->get(route('finance.index'))->assertForbidden();
        $this->actingAs($this->userWithRole('Treasurer'))->get(route('finance.index'))->assertOk();
    }

    public function test_journal_must_balance(): void
    {
        $this->expectException(ValidationException::class);
        app(JournalService::class)->create($this->entry(), [
            ['financial_account_id' => $this->account('1000', 'asset')->id, 'debit' => '100.00', 'credit' => 0],
            ['financial_account_id' => $this->account('4000', 'revenue')->id, 'debit' => 0, 'credit' => '99.99'],
        ], $this->userWithRole('Treasurer'));
    }

    public function test_preparer_cannot_approve_own_journal(): void
    {
        $treasurer = $this->userWithRole('Treasurer');
        $journal = $this->journal($treasurer);
        app(JournalService::class)->submit($journal);

        $this->expectException(ValidationException::class);
        app(JournalService::class)->approve($journal, $treasurer);
    }

    public function test_journal_can_be_approved_posted_and_reversed_without_editing_original_lines(): void
    {
        $treasurer = $this->userWithRole('Treasurer');
        $approver = $this->userWithRole('Finance Approver');
        $service = app(JournalService::class);
        $journal = $this->journal($treasurer);
        $originalLines = $journal->lines->map->only(['debit', 'credit'])->all();

        $service->submit($journal);
        $service->approve($journal, $approver);
        $service->post($journal);
        $reversal = $service->reverse($journal, $treasurer);

        $this->assertSame('reversed', $journal->fresh()->status);
        $this->assertSame('posted', $reversal->fresh()->status);
        $this->assertSame($journal->id, $reversal->reversal_of_id);
        $this->assertSame($originalLines, $journal->fresh()->lines->map->only(['debit', 'credit'])->all());
        $this->assertSame($journal->lines[0]->debit, $reversal->lines[0]->credit);
    }

    public function test_closed_period_cannot_be_posted(): void
    {
        AccountingPeriod::create(['name' => 'Closed', 'starts_on' => now()->startOfMonth(), 'ends_on' => now()->endOfMonth(), 'closed' => true]);
        $treasurer = $this->userWithRole('Treasurer');
        $journal = $this->journal($treasurer);
        $service = app(JournalService::class);
        $service->submit($journal);
        $service->approve($journal, $this->userWithRole('Finance Approver'));

        $this->expectException(ValidationException::class);
        $service->post($journal);
    }

    public function test_treasurer_can_administer_finance_and_download_pdf_report(): void
    {
        $treasurer = $this->userWithRole('Treasurer');

        $this->actingAs($treasurer)->post(route('finance.accounts.store'), ['code' => '5000', 'name' => 'Club supplies', 'type' => 'expense'])->assertRedirect();
        $this->actingAs($treasurer)->post(route('finance.banks.store'), ['name' => 'Club Bank', 'account_name' => 'Rotary Club', 'account_number' => '123456'])->assertRedirect();
        $response = $this->actingAs($treasurer)->get(route('finance.income-statement.pdf'));

        $response->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertDatabaseHas('financial_accounts', ['code' => '5000']);
        $this->assertDatabaseHas('audit_events', ['action' => 'finance.income-statement-pdf']);
    }

    private function journal(User $preparer): JournalEntry
    {
        return app(JournalService::class)->create($this->entry(), [
            ['financial_account_id' => $this->account('1000', 'asset')->id, 'debit' => '100.00', 'credit' => 0],
            ['financial_account_id' => $this->account('4000', 'revenue')->id, 'debit' => 0, 'credit' => '100.00'],
        ], $preparer);
    }

    /** @return array<string, string> */
    private function entry(): array
    {
        return ['entry_date' => now()->toDateString(), 'type' => 'revenue', 'party_name' => 'Test Party', 'description' => 'Test journal'];
    }

    private function account(string $code, string $type): FinancialAccount
    {
        return FinancialAccount::firstOrCreate(['code' => $code], ['name' => "Account {$code}", 'type' => $type]);
    }

    private function userWithRole(string $role): User
    {
        Role::findOrCreate($role);
        $user = User::factory()->create();
        $user->memberProfile()->create();
        $user->assignRole($role);

        return $user;
    }
}
