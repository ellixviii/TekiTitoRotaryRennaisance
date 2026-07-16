# TekiTito Rotary Renaissance

Secure organization management system for the Rotary Club of Taytay Renaissance.

This initial build includes Laravel Fortify authentication, TOTP two-factor authentication, passkeys, invitation-only account policy, role-based admin/member layouts, and Rotary/TekiTito branding. Member, finance, project, attendance, award, and meeting workflows are planned in subsequent releases.

## Technology

- PHP 8.3–8.5 and Laravel 13
- React 19, TypeScript, and Inertia 3
- Tailwind CSS 4 and shadcn/ui components
- Spatie Laravel Permission
- SQLite for local development; PostgreSQL is planned for production

## Requirements

- PHP 8.3 or newer with `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, `sqlite3`, `sodium`, and `zip`
- Composer 2
- Node.js 22.12 or newer and npm
- Git

## Windows installation

Open PowerShell and install the prerequisites:

```powershell
winget install --id Git.Git --exact
winget install --id PHP.PHP.8.5 --exact
winget install --id OpenJS.NodeJS.LTS --exact
```

Install Composer using the official [Composer Windows installer](https://getcomposer.org/Composer-Setup.exe). Close and reopen PowerShell afterward, then confirm:

```powershell
php --version
composer --version
node --version
npm --version
```

Clone and configure the application:

```powershell
git clone https://github.com/ellixviii/TekiTitoRotaryRennaisance.git
Set-Location TekiTitoRotaryRennaisance
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item database/database.sqlite -ItemType File -Force
php artisan migrate --seed
npm install
npm run build
php artisan app:create-admin
```

Start the local application:

```powershell
php artisan serve
```

Open <http://127.0.0.1:8000>.

If PHP reports a missing extension, find the loaded configuration with `php --ini`, enable the required `extension=` entry in `php.ini`, and restart PowerShell.

## macOS installation

Install [Homebrew](https://brew.sh/) if it is not already available, then run:

```bash
brew install php composer node git
php --version
composer --version
node --version
npm --version
```

Clone and configure the application:

```bash
git clone https://github.com/ellixviii/TekiTitoRotaryRennaisance.git
cd TekiTitoRotaryRennaisance
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install
npm run build
php artisan app:create-admin
```

Start the local application:

```bash
php artisan serve
```

Open <http://127.0.0.1:8000>.

## Development mode

After the one-time setup, run the Laravel server and Vite development server in separate terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

## Verification

```bash
php artisan test
npm run types:check
npm run lint:check
npm run build
```

## Security notes

- Public registration is disabled. Create only the initial administrator with `php artisan app:create-admin`; later accounts will use the invitation workflow.
- Never commit `.env`, database files, production exports, member data, credentials, or encryption keys.
- SQLite is intended only for local development. Production deployment will use PostgreSQL, HTTPS, managed secrets, private file storage, and tested encrypted backups.
- Enable two-factor authentication immediately for privileged accounts.

## License

Copyright © 2026 TekiTito Solutions. Released under the MIT License. See [LICENSE](LICENSE).
