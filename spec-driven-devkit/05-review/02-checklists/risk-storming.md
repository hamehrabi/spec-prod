# risk-storming.md — Make Uncertainty Visible

> **Purpose:** find the risks *before* they become incidents.
> **When you use it:** before build, before a major feature, before release.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 22.

> **Risk = impact × likelihood**, each scored 1–3.
> `1–2` low · `3–4` medium · `6–9` high. **Unproven technology starts at 9.**
> Assess impact first. If likelihood is unknown, keep it high until proven otherwise.

---

## The three steps — the order is the point

| Step | How | Why this order |
|---|---|---|
| **1. Identify alone** | Each person marks impact and likelihood **independently**. No discussion. | Prevents group influence and reveals who knows what. **This is the step people skip, and skipping it defeats the exercise.** |
| **2. Reach consensus** | Explain disagreements. Single-observer risks matter most — one person saw something nobody else did. | Disagreement *is* the signal. |
| **3. Mitigate together** | Redesign, or let an empowered stakeholder weigh mitigation cost against accepting the risk. | Accepting a risk knowingly is valid. Accepting it unknowingly is not. |

### The problem with step 1 on this project, stated honestly

**There is one person** (CON-008: one developer directing an AI agent). Independent scoring
needs more than one scorer, so the exercise as designed cannot be run.

Two substitutes, neither as good, both better than skipping it:

| Substitute | What it recovers |
|---|---|
| **Score before reading this file's own analysis.** Write your numbers down first, then compare against the grid below. | The anchoring effect that step 1 exists to prevent. |
| **Ask a second person once, cold.** Anyone technical who has not read the specs. One hour. | The single-observer signal — the most valuable kind, and the one a solo assessment structurally cannot produce. |

`[TODO: has a second person scored this grid? If not, every consensus score below is one
person's opinion wearing a table's clothing.]`

---

## The grid

Rows are the three **driving characteristics**. Columns are the meaningful areas from
[`subdomain-map.md`](../../01-docs/01-intent/subdomain-map.md). Scores are one person's,
pending the `[TODO]` above.

| | Intake (core) | Fill procedure | Boundary layer | Blueprint library | Host dependency | Total |
|---|---|---|---|---|---|---|
| **Simplicity / feasibility** | **6** | 4 | 2 | 2 | 3 | **17** |
| **Reliability / graceful failure** | 4 | **6** | 2 | 3 | **6** | **21** |
| **Auditability** | 4 | **9** | 3 | 2 | 1 | **19** |

**The two cells that stand out:**

- **Fill procedure × Auditability = 9.** The highest score on the grid. ADR-003's chosen
  failure mode is *leftover template text that reads exactly like a filled answer*, and the
  only detector is a string search that under-detects (`fitness-functions.md`, honest limit 1).
  Scored 9 because likelihood is genuinely unknown until the first real intakes — and
  **unproven starts at 9**.
- **Host dependency × Reliability = 6.** Breaks for every user at once, and until Round 8 it
  had no detector at all.

---

## The register

