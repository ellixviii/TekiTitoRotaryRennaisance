<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** @property bool $closed */
class AccountingPeriod extends Model
{
    protected $fillable = ['name', 'starts_on', 'ends_on', 'closed'];

    protected function casts(): array
    {
        return ['starts_on' => 'date', 'ends_on' => 'date', 'closed' => 'boolean'];
    }
}
