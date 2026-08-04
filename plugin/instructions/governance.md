# Governance — the three rules that decide whether a workspace governs anything

A generated workspace can be complete, consistent, well-linked, and still govern nothing.
Three artifacts are where governance is either real or decorative, and each has one rule.

---

## 1. Every consequential choice gets an ADR — with a visible cost

An ADR records a decision **and what it cost**. Compare at least **two genuinely different
options** — not one real option and two strawmen — and name the trade-off the winner carries.

| An ADR must contain | Why |
|---|---|
| At least two real options | One option is not a decision; it is a description |
| The **cost** of the chosen one | A choice with no downside was compared in the abstract, not weighted for this project |
| A **Compliance** field naming a fitness function or a named human reviewer | Otherwise nothing notices when the decision is quietly reversed |
| A **revisit trigger** | The conditions under which this stops being right |

### If a decision appears to have no downside, keep looking

Every real choice costs something. A one-sided ADR means the comparison happened in general
rather than for this product — different scale, different team, different constraints.

**Say so out loud rather than writing the one-sided ADR.** *"I can't see what this costs, which
usually means I'm comparing the textbook version rather than yours — what would it stop you
doing?"*

**ADRs are immutable once accepted.** A reversal is a **new** ADR naming what it supersedes.
Editing one destroys the record of what was believed at the time, which is the only reason
the file exists.

### The agent-rules table

`adr-index.md` carries a table of **the rules the ADRs impose on whoever builds this**, stated
as instructions rather than as decisions.

Every rule in that table must also appear in the generated `AGENT.md`. **A rule that lives
only in the index governs nothing** — the build agent reads `AGENT.md`, not the architecture
folder.

---

## 2. Every driving characteristic gets a fitness function — with a threshold that fails a build

> "High performance" is not a fitness function. **A measurable threshold is.**

| A fitness function must have | Not |
|---|---|
| A number or a countable condition | "should be fast", "must stay simple" |
| Something that runs automatically | "the team reviews this quarterly" |
| **A build that fails** when it is breached | A warning, a dashboard, a note |

**A warning is a decoration.** A check that prints red and lets the merge through teaches
everyone to ignore red.

### If a driver cannot be measured, the driver is too vague

Do not invent a proxy metric to satisfy the rule. **Fix the definition instead.**

*"Maintainability"* cannot be measured. *"A blueprint can be edited without touching the
question flow — swap cost zero files"* can. The second is the same intent, made countable, and
the act of making it countable is what tells you whether you meant anything.

**A driver with no fitness function is not governed. It is documented** — and the difference
is the entire point of naming drivers at all.

---

## 3. Every permission rule gets a deny test — seen to fail

For every **"can"** in a role or permission table, there is a **"cannot"**, and every *cannot*
needs a test proving the refusal actually happens.

**Allow-only tests are the characteristic failure here.** They pass on a system with no
enforcement at all, because doing the permitted thing works whether or not the boundary
exists.

### A denial test must be seen to fail before it is trusted

Run it against a version **without** the rule. If it passes there, it is testing nothing —
and it will keep passing after someone deletes the check.

> A rule stated in the specification is not a passing security test. Assert the **observable
> outcome** — a checksum, a file listing, a rejected request. Searching the instructions for
> the sentence *"never write outside spec/"* is a spell-check, not a boundary.

---

## Rows that are not filled in

**Every row of the runtime and scale specification is either specified or marked *not needed,
because…* — with a revisit trigger.** No blank rows.

```
☐ Not needed — why: single region, 50 users, static assets are 40 KB.
  Revisit when: a second region appears, or assets exceed a megabyte.
```

A blank row is not a neutral row. It is the difference between *we decided* and *nobody
looked*, and six months later nobody can tell which it was.

**Rate limiting specifically:** login and any endpoint calling a paid API are rate-limited, or
the file records that neither exists. An unlimited endpoint in front of a paid API is an
unlimited invoice.

---

## Skipping a specification

Some do not apply — an AI boundary specification for a product with no model, a frontend
component specification for an API. **Skip them with the reason recorded**, never silently.

A skipped file and a forgotten one look identical in a folder listing, and only one of them
is a decision.
