# driving-characteristics.md — Pick Three

> **Purpose:** choose the small set of quality attributes that will shape the structure.
> **When you use it:** after requirements, before the technical spec.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 4–6.

> **Pick three. More than three and you have prioritised nothing.**
> Every characteristic you support adds effort, complexity, and interaction effects.

---

## Step 1 — Translate business concerns into candidates

| Business concern (the kit author's words) | Candidate characteristics |
|---|---|
| *"lots of complexity … they don't have control on what AI built"* | Auditability, testability, security |
| *"a thorough template they can copy and paste"* | Feasibility, simplicity |
| Two-to-four-week v1, under 50 users (Round 1) | **Simplicity, feasibility** |
| Primary risk is abandonment mid-intake (RSK-1) | Simplicity, reliability |
| Eight rounds and ~90 file writes per run, any of which can be declined or interrupted | Reliability, fault tolerance |
| *"help them drive their project lifecycle from raw idea to production scale"* | Auditability, adaptability |

A concern is an **architecture characteristic** only if all three hold:
it is **non-domain**, it **influences structure**, and it is **critical to success**.

Decompose composites: *agility* = deployability + modularity + testability.

## Step 2 — Candidates considered

Keep roughly seven. Preserve the rejected ones — that list is why the decision was sound.

| Candidate | Kept? | Reason |
|---|---|---|
| **Simplicity / feasibility** | ✅ | CON-002 gives two to four weeks, and RSK-1 — the kit being experienced as paperwork — is the primary risk. Simplicity here is load-bearing, not tidiness: it is the defence against a specification tool growing a specification language. |
| **Reliability / graceful failure** | ✅ | One run spans eight rounds and roughly ninety file writes, each of which the developer may decline (REQ-F-025). Interruption is the normal case, not the exception, and the state store is a folder with no transactions (`database-design.md` §7). |
| **Auditability** | ✅ | It is close to the whole value proposition. A workspace whose identifiers do not resolve has failed at the one thing the developer bought it for — being able to name the requirement behind every change. |
| **Security and access control** | ❌ | Chosen by the kit author, then withdrawn on review — recorded here rather than erased. It is already a hard constraint (CON-005), a business rule (BR-008), four requirements (REQ-F-024 to REQ-F-026, REQ-R-002) and a set of denial tests, and the host's own per-file permission prompt enforces it independently of anything the kit does. A driving characteristic is for a quality you would otherwise **under-serve**; this one cannot be under-served without first violating a constraint that stops the build. |
| **Performance** | ❌ | There is nothing to be slow. Local Markdown writes, ~90 files, under 50 users, no shared resource, no query. The only latency a developer perceives is the model's own thinking time, which the kit does not control. |
| **Scalability** | ❌ | Under 50 users in six months (Round 1). Every run is one machine, one repository, one developer. There is no contended resource anywhere in the design. |
| **Accessibility (WCAG)** | ❌ | No graphical interface exists. The substantive obligation — plain text, no meaning carried by colour alone — is already REQ-NF-006. That makes it a requirement to satisfy, not a characteristic that shapes structure. |
| **Testability** | ❌ | Genuine, but subsumed rather than rejected: the observable measure of every one of the three kept drivers *is* an automated check. Testability is the means by which the other three are governed here, so naming it separately would double-count. |

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | **Simplicity / feasibility** | There is **one** intake flow and **one** intake command. Depth is a parameter on that flow, never a second path through it. Interview content and blueprint content are independently changeable: adding or reordering a question touches no blueprint, and editing a blueprint touches no question. | • Exactly **1** user-invocable intake command exists.<br>• Number of distinct end-to-end execution paths through intake = **1** (express is a depth argument, not a branch).<br>• Adding one question changes files in the question flow **only**; count of blueprint files changed = **0**.<br>• Editing one blueprint changes flow files = **0**. | → [`fitness-functions.md`](../04-technical-spec/fitness-functions.md) FF-001, FF-002 |
| 2 | **Reliability / graceful failure** | Any interruption — a declined write, a closed session, a killed process, a missing blueprint — leaves a workspace that resumes correctly at the first incomplete stage. No generated file ever exists in a state that presents itself as complete while being partial. | • For **every** stage 1–8: interrupt mid-stage, re-run, and intake resumes at that stage and completes. Pass rate **8/8**.<br>• Count of generated files containing an unfilled blueprint placeholder but **no** `[TODO]` marker = **0**.<br>• Declining any single file write leaves exit state resumable, not failed: **0** unrecoverable runs. | → FF-003, FF-004 |
| 3 | **Auditability** | Every claim in a generated workspace can be followed to its source. Every referenced identifier resolves to a definition in the same workspace; every generated file names the blueprint it came from; every unknown is a marked gap with an owner, not a silent omission. | • Dangling identifier references (referenced, never defined) = **0**.<br>• Generated files whose final blueprint link does not resolve = **0**.<br>• `[TODO]` markers without a matching `Q-###` row = **0**.<br>• Table rows requiring a decision that are left blank (neither specified nor marked *not needed, because…*) = **0**. | → FF-005, FF-006, FF-007, FF-008 |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

Every measure above is a count with a threshold of zero or an exact number, computable by
walking the generated files. None is a subjective judgement, and none needs a human to
score it. That is deliberate — a threshold nobody can compute is a threshold nobody enforces.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| Security and access control | Already absolutely enforced as a constraint with denial tests, and independently by the host's per-file permission prompt. Making it a driver would spend architectural attention on a quality that cannot degrade without a hard failure first. **Reopening trigger:** if the kit ever writes outside a folder it owns by design, or gains any capability to execute rather than write, this returns as a driver. |
| Performance | No contended resource, no query, no network, under 50 users. **Reopening trigger:** if a generated workspace ever exceeds a size where a full validation walk is perceptibly slow. |
| Scalability | One machine, one repository, one developer per run. **Reopening trigger:** anything shared between users — which CON-003 currently forbids outright. |
| Accessibility (WCAG) | No graphical interface. The real obligation is met by REQ-NF-006. **Reopening trigger:** any interface beyond plain terminal text. |
| Testability | Subsumed — it is the mechanism by which the three kept drivers are measured, not a separate goal. |

---

## What choosing three is expected to change

Written now, before the build, so it can be checked against what actually happened. If none
of these come true, this page was decoration.

- **Simplicity was kept, and it decided express mode on day one.** The kit author chose
  "deep by default, express mode available". Read against this driver, express mode is a
  **depth parameter on the single flow** — not a second flow, not a second command, not a
  branch with its own file-writing logic. Had simplicity not been a written driver, the
  natural implementation would have been two paths, and the second one would have rotted.
- **Security was dropped as a driver, which is what stops a permission framework.** The
  boundary rules are four requirements and a denial test each. An agent proposing a
  configurable policy layer, a path-allowlist DSL, or a sandbox abstraction now gets a
  one-line rejection against a written decision rather than an argument about taste.
- **Auditability got numbers, and the numbers are all zero.** "Traceable" would have stayed
  an adjective. As *dangling references = 0*, it becomes FF-005, which runs in CI, which
  fails the build — and the difference between those two states is the difference between a
  documented intention and a governed one.
- **Scalability was dropped, which rules out the machinery.** No caching layer, no
  incremental generation, no index of the workspace, no watch mode. Each of those is a
  reasonable idea that would consume a week of a four-week budget.
- **Reliability was kept, and it forces resume to be tested eight times, not once.** The
  measure names every stage. A single happy-path resume test would satisfy the word
  "reliable" and miss the stage where it actually breaks.

---

## Interaction effects worth knowing about

Three drivers is few enough to hold in mind, but they still pull against each other. Named
here so the trade is made deliberately when it comes up:

| Tension | Where it bites | How it is settled |
|---|---|---|
| **Auditability vs. Simplicity** | Every additional check, ID, and back-link is more machinery to build and maintain in a four-week budget. | Auditability's measures are all computed by one validation walk over the workspace — one mechanism, many checks. Simplicity is preserved by refusing a *rules engine*; the checks are a fixed list, not a configurable one. |
| **Reliability vs. Simplicity** | Resume needs to know what is complete. The simple implementation is a state file — which `database-design.md` §0 forbids, because it becomes a second source of truth. | Stage completeness is **derived** by inspecting which artifacts exist. More work to implement than a flag; the only option that keeps one source of truth. |
| **Auditability vs. the eight-round limit** | Full traceability wants more facts than eight rounds can collect. | The gap is made visible rather than closed: unknowns become `[TODO]` with a matching open question (BR-003). An audit trail with named holes beats a complete-looking one built on guesses. |

> Blueprint: ../../../spec-driven-template/01-docs/02-requirements/driving-characteristics.md
