# driving-characteristics.md — Pick Three

> **Purpose:** choose the small set of quality attributes that will shape the structure.
> **When you use it:** after requirements, before the technical spec.
> **Source:** Richards & Ford, *Fundamentals of Software Architecture*, Ch. 4–6.

> **Pick three. More than three and you have prioritised nothing.**
> Every characteristic you support adds effort, complexity, and interaction effects.

---

## Step 1 — Translate business concerns into candidates

| Business concern (their words) | Candidate characteristics |
|---|---|
| Time to market | Agility, testability, deployability |
| User satisfaction | Performance, availability, fault tolerance |
| Competitive advantage | Agility, scalability, availability |
| Mergers / acquisitions | Interoperability, extensibility, adaptability |
| Tight time / budget | **Simplicity, feasibility** |

A concern is an **architecture characteristic** only if all three hold:
it is **non-domain**, it **influences structure**, and it is **critical to success**.

Decompose composites: *agility* = deployability + modularity + testability.

**Applied to what the cook actually said:** *"recipes are scattered across six places"* and
*"I forget things at the shop and make a second trip"*. Neither is a speed complaint or a
scale complaint. Both are complaints about a task being unreliable and awkward — which points
at simplicity and reliability, not at performance.

## Step 2 — Candidates considered

Keep roughly seven. Preserve the rejected ones — that list is why the decision was sound.

| Candidate | Kept? | Reason |
|---|---|---|
| Simplicity / feasibility | ✅ | Version one has to be finishable. The build horizon is unknown ([`Q-011`](../01-intent/open-questions.md)), which argues for less structure rather than more. |
| Reliability / graceful failure | ✅ | The product's promise is *one trip*. A shopping list that is wrong, or that vanishes mid-shop, fails at the exact moment the cook is depending on it and cannot recover. |
| Accessibility | ✅ | B2C, so the device, the context and the ability range are all unknown and wide. It is also the one on this list that is materially harder to add later than to design in. |
| Performance | ❌ | One person's recipes. The largest realistic query is a week of meals — tens of rows, not thousands. Choosing it would spend a slot on a problem this product does not have. **Revisit if** a single account's recipe count passes a few thousand. |
| Scalability | ❌ | Same reason, one level up. Nobody has said how many accounts there will be ([`Q-010`](../01-intent/open-questions.md)), so this is *unknown* rather than *unimportant* — recorded, not assumed away. **Revisit when** Q-010 is answered with a number above a few thousand. |
| Security and access control | ❌ | **Not because it does not matter.** It is already a hard requirement with denial tests — REQ-R-002, REQ-R-003, AC-005, AC-006. A driver slot buys governance for something that could silently degrade, and this cannot: the denial tests fail loudly. |
| Auditability | ❌ | One user, nothing shared, no action taken on anyone else's behalf. There is nobody to answer *"why is it like this?"* to except the cook, who did it. |

**The security row is the one worth reading twice.** Dropping a quality from this list is not
the same as deciding it is unimportant, and the two get confused constantly. The question's own
guidance says so: a quality that is already a hard constraint elsewhere does not need a slot,
and the slot is better spent on something that could degrade without anyone noticing.

## Step 3 — The three drivers (unordered)

| # | Characteristic | Precise definition | Observable measure | Fitness function |
|---|---|---|---|---|
| 1 | **Simplicity / feasibility** | One person can add a capability end to end without touching more than one layer per change. | No import cycles between the data, domain and interface layers | FF-001 |
| 2 | **Reliability / graceful failure** | A generated shopping list is correct for the plan it was generated from, and stays readable when anything external is unavailable. | Every consolidation case in the acceptance criteria passes, including the unit-mismatch case; zero external calls on the shopping-list path | FF-002, FF-003 |
| 3 | **Accessibility** | Every capability is usable by keyboard alone and by a screen reader, at the sizes a phone actually offers. | Zero critical violations on an automated accessibility pass over each capability's primary screen | FF-004 |

> If you cannot state a **measure**, the definition is too vague. Rewrite it before
> moving to the technical spec.

**Reliability got two fitness functions and that is deliberate.** It is the driver closest to
the core subdomain, and it has two failure modes that no single check covers: the list can be
*wrong* (FF-002) and it can be *unavailable* (FF-003). One function guarding both would pass
while half the driver decayed.

## Step 4 — Explicitly NOT driving

| Characteristic | Why it is not a driver here |
|---|---|
| Performance | Tens of rows per query. Revisit if one account's recipes pass a few thousand. |
| Scalability | Account volume is unknown, not known to be small — see [`Q-010`](../01-intent/open-questions.md). Revisit when it is answered. |
| Security and access control | Already a hard requirement with denial tests that fail loudly. A driver slot governs what degrades quietly; this does not. |
| Auditability | One user, nothing shared, nobody to answer to. |

**What choosing these three has already changed:** the subdomain map's *build simply* rows for
recipe storage, weekly plans and search now have a written reason to point at. When something
proposes a plug-in architecture for recipe capture, *simplicity is a driver* is a one-sentence
rejection against a recorded decision rather than an opinion.

---

> Blueprint source: this file is new to the template — added from the architecture review.

---

**Next:** [`../04-technical-spec/fitness-functions.md`](../04-technical-spec/fitness-functions.md)

> Blueprint: blueprints/01-docs/02-requirements/driving-characteristics.md
