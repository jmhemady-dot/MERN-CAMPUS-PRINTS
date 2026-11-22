# t3 — Existing Routes and User-Visible Behavior

Observed from the current worktree on 2026-11-17. This is a behavior inventory, not a design proposal. The repository currently contains both PHP pages and a React/Express application; where their behavior differs, both observations are recorded rather than silently choosing one.

## Scope Baseline

- **Discovery method**: Listed the repository files, searched PHP/React/Express route declarations and links, then read the route pages, forms, client screens, and API route mounts directly.
- **Total items discovered**: 12 browser-route categories (including root and unmatched paths) and 13 Express API operations, plus the user-facing behaviors in this artifact.
- **Items in scope**: All discovered account, student, administrator, request, upload, download, queue, history, navigation, and empty/error-state behaviors; no product behavior was excluded.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-teamlead.md` — migration scope and handoff context.
- `.github/modernize/rearchitecture/artifacts/constitution.md` — especially Principle II (behavior and route parity) and Principle III (preserve request data semantics).
- `.github/modernize/rearchitecture/clarification.md` — user-confirmed full-project scope, MongoDB, PHP replacement/removal, and existing-UI constraint.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — repository/module context.

## Evidence Mapping

- `clarification.md#Generic` → this inventory covers the full application surface while treating PHP as legacy behavior to replace, not a runtime to retain.
- `constitution.md#II` → route inventory, authentication outcomes, workflow behavior, responsive navigation, and parity discrepancies below.
- `constitution.md#III` → request fields, option values, cost calculation, queue number, and status lifecycle below.
- `project-profile.yaml#project.structure` → route evidence spans the legacy PHP pages and existing React/Express components.

## Route Inventory

### Browser routes

| Existing PHP route | Current React route | Access and observed behavior |
|---|---|---|
| `/` (`index.php`) | `/` | Sends visitors to login. React replaces the URL with `/login`. |
| `/login.php` | `/login` | Public sign-in page; success sends admins to the admin dashboard and other accounts to the student dashboard. Failed sign-in shows an error. |
| `/register.php` | `/register` | Public student/faculty account form; duplicate/failed registration shows an error. Current React registration signs the new account in and navigates to its dashboard; PHP instead stays on the form and displays a success message. |
| `/logout.php` | No browser page; logout is an action | Ends the signed-in session and returns to login. |
| `/dashboard.php` | `/dashboard` | Signed-in student/faculty dashboard: counts, most recent queue number, latest five requests, navigation and quick actions. |
| `/submit_request.php` | `/submit-request` | Signed-in student/faculty print-request form with document upload, print options, estimated cost, and submission result. |
| `/queue.php[?request_id=…]` | `/queue[?request_id=…]` | Signed-in student/faculty active queue monitor; may show a selected active request or fall back to the most recent active request. |
| `/history.php[?search=…]` | `/history` | Signed-in student/faculty request history, aggregate totals, and filename search. |
| `/admin/dashboard.php` | `/admin/dashboard` (`/admin` redirects here) | Admin-only counts, seven-day activity, recent requests, quick actions. |
| `/admin/requests.php[?search=…]` | `/admin/requests` | Admin-only request search, details, status updates, and document download. |
| `/admin/download.php?id=…` | No browser page; download action | Admin-only document attachment download for a request. |
| Any unmatched URL | React wildcard redirects to `/login` | The current SPA does not provide equivalent `.php` URL handling. |

### Express API routes currently present

| Method and path | Visible purpose |
|---|---|
| `GET /api/health` | Reports that the Campus Prints API is running. |
| `POST /api/auth/register` | Creates a student/faculty account; current behavior also starts a signed-in session. |
| `POST /api/auth/login` | Signs in and returns the account role used for navigation. |
| `GET /api/auth/me` | Returns the signed-in account summary. |
| `POST /api/auth/logout` | Ends the signed-in session. |
| `GET /api/dashboard/student` | Supplies the student dashboard totals, recent requests, and latest queue number. |
| `POST /api/printing` | Creates a print request and returns its queue number and estimated cost. |
| `GET /api/student/queue[?request_id=…]` | Supplies active requests, selected request, ahead count, queue count, and wait estimate. |
| `GET /api/student/history[?search=…]` | Supplies a user's history, totals, and search results (up to 500 records). |
| `GET /api/admin/dashboard` | Supplies aggregate status counts, seven-day order activity, and recent requests. |
| `GET /api/admin/requests[?search=…]` | Supplies admin request search results (up to 200 records). |
| `PATCH /api/admin/requests/:id/status` | Updates a request to one of the five defined statuses. |
| `GET /api/admin/requests/:id/download` | Downloads the request document for an administrator. |

