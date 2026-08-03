# TASK-004: The boundary layer — path check, collisions, protected files

**Task ID:** TASK-004 · **Priority:** P0 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-014, REQ-F-024, REQ-F-025, REQ-F-026, REQ-F-035, REQ-F-036 · REQ-R-002 ·
BR-008 · SEC-A-003, SEC-Z-001, SEC-Z-002 · ADR-004

## Business reason

**This task exists before the first write, and that ordering is not negotiable.** A kit that
can write before it can refuse to write will write in the wrong place — during its own
development, on a real repository. Every denial test is written and passing before any file
is ever created.

## Goal

One rule, enforced before every proposed write: **destinations resolve inside `spec/`, or the
run stops and asks.** Plus the three protected cases: an existing root `CLAUDE.md`, an existing
`.gitignore`, and a `spec/` the kit did not create.

## Inputs

- [`security-specification.md`](../../01-docs/07-security-and-reliability/security-specification.md) §2, §3, §7
- [`ADR-004`](../../01-docs/05-architecture/architecture-decisions/ADR-004-fixed-spec-folder-no-state-file.md)
- [`security-tests.md`](../../03-tests/03-non-functional/security-tests.md) — twelve denials

## Expected files or components

```
instructions/boundary.md      <- the rule, the order of checks, the refusal messages
instructions/intake.md        <- gains: run boundary.md before proposing ANY write
```

## Expected output

```
Before proposing ANY write:
  1. Normalise the destination path.          <- BEFORE the check, never after
  2. If it does not resolve inside <repo>/spec/  -> STOP and ask, naming the PATH ONLY.
  3. If it is the developer's root CLAUDE.md or .gitignore -> STOP. Never propose it at all.
  4. Otherwise propose it and let the host's per-file prompt decide.

Never invert this: do not write and then check. There is no undo.
```

Plus, before the first write of a run: if `spec/` exists and is not a kit workspace, **stop
before writing anything**, explain, and offer an alternative folder name.

## Step-by-step instructions

1. Write the ordered check in `instructions/boundary.md`, with normalisation **first**.
2. Write the refusal message shape: name the path and the line range — **never the file's contents**.
3. Add the two absolute protections (`CLAUDE.md`, `.gitignore`): never proposed, at all.
4. Add the collision detection: how a kit workspace is recognised, and what is offered instead.
5. Wire it into `intake.md` as a precondition on every write.
6. Write all twelve denial tests **and see them fail** against a version without the boundary.

## Dependencies

TASK-001.

## Constraints / Boundaries

- **Never request blanket write permission** (SEC-Z-002). The host's per-file prompt is the
  only enforcement independent of the kit's own behaviour.
- Normalise **before** comparing. A prefix check accepts both `spec/../../etc/hosts` and
  `specimen/x.md`. This is the single most likely defect in the product.
- A refusal message names the **path**, never the target file's contents (STEST-013).
- Do not build a configurable policy layer, an allowlist DSL, or a sandbox abstraction. One
  rule, hard-coded. Security is a constraint here, not a driver, precisely so this stays small.

## Do not change

- Anything in `spec/`.
- The developer's `CLAUDE.md` or `.gitignore` — under **any** circumstance, including when
  the developer offers permission (EV-036).
- The `spec/` location. It is fixed by ADR-004; making it configurable is a branch (FF-001).

## Acceptance check / Done criteria

- [ ] Every proposed write passes the ordered check.
- [ ] `spec/../../etc/hosts` is **rejected**; `specimen/x.md` is **rejected**; `spec/../spec/x.md` is allowed.
- [ ] A blocked write's message contains the path and **no content from the target file**.
- [ ] `CLAUDE.md` and `.gitignore` are never proposed — verified in the proposal log, not only by checksum.
- [ ] A non-kit `spec/` stops the run before any write, and offers an alternative.
- [ ] No blanket write permission is requested at any point.
- [ ] All twelve denial tests were **seen to fail** without the boundary layer.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| UTEST-019 | Path variants incl. traversal and prefix-collision | Correct allow/reject for each |
| STEST-002 | Write to `<repo>/README.md` | Stops and asks, naming the file |
| STEST-003 | `spec/../../etc/hosts` | Rejected despite the `spec/` prefix |
| STEST-004 | Full run, diff the repo | Files outside `spec/` identical before and after |
| STEST-005 | `spec/` holds unrelated files | Stops before any write; alternative offered |
| STEST-006 | Observe permission requests | Per-file only; no blanket grant |
| STEST-007 | Repo with tuned `CLAUDE.md` | Checksum unchanged **and never proposed** |
| STEST-008 | Repo with `.gitignore` | Checksum unchanged; no `spec/` ignore rule added |
| STEST-013 | Blocked write on a sensitive file | Message names the path only |
| FTEST-003, FTEST-007, FTEST-008 | Boundary, collision, unwritable repo | Named failure states |

## Review checklist

- [ ] Matches every requirement listed above.
- [ ] No unrelated feature added — no policy engine, no configurability.
- [ ] Every denial test seen failing before the fix.
- [ ] Refusal messages are safe: path, not content.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Writing any file (TASK-005, TASK-006). This task decides **whether** a write is allowed.
- Resume (TASK-007).
- Validation (TASK-012).

## Stop condition

**Stop and ask if:**
- Normalisation behaves differently across platforms in a way that changes the verdict.
  CON-004 makes that a specification problem, not something to paper over per-OS.
- Any requirement seems to need writing outside `spec/` without asking. Nothing does; if
  something appears to, the requirement is being misread.
- Recognising "is this a kit workspace?" turns out to need a marker file. **That is a state
  file, and ADR-004 forbids it** — derive it from the artifacts instead, or stop and ask.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
