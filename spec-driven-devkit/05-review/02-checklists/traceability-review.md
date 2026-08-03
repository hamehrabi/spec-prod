# Traceability Review

> Source: Ch. 10, Appendix F.
> Traceability runs in **two directions**, and the backward one is the one that catches AI
> agents adding things nobody asked for.

**Reviewer:** `________` · **Date:** `________`

---

## Forward trace — requirement → code

*Did everything we promised get built?*

- [ ] Every `REQ-F-###` resolves to at least one task
- [ ] Every `REQ-F-###` resolves to at least one test
- [ ] Every `REQ-NF-###` resolves to a test or is explicitly marked untestable **with the reason**
- [ ] Every `REQ-R-###` and every **No** in the actor matrix has a **denial** test
- [ ] Every `BR-###` appears in the coverage matrix
- [ ] Every `SEC-A-###` / `SEC-Z-###` has a test
- [ ] Every driving characteristic has at least one fitness function
- [ ] Every completed task has its code link filled in
- [ ] Every `[TODO]` has a matching `Q-###` row

## Backward trace — code → requirement

*Did anything get built that nobody asked for?*

- [ ] **Every instruction module traces to a requirement or an ADR**
- [ ] Every rule in `AGENT.md` traces to an ADR, a business rule, or a requirement
- [ ] Every fitness function traces to a driver or an ADR
- [ ] Every test traces to a requirement or an acceptance criterion
- [ ] Every question in the question set traces to something a generated file needs
- [ ] **Every file the plugin ships traces to a requirement**
- [ ] Every task in the index has a requirement — **TASK-019 does not, which is why it is blocked**

> **The backward trace is the one that matters with an AI agent.** The forward trace catches
> work that did not happen, which someone usually notices. The backward trace catches work
> that happened and nobody approved — which nothing else in the process will find.

---

## What the backward trace looks for in *this* project

The generic version asks "is there code with no requirement?". Here the specific shapes are:

| Suspicious thing | Why it appears | What to do |
|---|---|---|
| **A question nobody needs an answer to** | Questions accumulate. One that fills no generated file is pure interview cost — and interview cost is RSK-1 | Delete it, or name the file it feeds |
| **A file in the payload that is not Markdown or the manifest** | ADR-002. FF-009 should catch it — confirm the **exclusion list** did not quietly grow | Remove it, or supersede ADR-002 |
| **An instruction rule with no requirement** | Prose invites helpful additions | Trace it or delete it |
| **A blueprint the intake never fills** | Packaged in TASK-003, never wired up | Wire it, or record why it ships unused |
| **A validation check that is not one of the twelve** | Checks accumulate faster than requirements | Add it to the twelve deliberately, or remove it |
| **A `Q-###` nothing references** | The `[TODO]` it belonged to was resolved and the row was orphaned | Close it |

---

## Gap analysis

Every blank cell is either **deliberate** or a **finding**. The point of this review is to
decide which, in writing.

| Gap | Deliberate? | Where it is recorded |
|---|---|---|
| All code links blank | **Yes** — no code exists yet, which is the whole point | `traceability.md` gap analysis |
| REQ-NF-004 has no automatable test | **Yes** — it is genuinely a human judgement; covered by the manual smoke test step 3 | `traceability.md`; `end-to-end-tests.md` |
| REQ-F-032 has one thin test | **Yes** — P2, thin coverage makes it cheap to cut | `product-spec.md` §11 |
| SM-2 has no requirement, task, or test | **Yes, and it is a problem** | **Q-002** |
| TASK-019 has no requirement | **Yes** — which is why it is blocked | SC-008 |
| Performance cells nearly all empty | **Yes** — performance was rejected as a driver, with reopening triggers | `test-plan.md` |

---

## Review outcome

| Date | Reviewer | Forward gaps | Backward gaps | Actions |
|---|---|---|---|---|
| *(not yet run)* | | | | |

> **Treat anything with no requirement as suspicious until approved.** Not wrong — suspicious.
> Some of it will be good work that arrived without a decision, and the fix is to write the
> requirement, not to delete the work.

> Blueprint: ../../../spec-driven-template/05-review/02-checklists/traceability-review.md
