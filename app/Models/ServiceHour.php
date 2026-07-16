<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceHour extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['served_on' => 'date', 'hours' => 'decimal:2'];
    }

    /** @return BelongsTo<User, $this> */
    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<OperationRecord, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(OperationRecord::class);
    }
}
