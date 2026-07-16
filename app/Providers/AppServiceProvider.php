<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );

        Gate::define('manage-members', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Club Administrator']));
        Gate::define('view-member', fn (User $user, User $member) => $user->is($member) || $user->can('manage-members'));
        Gate::define('update-member', fn (User $user, User $member) => $user->is($member) || $user->can('manage-members'));
        Gate::define('view-finance', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Club Administrator', 'Treasurer', 'Finance Approver', 'Read-only Auditor']));
        Gate::define('create-finance', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Club Administrator', 'Treasurer']));
        Gate::define('approve-finance', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Finance Approver']));
        Gate::define('post-finance', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Treasurer']));
        Gate::define('view-operations', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Club Administrator', 'Treasurer', 'Finance Approver', 'Secretary', 'Project Chair', 'Read-only Auditor']));
        Gate::define('manage-operations', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Club Administrator', 'Secretary', 'Project Chair']));
        Gate::define('view-audit', fn (User $user) => $user->hasAnyRole(['Super Administrator', 'Read-only Auditor']));
    }
}
