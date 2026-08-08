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

Rows are your **driving characteristics** (the Pantry drivers behind FF-001…003). Columns
are meaningful areas of the system. Score cells are filled **during** a session; they are
left blank here on purpose.

| | Recipes | Planning | ShoppingList (core) | Account/Auth | Total |
|---|---|---|---|---|---|
| *Simplicity / feasibility (FF-001)* | — | — | — | — | — |
| *Reliability / graceful failure (FF-002)* | — | — | — | — | — |
| *Accessibility (FF-003)* | — | — | — | — | — |

No session run yet — the first risk-storming session fills the score cells.

## The register

| ID | Risk | Impact | Likelihood | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|

No entries yet — the first risk-storming session adds the first row.

> Track the **trend**, not just the snapshot. A medium risk getting worse deserves more
> attention than a high one already being mitigated.

## Rules

- Run it **individually first**. Always.
- Repeat across the lifecycle — a risk assessment is not a one-time gate.
- A risk with no owner is not managed.
- Unknown technology scores **9** until you have evidence.

> Blueprint: blueprints/05-review/02-checklists/risk-storming.md
