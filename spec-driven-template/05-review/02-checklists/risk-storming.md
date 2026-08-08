# risk-storming.md — Make Uncertainty Visible

> **Purpose:** find the risks *before* they become incidents.
> **When you use it:** before build, before a major feature, before release.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 22.

> Copy this file to `risk-storming-<date>.md` and fill it in, once per session. **The scoring
> cells stay blank in this copy** — a risk nobody has scored yet has no numbers, and writing
> plausible ones is worse than leaving them empty.

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
Service-level scope is usually too narrow to be useful.

| | Area A | Area B | Area C | Total |
|---|---|---|---|---|
| *Characteristic 1* | | | | |
| *Characteristic 2* | | | | |
| *Characteristic 3* | | | | |

## The register

| ID | Risk | Impact | Likelihood | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | | 1–3 | 1–3 | | ↑ ↓ → | | | Open |

> Track the **trend**, not just the snapshot. A medium risk getting worse deserves more
> attention than a high one already being mitigated.

## Rules

- Run it **individually first**. Always.
- Repeat across the lifecycle — a risk assessment is not a one-time gate.
- A risk with no owner is not managed.
- Unknown technology scores **9** until you have evidence.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

# WORKED EXAMPLE — ProjectBoard, pre-build session

Three people, 40 minutes: tech lead, developer, product owner.

### Individual scores before discussion

| Risk | Tech lead | Developer | Product owner |
|---|---|---|---|
| Cross-project data leak | 3×2 = **6** | 3×1 = 3 | 3×3 = **9** |
| Task list slow at scale | 2×2 = 4 | 2×3 = **6** | 1×1 = 1 |
| One developer is a bus factor | 3×2 = **6** | 2×2 = 4 | 3×3 = **9** |
| Email provider outage | 1×2 = 2 | 1×2 = 2 | 2×2 = 4 |

### What the disagreements revealed

| Disagreement | What surfaced |
|---|---|
| Data leak: 3 vs 9 | The developer scored likelihood **1** because *"we always filter by project"*. The product owner scored **3** because she had seen it happen at a previous company. **Nobody had written the rule down anywhere.** Consensus: 6, and it produced FF-003. |
| Slowness: 6 vs 1 | The developer had loaded a 500-task fixture and seen it crawl. The product owner had only seen demo data. **Single-observer risk — the most valuable kind.** Consensus: 6, and it produced PTEST-003 before a line of pagination code existed. |
| Bus factor: 4 vs 9 | Nobody disagreed it was real; they disagreed on impact. Consensus: 6. Mitigation was not technical — it was writing the specs this template exists to produce. |

### Consensus register

| ID | Risk | I | L | Score | Trend | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|---|
| RISK-001 | Cross-project data leak | 3 | 2 | **6** | → | FF-003 + STEST-001/007; scoping rule written into `database-design.md` | Tech lead | Mitigated |
| RISK-002 | Task list unusable at real scale | 2 | 3 | **6** | ↓ | PTEST-003 + ADR-003 pagination + MIG-003 index | Developer | Mitigated |
| RISK-003 | Single developer, no redundancy | 3 | 2 | **6** | → | Specs + ADRs are the mitigation. Accepted knowingly. | Product owner | **Accepted** |
| RISK-004 | Email provider outage blocks task creation | 2 | 2 | 4 | ↓ | ADR-005 — email moved to a background job | Developer | Mitigated |
| RISK-005 | Auth built in-house (generic subdomain) | 3 | 2 | **6** | → | Thin implementation; flagged to buy at v2 | Tech lead | Accepted for v1 |

### What the session changed

- **RISK-002 was found before any code existed.** The performance test was written first,
  failed at 7.1 s, and produced an ADR — instead of being discovered by a customer.
- **RISK-001's mitigation is a fitness function, not a promise.** The individual-scoring
  step is what exposed that the rule lived only in one developer's head.
- **RISK-003 was accepted, not solved.** That is a legitimate outcome, made by the person
  with the authority to accept it — which is the whole point of step 3.

> **The step that did the work:** scoring alone first. In a discussion the developer's
> confident *"we always filter by project"* would have closed the topic in ten seconds.
