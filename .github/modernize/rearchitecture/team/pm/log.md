## [t3] Inventory existing routes and user-visible behavior
- Codebase/domain discoveries: The repository has parallel PHP page URLs and extensionless React routes; the SPA catch-all redirects unknown URLs to login. Legacy and current React behavior diverges for registration completion, print-option vocabulary, queue refresh/order, faculty labeling, and request cost breakdown.
- Wrong assumptions and corrections: There is no `context.md`, `decisions.md`, or prior PM log in the supplied context store; the constitution, clarification, t1 index, and current source provided enough scope for this inventory.
- Debugging dead-ends and what actually worked: No knowledge graph or topology artifact was present; route searches plus source reads of PHP pages, React pages, and Express mounts established the behavioral surface.
- Techniques/patterns worth reusing for future tasks: Keep legacy PHP browser routes separate from `/api/*` routes in route inventories; record coexisting implementation discrepancies as parity questions rather than selecting one silently.
- Learnings consumed: (none)
