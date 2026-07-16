<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string|null $guest_name
 * @property Carbon $time_in
 * @property Carbon|null $time_out
 * @property-read User|null $member
 */
class AttendanceEntry extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['time_in' => 'datetime', 'time_out' => 'datetime'];
    }

    /** @return BelongsTo<OperationRecord, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(OperationRecord::class, 'event_id');
    }

    /** @return BelongsTo<User, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
