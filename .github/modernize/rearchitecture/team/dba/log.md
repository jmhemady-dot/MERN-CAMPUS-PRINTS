## [t2.2] MongoDB import and parity gaps
- Codebase/domain discoveries: legacy IDs are integer user/request IDs; MERN uses ObjectIds. Legacy requests point to absolute paths under `uploads/`, while the MERN upload route uses generated names under `server/private-uploads/`. PHP and MERN persist differently spelled print options.
- Wrong assumptions and corrections: the tracked `uploads/` folder has only `.htaccess`, but this is not proof the legacy database has no rows or that externally stored uploads do not exist. No schema/export was found, so do not mark import readiness.
- Debugging dead-ends and what actually worked: `rg` over all active PHP sources and targeted reads of submission, queue, download, model, and upload route files exposed the exact field/ID/option mapping; repository file inventory confirmed no SQL/CSV/dump.
- Techniques/patterns worth reusing for future tasks: use explicit unique sparse legacy-ID fields and two-pass imports; preserve raw historical options; verify file bytes with checksums; seed the atomic queue counter from imported max; reconcile staging before cutover.
- Learnings consumed: []
