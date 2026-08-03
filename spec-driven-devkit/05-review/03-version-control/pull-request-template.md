# Pull Request Template

> Source: Ch. 26.

---

```markdown
## Requirement

REQ-### / TASK-### / BUG-### / RISK-###
<!-- If you cannot name one, stop. Every change traces to a requirement. -->

## What changed

<!-- What is different in BEHAVIOUR, not which files moved. The diff shows the files. -->

## Why

<!-- The reason. Not restating the change. -->

## Files changed

| File | Why |
|---|---|
|      |     |

### ⚠ Files changed that the task did NOT list

<!-- "None" is the expected answer and must be written explicitly.
     A blank section is indistinguishable from a forgotten one. -->

None.

## How it was tested

| Test ID | Level | Result |
|---|---|---|
|         |       |        |

- [ ] Every new denial test was **seen to fail** without this change
- [ ] No test was weakened or deleted
- [ ] No assertion on generated prose — structure only (ADR-002)
- [ ] Every write test asserts the negative half: files outside `spec/` unchanged, by checksum

## ADR compliance

- [ ] **ADR-001** — no question text in a blueprint; no blueprint structure in the instruction set; no orchestration in the question set
- [ ] **ADR-002** — no script, manifest, lockfile, or dependency in the payload
- [ ] **ADR-003** — nothing authored from memory of a blueprint
- [ ] **ADR-004** — no state, progress, cache, or answer file
- [ ] **ADR-005** — version stamp intact; no timestamp added
- [ ] No ADR is reversed by this change. <!-- If one is: link the SUPERSEDING ADR. -->

## Rollback notes

<!-- How to undo this if it turns out to be wrong. -->

- **Revert:** <!-- is a plain revert enough? if not, what else? -->
- **Already published?** <!-- if yes: rollback-plan.md - it can only be superseded, not recalled -->
- **Blueprint path changed?** <!-- if yes: the MIGRATION NOTE must be in this PR, not a later one -->
- **Existing workspaces affected?** <!-- almost always "no - they are plain Markdown" -->

## Reviewer checklist

- [ ] Layer 1 — does only what the requirement asks
- [ ] Layer 2 — no ADR silently reversed
- [ ] Layer 3 — only allowed files; anything else reported above
- [ ] Layer 4 — tests from acceptance criteria; denials seen failing
- [ ] Layer 5 — boundary intact; nothing echoes content from outside `spec/`
- [ ] Layer 6 — `traceability.md` updated; blanks still deliberate
- [ ] Layer 7 — `change-log.md` and, if user-visible, `release-notes.md` updated
- [ ] **`spec/` in this repository was not edited**
```

---

## The two sections that earn their place

**"Files changed that the task did not list."** Everything else is recoverable from the diff.
This one is a **confession field**, and it only works if "None." is written explicitly —
otherwise an empty section reads the same as a forgotten one. This is the review's main
defence against the failure mode where an agent helpfully improves something adjacent.

**"Rollback notes."** Publishing is the one irreversible act here. A version installed on
someone's machine cannot be recalled — only superseded. Writing the rollback story *before*
merging is what makes that survivable, and the blueprint-path question inside it is the one
that damages workspaces already generated.

> Blueprint: ../../../spec-driven-template/05-review/03-version-control/pull-request-template.md
