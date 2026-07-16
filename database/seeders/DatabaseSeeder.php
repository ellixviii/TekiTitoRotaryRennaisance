<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        foreach ([
            'Super Administrator',
            'Club Administrator',
            'Treasurer',
            'Finance Approver',
            'Secretary',
            'Project Chair',
            'Member',
            'Read-only Auditor',
        ] as $role) {
            Role::findOrCreate($role);
        }
    }
}
