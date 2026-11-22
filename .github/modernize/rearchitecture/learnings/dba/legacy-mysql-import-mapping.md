# Legacy MySQL Import Mapping

Migrate auto-increment IDs through explicit legacy-ID fields, preserve raw option values, and verify uploaded bytes before switching request paths to private storage.

## What Happened

In INTEG-2 task t2.2, legacy PHP stores integer user/request IDs, integer foreign keys, option labels that differ from the existing MERN client, and absolute upload paths under `uploads/`; the MERN side uses ObjectIds and `private-uploads/`. No SQL export/schema or real upload files were available, so safe import execution could not be claimed.

## Takeaway

For MySQL-to-MongoDB rewrites, preserve source auto-increment identifiers in indexed `legacy_id` fields while MongoDB ObjectIds remain internal IDs; map foreign keys using the legacy-ID lookup. Keep source option strings or an explicit source-value field until canonical labels are approved. Import files with checksums and rewrite only to generated safe basenames. Stage and reconcile the import before cutover.

## History
- 2026-11-17 (INTEG-2/t2.2): initial
