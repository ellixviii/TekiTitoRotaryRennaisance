<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:create-admin', function () {
    $credentials = [
        'name' => trim((string) $this->ask('Full name')),
        'email' => strtolower(trim((string) $this->ask('Email address'))),
        'password' => (string) $this->secret('Password'),
    ];

    Validator::make($credentials, [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'password' => [
            'required',
            Password::min(12)->mixedCase()->letters()->numbers()->symbols(),
        ],
    ])->validate();

    $user = User::create([
        ...$credentials,
        'password' => Hash::make($credentials['password']),
    ]);
    $user->forceFill(['email_verified_at' => now()])->save();

    Role::findOrCreate('Super Administrator');
    $user->assignRole('Super Administrator');

    $this->info("Super Administrator created for {$user->email}.");
})->purpose('Create the initial Super Administrator account');