The API is not a substitute for browser-route parity: legacy `.php` paths and query-string URLs are still part of the observed application surface.

## User Scenarios & Testing

### User Story 1 — Sign in and access account area (Priority: P1)

A student, faculty member, or administrator can access the application with their account and reach the correct area.

**Why this priority**: Authentication gates every request and administrator function.

**Independent Test**: Exercise registration, valid/invalid sign-in, role-specific destinations, protected-route access, and logout using one account per role.

**Acceptance Scenarios**:
1. **Given** a valid student or faculty account, **When** the user signs in, **Then** the student dashboard opens and account-specific requests are shown.
2. **Given** a valid administrator account, **When** the user signs in, **Then** the administrator dashboard opens.
3. **Given** invalid credentials or an unauthenticated protected-route visit, **When** the user submits or navigates, **Then** the user sees an error or is returned to login.

### User Story 2 — Submit and track a print request (Priority: P1)

A signed-in student or faculty member can submit a document, choose print settings, and follow the request through the queue.

**Why this priority**: Request submission and status tracking are the primary service journey.

**Independent Test**: Submit a valid supported file and verify the cost, queue number, initial status, active-request view, and subsequent status changes.

**Acceptance Scenarios**:
1. **Given** a valid file and valid print choices, **When** the user submits the request, **Then** the user sees the queue number and estimated cost.
2. **Given** an active request, **When** the user opens Queue Monitor, **Then** its status, progress, wait summary, and active request list are visible.
3. **Given** no active requests, **When** the user opens Queue Monitor, **Then** an explanatory empty state offers the next action.

### User Story 3 — Review past requests (Priority: P2)

A signed-in student or faculty member can search past requests and review totals.

**Why this priority**: Users need to verify prior work and spending after a request leaves the active queue.

**Independent Test**: Create requests with different filenames/statuses, search by filename, and compare the displayed rows and aggregate totals with those records.

**Acceptance Scenarios**:
1. **Given** one or more requests, **When** the user opens Transaction History, **Then** requests appear newest-first with queue, file, copy/page, cost, status, and date details.
2. **Given** a filename search with no matches, **When** results load, **Then** the user sees a no-matches state while account-wide totals remain visible.

### User Story 4 — Process requests as an administrator (Priority: P1)

An administrator can monitor workload, find a request, change its status, and retrieve its submitted document.

**Why this priority**: Request processing and document access complete the service workflow.

**Independent Test**: Sign in as an administrator, inspect the dashboard, search a request, update its status, download its file, and confirm a non-admin cannot access those actions.

**Acceptance Scenarios**:
1. **Given** requests exist, **When** the administrator opens the dashboard, **Then** total/status counts, seven-day activity, and recent requests are shown.
2. **Given** a matching request, **When** the administrator searches and updates its status, **Then** the request details remain visible and a success or failure outcome is shown.
3. **Given** a request with an available document, **When** an administrator downloads it, **Then** the file is returned; a non-admin is denied.

## User-Visible Behavior Inventory

### Account access

- Login requires email and password. A successful admin login opens the admin area; student and faculty accounts open the student area. PHP distinguishes “User Not Found” from “Invalid Password”; current React reports a generic invalid-credentials message.
- Registration collects full name, student/employee ID, email, account type (Student or Faculty), and password. Duplicate email is rejected. PHP displays registration success without signing the user in; the current React flow signs in immediately and redirects.
- Logout returns to login. Requests to protected pages without a valid session return the user to login. Admin pages reject non-admin accounts with an access-denied outcome.
- Student navigation links Dashboard, Submit Request, Queue Monitor, Transaction History, and Logout. Admin navigation links Dashboard, Manage Requests, Student View, and Logout.

### Student dashboard

