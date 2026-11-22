## 2026-11-17T13:07:22Z — from teamlead (t1)

Constitution established: full-project MERN rewrite, no PHP runtime coexistence, preserve existing behavior and UI, use MongoDB, and defer unresolved target versions to architecture assessment.

Define MongoDB schema, data migration, upload-reference, reconciliation, and recovery details before implementation.

## 2026-11-17T13:18:11Z — from architect (t2)

Source evidence for all roles: the repository still has 11 PHP route files plus PHP/MySQL config; existing React/Express code has mismatched `.php` URL coverage, registration/session behavior, option strings, polling, and upload paths. See `artifacts/t2-architect.md` before finalizing target design or data migration.

## 2026-11-17T13:18:11Z — from pm (t3)

PHP and MERN use different stored print-option values (`Black & White` / `Single Sided` versus `Black and White` / `Single-sided`). Preserve existing data semantics when mapping them.
