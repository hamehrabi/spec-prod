# Product → Engineering Handoff

> Source: Ch. 16.
> What engineering needs from product before building. **Here both roles are the same
> person** (CON-008), which makes writing it down more valuable, not less — an unwritten
> handoff between two roles in one head is indistinguishable from no handoff at all.

---

## Problem statement

Developers building production-intended applications with an AI coding assistant have no
predefined specification for the assistant to work inside. The assistant produces plausible
code quickly, but there is no standard to check it against, so the developer cannot
confidently accept or reject what was built, or tell what it changed unasked. The cost is
rework, unreviewable code, and projects that stall before production.

## Users

| Persona | Needs |
|---|---|
| **Developer starting something new** | To get from an idea to a project an agent can build correctly, without spending two days writing documents |
| **Developer with work underway** | To impose structure without the kit trampling a repository they have already tuned |
| **The build agent** *(not a person)* | To understand a ~90-file workspace well enough to do one task correctly, without reading all of it |
| **The kit author** | To improve questions and templates independently of each other |

## Must-haves, with pass/fail criteria

| # | Must have | Passes when | Fails when |
|---|---|---|---|
| 1 | Installs with nothing but Claude Code | No account, key, script, or download needed | Any extra step exists |
| 2 | One command starts the interview | Interview begins immediately | Any configuration step in between |
| 3 | The interview **ends** | Never more than eight rounds; unknowns become open questions | A ninth round is asked |
| 4 | Files appear as you go | Round *N*'s files exist before round *N+1* is asked | Anything is held to the end |
| 5 | Nothing outside `spec/` is touched unasked | Every file outside is byte-identical after a full run | One file changed |
| 6 | An existing `CLAUDE.md` is never modified | Byte-identical, and never proposed | Proposed, even if declined |
| 7 | Unknowns are gaps, not guesses | `[TODO]` + a matching `Q-###` | A plausible value was substituted |
| 8 | It resumes | All eight stages interrupt and resume | Any stage cannot resume |
| 9 | "Complete" means checked | Validation reports the **count that ran** | Success claimed on an unrun check |
| 10 | A fresh session can use the output | It restates the task, names its requirement, lists files, and **waits** | It starts editing |

**Criterion 10 is the product.** Everything above it produces a well-formed workspace; only
10 proves the workspace *works*.

## Non-goals

Writing the developer's application code (**permanent**) · other AI assistants · config-file
intake · automatic drift detection · any hosted or team component · **telemetry of any kind**.

## Risks product is accepting

| Risk | Accepted because |
|---|---|
| **RSK-1** — abandoned mid-intake | The primary risk. Four mechanisms defend it; none guarantees it |
| **RSK-2** — structurally complete, substantively hollow | No count detects it. Two human eval scorers are the only defence |
| **RSK-7 / Q-002** — the definition of first-month success is unmeasurable | CON-007 forbids the telemetry that would show it. **The promise is the product** |
| RISK-012 — one person | This workspace is the mitigation: the specs outlive the session that wrote them |

## Open questions blocking engineering

| ID | Question | Blocks |
|---|---|---|
| **Q-007** | Licence and attribution for blueprints derived from a published method | **Release.** Nothing in the build will ever fail because of it (RISK-013) |
| **Q-002** | Drop SM-2, replace it, or qualify the privacy promise? | Release |
| Q-008 | Familiarity with plugin internals — does TASK-001 need a spike first? | TASK-001 |
| Q-003 | Is the blueprint library core rather than supporting? | Effort allocation, after ten real intakes |
| Q-006 | Is the kit used on itself? | A decision either way, not a drift |
| — | Do resume, contradiction detection, inference, and depth scaling move from `Should` to `Must`? | Scope, against CON-002 |

## Decision owner

**Kit author** — for everything. There is no product owner to escalate to and no tiebreaker.

**The consequence, stated plainly:** the usual value of this handoff is forcing two people to
agree. With one person it cannot do that. What it *can* do is make the product decisions
visible enough that engineering decisions can be checked against them later — which is why
the pass/fail column exists and why the criteria are observable rather than aspirational.

> Blueprint: ../../../spec-driven-template/06-agent/04-handoffs/product-to-engineering-handoff.md
