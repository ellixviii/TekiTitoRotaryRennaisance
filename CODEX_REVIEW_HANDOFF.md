# Rotary Organization Management System — Build Review Handoff (for CODEX)

## 0. What this document is

This is a **revised architecture and build proposal** for a Rotary club management system, prepared for an independent critical review by CODEX before (or alongside) implementation.

It supersedes the original `CLAUDE_REVIEW_HANDOFF.md`. That document was reviewed by Claude Code; the verdict was **Approve with changes**. This document carries the original architecture forward and folds in the changes from that review:

1. **Right-sizing** the operational ambition to a volunteer-run club (see §2).
2. Adding **mission/impact and member-engagement features** so the system advances the club's purpose, not just its recordkeeping (see §6).
3. Adding an **optional, self-hosted (Ollama) AI-assist layer** that reduces administrative burden without moving sensitive data off-premises (see §11).

CODEX is asked to act as a second, independent senior reviewer — software architect, application-security reviewer, and accounting-systems reviewer — and to challenge this proposal, not rubber-stamp it.

## 1. Instructions for CODEX

- Produce a **review report only**. Do not scaffold or generate application code unless separately instructed.
- **Verify, do not trust, the version and license claims** in §9. The author (Claude Code) explicitly did **not** verify current framework versions against primary sources; every version below is marked *claimed — verify*. Distinguish confirmed facts from assumptions in your report.
- If implementation has already begun, review the actual code against this specification and report divergences.
- Focus on the areas in §14 (Required Review Output).
- Do not modify this handoff file.

## 2. Guiding principle: right-size for a volunteer organization

This is the single most important framing, and it should shape every recommendation.

**The users are volunteers with annual turnover, no dedicated ops or security staff, and a small budget.** The dominant real-world risk to this project is not account takeover — it is **abandonment**: the system gets built, works for a while, the one person who understood it rotates out, nobody patches it, and it rots.

Therefore:

- **Keep** the cheap, high-value integrity controls that protect money and PII: double-entry accounting, immutable posted entries, append-only audit, encrypted bank fields, invitation-only access, least-privilege policies. These are non-negotiable.
- **Tier down** the enterprise "operational theater" that a volunteer club cannot sustain: replace a mandatory independent penetration test with a scoped security review at launch; replace aspirational RPO 15 min / RTO 4 h with **honest daily encrypted backups plus a tested restore drill**; drop anything that assumes a 24/7 ops team.
- **Explicitly plan for maintenance and handover**: who runs dependency updates, what monthly hosting costs, and how knowledge survives the annual officer turnover. The original spec had a full recovery section but **no maintenance / bus-factor plan**. That gap must be closed.

CODEX: challenge any part of this proposal that quietly assumes enterprise resources.

## 3. Project status

- Repository is (or was) empty; this is a proposed architecture, not an approved specification.
- Target users: administrators, finance officers, secretaries, project chairs, auditors, and ordinary members.
- The system will contain personally identifiable information (PII) and financial records.
- Desired licensing: MIT or another genuine 100% open-source license.
- Jurisdiction context: **Philippines** — Philippine Data Privacy Act 2012 (NPC) and BIR receipt/numbering rules are in scope (see §10).

## 4. Product scope (core)

### User management
- Invitation-based accounts and role-based access; public registration disabled.
- Admin interface with sidebar and member directory.
- Member interface without the administrative sidebar.
- Member profile: narrow info pane with edit modal; wider pane with Transactions, Attendance, Awards, and Reminders tabs.
- Admins access authorized member profiles; ordinary members access only their own. **Hidden navigation is never an access-control boundary — enforcement is server-side.**
- Permission-controlled exports.

### Financial management
- Bank transactions.
- Revenue records: member or manually entered party, acknowledgement receipt number, GL account, bank, amount, description.
- Expense records: member or manually entered party, control number, GL account, bank, amount, description.
- Payables, receivables, and fixed assets.
- Voiding/reversal workflow (reversing entry, never deletion).
- CSV/XLSX/PDF exports.
- Income statement and other financial reports.

