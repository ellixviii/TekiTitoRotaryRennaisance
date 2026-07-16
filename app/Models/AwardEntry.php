<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AwardEntry extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['awarded_on' => 'date'];
    }

    /** @return BelongsTo<User, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /** @return BelongsTo<AwardCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(AwardCategory::class, 'category_id');
    }

    /** @return BelongsTo<OperationRecord, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(OperationRecord::class, 'event_id');
    }
}
