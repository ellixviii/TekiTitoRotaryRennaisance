# Rotary Organization Management System — Architecture Review Handoff

## Instructions for Claude Code

Act as a senior software architect, application-security reviewer, and accounting-systems reviewer. Review this proposal critically before any implementation begins.

Do **not** generate application code or scaffold the project. Produce a review report only. Verify claims about current framework compatibility, supported versions, and licenses using primary sources where internet access is available. Distinguish confirmed facts from assumptions.

Focus especially on:

1. Security and privacy risks involving member records and bank information.
2. Correctness and auditability of the financial model.
3. Laravel/React ecosystem compatibility as of the review date.
4. Missing requirements, ambiguous workflows, and unsafe assumptions.
5. Whether the architecture is appropriately simple for a single Rotary club.
6. OSS licensing conflicts or operational dependencies that undermine the OSS requirement.
7. A realistic build order and release gates.

## Project Status

- Repository is currently empty; implementation has not started.
- This document is a proposed architecture, not an approved specification.
- Target users include administrators, finance officers, secretaries, project chairs, auditors, and ordinary members.
- The system will contain personally identifiable information and financial records.
- Desired licensing: MIT or another genuine 100% open-source license.

## Product Scope

### User management

- Invitation-based accounts and role-based access.
- Admin interface with sidebar and member directory.
- Member interface without the administrative sidebar.
- Member profile: narrow information pane with edit modal; wider pane containing Transactions, Attendance, Awards, and Reminders tabs.
- Admins may access authorized member profiles; ordinary members may access only their own information.
- Permission-controlled exports.

### Financial management

- Bank transactions.
- Revenue records: member or manually entered party, acknowledgement receipt number, GL account, bank, amount, and description.
- Expense records: member or manually entered party, control number, GL account, bank, amount, and description.
- Payables, receivables, and fixed assets.
- Voiding/reversal workflow.
- CSV/XLSX/PDF exports.
- Income statement and other financial reports.

### Project management

- Kanban boards and cards.
- Member assignments, due dates, comments, labels, and attachments.

### Attendance

- Events/occasions with member or guest attendance.
- Manual entry and USB RFID/NFC reader entry.
- Check-in, check-out, timestamps, and correction history.
- Printable sticker nameplates and exports.

### Awards and recognition

- Categories, award events, awards, recipients, citations, and attachments.

### Meetings

- Meeting events and ordered agendas.
- Minutes linked to agenda items.
- Motions, decisions, votes, and action items.
- Draft/review/approved/locked states.
- Printable agendas and minutes.

### Audit

- Audit coverage for authentication, authorization changes, CRUD activity, sensitive reads, financial activity, exports, approvals, and configuration changes.

## Proposed Architecture

Use a **modular monolith**, not microservices:

```text
React/Inertia browser UI
        |
 HTTPS + Laravel session/CSRF
        |
Laravel modular monolith
  |-- Identity and Access
  |-- Members
  |-- Finance and Ledger
  |-- Projects
  |-- Events and Attendance
  |-- Awards
  |-- Meetings
  |-- Reports and Exports
  `-- Audit
        |
 PostgreSQL + Valkey + private object storage
        |
 Queue workers for reports, exports, and notifications
