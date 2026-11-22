## [t2] Traced PHP, React, Express, and Mongo data flows
- Existing repository is a mixed app: 11 PHP route files plus PHP DB config remain alongside the React/Vite client and Express/Mongoose API.
- PHP uploads use root `uploads/`; Express uses `server/private-uploads/`. No data/file importer or source DDL was present in the inspected tree.
- URL paths, registration session behavior, request option spellings, and page refresh behavior differ between PHP and React/MERN.
- Worktree was already dirty in project profile/board/auth code; left all pre-existing changes untouched.
- Learnings consumed: [teamlead/mern-constitution-version-policy]

## [t2.1] Specified PHP URL aliases and SPA serving parity
- Existing React routes are extensionless and have no `.php` aliases; Express has no built-client serving or HTML navigation fallback.
- Preserve legacy browser paths as React aliases; keep form-action and admin-download compatibility in Express before the SPA fallback.
- Numeric legacy request IDs resolve through the DBA's unique sparse `PrintRequest.legacy_id` to Mongo IDs for queue selection, admin updates, and downloads; do not guess the translation.
- Consumed t2.2 DBA guidance: preserve raw historical option labels and accept legacy spellings during compatibility handling until a product decision establishes canonical storage/display labels.
- Express 5 wildcard syntax must use a named wildcard; `/{*splat}` includes `/` (verified against the official migration guide).
- Learnings consumed: [architect/legacy-mern-parity-gaps, pm/dual-route-inventory]
