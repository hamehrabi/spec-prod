# Code Review Checklist

> Source: Ch. 20 + Ousterhout Ch. 19 (design red flags).
> **What is being reviewed here is Markdown** — instruction modules, question sets, blueprints
> (ADR-002). It is still code: it is executed, it has behaviour, and it can be wrong. Review it
> like code.

---

## Layer 1 — Requirement

- [ ] The change names a `REQ-###` or `TASK-###`
- [ ] It does **only** what that requirement asks
- [ ] Nothing was added that no requirement asked for
- [ ] If the requirement was ambiguous, it was **raised** rather than interpreted

## Layer 2 — Design

- [ ] No ADR was silently reversed
- [ ] **ADR-002:** no script, manifest, lockfile, or dependency entered the payload
- [ ] **ADR-004:** no state, progress, cache, or answer file anywhere
- [ ] **ADR-001:** no question text in a blueprint; no blueprint structure in the instruction set; no orchestration in the question set
- [ ] **ADR-003:** nothing authored from memory of a blueprint
- [ ] Still exactly one command and one end-to-end path (FF-001)

## Layer 3 — Implementation

- [ ] Only the files the task allowed were changed
- [ ] Any file touched outside that list was **reported**
- [ ] The change is the simplest thing that satisfies the requirement
- [ ] Instruction prose is unambiguous — *could two readers do two different things?*
- [ ] Every rule states what to do **and** what not to do

## Layer 4 — Test

- [ ] Tests come from acceptance criteria, not from what was just written
- [ ] Normal, edge, **and** failure cases exist
- [ ] **Every denial test has been seen to fail**
- [ ] No test was weakened or deleted to make something pass
- [ ] No assertion on generated **prose** — structure only (ADR-002)
- [ ] Every write test asserts the negative half: files outside `spec/` unchanged, by checksum

## Layer 5 — Security

- [ ] The boundary check normalises **before** comparing
- [ ] No message echoes content from outside `spec/`
- [ ] `.env` and secret files are not read
- [ ] No blanket write permission requested
- [ ] Every **No** in the actor matrix still has a denial test

## Layer 6 — Traceability

- [ ] `traceability.md` updated
- [ ] Blank cells still deliberate and still named in the gap analysis
- [ ] Any new `[TODO]` has a matching `Q-###`

## Layer 7 — Operational

- [ ] If a blueprint path changed: **the migration note exists**
- [ ] `release-notes.md` `[Unreleased]` updated if user-visible
- [ ] `change-log.md` updated, including anything rejected

---

## The 12 design red flags (Ousterhout Ch. 19), translated

Ousterhout's flags are about code. Ten of the twelve translate directly to instruction
modules, and the translations are where the real review value is.

| # | Red flag | What it looks like here |
|---|---|---|
| 1 | **Shallow module** | An instruction file whose interface is as complex as its content — a "module" that is one rule with a heading |
| 2 | **Information leakage** | The same fact stated in two modules. When `spec/`'s folder layout appears in both `intake.md` and a blueprint, one will drift |
| 3 | **Temporal decomposition** | Splitting instructions by *when they run* rather than by *what they know*. "Round 5 rules" as a module instead of "depth rules" |
| 4 | **Overexposure** | A rule stated in the question set that only the orchestrator needs — forcing question authors to understand orchestration |
| 5 | **Pass-through method** | An instruction that only says "then apply `fill.md`" and adds nothing |
| 6 | **Repetition** | The same boundary rule restated in three modules. **Highest risk here**, because prose invites copy-paste |
| 7 | **Special-general mixture** | A general fill procedure with a special case for one blueprint. ADR-003 says: fix the blueprint |
| 8 | **Conjoined methods** | Two instruction files that cannot be understood apart. If `boundary.md` cannot be read without `fill.md`, they are one thing |
| 9 | **Comment repeats code** | A rule's explanation restating the rule instead of giving the **reason**. Reasons are what an agent needs to generalise |
| 10 | **Implementation documentation contaminates interface** | An `AGENT.md` rule that explains *how* rather than *what must hold* |
| 11 | Vague name | An instruction file called `helpers.md` or `misc.md` |
| 12 | **Hard to pick name** | If a module cannot be named crisply, it is doing two things — the strongest signal ADR-001's boundaries are being violated |

**Flags 2 and 6 are the ones that will actually bite.** In a product made of prose, the
easiest way to be helpful is to restate a rule where the reader is, and the result is two
copies that diverge. **Link, do not restate** — the same rule `CLAUDE.md` follows.

---

## The three project-specific checks

Above everything else, every review asks:

1. **Did a script appear?** → ADR-002. FF-009 should catch it; confirm the exclusion list did not quietly grow.
2. **Did a state file appear?** → ADR-004. Under any name: cache, progress, session, manifest.
3. **Did `spec/` in this repository get edited?** → It is the specification, not the product. Editing it to make a task pass reverses the direction the method runs in.

> Blueprint: ../../../spec-driven-template/05-review/02-checklists/code-review-checklist.md