| ID | Risk | Impact | Likelihood | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | **The kit is experienced as paperwork and abandoned mid-intake** (RSK-1) | 3 | 3 | **9** | → | Eight-round hard stop · write after every round · resume · depth scaled by subdomain · express depth. **All four are mechanisms, not intentions.** | Kit author | Open |
| RISK-002 | **Generated workspaces are structurally complete and substantively hollow** (RSK-2) | 3 | 3 | **9** | → | `[TODO]` instead of invention (BR-003) · validation before success (BR-009) · `todo_density` scorer · **two human eval scorers**, because no count detects hollowness | Kit author | Open |
| RISK-003 | Leftover template text survives the fill step | 2 | 3 | **6** | → | FF-005 + FTEST-006 + retry-once. **Detector under-detects** — a *reworded* example would pass | Kit author | Open |
| RISK-004 | Host plugin format changes, breaking installation for everyone at once (RSK-3) | 3 | 2 | **6** | **↓** | **Scheduled CI install test (Round 8)** · documented mechanisms only · output stays plain Markdown so existing workspaces survive | Kit author | **Mitigated** |
| RISK-005 | The workspace is generated correctly and then ignored by the build agent (RSK-5) | 3 | 2 | **6** | → | Deny test per rule · fitness function per driver · allowed/forbidden file lists · **ETEST-003 is the only test that proves governance actually governs** | Kit author | Open |
| RISK-006 | Recursion confusion between the kit and what it generates (RSK-4) | 2 | 3 | **6** | → | Glossary in `project-brief.md` · the ⚠ block in `AGENT.md` · the convention that output is always "the generated workspace" | Kit author | Mitigated |
| RISK-007 | Confirmation fatigue across ~90 per-file prompts becomes blanket approval (RSK-6) | 2 | 3 | **6** | → | **Unmitigated.** The kit never requests blanket permission and never builds a bypass. Whether the volume is tolerable is unmeasured — `[TODO: measure on a full run before release]` | Kit author | **Open** |
| RISK-008 | The kit's own definition of success (SM-2) is unmeasurable under CON-007 (RSK-7) | 2 | 3 | **6** | → | **Unmitigated by design.** Q-002. The eval golden set is the only substitute for field data | Kit author | **Accepted** |
| RISK-009 | **Instruction-driven validation shares a failure mode with instruction-driven generation** | 3 | 2 | **6** | → | CI fitness functions are the independent check. Named as a permanent weakness in ADR-002's Consequences rather than mitigated away | Kit author | **Accepted** |
| RISK-010 | The blueprint library is really core, not supporting (Q-003) | 2 | 2 | 4 | → | Revisit after the first ten real intakes. If wrong, its thin specs and acceptance-only tests are the wrong strategy | Kit author | Open |
| RISK-011 | Two sessions in one repository corrupt a workspace | 2 | 2 | 4 | → | **Rejected for v1 via SC-008 (2026-08-08)** — one session per repository at a time is a documented non-goal. The behaviour stays unmeasured; the risk is consciously accepted, not mitigated | Kit author | **Accepted** |
| RISK-012 | Solo developer, no redundancy | 3 | 2 | **6** | → | This workspace **is** the mitigation — the specs outlive the session that wrote them. Accepted knowingly | Kit author | **Accepted** |
| RISK-013 | Licence / attribution position on blueprints derived from a published method (Q-007) | 3 | 2 | **6** | → | **Unresolved.** Must be answered before release, not after | Kit author | **Open** |

> Track the **trend**, not just the snapshot. A medium risk getting worse deserves more
> attention than a high one already being mitigated.

---

## Rules

- Run it **individually first**. Always. *(See the honest note above about a team of one.)*
- Repeat across the lifecycle — a risk assessment is not a one-time gate.
- **A risk with no owner is not managed.**
- Unknown technology scores **9** until you have evidence.

---

## What this session changed

- **RISK-004 dropped from 9 to 6 and became Mitigated during Round 8.** It had carried a
  `[TODO: no detector]` through four files. Writing the grid is what forced the question, and
  the answer was a scheduled CI install test — twenty minutes of work for the one risk that
  fails for every user simultaneously.
- **RISK-002 and RISK-009 are the pair worth staring at.** The mitigation for hollow output is
  validation; validation is instruction-driven; instruction-driven checking shares a failure
  mode with instruction-driven generation. That is why **two human eval scorers exist** — no
  deterministic count can detect a workspace that is structurally perfect and says nothing.
- **Three risks are Accepted, not solved** (RISK-008, RISK-009, RISK-012). Each was accepted
  by the person with authority to accept it, with the reason recorded. That is a legitimate
  outcome; the illegitimate one is accepting it without noticing.
- **RISK-013 is the one most likely to be forgotten**, because it is legal rather than
  technical and nothing in the build will ever fail because of it.

> **The step that would do the most work here:** one hour of a second person's time, scoring
> this grid cold. A solo assessment cannot produce a single-observer risk, and those are the
> ones that matter most.

> Blueprint: ../../../spec-driven-template/05-review/02-checklists/risk-storming.md
