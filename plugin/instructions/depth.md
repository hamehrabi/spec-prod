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
