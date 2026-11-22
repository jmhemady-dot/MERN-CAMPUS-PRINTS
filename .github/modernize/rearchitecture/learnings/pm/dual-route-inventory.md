# Dual Route Inventory

When a repository contains both server-rendered PHP pages and a partial SPA, inventories should report the legacy browser URLs, SPA routes, and JSON API endpoints separately.

## What Happened

In INTEG-2 task t3, PHP paths such as `/dashboard.php` coexisted with extensionless React routes such as `/dashboard`, while API paths lived under `/api/`. The React wildcard redirected unknown paths to login, so PHP bookmarks were not automatically equivalent to the SPA routes. Several user-facing behaviors also differed between the PHP and React versions.

## Takeaway

Use source-backed route tables that distinguish browser navigation from API calls. For every overlapping workflow, call out differences as explicit parity risks and let the product/architecture owners decide; do not infer canonical behavior from file presence alone.

## History
- 2026-11-17 (INTEG-2/t3): initial
