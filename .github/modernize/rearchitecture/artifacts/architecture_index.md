# INTEG-2 Architecture Discovery Index

## Implementation Guide

**This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.**

This discovery task records current endpoints and evidence, not the approved target design. T4 should define target API/page boundaries; T5 should define data migration and recovery details. Every implementation worker must consult `.github/modernize/rearchitecture/artifacts/t2-architect.md` before implementation.

### Global artifacts

- `t2-architect.md` — current PHP and MERN route inventory, behavior/data-flow evidence, inferred legacy model, current Mongoose model, migration gaps, and source anchors. Filter the route tables by your assigned page/API; review the data-model section for request/user/counter/upload flows.
- `constitution.md` — full rewrite, PHP removal, behavioral parity, MongoDB fidelity, and version discipline.
- `clarification.md` / `clarification-answers.md` — authoritative scope: full project, MongoDB, replace/remove PHP, in-place.
- `t1-teamlead.md` — constitution index and upstream follow-ups.

### Unit navigation (current discovery groups)

The grouped current surfaces are: PHP/React site entry and auth; student dashboard; print submission; student queue; student history; admin dashboard; admin request management; Express auth API; student dashboard API; printing API; student request APIs; admin dashboard API; admin request/download APIs; health endpoint. Read the corresponding source paths in `t2-architect.md#Route Inventory`. These are current code groupings, not a committed target unit count.

### Required completion evidence

Report the exact artifacts read, preserve all parity/data requirements referenced from t2, list unresolved route/data/upload/option-semantics gaps, and provide build, test, database migration/reconciliation, and runtime evidence. Do not infer implementation scope from source anchors alone; the approved migration boundary and design belong to later tasks.
