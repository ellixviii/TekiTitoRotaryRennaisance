<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** @property int $id @property string $code @property string $name @property string $type */
class FinancialAccount extends Model
{
    protected $fillable = ['code', 'name', 'type', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
