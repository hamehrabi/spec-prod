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
| **1. Identify alone** | Each person marks impact and likelihood **independently**, on the current diagram. No discussion. | Prevents group influence and reveals who knows what. This is the step people skip, and skipping it defeats the exercise. |
| **2. Reach consensus** | Explain disagreements. Single-observer risks matter most — one person saw something nobody else did. Revise to a shared rating. | Disagreement *is* the signal. |
| **3. Mitigate together** | Redesign, or let an empowered stakeholder compare mitigation cost against accepting the risk. | Accepting a risk knowingly is a valid outcome. Accepting it unknowingly is not. |

Pantry is a one-person project, so steps 1 and 2 collapse into one scorer — the
independence the exercise relies on is not available, and these scores should be
re-examined the first time a second person joins.

## The grid

Rows are your **driving characteristics**. Columns are meaningful areas of the system.
Service-level scope is usually too narrow to be useful.

| | Recipes & search | Planning & list generation (core) | Photos & storage | Data & backup |
|---|---|---|---|---|
| *Simplicity / feasibility* | 2 | 6 | 4 | 2 |
| *Reliability / graceful failure* | 3 | 6 | 4 | **6** |
| *Accessibility* | 3 | 3 | 2 | — |

## The register

| ID | Risk | Impact | Likelihood | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | The recipe library is lost — the Round 8 answer says this would end the project. | 3 | 2 | **6** | → | Backup-and-recovery plan with restore verification; durability outranks restore speed. | Developer | Open until the first verified restore |
| RISK-002 | The core generation rule (shared ingredients, Q-011) is guessed by the agent and lists come out wrong. | 3 | 2 | **6** | → | TASK-012 is blocked until Q-011 is answered; ATEST-005 cannot pass by accident. | Developer | Mitigated by the block |
| RISK-003 | Auth model undecided (Q-009) stalls every slice behind sign-in. | 2 | 3 | **6** | → | TASK-002 blocked; answer Q-009 before implementation starts. | Developer | Open |
| RISK-004 | Cross-account data leak. | 3 | 1 | 3 | → | SEC-Z-001 scoping on every query; STEST-001, FTEST-004. | Developer | Mitigated by tests once written |
| RISK-005 | One developer, no redundancy. | 3 | 2 | **6** | → | This workspace — the specs are the mitigation. Accepted knowingly. | Developer | **Accepted** |
| RISK-006 | Deployment target undecided (Q-018) invalidates ops planning. | 2 | 1 | 2 | ↓ | Plan-for-a-container (Round 8) keeps every option open at no cost. | Developer | Accepted for now |

> Track the **trend**, not just the snapshot. A medium risk getting worse deserves more
> attention than a high one already being mitigated.

## Rules

- Run it **individually first**. Always.
- Repeat across the lifecycle — a risk assessment is not a one-time gate.
- A risk with no owner is not managed.
- Unknown technology scores **9** until you have evidence.

---

> Blueprint source: this file is new to the template — added from the architecture review.

> Blueprint: blueprints/05-review/02-checklists/risk-storming.md
