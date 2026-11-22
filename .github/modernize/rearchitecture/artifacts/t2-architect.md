# t2 — Current Routes, Data Flow, and MERN Gaps

## Summary

The worktree is a mixed implementation: 12 active PHP files still define the original application, while React/Vite and Express/Mongoose provide a partial replacement. The React routes consume the existing API, but the Express server does not serve the built client. PHP/MySQL data and files have no migration/import path in the inspected source. This is discovery evidence for t4/t5, not a target design decision.

## Current Worktree and Project Shape

- Repository root: legacy PHP page routes and `mobile.css`; `admin/` has three more PHP endpoints; `config/database.php` is PHP/MySQL config; `client/` is React/Vite; `server/` is Express/Mongoose; `uploads/` is the legacy upload location. Two timestamped `_mern_backup_*` directories are present and were left untouched.
- Active PHP entrypoints: `index.php`, `login.php`, `register.php`, `logout.php`, `dashboard.php`, `submit_request.php`, `queue.php`, `history.php`, `admin/dashboard.php`, `admin/requests.php`, `admin/download.php`. `config/database.php` is configuration, not a route.
- React entrypoint: `client/src/main.jsx` → `App.jsx`/React Router. Express entrypoint: `server/index.js` → `config/db.js` and six route modules. The client and server have independent package manifests; there is no root package manifest or observed Express static/fallback handler for `client/dist`.
- Functional areas: account registration/login; student print-request submission; queue monitoring; transaction history; admin dashboard, request/status management, and document download.
- Worktree was already dirty before this task: modified `project-profile.yaml`, `board.md`, `client/src/pages/AuthPages.jsx`, `server/routes/auth.js`; untracked auth components/pages/utilities and server controller/middleware/utilities. No source or pre-existing artifact was changed by this task.
- `.github/modernize/rearchitecture/context.md`, `decisions.md`, and `team/architect/log.md` did not exist at inspection time. T1 constitution and clarification answer were available and used.

## Route Inventory

### Legacy PHP URLs and behavior

| Trigger | Source | Current behavior |
|---|---|---|
| `/` → `/login.php` | `index.php:1` | Redirect to login. |
| `POST /login.php` | `login.php:4-43` | Looks up email, verifies password, sets PHP session; redirects admin to `admin/dashboard.php`, other roles to `dashboard.php`. Distinct “User Not Found” / “Invalid Password” messages. |
| `POST /register.php` | `register.php:4-68` | Creates student/faculty account; duplicate-email and success/failure messages; registration does not itself establish a session. |
| `/logout.php` | `logout.php:3-8` | Destroys session and redirects to login. |
| `/dashboard.php` | `dashboard.php:1-49` | Session-gated student summary: total/pending/completed, latest queue number, recent requests. |
| `POST /submit_request.php` | `submit_request.php:9-138` | Session-gated multipart document upload and print-request creation; cost is pages × copies × (color ? 5 : 1). |
| `/queue.php?request_id=…` | `queue.php:1-64,726-764` | Shows selected active request owned by session user, otherwise latest active; ahead/total count only Pending/In Progress/Printing; wait estimate is ahead × 2 minutes. Refreshes visible page every 15 seconds. |
| `/history.php?search=…` | `history.php:1-78` | User-scoped filename substring search and request totals/completed/pages/cost; sorted newest ID first. |
| `/admin/dashboard.php` | `admin/dashboard.php:1-105` | Admin-only counts, recent requests, seven-day activity; visible dashboard data refreshes every 30 seconds unless menu/form interaction is active. |
| `/admin/requests.php?search=…` | `admin/requests.php:1-93` | Admin-only search by student name, filename, or queue-number substring; status update is CSRF-protected POST and redirects after update. |
| `/admin/download.php?id=…` | `admin/download.php:1-121` | Admin-only download by legacy integer request ID; validates stored path stays under `uploads/`, sets content/security headers. |

### Current React routes

`client/src/App.jsx:13-20`: `/admin` → `/admin/dashboard`; `/admin/dashboard`, `/admin/requests`, `/dashboard`, `/submit-request`, `/queue`, `/history`, `/login`, `/register`; `/` and unknown paths redirect to `/login`. Queue accepts `request_id`; history accepts `search`. Current SPA path names do not preserve the old `.php` paths.

