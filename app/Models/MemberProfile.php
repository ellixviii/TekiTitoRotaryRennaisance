<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string|null $membership_number
 * @property string|null $phone
 * @property string|null $address
 * @property CarbonInterface|null $birth_date
 * @property CarbonInterface|null $joined_at
 * @property string|null $classification
 * @property string $status
 */
class MemberProfile extends Model
{
    protected $fillable = [
        'membership_number',
        'phone',
        'address',
        'birth_date',
        'joined_at',
        'classification',
        'status',
    ];

    protected function casts(): array
    {
        return ['birth_date' => 'date', 'joined_at' => 'date'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
