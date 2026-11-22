## 2026-11-17T13:07:22Z — from teamlead (t1)

Constitution established: full-project MERN rewrite, no PHP runtime coexistence, preserve existing behavior and UI, use MongoDB, and defer unresolved target versions to architecture assessment.

Coordinator follow-up: ratification date and task-breakdown format were flagged. The user now asks to move quickly, prioritize a minimal working end-to-end migration, and defer nonessential artifacts. Leave the ratification date deferred rather than blocking; use concise, vertical feature-based task breakdowns. Test gaps and PowerShell's `npm.ps1` restriction should inform later validation.

## 2026-11-17T13:18:11Z — from architect (t2)

Source evidence for all roles: the repository still has 11 PHP route files plus PHP/MySQL config; existing React/Express code has mismatched `.php` URL coverage, registration/session behavior, option strings, polling, and upload paths. See `artifacts/t2-architect.md` before finalizing target design or data migration.
