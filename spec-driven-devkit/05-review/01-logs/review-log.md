# Review Log

> Source: Ch. 20, Appendix M.
> Evidence that reviews happened, what they found, and what changed as a result.

---

## Entry template

```
Review ID:
Date:
Reviewer:
What was reviewed:        [TASK-### / a module / a release / a specification]
Layer(s) applied:         [see the five layers below]
Findings:
Actions raised:
Re-review needed:         yes / no
```

## Log

| Review ID | Date | Reviewer | Reviewed | Findings | Actions |
|---|---|---|---|---|---|
| REV-001 | 2026-08-03 | Intake process | The specification workspace, at the end of intake | See "Findings from REV-001" below | Q-002, Q-003, Q-006, Q-007 remain open; SC-008 raised |
| | | | | | |

---

## The five team review layers (Ch. 20)

| Layer | Question | Who, here |
|---|---|---|
| **1. Requirement** | Does this satisfy the requirement it names, and no more? | Kit author |
| **2. Design** | Does it follow the ADRs, or silently reverse one? | Kit author |
| **3. Implementation** | Is it the simplest thing that works? Only approved files touched? | Kit author |
| **4. Test** | Do tests come from acceptance criteria? Has each denial been **seen to fail**? | Kit author |
| **5. Operational** | Can it be released, diagnosed, and rolled back? | Kit author |

**All five layers have the same name in every row, and that is the finding.** One person
(CON-008) applying five perspectives is better than one perspective — and it is not the same
as five people. Recorded rather than dressed up.

The one practical counter: **layers 1 and 4 can be applied by a different session** — an
agent asked to review a task against its requirement and its tests, with no memory of having
written them. That is not independence, but it is not self-review either.

---

## Findings from REV-001 — the specification review

The intake's own validation pass, recorded as a review because that is what it was.

| # | Finding | Severity | Action |
|---|---|---|---|
| 1 | **SM-2 (intake completion rate) is unmeasurable under CON-007.** The kit author's own definition of first-month success is invisible to the product | High | **Q-002 — open.** Kept visible in `intent.md` and `product-spec.md` rather than deleted |
| 2 | The blueprint library is classified *supporting* but plausibly passes the core test | Medium | **Q-003 — open.** Revisit after ten real intakes |
| 3 | Instruction-driven validation shares a failure mode with instruction-driven generation | Medium | **Accepted.** Named in ADR-002's Consequences and RISK-009. CI is the independent check |
| 4 | FF-006's worked-example detector is a string search and would miss a *reworded* example | Medium | Documented as an honest limit in `fitness-functions.md`. Mitigated by ADR-003's delete-whole rule |
| 5 | **Two sessions in one repository would both write to `spec/`.** No lock, no state file permitted | Medium | **SC-008 decided 2026-08-08: rejected for v1** — one session per repository at a time, a documented non-goal; TASK-019 → Rejected. Found by the seven-questions worksheet, not by design review |
| 6 | Licence and attribution for blueprints derived from a published method | **Release blocker** | **Q-007 answered 2026-08-04: MIT + `ATTRIBUTION.md`**, both shipped at the repository root. RISK-013 mitigated. Nothing in the build would ever have failed because of it — which is exactly why this row, not a check, had to carry it |
| 7 | Four `Should` priorities (resume, contradiction detection, inference, depth scaling) defend the primary risk | Medium | **Q-013 answered 2026-08-04: promoted to Must.** All four are built and tested |
| 8 | RSK-3 had no detector | High | **Closed in Round 8** — scheduled CI install test |

---

## Review rules

- **Every review produces either a finding or an explicit "nothing found".** A review with no
  output is indistinguishable from a review that did not happen.
- A finding without an action is an observation. Raise it as a question, a task, or an
  accepted risk with an owner.
- **Re-review anything that changed as a result.**
- Review against the **specification**, never against what the code happens to do.

> Blueprint: ../../../spec-driven-template/05-review/01-logs/review-log.md
