<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property int $id @property string $reference @property string $status @property string $description @property int $prepared_by */
class JournalEntry extends Model
{
    protected $fillable = ['reference', 'entry_date', 'type', 'document_number', 'party_name', 'member_id', 'bank_id', 'description', 'status', 'prepared_by', 'approved_by', 'approved_at', 'posted_at', 'reversal_of_id'];

    protected function casts(): array
    {
        return ['entry_date' => 'date', 'approved_at' => 'datetime', 'posted_at' => 'datetime'];
    }

    /** @return HasMany<JournalLine, $this> */
    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    /** @return BelongsTo<User, $this> */
    public function preparer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** @return BelongsTo<User, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /** @return BelongsTo<Bank, $this> */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }
}
