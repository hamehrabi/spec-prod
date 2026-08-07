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

## The grid

Rows are your **driving characteristics**. Columns are meaningful areas of the system.
Score in a live session; the register below holds the current consensus.

| | Recipes | Planning | List generation | Total |
|---|---|---|---|---|
| *Simplicity / feasibility* | — | — | — | — |
| *Reliability / graceful failure* | — | — | — | — |
| *Accessibility* | — | — | — | — |

## The register

| ID | Risk | Impact | Likelihood | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | Loss of the recipe library (years of handwritten cards) | 3 | 2 | 6 | → | Nightly backup + a durable/off-site copy of recipe data; tested restore (backup-and-recovery.md) | Developer | Open until a restore is tested |
| RISK-002 | The shopping list misses or mis-combines ingredients (the core) | 3 | 2 | 6 | → | Decide the combine rule (Q-009); ATEST-001, UTEST-003, FTEST-001 | Developer | Open — blocked on Q-009 |
| RISK-003 | Cross-account data leak | 3 | 1 | 3 | → | Every query scoped by `account_id` (FF-005); STEST-001 | Developer | Mitigated by design |
| RISK-004 | Single developer, no redundancy (bus factor) | 3 | 2 | 6 | → | The specification itself is the mitigation. Accepted knowingly. | Developer | Accepted |
| RISK-005 | Auth built before the model is decided (Q-006) | 2 | 2 | 4 | → | Decide Q-006 before TASK-002; keep the implementation thin | Developer | Open |

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