- Shows the signed-in name, pending count, total request count, completed count, and the queue number for the user's most recent request (or `-` when there is none).
- Shows up to five recent requests with filename, queue number, and status; an empty account sees “No requests yet.”
- Quick actions open request submission, queue monitoring, and transaction history.

### Submit print request

- Requires a document and accepts PDF, DOC, DOCX, JPG/JPEG, or PNG files up to 10 MB.
- Collects copies (1–100), pages (1–1000), paper size (A4, Letter, Legal), color mode, print type, and orientation (Portrait/Landscape).
- The legacy PHP form dynamically summarizes each selection and estimates cost as copies × pages × ₱1 for black-and-white or ₱5 for colored printing. Success reports the assigned queue number and estimated cost and links to Queue Monitor; validation or storage failures show an error.
- A new request begins as `Pending`; the assigned queue number is shared across requests.

### Queue monitor

- Shows the selected active request's queue number and status, number of requests ahead, estimated wait, total in queue, progress, and a table of the user's active requests.
- Progress by status: Pending 10%, In Progress 35%, Printing 65%, Ready for Pickup 90% (Completed is 100% in the progress mapping but completed requests are not active-list entries).
- Wait text is “Ready to collect” for Ready for Pickup, “Printing now” for Printing, “Being prepared” for In Progress, or approximately two minutes per request ahead for other statuses.
- A supplied request ID is honored only when it belongs to the current user and is active; otherwise the latest active request is shown. With no active requests, the page explains that completed requests are in Transaction History and offers a new-request action.
- The legacy PHP page refreshes its information every 15 seconds while visible.

### Transaction history

- Lists the user's requests newest-first, including filename, queue number, copies, pages, estimated cost, status, and date.
- Shows total requests, completed requests, total pages, and total cost. Filename search filters the displayed rows; the totals describe the user's full history. An empty result shows “No matching requests.”
- Current React history limits displayed rows to 500 and indicates when the result is limited.

### Administrator area

- Dashboard shows total requests and counts for Pending, In Progress, Printing, Ready for Pickup, and Completed; a seven-day activity chart; a status summary; and up to five recent requests with student, queue, filename, and status.
- Manage Requests searches by student name, filename, or queue number and shows student name/ID, file, queue number, pages, copies, cost, and status. Results are ordered by queue number.
- An administrator may download the submitted document and change a request to Pending, In Progress, Printing, Ready for Pickup, or Completed. A successful update is reflected on the request list; errors are shown to the administrator.

### Shared presentation and states

- Student and admin screens provide responsive mobile navigation, a dark/light appearance toggle saved across visits, and links between the relevant areas.
- Pages show loading and request-failure feedback where data is fetched. Empty states exist for no dashboard requests, no active queue requests, no history matches, and no administrator search matches.
- Authentication failures return users to login in the current React pages; administrator authorization failures are displayed as an “Administrators only” message.

## Requirements

### Functional Requirements

- **REQ-001 — Public entry and routes:** Visiting `/` reaches login; all listed account, student, admin, and download journeys remain reachable at their approved URLs, including existing `.php` bookmarks and query parameters or an explicitly approved replacement mapping.
- **REQ-002 — Registration:** A user can submit all five registration fields, choose Student or Faculty, receive a clear duplicate/validation/success outcome, and then follow the approved post-registration sign-in behavior.
- **REQ-003 — Sign-in and sign-out:** Correct credentials open the role-appropriate area; incorrect credentials show a useful error; logout returns the user to login; protected student/admin pages enforce their access outcome.
- **REQ-004 — Student dashboard:** The three counts, latest queue number, five latest requests, empty state, and three quick actions agree with the signed-in user's requests.
- **REQ-005 — Request submission:** A user can submit an allowed document with valid options, see the calculated amount and success queue number, and receive a visible error for missing/invalid/oversized submissions.
- **REQ-006 — Queue tracking:** A user can view the latest active request or select another of their active requests, see the specified status/progress/wait data, and see an actionable empty state when none are active. Queue data refreshes on the observed 15-second cadence.
- **REQ-007 — History:** A user can search by filename, view matching requests newest-first, and see accurate account-wide request/completion/page/cost totals and an empty-result state.
- **REQ-008 — Admin dashboard:** An administrator can see total and per-status counts, seven days of activity, recent requests, and links to manage requests or switch to Student View.
- **REQ-009 — Admin request management:** An administrator can search by student, filename, or queue number; see the request details; set any allowed status; and receive success/failure feedback.
- **REQ-010 — Document download:** An administrator can download the request's original document; unauthorized users and missing/unavailable documents receive a failure outcome rather than a misleading successful download.
- **REQ-011 — Shared UX:** Existing responsive navigation, stored dark/light preference, visible loading/error/empty states, and route-to-route navigation remain available.