### Current Express API

All API routes are mounted under `/api` by `server/index.js:19-28`.

| Endpoint | Source | Contract/data flow |
|---|---|---|
| `GET /api/health` | `server/index.js:28` | Returns static `status: ok`, message, and `database: connected`; server starts only after Mongo connection succeeds. |
| `POST /api/auth/register` | `routes/auth.js:16`, `controllers/authController.js:5-53` | Validates student/faculty registration, lowercases email, hashes password, creates `User`, sets 1-day HttpOnly JWT cookie; returns 201 and public user. |
| `POST /api/auth/login` | `routes/auth.js:17`, `authController.js:56-83` | Email/password authentication, sets same cookie; 401 on invalid credentials. Auth routes share a 10-attempt/15-minute limiter. |
| `GET /api/auth/me`, `POST /api/auth/logout` | `routes/auth.js:19-23` | Returns cookie-authenticated public user; logout clears `campus_token`. |
| `GET /api/dashboard/student` | `routes/dashboard.js:9` | Cookie/JWT lookup; student/faculty summary and five newest requests; admin gets an empty preview response. |
| `POST /api/printing` | `routes/printing.js:65-139` | Authenticated student/faculty multipart request; 10MB limit, extension/MIME/signature checks; increments Mongo `counters.printQueue`, writes file under `server/private-uploads`, creates `PrintRequest`, cleans up saved file on error. |
| `GET /api/student/queue?request_id=…` | `routes/studentRequests.js:26-63` | User-owned active requests; selected request falls back to latest; returns queue ahead/total and estimate. File path is omitted. |
| `GET /api/student/history?search=…` | `routes/studentRequests.js:66-108` | User-scoped filename regex search; returns stats and at most 500 requests, sorted by createdAt. |
| `GET /api/admin/dashboard` | `routes/adminDashboard.js:27-121` | Admin-only counts, recent requests, seven-day activity. |
| `GET /api/admin/requests?search=…` | `routes/adminRequests.js:46-100` | Admin-only joined student/request search, capped at 200 rows; queue number search is exact numeric equality. |
| `PATCH /api/admin/requests/:id/status` | `routes/adminRequests.js:102-124` | Admin-only status update; validates ObjectId and status enum; checks request Origin. |
| `GET /api/admin/requests/:id/download` | `routes/adminRequests.js:126-180` | Admin-only download from `server/private-uploads`, constrained UUID filename, safe path and response headers. |