### Project management
- Kanban boards and cards; member assignments, due dates, comments, labels, attachments.

### Attendance
- Events/occasions with member or guest attendance.
- Manual entry and USB RFID/NFC reader (keyboard-wedge) entry.
- Check-in, check-out, timestamps, correction history.
- Printable sticker nameplates and exports.

### Awards and recognition
- Categories, award events, awards, recipients, citations, attachments.

### Meetings
- Meeting events and ordered agendas.
- Minutes linked to agenda items; motions, decisions, votes, action items.
- Draft/review/approved/locked states.
- Printable agendas and minutes.

### Audit
- Coverage for authentication, authorization changes, CRUD activity, sensitive reads, financial activity, exports, approvals, and configuration changes.

## 5. Proposed architecture (modular monolith)

```text
React/Inertia browser UI
        |
 HTTPS + Laravel session/CSRF
        |
Laravel modular monolith
  |-- Identity and Access
  |-- Members
  |-- Finance and Ledger
  |-- Projects & Service Impact      (extended, see §6)
  |-- Events and Attendance          (+ service hours, see §6)
  |-- Awards
  |-- Meetings
  |-- Engagement & Continuity        (new, see §6)
  |-- Reports and Exports
  |-- Audit
  `-- AI Assist (optional)           (new, see §11)
        |
 PostgreSQL + Valkey + private object storage
        |
 Queue workers for reports, exports, notifications
        |
 (optional) Ollama on the private network — AI never touches the ledger
