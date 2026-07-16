<?php

use App\Http\Controllers\AcceptInvitationController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\OperationsController;
use App\Http\Middleware\EnsureActiveMember;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function () {
    Route::get('invitations/{token}', [AcceptInvitationController::class, 'show'])->middleware('throttle:20,1')->name('invitations.accept');
    Route::post('invitations/{token}', [AcceptInvitationController::class, 'store'])->middleware('throttle:10,1')->name('invitations.store');
});

Route::middleware(['auth', 'verified', EnsureActiveMember::class])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('members/{member}', [MemberController::class, 'show'])->name('members.show');
    Route::patch('members/{member}', [MemberController::class, 'update'])->name('members.update');

    Route::middleware('can:view-finance')->prefix('finance')->name('finance.')->group(function () {
        Route::get('/', [FinanceController::class, 'index'])->name('index');
        Route::get('income-statement', [FinanceController::class, 'incomeStatement'])->name('income-statement');
        Route::get('journals/{journal}', [FinanceController::class, 'show'])->name('show');
        Route::middleware('can:create-finance')->group(function () {
            Route::get('entries/create', [FinanceController::class, 'create'])->name('create');
            Route::post('entries', [FinanceController::class, 'store'])->name('store');
            Route::post('journals/{journal}/submit', [FinanceController::class, 'submit'])->name('submit');
        });
        Route::post('journals/{journal}/approve', [FinanceController::class, 'approve'])->middleware('can:approve-finance')->name('approve');
        Route::post('journals/{journal}/post', [FinanceController::class, 'post'])->middleware('can:post-finance')->name('post');
        Route::post('journals/{journal}/reverse', [FinanceController::class, 'reverse'])->middleware('can:post-finance')->name('reverse');
    });

    Route::middleware('can:manage-members')->group(function () {
        Route::get('members', [MemberController::class, 'index'])->name('members.index');
        Route::post('invitations', [InvitationController::class, 'store'])->name('invitations.create');
        Route::patch('members/{member}/status', [MemberController::class, 'status'])->name('members.status');
        Route::get('members-export', [MemberController::class, 'export'])->name('members.export');
    });

    Route::middleware('can:view-operations')->group(function () {
        Route::get('operations/{module}', [OperationsController::class, 'index'])->name('operations.index');
        Route::get('operations/{module}/export', [OperationsController::class, 'export'])->name('operations.export');
        Route::middleware('can:manage-operations')->group(function () {
            Route::post('operations/{module}', [OperationsController::class, 'store'])->name('operations.store');
            Route::patch('operations/{module}/{record}', [OperationsController::class, 'update'])->name('operations.update');
            Route::delete('operations/{module}/{record}', [OperationsController::class, 'destroy'])->name('operations.destroy');
            Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
            Route::post('attendance', [AttendanceController::class, 'createEvent'])->name('attendance.store');
            Route::get('attendance/{event}', [AttendanceController::class, 'show'])->name('attendance.show');
            Route::post('attendance/{event}/tap', [AttendanceController::class, 'tap'])->name('attendance.tap');
            Route::get('attendance/{event}/export', [AttendanceController::class, 'export'])->name('attendance.export');
        });
    });
    Route::get('audit', AuditController::class)->middleware('can:view-audit')->name('audit.index');
    Route::middleware(['can:view-operations'])->group(function () {
        Route::get('mission', [MissionController::class, 'index'])->name('mission.index');
        Route::middleware('can:manage-operations')->group(function () {
            Route::post('mission/years', [MissionController::class, 'year'])->name('mission.years.store');
            Route::patch('mission/years/{year}/archive', [MissionController::class, 'archive'])->name('mission.years.archive');
            Route::patch('mission/projects/{project}', [MissionController::class, 'outcome'])->name('mission.projects.outcome');
            Route::post('mission/service-hours', [MissionController::class, 'service'])->name('mission.service.store');
            Route::post('mission/assignments', [MissionController::class, 'assignment'])->name('mission.assignments.store');
            Route::post('mission/onboarding', [MissionController::class, 'onboarding'])->name('mission.onboarding.store');
            Route::patch('mission/onboarding/{item}', [MissionController::class, 'completeOnboarding'])->name('mission.onboarding.toggle');
        });
    });
});

require __DIR__.'/settings.php';
