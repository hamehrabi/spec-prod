# TASK-003: Package the blueprint library, read-only

**Task ID:** TASK-003 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-003 (library ships inside the plugin) · REQ-NF-008 (three platforms) · ADR-001 (read-only module)

## Business reason

The interview has nothing to fill in without the templates. They already exist in
`spec-driven-template/`; this task **packages and versions** them. It does not rewrite them —
the subdomain map classifies the library as *supporting*, and re-authoring 90 working
templates is the exact analogue of spending three weeks on authentication.

## Goal

All ~90 blueprints ship inside the plugin, readable from local disk with no network call,
and never written to at run time.

## Inputs

- `spec-driven-template/` — the existing library
- [`subdomain-map.md`](../../01-docs/01-intent/subdomain-map.md) — supporting, build simply
- [`ADR-005`](../../01-docs/05-architecture/architecture-decisions/ADR-005-version-stamp-generated-workspaces.md) — blueprint paths are a stable contract

## Expected files or components

```
blueprints/**                 <- the library, mirroring the template's folder structure
instructions/intake.md        <- gains the blueprint-path map and the missing-blueprint failure
```

## Expected output

- Every blueprint present, readable, and reachable by a stable path.
- A missing blueprint produces the `MISSING_BLUEPRINT` failure: **name it and stop.**
- No blueprint is modified during a run.

## Step-by-step instructions

1. Copy the library into the plugin, preserving folder structure — **paths are a contract** (ADR-005).
2. Record the path map in `instructions/intake.md`. Do not embed blueprint *content* there (ADR-001).
3. Implement the missing-blueprint failure state: name the path, stop, leave prior work intact.
4. Verify every path resolves on all three platforms, including case sensitivity.
5. **Do not** copy `appendix-index.md` — it is template scaffolding, not a project artifact.

## Dependencies

TASK-001.

> **Followed immediately by TASK-021 (integrity manifest), which is also P0.** This task
> packages the library; TASK-021 makes it verifiable. Nothing may read a blueprint for
> generation until both are done — an unverified library produces specifications that are
> subtly wrong and entirely plausible.

## Constraints / Boundaries

- **Do not rewrite, reformat, or "improve" any blueprint.** Packaging only.
- Do not fetch anything at run time (CON-003).
- Do not write to a blueprint during a run — the module is read-only (ADR-001).
- Do not flatten the folder structure. Depth determines back-link arithmetic (UTEST-014).

## Do not change

- Anything in `spec/`.
- The **content** of any blueprint. If one seems wrong, that is a separate change with its
  own decision record — not a quiet edit inside a packaging task.
- The blueprint folder structure or any filename. A rename is a **breaking change** requiring
  a migration note (ADR-005).

## Acceptance check / Done criteria

- [ ] Every blueprint from `spec-driven-template/` is present, except `appendix-index.md`.
- [ ] Each is byte-identical to its source.
- [ ] All read from local disk with the network blocked.
- [ ] A deliberately removed blueprint produces the named failure, and prior rounds survive.
- [ ] All paths resolve on Windows, macOS, and Linux.
- [ ] No blueprint is modified by a run — verified by checksums before and after.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-003 | Full run, network blocked | Every blueprint read from local disk |
| TEST-003 | Compare packaged vs. source | Byte-identical; `appendix-index.md` absent |
| FTEST-004 | Remove one blueprint, run | Named, stopped, prior rounds intact, **nothing improvised** |
| STEST-012 | Checksums of plugin files before/after a run | Unchanged |

## Review checklist

- [ ] Matches REQ-F-003, REQ-NF-008.
- [ ] No blueprint content edited.
- [ ] Tests pass.
- [ ] The missing-blueprint message names the path and says what survived.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Reading, filling, or copying a blueprint into a workspace (TASK-005).
- Any question (TASK-006).
- Improving template content — a separate decision, separately recorded.

## Stop condition

**Stop and ask if:**
- A blueprint seems wrong, outdated, or inconsistent. **Package it as-is and raise it.** Fixing
  it here would be an unrequested content change inside a packaging task.
- The library will not fit, or the plugin mechanism restricts bundled files — that would
  challenge CON-003 and needs a decision, not a workaround.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
