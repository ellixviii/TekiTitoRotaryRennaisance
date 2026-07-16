<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberCard extends Model
{
    protected $guarded = [];

    protected $hidden = ['card_hash'];

    protected function casts(): array
    {
        return ['revoked_at' => 'datetime'];
    }
}
