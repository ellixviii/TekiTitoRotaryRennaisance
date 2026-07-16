<?php

namespace Database\Seeders;

use App\Models\AccountingPeriod;
use App\Models\FinancialAccount;
use App\Models\RotaryYear;
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

        foreach ([
            ['1000', 'Cash on Hand', 'asset'],
            ['1010', 'Cash in Bank', 'asset'],
            ['1100', 'Accounts Receivable', 'asset'],
            ['2000', 'Accounts Payable', 'liability'],
            ['3000', 'Club Fund Balance', 'equity'],
            ['4000', 'Membership Dues', 'revenue'],
            ['4100', 'Donations and Project Revenue', 'revenue'],
            ['5000', 'Administrative Expenses', 'expense'],
            ['5100', 'Project Expenses', 'expense'],
            ['5200', 'Meeting and Event Expenses', 'expense'],
        ] as [$code, $name, $type]) {
            FinancialAccount::updateOrCreate(['code' => $code], ['name' => $name, 'type' => $type, 'active' => true]);
        }

        AccountingPeriod::updateOrCreate(
            ['name' => 'Fiscal Year '.now()->year],
            ['starts_on' => now()->startOfYear()->toDateString(), 'ends_on' => now()->endOfYear()->toDateString()],
        );

        $startYear = now()->month >= 7 ? now()->year : now()->year - 1;
        RotaryYear::updateOrCreate(
            ['name' => $startYear.'–'.($startYear + 1)],
            ['starts_on' => "{$startYear}-07-01", 'ends_on' => ($startYear + 1).'-06-30'],
        );
    }
}
