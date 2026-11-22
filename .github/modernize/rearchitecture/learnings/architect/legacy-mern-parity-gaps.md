# Legacy MERN Parity Gaps

When a PHP application already has a partial React/Express/Mongoose replacement, route names alone do not prove behavioral or data parity.

## What Happened

INTEG-2 task t2 found legacy PHP routes and MySQL references coexisting with React pages and Mongo-backed APIs. The two sides differed in URL paths, registration session outcome, request-option strings, refresh cadence, ID types, and upload directories. No SQL DDL/data import or file-reference migration was present in the inspected source.

## Takeaway

Inventory both legacy and replacement routes and trace each to its persistence and file effects. Before cutover, explicitly map MySQL integer IDs/relationships, status and option values, sequence counters, timestamps, and upload bytes/paths; verify all public paths and refresh behavior. Treat existing MERN code as partial evidence, not proof of parity.

For a PHP-to-SPA replacement, keep old page URLs as explicit client-router aliases so Vite and production behave alike; serve the production bundle through Express with a navigation-only fallback after API 404 handling. Legacy form actions and downloads need exact Express adapters, not the SPA fallback. Resolve integer IDs through the DBA-owned import mapping before selecting or downloading a migrated request. Preserve historical option strings and defer canonicalization until product approval.

## History
- 2026-11-17 (INTEG-2/t2): initial
- 2026-11-17 (INTEG-2/t2.1): added PHP URL alias, Express SPA fallback, and legacy-ID guidance
