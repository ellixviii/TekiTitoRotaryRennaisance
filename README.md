# TekiTito Rotary Renaissance

Secure organization management system for the Rotary Club of Taytay Renaissance.

The application includes invitation-only membership, role-based administration, member statements, double-entry finance, project-linked transactions, service outcomes and volunteer hours, Rotary-year handover, attendance with RFID/NFC support, meetings, awards, assets, obligations, reminders, exports, and an append-only audit console.

## Technology

- PHP 8.3–8.5 and Laravel 13
- React 19, TypeScript, and Inertia 3
- Tailwind CSS 4 and shadcn/ui components
- Spatie Laravel Permission
- SQLite for local development; PostgreSQL is recommended for production
- Asia/Manila application timezone

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

Install the official [Composer Windows installer](https://getcomposer.org/Composer-Setup.exe), reopen PowerShell, then configure the application:

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
.\scripts\dev.ps1 start
```

Open <http://127.0.0.1:8890>. If PHP reports a missing extension, use `php --ini` to locate `php.ini`, enable the required extension, and reopen PowerShell.

## macOS installation

Install [Homebrew](https://brew.sh/), then configure the application:

```bash
brew install php composer node git
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
chmod +x scripts/dev.sh
./scripts/dev.sh start
```

Open <http://127.0.0.1:8890>.

## Starting and stopping

Laravel uses port `8890`; Vite uses port `5180`. The scripts refuse to replace another application using either port and write logs under `storage/logs`.

| Action | Windows PowerShell | macOS/Linux |
| --- | --- | --- |
| Start | `.\scripts\dev.ps1 start` | `./scripts/dev.sh start` |
| Status | `.\scripts\dev.ps1 status` | `./scripts/dev.sh status` |
| Restart | `.\scripts\dev.ps1 restart` | `./scripts/dev.sh restart` |
| Stop | `.\scripts\dev.ps1 stop` | `./scripts/dev.sh stop` |

For manual development, run these in separate terminals:

```bash
php artisan serve --host=127.0.0.1 --port=8890
```

```bash
npm run dev
```

## First use

1. Sign in with the administrator created by `php artisan app:create-admin`.
2. Open **Settings → Security** and enable two-factor authentication or register a passkey.
3. Open **Members** and invite officers and members. Public registration is disabled.
4. Assign the minimum role each person needs.
5. Open **Mission**, confirm the current Rotary year, and assign officers and committees.
6. Have the club accountant approve the seeded chart of accounts before recording real transactions.

Invitation emails use the mail settings in `.env`. Local development writes messages to `storage/logs/laravel.log`; configure SMTP before sending real invitations.

## Roles

- **Super Administrator:** complete system and audit access.
- **Club Administrator:** membership and operational administration.
- **Treasurer:** prepare and post financial journals.
- **Finance Approver:** independently approve submitted journals.
- **Secretary:** meetings, attendance, onboarding, and operational records.
- **Project Chair:** projects, outcomes, volunteer hours, and assignments.
- **Read-only Auditor:** read-only finance, operations, and audit access.
- **Member:** personal profile, statement, and member-facing access.

The financial workflow deliberately separates preparation, approval, and posting. A preparer cannot approve their own journal.

Super Administrators may access the application before email verification so the club cannot be locked out during initial setup. All other roles must verify their email address.

## Using the features

### Members

- Invite members from **Members**. Invitation links are hashed, expiring, and single-use.
- Open a member to edit club information, suspend or archive access, and review posted transactions and outstanding obligations.
- Members may edit permitted personal fields but cannot grant roles or alter administrator-owned membership fields.
- Use **Export CSV** only on trusted devices; exports contain personal information and are audited.

### Finance

1. Open **Finance → New entry**.
2. Select revenue, expense, or general journal and optionally associate a member, bank, and service project.
3. Select debit and credit accounts and save the balanced draft.
4. Submit it, have a different authorized officer approve it, then have the treasurer post it.
5. Correct posted entries with a reversal. Posted journal lines are never edited or deleted.
6. Use **Income statement** for date-filtered reporting.

Bank account numbers are application-encrypted. Closed accounting periods reject new postings.

### Projects and mission impact

- Use **Projects** as a Kanban board and assign responsible members.
- Use **Mission** to set beneficiary and outcome targets, enter actual results, and log volunteer hours.
- Associate journals with projects to calculate cost and cost per beneficiary deterministically.
- Engagement indicators show the exact attendance, service-hour, and responsibility inputs from the last 90 days. They are outreach prompts, not member ratings.

### Rotary-year continuity and onboarding

- Create July-to-June Rotary years in **Mission**.
- Record officer and committee responsibilities separately from security roles.
- Assign mentors and checklist items to new members; select an item to complete or reopen it.
- Print the Mission page as a handover packet, then archive the completed year. Prior history remains available.

### Attendance

1. Create an event under **Attendance**.
2. Select a member, enter a guest, or focus the card field and tap an RFID/NFC keyboard-wedge reader.
3. The first matching tap records time-in; the next records time-out. Raw card identifiers are never stored.
4. Export CSV attendance or print entry cards as nameplates.

RFID/NFC identifies an attendance record only; it is not an authentication credential.

### Meetings, awards, and records

- **Meetings:** enter the agenda in the description, record minutes in notes, and print the completed record.
- **Awards:** record categories, responsible members, event dates, and recognition status.
- **Assets, Payables, Receivables, and Reminders:** record amounts, owners, dates, notes, and lifecycle status; export each module to CSV.

### Audit

Super administrators and read-only auditors can search **Audit**. It records membership activity, exports, journal transitions, attendance taps, project impact, service hours, onboarding, and operational changes with the actor, Manila timestamp, subject, and IP address.

## Routine maintenance

Back up the database and `.env` key material before updating. Stop the application, then run:

```bash
git pull --ff-only
composer install --no-interaction
npm install
php artisan migrate --force
npm run build
php artisan optimize:clear
```

Restart the services and run the verification commands below. Never use `migrate:fresh` on an installation containing real data.

## Verification

```bash
php artisan test
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

## Security notes

- Never commit `.env`, databases, exports, member data, credentials, or encryption keys.
- Keep `APP_TIMEZONE=Asia/Manila` in every environment.
- SQLite is for local development. Production should use PostgreSQL, HTTPS, managed secrets, private storage, and tested encrypted backups.
- Enable two-factor authentication for privileged accounts.
- Confirm the chart of accounts, fiscal year, approval thresholds, and Philippine reporting obligations with the club accountant before entering production data.
- AI, cloud transcription, OCR, and chatbots are intentionally excluded so sensitive data is not sent to model providers and club operations do not depend on GPU infrastructure.

## License

Copyright © 2026 TekiTito Solutions. Released under the MIT License. See [LICENSE](LICENSE).
