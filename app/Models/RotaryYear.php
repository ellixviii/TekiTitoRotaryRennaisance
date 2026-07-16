<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RotaryYear extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['starts_on' => 'date', 'ends_on' => 'date', 'archived' => 'boolean'];
    }
}