```

One Laravel deployment, one PostgreSQL database. Each module has its own models, policies, requests, actions/services, routes, and tests. Cross-module changes use ordinary database transactions. **No microservices.** No Kubernetes initially.

## 6. Mission & engagement extensions (new — the "not just bragging rights" additions)

The original scope records the club's internal life (money, attendance, awards, meetings) but does not connect to *why the club exists*: community service and member fellowship. These additions tilt the system toward purpose. They are designed to reuse data the system already captures, not to spawn new module empires.

Priority markers: ⭐ = high-leverage, changes what the system *is*.

### Service impact (fold into Projects & Attendance)
- ⭐ **Volunteer service hours** — members log hours per service project. The club can finally state real contribution, not just meeting attendance.
- **Service project outcomes** — structured impact metrics (beneficiaries reached, items distributed, scholarships given), not prose.
- ⭐ **Cost-to-impact link** — tie Finance expenses/revenue to a project so the club can report "₱X raised → Y families served." Closes the loop between the money island and the mission island.

### Member engagement & retention (thin reporting layer over existing data)
- ⭐ **Engagement early-warning** — flag members with declining attendance, no committee role, and no recent service hours *before* they resign. Retention is Rotary's chronic problem; the signals already live in the data.
- **Onboarding & mentorship** — assign a sponsor/mentor and a first-90-days checklist for new members.
- **Committee / service-role assignments** — who does the work of the club, visible and rotated (distinct from access-control roles).

### Trust-building finance additions
- **Donation/fundraising transparency** — donors (often non-members) see giving history and receive proper receipts; "here's what your money did."
- **Dues self-service** — members see what they owe and their payment history without emailing the treasurer.
- **Giving recognition (e.g., Paul Harris cumulative giving)** — recognition earned by contribution, not politics.

### Continuity across the annual handover ⭐
- Rotary leadership turns over every **July**. Institutional memory walking out the door each year is the most destructive recurring pattern.
- **Year-based archiving + auto-generated handover packet**: clean officer rollover, a "state of everything" report, and preserved prior-year read access. This is where the Audit module doubles as a *continuity* feature.

### Grant management (Rotary-specific, often overlooked)
- District/Global Grants through The Rotary Foundation carry mandatory budgets, reporting, and audit requirements. If the club does grants, structured grant tracking is higher value than the awards module.

### Community-facing surface (the healthy form of "bragging rights")
- **Public impact / annual report generator** — one honest exportable page: hours served, projects completed, funds raised and where they went. Outward accountability, not inward trophies.
- **Announcements / member communication** — the original had meetings and reminders but no general broadcast.

**Recommended minimum meaningful set** if scope must be cut: the four ⭐ items — service hours, engagement early-warning, cost-to-impact link, and the handover packet. These structurally change the system from a ledger of activity into a tool that advances the mission and survives the annual turnover.

CODEX: assess whether these can be delivered as thin layers over existing data (as claimed) or whether any hides a large build; flag scope creep.

## 7. Access model

Initial roles (permission bundles, not authorization logic):
Super Administrator, Club Administrator, Treasurer, Finance Approver/Auditor, Secretary, Project Chair, Member, Read-only Auditor.

Server-side Laravel policies enforce granular permissions and record ownership — e.g. `members.private.view`, `finance.journal.create`, `finance.journal.post`, `finance.journal.approve`, `finance.entry.reverse`, `reports.financial.export`, plus new ones for `service.hours.log`, `impact.record.edit`, `ai.assist.use`.

All users share one authentication system. Interface differs by role; navigation hiding is never an access boundary.

CODEX: identify segregation-of-duties conflicts, missing roles, privilege-escalation paths, and permissions needing dual control.

## 8. Financial model (double-entry — strongest part of the spec, keep intact)

Main records: chart of accounts / GL accounts; banks with encrypted/masked account details; journal entries and debit/credit lines; revenue/expense source documents; receivables/payables/payments/disbursements; assets/depreciation/disposal; accounting periods; approval and reconciliation records; supporting attachments.

Invariants:
- Every posted journal entry balances exactly.
- Monetary values use fixed-precision decimal types, never floating point.
- Draft entries are editable; posted entries are immutable.
- Voiding creates a dated reversing entry; the original is never deleted.
- Closed periods reject changes unless reopened through a separately authorized, audited workflow.
- Receipt/control numbers are database-enforced unique within an agreed scope.
- Preparers cannot approve their own entries.
- Reports derive from posted journal lines, not duplicated totals.
- Concurrent posting and numbering use transactions, constraints, and locks.

The system must **not** store online-banking passwords, PINs, CVVs, card authentication data, or unneeded full account numbers. Direct bank connectivity is out of initial scope.

CODEX: assess posting state transitions, reversal/period-close behavior, rounding/currency handling, reconciliation, report completeness, fraud controls, and where a qualified accountant must set policy. Treat "define the chart of accounts, fiscal year, approval thresholds, and BIR obligations" as a **Phase 0 blocker**, not an open question.

## 9. Proposed stack — CLAIMED, VERIFY

> Every version below is asserted by the proposal but **was not verified against primary sources**. CODEX must confirm current stable versions, mutual compatibility, and license status as of the review date, and correct any that are wrong or not yet released.

| Concern | Proposed choice (verify) |
|---|---|
| Backend | Laravel 13, PHP 8.4 or 8.5 |
| Frontend | React 19, TypeScript, Inertia 3 |
| Authentication | Official Laravel React Starter Kit using Fortify |
| Authorization | Laravel policies/gates + `spatie/laravel-permission` |
| UI | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL 18 |
| Queue/cache | Valkey |
| PDF | `barryvdh/laravel-dompdf` (compatibility review) |
| Spreadsheet | PhpSpreadsheet (security/license review) |
| Activity capture | `spatie/laravel-activitylog`, augmented for audit integrity |
| Optional AI runtime | Ollama (self-hosted) + local transcription (e.g. Whisper) — see §11 |
| Testing | Pest/PHPUnit, Vitest, targeted browser tests |
| Deployment | Containers with Caddy or Nginx; no Kubernetes initially |

**Jetstream decision:** the original request named Jetstream + React, but Jetstream historically ships Livewire and Inertia/Vue stacks, not an official React stack. The proposal substitutes the **official Laravel React Starter Kit with Fortify**, retaining the needed auth/2FA features without maintaining an unsupported bridge. Claude Code's review approved this substitution. CODEX: confirm it remains correct as of the review date and that the starter kit still provides the required 2FA/session features.

## 10. Compliance (Philippines) — treat as Phase 0 blockers

- **Data Privacy Act 2012 (RA 10173):** NPC registration where applicable, lawful basis/consent, data subject rights, breach notification, retention limits. These shape the member data model, not just policy footnotes.
- **BIR:** official receipt/acknowledgement numbering and record-keeping rules affect the finance numbering scheme.
- These must be confirmed by qualified local advisers, but the **data model cannot be finalized until they are**.

## 11. Optional AI-assist layer (self-hosted / Ollama)

**Purpose:** the core flaw of the base design is that it *digitizes* the admin burden without *reducing* it — volunteers still type every transaction, minute, and attendance record. The AI layer converts **typing into confirming** and **records into surfaced insight**, freeing volunteer hours for actual service.

**Why local (Ollama), not cloud:** the system holds member PII and bank data. Self-hosting on the private network means AI features with **no sensitive data leaving the premises**, preserving the security posture in §12. This is a security decision, not merely a budget one. Tradeoff: club-affordable local models (7–8B class) are far weaker than frontier models, so features are scoped to tasks small models do reliably.

**Candidate features (ranked by time saved):**
1. ⭐ **Meeting minutes** — local transcription → LLM drafts minutes structured against the agenda; auto-extracts action items into tasks. Secretary corrects and approves.
2. ⭐ **Receipt/expense capture** — photo → OCR + LLM extract vendor/amount/date → pre-fill the expense form. Treasurer confirms.
3. ⭐ **Plain-English financial summaries** — monthly narrative; **numbers computed deterministically by application code, LLM only phrases them.**
4. **"Ask your club"** — semantic search (RAG) over the club's own minutes, projects, and members; read-only; supports continuity/handover.
5. **Impact / grant report drafting** — turn structured impact data into a community report or grant-template draft for human editing.
6. **Engagement narration & onboarding help** — one-sentence disengagement summaries; how-to help for rare-use volunteers.

**Non-negotiable guardrails:**
1. **Local only.** No sensitive data leaves the private network.
2. **AI never writes to the ledger or audit log.** It drafts/suggests; a human posts.
3. **Numbers are code, prose is AI.** All monetary math is deterministic; the model never does arithmetic on money.
4. **Human approval gate on every AI output;** every AI action is itself audited (model, input, who accepted).
5. **Uploaded documents and model output are untrusted input** — prompt injection via a malicious receipt/PDF is a real threat; extracted content is a suggestion, never an action trigger.
6. **Fully degradable.** The system works 100% with AI switched off; AI is never a dependency.
7. **Hardware honesty.** Requires a decent server/GPU; scope to summarize/draft/extract where "occasionally wrong, human reviews" is acceptable — never near money math.

CODEX: assess whether these guardrails are sufficient, whether the AI layer is genuinely optional/isolable, and the realistic hardware footprint and failure modes.

## 12. Security baseline

- Public registration disabled; admins issue invitations.
- Mandatory TOTP 2FA for privileged and finance users; consider requiring it for all.
- Verified email, strong password rules, breached-password screening, login/reset throttling, session revocation.
- Secure, HTTP-only, SameSite cookies; CSRF protection; no auth tokens in browser storage.
- TLS-only production, HSTS, CSP, frame protection, restrictive headers.
- Short idle sessions; password/2FA re-confirmation for sensitive changes, exports, approvals, reversals, bank-data reveal, and role changes.
- Least-privilege policies for every route and record; protection against IDOR/identifier-based authorization failures.
- Application-level encryption for selected member fields and full bank identifiers, keys stored outside the database.
- Mask sensitive values by default; audit explicit reveal actions.
- Private attachments outside the web root, randomized names, MIME/content inspection, size limits, malware scanning, short-lived authorized downloads.
- CSV formula-injection defenses; safe PDF generation with remote resource access disabled.
- Rate limits for authentication, exports, searches, NFC endpoints, sensitive reads, **and AI endpoints**.
- Structured logs with automatic secret/PII redaction.
- Secrets outside source control, rotated under an operational procedure.
- **Right-sized assurance (per §2):** OWASP ASVS Level 2 as the target checklist; replace a mandatory independent penetration test with a **scoped security review at launch** unless budget allows more.

CODEX: produce a concise threat model covering account takeover, broken access control, insider fraud, malicious uploads, injection, export leakage, audit tampering, backup theft, NFC cloning/replay, compromised admin devices, **and prompt injection / data exfiltration via the AI layer**.

## 13. Audit, RFID/NFC, deployment, recovery

**Audit:** capture actor (and impersonator), action/target, safe before/after diffs, UTC timestamp, request ID, IP, user agent, reason for high-risk actions, outcome, export type/filters. Never record passwords, tokens, TOTP secrets, complete bank details, or raw documents. Activity-log tables not writable by ordinary code paths; financial audit events append-only and tamper-evident (hash chain or signed periodic digest) with digests copied to separate immutable storage. Audit access and exports are themselves audited. **Right-size the tamper-evidence to the smallest robust design a volunteer club can operate.**

**RFID/NFC:** USB reader as keyboard wedge entering a randomly assigned card ID into a dedicated check-in screen (no proprietary extension or daemon). Never encode PII on the card; store a keyed hash of the card ID; record source/event/station/server timestamp; debounce duplicate taps; require an authenticated station session with narrow permission; define lost/replaced-card revocation; treat a tap as identification, not authentication. Introduce a local bridge only if hardware can't run in keyboard mode.

**Deployment & recovery (right-sized):** reverse proxy, app container(s), queue worker, PostgreSQL, Valkey, encrypted private object storage. Production DB separated from app containers and off the public internet. **Encrypted daily backups with at least one off-site copy under a separate key, and a tested (e.g., quarterly) restore drill** — prioritize a restore you have actually proven over aspirational RPO/RTO numbers. Centralized error logs, uptime/disk/certificate/queue-failure alerts, incident runbooks. Staging uses synthetic data only. **Add an explicit maintenance & handover plan** (who patches, monthly cost, knowledge transfer across the annual turnover).

## 14. Required review output

Create a Markdown report named `CODEX_ARCHITECTURE_FEEDBACK.md` with:

1. **Executive verdict** — `Approve`, `Approve with changes`, or `Reject`, with a short rationale.
2. **Version & license verification** — each item in §9 confirmed against primary sources, marked *confirmed* / *corrected* / *unverifiable*, with the correct current version and license.
3. **Blocking findings** — must be resolved before scaffolding.
4. **Security findings** — ranked Critical/High/Medium/Low; each with risk, evidence/reasoning, concrete recommendation, and whether it blocks the build. Include the AI-layer threat model.
5. **Financial/accounting findings** — correctness, controls, auditability, and decisions requiring an accountant.
6. **Mission/engagement findings** — whether the §6 additions are genuinely thin layers or hidden large builds; scope-creep risk; sequencing.
7. **AI-assist findings** — sufficiency of guardrails, isolability/optionality, realistic hardware footprint, failure modes.
8. **Architecture & stack findings** — compatibility, maintainability, OSS/license status, simpler alternatives, and the maintenance/bus-factor plan.
9. **Data-model gaps** — missing entities, invariants, retention, tenancy, indexing.
10. **Delivery-plan feedback** — ordering, dependencies, missing gates, realistic scope reductions.
11. **Right-sizing assessment** — call out anything still scoped beyond a volunteer club's capacity to sustain (per §2).
12. **Questions for the owner** — only those whose answers materially change design or scope.
13. **Recommended revised decisions** — a compact decision table with proposed defaults.
14. **Go-signal checklist** — checkboxes that must be satisfied before implementation.

For each finding include: severity, affected area, why it matters, recommended change, and whether it blocks the build. Avoid generic advice — identify concrete failure modes and corrections.

## 15. Open decisions for the owner

1. One club only, or multiple clubs/organizations with hard tenant isolation?
2. Accept Fortify / official React Starter Kit instead of Jetstream itself? (Recommended: yes.)
3. Hosting jurisdiction/provider, expected user count, availability, budget, **and monthly running cost**; realistic RPO/RTO given that budget.
4. Accounting basis, fiscal year, base/additional currencies, chart of accounts, tax/BIR requirements, official report formats, approval thresholds. **(Phase 0 blocker.)**
5. Manual/CSV bank records only, or future direct bank integration?
6. Exact member fields, privacy classification (DPA 2012), retention duration, access matrix.
7. Which §6 mission features are in v1 vs later? (Recommended v1 minimum: the four ⭐ items.)
8. Is the AI-assist layer wanted for v1, or deferred until the core modules are stable? What hardware is available for a local model?
9. RFID/NFC reader, credential format, printer, label dimensions, number of stations, offline behavior.
10. Required data migration sources and quality.
11. May members edit sensitive identity fields directly, or submit change requests for approval?
12. **Who owns ongoing maintenance and the annual officer handover?**

## 16. Proposed delivery plan (phased, with go/no-go gates)

- **Phase 0 — Requirements & controls:** permission & segregation-of-duties matrix; member data dictionary + DPA classification/retention; chart of accounts, fiscal rules, numbering, approvals, BIR obligations, report samples; threat model & security acceptance checklist; RFID/NFC + label-printer proof of concept; hosting, recovery objectives, running-cost and maintenance/handover plan; migration inventory.
- **Phase 1 — Secure foundation:** Laravel React starter, PostgreSQL, Valkey, private storage, queue, CI; invitations, auth, 2FA, sessions, roles, policies, audit foundation; admin/sidebar and member/header layouts; security headers, environment separation, backup automation + first restore drill, authorization tests.
- **Phase 2 — Members:** directory, profile layout/editing, privacy controls, reminders, exports, audits.
- **Phase 3 — Core finance:** chart of accounts, banks, journals, revenue/expense documents, posting, approval, reversal, periods, receivables/payables, core reports, exports.
- **Phase 4 — Attendance + service hours:** events, members/guests, check-in/out, reader integration, corrections, nameplates, exports, **volunteer service-hours logging (⭐)**.
- **Phase 5 — Meetings & awards:** agendas, minutes, decisions, actions, approvals, awards/categories/events, reports.
- **Phase 6 — Projects & impact:** kanban, tasks, assignments, comments, attachments, policy enforcement, **cost-to-impact link and outcome metrics (⭐)**.
- **Phase 7 — Engagement & continuity:** **engagement early-warning (⭐)**, onboarding/mentorship, dues self-service, donation transparency/receipts, **annual handover packet (⭐)**, public impact/annual report.
- **Phase 8 — Advanced finance:** assets, depreciation, bank CSV import/reconciliation, aging, additional statements, year-end close; **grant management if required**.
- **Phase 9 — Optional AI-assist:** introduced only after the module each feature augments is stable; guardrails per §11; fully behind a feature flag.
- **Phase 10 — Hardening & launch:** migration rehearsals + financial reconciliation; accessibility/browser/performance/concurrency tests; ASVS verification; scoped security review; restore drill; user acceptance; training; staged rollout.

Every phase has explicit acceptance tests and a go/no-go review. Finance tests must include duplicate requests, concurrency, rounding, approval conflicts, closed periods, reversals, and interrupted operations. AI features (if built) must include prompt-injection and "AI cannot write to ledger/audit" tests.

---

*Prepared by Claude Code as a revised handoff for independent review by CODEX. Version/compatibility claims in §9 are unverified and must be confirmed by the reviewer. Do not modify this file; record findings in `CODEX_ARCHITECTURE_FEEDBACK.md`.*
