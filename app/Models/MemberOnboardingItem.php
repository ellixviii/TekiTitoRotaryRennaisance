<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberOnboardingItem extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }
}
