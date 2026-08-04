# Depth — how much specification each area gets

**Depth is set per area by the subdomain map, never applied uniformly.**

Writing core-depth specifications for a supporting area is the failure that makes this whole
method feel like paperwork. It is also the most natural thing to do, because uniform effort
looks like thoroughness and costs nothing to decide.

---

## The three classes

| Class | What it is | Build or buy | Specification depth | Test depth |
|---|---|---|---|---|
| **Core** | The one capability the product competes on — what a customer would actually pay for | **Build in-house.** Never outsource it, never generate it from a template | **The full chain:** requirements → design decisions → contracts → tasks → tests, with the reasoning kept | Full pyramid: unit, integration, end-to-end, failure |
| **Supporting** | Necessary, simple, changes rarely | **Build simply.** The first design that works is the right one | **One page.** What it does, its rules, its acceptance criteria | Acceptance-level only |
| **Generic** | Everyone needs it, nobody wins with it — authentication, email, payments, file storage | **Buy or adopt.** Building it is how three weeks disappear | **An integration contract only:** what goes in, what comes back, what happens when it fails | Contract conformance and failure behaviour |

**Every row of the generated subdomain map carries a build-or-buy decision.** Generic says
**buy** unless a constraint forbids it — and then the row says which constraint, and flags
itself to revisit when that constraint lifts.

A row with no decision is not a neutral row. It is a decision nobody made, which becomes
whatever the next reader assumes.

---

## What "not needed" looks like

**"Not needed" is a first-class answer** — with a reason and a revisit trigger:

> ☐ **Not needed** — *why:* single region, 50 users, static assets are 40 KB.
> *Revisit when:* a second region appears, or assets exceed a megabyte.

An explicit *no* is a decision. A blank is an accident waiting for traffic.

---

## Skipping a file

Some blueprints do not apply. An API-only product has no interface, so
`frontend-component-spec.md` has nothing to describe.

**Skip it with the reason recorded — never silently.** A blueprint that produced no file and
left no trace is indistinguishable from one the intake forgot, and the difference matters to
whoever reads the workspace next.

```
frontend-component-spec.md — skipped: this is an API-only product with no
interface. Revisit if a UI is added.
```

---

## The rule that keeps this honest

**The class decides the depth. The filename never does.**

If depth ever seems to need a per-file exception — *this one document should be deeper
because it feels important* — then the map is wrong, not the rule. Fix the classification.

An area classified core gets the full chain even when its file looks small. An area
classified supporting gets one page even when the topic is interesting.

---

## Express depth

`depth` is the **only** argument the command takes, and it takes one of two values:
`default` or `express`.

**It changes how much is asked and written. It never changes which path runs.** There is one
flow, and both depths go through all of it — a second flow would be exercised half as often
and would rot, which is the whole reason this is a parameter rather than a mode.

### Reduce within a stage; never delete a stage

**Every stage still runs, and every stage still produces its minimum artifacts.**

| Stage | Default | Express |
|---|---|---|
| Rounds asked | Up to four questions each | **Up to two**, the ones whose answers most constrain later rounds |
| The free-text problem statement | Always asked | **Always asked.** It is the only thing grounding the workspace in their problem |
| Core-subdomain question | Always asked | **Always asked.** It decides where the remaining depth goes |
| Driving characteristics | Up to three | **Up to three.** The limit is not a depth setting |
| Core-area specifications | Full chain | Full chain — *this is what the saved effort buys* |
| Supporting areas | One page | A few lines, with acceptance criteria |
| Generic areas | Integration contract | The contract's failure behaviour only |
| Acceptance gate | Every round | **Every round.** Never skippable, at any depth |

The two questions express keeps per round are the ones **later rounds depend on**. A question
whose answer only shapes prose is a good one to drop; a question whose answer changes what
gets built is not.

**Which two is decided in `instructions/questions.md`, not per run.** Exactly two questions in
each round carry `*(express keeps)*` and the reason for the mark. That principle above does
not by itself select two — in Round 2 every question changes what gets built, so a run reading
only the principle has to invent the answer, and two runs at the same depth then ask different
things (BUG-012). The rule lives here; the per-round application lives with the questions
(ADR-001).

### Express asks less. It never assumes more.

**A dropped question is recorded as unknown, never answered on the developer's behalf.** It
becomes a `[TODO]` paired with a `Q-###` row carrying a decision owner and a *must be answered
before* stage.

This is the line that makes express safe, and it is easy to cross without noticing: the two
modes look identical from inside the run, because a filled-in default and a stated answer
produce the same sentence in the same table. Nobody downstream can tell them apart, and the
developer never saw the question — which is a **silent inference**, forbidden in every file
this kit writes (`instructions/inference.md`).

An inference is drawn from something the developer actually said, and it is announced. A
default is drawn from nothing. Express produces more of the first only where a derivation rule
already exists, and never any of the second.

**A thin workspace full of marked gaps is the intended output.** It is honest about what was
not asked, and every gap is answerable at the next gate. A thin workspace full of plausible
answers nobody gave is the failure this kit exists to prevent.

### A thinner workspace is not a weaker one

**Every structural rule holds identically at both depths.** Identifiers resolve, back-links
resolve, `[TODO]`s pair with `Q-###` rows, no worked-example content survives, the entry point
is under 100 lines.

Express reduces **volume**, never **validity**. A workspace that skipped a check to be faster
is not a thinner specification — it is an unvalidated one.

### Two depths, not three

Two values is a parameter. Three is a configuration system, and a configuration system is a
set of branches nobody exercises evenly.

### The report says what was thinned

The closing report names which stages were written thin, so the developer knows where to look
first if the workspace later feels shallow — and knows it was a choice rather than a gap.