### Key Entities

- **Account**: Full name, student/employee ID, email, password credential, and student/faculty/administrator role.
- **Print request**: Owner, original filename, print choices, copies, pages, estimated cost, queue number, lifecycle status, and creation/update times.
- **Uploaded document**: The submitted file associated with one print request and retrieved by administrators.
- **Queue position**: A request's place in the shared queue, its current status, number of requests ahead, and displayed wait estimate.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 12 discovered browser-route categories are reachable at their approved paths, including the agreed treatment of legacy `.php` URLs and query parameters.
- **SC-002**: All 5 request statuses appear correctly in student tracking and administrator processing, with the specified progress and wait text for each relevant state.
- **SC-003**: A valid submission reports the correct queue number and cost; the displayed cost equals copies × pages × the applicable ₱1 or ₱5 per-page rate.
- **SC-004**: Student history totals reconcile with the user's full set of requests, including request count, completed count, pages, and cost, regardless of filename filtering.
- **SC-005**: All 6 documented file extensions and the 10 MB limit are accepted/rejected consistently with the user-facing validation rules.
- **SC-006**: Each of the 4 prioritized user journeys above has a repeatable acceptance test for success and its documented denied, invalid, or empty state.

## Parity Questions and Risks for Downstream Owners

1. **Legacy URL continuity:** PHP uses `.php` paths (including `/admin/download.php?id=`); the current SPA has extensionless paths and redirects unmatched paths to login. Preserve old URLs as aliases or explicitly approve a URL change; do not silently drop existing links/bookmarks.
2. **Registration outcome:** PHP stays on the registration form with “Registration Successful!”; current MERN signs the new user in and redirects. Product confirmation is needed if the target should preserve the PHP outcome or the existing MERN outcome.
3. **Print option values/data:** PHP uses `Black & White`, `Single Sided`, and `Double Sided`; current MERN uses `Black and White`, `Single-sided`, and `Double-sided`. This affects visible labels and stored data; DBA/backend owners must map existing values without loss and the product owner should approve canonical labels.
4. **Queue refresh/order:** PHP refreshes every 15 seconds and lists active requests by ascending queue number. Current React queue page does not refresh automatically and its API returns active requests descending. Confirm and restore the observed PHP behavior unless a product decision says otherwise.
5. **Account labels:** PHP labels every student-area account “Student Account”; React labels faculty “Faculty Account.” Confirm whether to preserve the legacy label or use the more specific current label.
6. **Registration validation:** PHP requires name, ID, email, role, and password in the form but does not impose the current React/server length rules. Current React/server restrict full name to 2–150 characters, ID to 100 characters, and password to 8–72 characters. Treat the stricter rules as behavior changes that need approval or explicit migration acceptance.
7. **Request summary and currency:** PHP displays a live breakdown of copies, pages, paper, color, orientation, print type, price per page, and total; current React displays the total only. The React success message also says `PHP` while its live estimate uses `₱`; preserve the full breakdown and consistent currency presentation.
8. **Queue status semantics:** Both implementations expose the five statuses above, but queue counts exclude Completed and Ready for Pickup. Verify these exclusions and the per-status wait/progress text explicitly in migrated behavior.
9. **Login failure message:** PHP distinguishes a missing account from an incorrect password; current React shows a generic invalid-credentials message. Confirm the intended user-facing outcome rather than restoring account enumeration by assumption.

## Verification

- Cross-checked browser routes against `index.php`, PHP page links/forms, React `App.jsx`, and Express route mounts.
- Cross-checked key form fields, status labels, queue selection/count/wait behavior, history columns/totals, and admin actions against their page sources and current React/API behavior.
- No application files were changed. No runtime tests were run because this task produces a documentation-only inventory; route and behavior checks should be executed by the implementation/test owners against the migrated app.
- The worktree was already dirty before inventory began. Existing changes were read-only during this task and left untouched.
