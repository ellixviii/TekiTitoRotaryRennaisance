<?php

namespace App\Services;

use App\Models\AccountingPeriod;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JournalService
{
    /**
     * @param  array<string, mixed>  $entry
     * @param  array<int, array<string, mixed>>  $lines
     */
    public function create(array $entry, array $lines, User $preparer): JournalEntry
    {
        $this->assertBalanced($lines);

        return DB::transaction(function () use ($entry, $lines, $preparer) {
            $lastId = JournalEntry::query()->lockForUpdate()->max('id') ?? 0;
            $journal = JournalEntry::create([
                ...$entry,
                'reference' => 'JE-'.now()->format('Y').'-'.str_pad((string) ($lastId + 1), 6, '0', STR_PAD_LEFT),
                'prepared_by' => $preparer->id,
                'status' => 'draft',
            ]);
            $journal->lines()->createMany($lines);

            return $journal->load('lines.account');
        }, 3);
    }

    public function submit(JournalEntry $journal): JournalEntry
    {
        $this->expectStatus($journal, 'draft');
        $journal->update(['status' => 'submitted']);

        return $journal;
    }

    public function approve(JournalEntry $journal, User $approver): JournalEntry
    {
        $this->expectStatus($journal, 'submitted');
        throw_if($journal->prepared_by === $approver->id, ValidationException::withMessages(['journal' => 'The preparer cannot approve this journal.']));
        $journal->update(['status' => 'approved', 'approved_by' => $approver->id, 'approved_at' => now()]);

        return $journal;
    }

    public function post(JournalEntry $journal): JournalEntry
    {
        return DB::transaction(function () use ($journal) {
            $journal = JournalEntry::query()->lockForUpdate()->findOrFail($journal->id);
            $this->expectStatus($journal, 'approved');
            throw_if(AccountingPeriod::where('closed', true)->whereDate('starts_on', '<=', $journal->entry_date)->whereDate('ends_on', '>=', $journal->entry_date)->exists(), ValidationException::withMessages(['journal' => 'The accounting period is closed.']));
            $this->assertBalanced($journal->lines()->get(['debit', 'credit'])->toArray());
            $journal->update(['status' => 'posted', 'posted_at' => now()]);

            return $journal;
        });
    }

    public function reverse(JournalEntry $journal, User $user): JournalEntry
    {
        return DB::transaction(function () use ($journal, $user) {
            $journal = JournalEntry::with('lines')->lockForUpdate()->findOrFail($journal->id);
            $this->expectStatus($journal, 'posted');
            $reversal = $this->create([
                'entry_date' => now()->toDateString(),
                'type' => 'reversal',
                'document_number' => $journal->document_number,
                'party_name' => $journal->party_name,
                'member_id' => $journal->member_id,
                'bank_id' => $journal->bank_id,
                'description' => "Reversal of {$journal->reference}: {$journal->description}",
                'reversal_of_id' => $journal->id,
            ], $journal->lines->map(fn ($line) => [
                'financial_account_id' => $line->financial_account_id,
                'debit' => $line->credit,
                'credit' => $line->debit,
                'memo' => $line->memo,
            ])->all(), $user);
            $reversal->update(['status' => 'posted', 'approved_by' => $user->id, 'approved_at' => now(), 'posted_at' => now()]);
            $journal->update(['status' => 'reversed']);

            return $reversal;
        });
    }

    /** @param array<int, array<string, mixed>> $lines */
    private function assertBalanced(array $lines): void
    {
        throw_if(count($lines) < 2, ValidationException::withMessages(['lines' => 'A journal requires at least two lines.']));
        foreach ($lines as $line) {
            $debit = $this->cents($line['debit'] ?? 0);
            $credit = $this->cents($line['credit'] ?? 0);
            throw_if(($debit > 0) === ($credit > 0), ValidationException::withMessages(['lines' => 'Each line must contain either a debit or a credit.']));
        }
        $debits = array_sum(array_map(fn (array $line) => $this->cents($line['debit'] ?? 0), $lines));
        $credits = array_sum(array_map(fn (array $line) => $this->cents($line['credit'] ?? 0), $lines));
        throw_if($debits <= 0 || $debits !== $credits, ValidationException::withMessages(['lines' => 'Total debits must equal total credits.']));
    }

    private function cents(mixed $amount): int
    {
        $value = (string) $amount;
        throw_unless(preg_match('/^\d+(?:\.\d{1,2})?$/', $value) === 1, ValidationException::withMessages(['lines' => 'Amounts must use at most two decimal places.']));
        [$whole, $decimal] = array_pad(explode('.', $value, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad($decimal, 2, '0');
    }

    private function expectStatus(JournalEntry $journal, string $status): void
    {
        throw_if($journal->status !== $status, ValidationException::withMessages(['journal' => "Journal must be {$status}."]));
    }
}