Client pages call these APIs through `client/src/services/api.js` (`withCredentials`, default `http://localhost:5000/api`). The server reads `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `PORT`; secret values in `server/.env` were not inspected.

## Data Model and Cross-Flow Evidence

### Legacy MySQL model (inferred from SQL; no DDL/schema dump was found)

- `users`: integer `id` is used as request owner; fields observed are `fullname`, `student_id`, `email`, `password`, `role`. Registration permits `student`/`faculty`; admin accounts are managed separately in the MERN `createAdmin.js` script.
- `print_requests`: integer `id`; `user_id`; `filename`; `file_path`; `copies`; `paper_size`; `color_mode`; `pages`; `print_type`; `orientation`; `queue_number`; `estimated_cost`; `status`; `created_at`; `updated_at` (admin update explicitly sets updated time). User/request relationship is one-to-many.
- Existing upload records point to files under root `uploads/`. The inspected directory contained `.htaccess` only; no uploaded bytes were migrated or copied by inspected code.

### Current Mongoose model

- `User` (`server/models/User.js:3-32`): ObjectId identity; required trimmed `fullname`, required unique lowercase `email`, `password` excluded by default; optional `student_id`; enum `role` defaults to student; Mongoose camelCase timestamps.
- `PrintRequest` (`server/models/PrintRequest.js:3-69`): `user_id` is required ObjectId ref to `User`; filename/path, pages/copies, options, globally unique numeric queue number, estimated cost and five-status enum; timestamps are `createdAt`/`updatedAt`.
- Print request submission writes a separate `counters` document (`_id: printQueue`). Current creation does not establish a transaction spanning sequence increment, filesystem write, and request insert.

### Required fidelity / data decisions for downstream

1. Integer IDs and relations must map to ObjectIds and preserve every user/request association; the source SQL schema, export, constraints, and current database contents are unavailable here, so exact source types/nullability/unique rules remain unverified.
2. No MySQL-to-Mongo importer, backfill, reconciliation, or rollback procedure was found. Existing request queue maxima must inform counter initialization; starting a fresh counter at 1 can collide with legacy queue numbers.
3. Keep upload bytes and records associated: legacy root `uploads/` vs current `server/private-uploads/` are different roots. No file migration or reference rewrite was found.
4. Persisted option spellings differ: PHP form uses `Black & White`, `Single Sided`, `Double Sided`; React/API use `Black and White`, `Single-sided`, `Double-sided`. Both currently price colored work as 5 and black-and-white as 1 per page per copy. Legacy values need an explicit lossless mapping or compatible handling.
5. Registration differs: PHP only shows success and leaves user logged out; current MERN registers, sets cookie, and navigates to dashboard. Product parity authority for this behavior is not established by code inspection.

## MERN Gaps and Risks

- **HIGH — PHP removal incomplete:** active PHP routes and MySQL config remain. User-selected cleanup requires replacement/removal, not dual runtime.
- **HIGH — data/file cutover undefined:** no MySQL export/schema or migration/reconciliation script is present; uploaded file references cross incompatible directories.
- **HIGH — deployment/runtime gap:** Express has API routes only; no static SPA serving/fallback. There is no root package manifest or documented combined start command; separate dev servers are implied.
- **HIGH — route compatibility:** PHP `.php` route paths and integer `request_id`/download `id` are not SPA route aliases; React/API use different clean paths and ObjectIds. Confirm how existing bookmarks/external links must behave before finalizing URL compatibility.
- **WARNING — observable refresh behavior:** PHP queue reloads every 15s and admin dashboard every 30s with interaction guards; React queue/dashboard fetch once on mount and do not poll.
- **WARNING — admin search semantics:** PHP queue-number matching is substring; MERN requires exact numeric match. PHP results are not explicitly capped; MERN caps at 200. Student history is capped at 500 in MERN but no corresponding PHP cap was observed.
- **WARNING — partial behavior drift:** admin activity grouping uses local PHP date vs explicit `Asia/Manila` in Mongo implementation. PHP and MERN registration feedback/session outcomes also differ.
- **WARNING — quality setup:** client manifest has build/lint but no test script; server `test` is a failing placeholder. No root build/test orchestration was found.
- Node observed in this shell: v26.13.1; npm.cmd: 11.20.0. PHP was not installed/on PATH. These are environment observations, not approved target-version decisions. Preserve manifest declarations pending compatibility review per t1.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-teamlead.md` — read constitution, project profile, manifest/version policy, and t1 follow-ups.
- `.github/modernize/rearchitecture/artifacts/constitution.md` — applied full rewrite/PHP removal, parity, Mongo fidelity, and version discipline.
- `.github/modernize/rearchitecture/clarification.md` and `clarification-answers.md` — used confirmed full-project scope, MongoDB, PHP replacement, and in-place output.
- `.github/modernize/rearchitecture/board.md` — checked task dependencies/status; treated as read-only.
- `.github/modernize/rearchitecture/learnings/teamlead/mern-constitution-version-policy.md` — kept declared package ranges as evidence; did not approve or substitute target versions.

## Evidence Mapping

- `clarification-answers.md#Clarification-Answers` and `constitution.md#Migration Mode` → this report’s PHP route inventory and **MERN Gaps** (PHP runtime must be removed).
- `constitution.md#Core Principles II–IV` → **Route Inventory**, **Data Model and Cross-Flow Evidence**, and explicit route/data/upload/version gaps.
- `t1-teamlead.md#Open Follow-ups` → MERN runtime observations, missing schema/migration evidence, package test gaps, and subsequent DBA/architecture work.
- Source anchors in the Route Inventory and Data Model sections → endpoint/page behaviors, collection fields, cross-flow rules, and identified mismatches.

## Verification

- Read-only inspection only; no source files, config, or pre-existing user changes were modified.
- Checked route declarations, all active PHP entrypoint logic, the Express route modules, models, React router/API pages, package manifests, source file inventory, and `git status`.
- No build or test run: this is a discovery artifact task, not an implementation or smoke-test assignment.