```

Modules remain in one Laravel deployment and one PostgreSQL database, but each receives separate models, policies, requests, actions/services, routes, and tests. Cross-module changes use ordinary database transactions.

## Proposed Stack

| Concern | Proposed choice |
|---|---|
| Backend | Laravel 13, PHP 8.4 or 8.5 |
| Frontend | React 19, TypeScript, Inertia 3 |
| Authentication | Official Laravel React Starter Kit using Fortify |
| Authorization | Laravel policies/gates plus `spatie/laravel-permission` |
| UI | Tailwind CSS 4 and shadcn/ui |
| Database | PostgreSQL 18 |
| Queue/cache | Valkey |
| PDF | `barryvdh/laravel-dompdf`, subject to compatibility review |
| Spreadsheet | PhpSpreadsheet, subject to security/license review |
| Activity capture | `spatie/laravel-activitylog`, augmented for audit integrity |
| Testing | Pest/PHPUnit, Vitest, and targeted browser tests |
| Deployment | Containers with Caddy or Nginx; no Kubernetes initially |

### Jetstream compatibility decision

The original request specified Jetstream and React. Official Jetstream historically provides Livewire and Inertia/Vue stacks, not an official React stack. The proposal therefore uses the official Laravel React Starter Kit with Fortify, retaining the relevant authentication features without maintaining an unsupported Jetstream/React bridge.

Reviewer: verify this remains correct as of the review date and explicitly approve or reject the substitution.

## Proposed Access Model

Initial roles:

- Super Administrator
- Club Administrator
- Treasurer
- Finance Approver/Auditor
- Secretary
- Project Chair
- Member
- Read-only Auditor

Roles are permission bundles, not authorization logic. Server-side Laravel policies enforce granular permissions and record ownership. Examples include `members.private.view`, `finance.journal.create`, `finance.journal.post`, `finance.journal.approve`, `finance.entry.reverse`, and `reports.financial.export`.

All users use one authentication system. Interface elements may differ by role, but hidden navigation is never treated as an access-control boundary.

Reviewer: identify conflicts in duties, missing roles, privilege-escalation paths, and permissions that need dual control.

## Proposed Financial Model

Use double-entry accounting rather than unrelated revenue and expense tables.

Main records:

- Chart of accounts and GL accounts.
- Banks and encrypted/masked bank-account details.
- Journal entries and debit/credit journal lines.
- Revenue and expense source documents.
- Receivables, payables, payments, and disbursements.
- Assets, depreciation, and disposal.
- Accounting periods.
- Approval and reconciliation records.
- Supporting attachments.

Invariants:

- Every posted journal entry balances exactly.
- Monetary values use fixed-precision decimal database types, never floating point.
- Draft entries may be edited; posted entries are immutable.
- Voiding creates a dated reversing entry and never deletes the original.
- Closed periods reject changes unless reopened through a separately authorized and audited workflow.
- Receipt/control numbers use database-enforced uniqueness within an agreed scope.
- Approval rules can prevent preparers from approving their own entries.
- Reports derive from posted journal lines, not duplicated report totals.
- Concurrent posting and numbering use transactions, constraints, and locks where required.

The system must not store online-banking passwords, PINs, CVVs, payment-card authentication data, or unneeded full account numbers. Direct bank connectivity is outside the initial scope unless explicitly approved later.

Reviewer: assess accounting correctness, posting state transitions, reversal and period-close behavior, rounding/currency handling, reconciliation, report completeness, fraud controls, and where a qualified accountant must define policy.

## Proposed Security Baseline

- Public registration disabled; administrators issue invitations.
- Mandatory TOTP 2FA for privileged and finance users; consider requiring it for everyone.
- Verified email, strong password rules, breached-password screening, login/reset throttling, and session revocation.
- Secure, HTTP-only, SameSite cookies; CSRF protection; no authentication tokens in browser storage.
- TLS-only production access, HSTS, Content Security Policy, frame protection, and restrictive browser headers.
- Short idle sessions and password/2FA re-confirmation for sensitive changes, exports, approvals, reversals, bank-data reveal, and role changes.
- Least-privilege policies for every route and record; protection against identifier-based authorization failures.
- Application-level encryption for selected member fields and full bank identifiers, with keys stored outside the database.
- Mask sensitive values by default and audit explicit reveal actions.
- Private attachments outside the public web root with randomized names, MIME/content inspection, size limits, malware scanning, and short-lived authorized downloads.
- CSV formula-injection defenses and safe PDF generation with remote resource access disabled.
- Rate limits for authentication, exports, searches, NFC endpoints, and sensitive reads.
- Structured logs with automatic secret/PII redaction.
- Secrets kept outside source control and rotated under an operational procedure.
- Dependency, secret, static-analysis, container, and license scanning in CI.
- OWASP ASVS Level 2 as the minimum release checklist, applying relevant stronger controls to finance and administration.
- Independent penetration test before real financial information is imported.

Reviewer: create a concise threat model covering account takeover, broken access control, insider fraud, malicious uploads, injection, export leakage, audit tampering, backup theft, NFC cloning/replay, and compromised administrator devices.

## Audit Design

Each relevant event should capture:

- Actor and impersonator, if applicable.
- Action, target type, and target identifier.
- Safe before/after differences.
- UTC timestamp, request/correlation ID, IP, and user agent.
- Reason for high-risk actions.
- Outcome and failure category.
- Report/export type and filters.

Do not record passwords, tokens, TOTP secrets, complete bank details, raw documents, or other unnecessary sensitive content.

Activity-log tables must not be writable by ordinary application code paths. Financial audit events should be append-only and tamper-evident, for example through a hash chain or signed periodic digest. Digests should be copied to separate immutable storage. Audit access and exports are themselves audited.

Reviewer: determine whether this design is meaningfully tamper-evident, define the trust boundary, and recommend the smallest robust design suitable for this organization.

## RFID/NFC Proposal

Start with a USB reader that operates as a keyboard wedge. It enters a randomly assigned card identifier into a dedicated check-in screen. This avoids a proprietary browser extension or local daemon.

Requirements:

- Never encode member PII on the card.
- Prefer storing a keyed hash of the card identifier rather than the raw value.
- Record input source, event, station, and server timestamp.
- Prevent accidental duplicate taps with a configurable debounce window.
- Require an authenticated attendance-station session with narrowly scoped permission.
- Define lost/replaced-card revocation.
- Treat a tap as identification, not strong authentication.

A local bridge service should only be introduced if the selected hardware cannot operate reliably in keyboard mode.

Reviewer: assess replay/cloning risks, browser focus/input risks, station security, offline requirements, and whether this is operationally workable.

## Deployment and Recovery Proposal

- Reverse proxy, Laravel application container(s), queue worker, PostgreSQL, Valkey, and encrypted private object storage.
- Production database separated from application containers and inaccessible from the public internet.
- Encrypted daily full backups plus transaction-log/point-in-time recovery where supported.
- At least one off-site backup with a separate encryption key.
- Automated backup monitoring and quarterly restore drills.
- Initial targets: RPO 15 minutes and RTO four hours, subject to budget and hosting capability.
- Centralized security/error logs, uptime alerts, queue-failure alerts, disk/certificate monitoring, and incident runbooks.
- Staging uses synthetic data only.

Reviewer: challenge feasibility, single points of failure, key recovery, backup immutability, monitoring gaps, and operational burden.

## Proposed Delivery Plan

### Phase 0 — Requirements and controls

- Permission and segregation-of-duties matrix.
- Member data dictionary, privacy classification, retention, and deletion rules.
- Chart of accounts, fiscal rules, currencies, numbering, approvals, and report samples.
- Threat model and security acceptance checklist.
- RFID/NFC reader and label-printer proof of concept.
- Hosting, recovery objectives, and migration inventory.

### Phase 1 — Secure foundation

- Laravel React starter, PostgreSQL, Valkey, private storage, queue, CI.
- Invitations, authentication, 2FA, sessions, roles, policies, and audit foundation.
- Admin/sidebar and member/header layouts.
- Security headers, environment separation, backup automation, and authorization tests.

### Phase 2 — Members

- Member directory, profile layout/editing, privacy controls, reminders, exports, and audits.

### Phase 3 — Core finance

- Chart of accounts, banks, journals, revenue/expense documents, posting, approval, reversal, periods, receivables/payables, core reports, and exports.

### Phase 4 — Attendance

- Events, members/guests, check-in/out, reader integration, corrections, nameplates, and exports.

### Phase 5 — Meetings and awards

- Agendas, minutes, decisions, actions, approvals, awards, categories, events, and reports.

### Phase 6 — Projects

- Kanban boards, tasks, assignments, comments, attachments, and policy enforcement.

### Phase 7 — Advanced finance

- Assets, depreciation, bank CSV import/reconciliation, aging, additional statements, and year-end close.

### Phase 8 — Hardening and launch

- Migration rehearsals and financial reconciliation.
- Accessibility, browser, performance, and concurrency tests.
- ASVS verification, penetration test, restore drill, user acceptance, training, and staged rollout.

Every phase must have explicit acceptance tests and a go/no-go review. Finance tests must include duplicate requests, concurrency, rounding, approval conflicts, closed periods, reversals, and interrupted operations.

## Unresolved Decisions

1. One club only, or multiple clubs/organizations with hard tenant isolation?
2. Acceptance of Fortify/official React Starter Kit instead of Jetstream itself?
3. Hosting jurisdiction, provider, expected user count, availability, budget, RPO, and RTO?
4. Accounting basis, fiscal year, base/additional currencies, chart of accounts, tax requirements, official report formats, and approval thresholds?
5. Manual/CSV bank records only, or future direct bank integration?
6. Exact member fields, privacy classification, retention duration, and access matrix?
7. Required compliance under Philippine privacy, tax, corporate, and accounting rules, to be confirmed by qualified advisers?
8. RFID/NFC reader, credential format, printer, label dimensions, number of stations, and offline behavior?
9. Required data migration sources and quality?
10. Whether members may edit sensitive identity fields directly or submit change requests for approval?

## Required Review Output

Create a Markdown report named `CLAUDE_ARCHITECTURE_FEEDBACK.md` with the following sections:

1. **Executive verdict** — `Approve`, `Approve with changes`, or `Reject`, with a short explanation.
2. **Blocking findings** — issues that must be resolved before scaffolding.
3. **Security findings** — ranked Critical/High/Medium/Low, each containing risk, evidence/reasoning, and a concrete recommendation.
4. **Financial/accounting findings** — correctness, controls, auditability, and decisions requiring an accountant.
5. **Architecture and stack findings** — compatibility, maintainability, OSS/license status, and simpler alternatives.
6. **Data-model gaps** — missing entities, invariants, retention, tenancy, and indexing concerns.
7. **Delivery-plan feedback** — ordering, dependencies, missing gates, and realistic scope reductions.
8. **Questions for the owner** — only questions whose answers materially change design or scope.
9. **Recommended revised decisions** — a compact decision table with proposed defaults.
10. **Go-signal checklist** — checkboxes that must be satisfied before implementation.

For each finding, include:

- Severity.
- Affected area.
- Why it matters.
- Recommended change.
- Whether it blocks the build.

Avoid generic advice. Identify concrete failure modes and proposed corrections. Do not modify this handoff file or start building the application.
