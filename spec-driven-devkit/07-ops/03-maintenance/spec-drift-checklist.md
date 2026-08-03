# Spec Drift Checklist

> Source: Ch. 30 §30.3.
> **Drift is when the code stops matching the specification and nobody notices.** For this
> project it is sharper than usual: the specification *is* the product, so drift means the
> kit and the workspace that describes it have quietly become two different things.

**Run:** before each release, and after any change that touched more than one module.

---

## The three kinds of drift here

| Kind | What drifted | Detector |
|---|---|---|
| **A. Kit vs. this workspace** | The plugin does something `spec/` does not describe, or vice versa | This checklist. Nothing automated |
| **B. Generated workspace vs. blueprints** | A generated file no longer matches the template it came from | FF-007 — automated |
| **C. This workspace vs. its own blueprints** | `spec/` drifted from `spec-driven-template/` | **Nothing.** Manual — see the last section |

Only **B** is automated. **A** is what this file is for. **C** is the recursion trap.

---

## Checklist

### Requirements and specification

- [ ] Every behaviour the plugin has traces to a `REQ-###` in `requirements.md`
- [ ] Every `REQ-###` is either implemented, or has an open task, or is explicitly deferred
- [ ] **No behaviour exists that no requirement asked for** — the analogue of "code with no requirement"
- [ ] Every requirement still testable as written
- [ ] `[TODO]` markers still have matching `Q-###` rows

### Decisions

- [ ] No ADR has been silently reversed. Check the three most likely, specifically:
  - [ ] **ADR-002** — is there a script, manifest, lockfile, or dependency anywhere in the payload? (FF-009 should have caught it; confirm the exclusion list did not quietly grow)
  - [ ] **ADR-004** — is there a state, progress, cache, or answer file anywhere?
  - [ ] **ADR-001** — has question text leaked into a blueprint, or blueprint structure into the instruction set?
- [ ] Every rule in `adr-index.md` still appears verbatim in `AGENT.md`
- [ ] `decisions.md` reflects every choice made since the last review

### Tests

- [ ] Every test still traces to a requirement or acceptance criterion
- [ ] **No test has been weakened or deleted to make something pass**
- [ ] Every denial test has been seen to fail at some point
- [ ] Every fitness function still **blocks** — none downgraded to a warning
- [ ] The coverage matrix's blank cells are still deliberate, and still named in the gap analysis

### The drivers

- [ ] **Simplicity:** still exactly one command and one path? Has an argument, a flag, or a mode crept in?
- [ ] **Reliability:** does resume still pass 8/8, or has it quietly become "we test one stage"?
- [ ] **Auditability:** are all four measures still zero?

### Traceability

- [ ] `traceability.md` updated for every new requirement, task, and test
- [ ] Code links filled in for completed tasks
- [ ] **Blank cells still visible** — not filled in to make the matrix look complete

### The generated workspace's own promises

- [ ] The C3 guarantees in `api-specification.md` all still hold
- [ ] Entry point still under 100 lines with resolving paths
- [ ] Task files still name allowed **and** forbidden files

---

## Drift triggers — when to run this outside the schedule

| Trigger | Why |
|---|---|
| A blueprint was renamed or moved | Back-links, migration note, FF-007 |
| A question was reworded | Its derivability annotation and its eval baseline may both be stale |
| A new argument or flag was added | Simplicity's measure counts branches |
| A fitness function was skipped or excluded | The exclusion list is the soft underbelly of FF-009 |
| A test was changed to make something pass | The single most damaging drift there is |
| **A `[TODO]` was resolved** | The `Q-###` row and every file referencing it need updating together |

---

## The recursion trap — drift type C

This workspace was generated from `spec-driven-template/`, and that library **is also the
product being built**. So when the kit author improves a blueprint:

```
blueprint improved
   -> the KIT now ships a better template                     (intended)
   -> and THIS workspace is now out of date against it        (side effect nobody sees)
```

Nothing detects it. The `> Blueprint:` back-link at the foot of every file is what makes it
*findable* — but only if someone looks.

| Question | Answer |
|---|---|
| Does `spec/` have to stay in sync with the library? | **No.** It is a snapshot of what the templates said when it was written. |
| Then what is the risk? | Reading `spec/` and assuming it reflects the current templates — and "improving" a blueprint to match a workspace that is simply older. |
| What is the rule? | **The library is the source. This workspace is a product of it.** Never edit a blueprint to match this workspace. Edit blueprints for their own reasons, and let this workspace be a dated snapshot. |
| Should this workspace be regenerated? | Only if the kit author wants it as a dogfooding exercise — **Q-006**, still open. It is not required, and doing it casually would discard the hand-written analysis in these files. |

> **This is the highest-value paragraph in the file**, because it is the one drift the whole
> project is structurally set up to create and has no detector for.

---

## Outcome

| Date | Drift found | Type | Action | Artifacts updated |
|---|---|---|---|---|
| *(empty — nothing has been built yet)* | | | | |

> Blueprint: ../../../spec-driven-template/07-ops/03-maintenance/spec-drift-checklist.md
