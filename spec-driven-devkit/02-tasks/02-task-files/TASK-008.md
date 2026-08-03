# TASK-008: Rounds 2–4 — scope, roles and data, product shape

**Task ID:** TASK-008 · **Priority:** P1 · **Status:** Not started · **Assigned to:** AI agent

---

## Source requirement or spec section

REQ-F-012 (name the core subdomain) · REQ-F-013 (refuse more than three drivers) ·
REQ-F-017 (depth scaled by subdomain) · BR-011, BR-013

## Business reason

These three rounds produce the decisions everything downstream depends on: what is in scope,
what the developer competes on, and which three qualities shape every later design call. Get
the core-subdomain question wrong and the workspace spends its depth in the wrong place.

## Goal

Rounds 2, 3, and 4 ask their questions and write their eight files, with the two rules that
make them worth asking: **one core subdomain** and **at most three drivers**.

## Inputs

- [`MASTER-PROMPT.md`](../../../spec-driven-template/MASTER-PROMPT.md) — Rounds 2–4
- [`subdomain-map.md`](../../01-docs/01-intent/subdomain-map.md) · [`driving-characteristics.md`](../../01-docs/02-requirements/driving-characteristics.md)

## Expected files or components

```
instructions/questions.md     <- gains Rounds 2-4
instructions/depth.md         <- NEW: how subdomain class maps to spec depth
```

Produces: `constraints-and-non-goals.md` · `open-questions.md` · `subdomain-map.md` ·
`requirements.md` · `database-design.md` · `driving-characteristics.md` ·
`product-spec.md` · `frontend-component-spec.md`

## Expected output

- Round 2 asks the core-subdomain question and produces a map classifying **every** area as
  core / generic / supporting, each with a build-or-buy decision.
- Round 4 refuses a fourth driver: **push back once**, with the reason, then accept three and
  record the rejected ones.
- Depth per file follows the map: core → full chain, supporting → one page, generic →
  integration contract only.

## Step-by-step instructions

1. Add Rounds 2–4 to `questions.md`. Each round: at most four questions, recommended first.
2. Create `instructions/depth.md` mapping subdomain class → spec depth and test depth.
3. Implement the three-driver rule: push back **exactly once**, then accept, then record rejects.
4. Require every subdomain-map row to carry a build-or-buy decision — generic says **buy**
   unless a constraint forbids it, and then the row says so and flags it to revisit.
5. Skip `frontend-component-spec.md` for API-only products — **with the reason recorded**, not silently.

## Dependencies

TASK-006.

## Constraints / Boundaries

- Never accept a fourth driver. Never push back twice.
- Never write uniform depth across classes — that is the failure the method exists to avoid.
- Never leave a subdomain-map row without a build-or-buy decision.
- Question text goes in `questions.md`; depth rules in `depth.md`; neither in a blueprint.

## Do not change

- Anything in `spec/`.
- Round 1's questions, or `boundary.md`, `fill.md`, `resume.md`.
- Any blueprint.

## Acceptance check / Done criteria

- [ ] Rounds 2–4 ask at most four questions each, recommended first with reasons.
- [ ] The core-subdomain question is asked, always — even when only one capability is in scope.
- [ ] A fourth driver triggers exactly one push-back; three are accepted; rejects recorded with reasons.
- [ ] Every subdomain-map row has a build-or-buy decision.
- [ ] A supporting area's spec is one page; the core area's is the full chain.
- [ ] A skipped file records why it was skipped.

## Tests to run or create

| Test ID | Scenario | Expected result |
|---|---|---|
| ATEST-012 | Complete Round 2 | The core-subdomain question was asked |
| ATEST-013 | Select four drivers | One push-back, three accepted, rejects recorded |
| ATEST-018 | Inspect a supporting spec | One page, acceptance-level tests |
| UTEST-010 | Only one capability in scope | Question still asked; answer recorded |
| UTEST-011 | 3 vs 4 selected | No push-back / exactly one push-back |
| UTEST-015 | Core vs supporting vs generic | Three different depths |

## Review checklist

- [ ] Matches REQ-F-012, REQ-F-013, REQ-F-017, BR-011, BR-013.
- [ ] No unrelated feature added.
- [ ] Tests pass, including "exactly once" in both directions.
- [ ] Push-back text explains **why** three, and does not nag.
- [ ] Only approved files changed.
- [ ] Traceability matrix updated.

## Out of scope

- Inference between rounds (TASK-011) — these rounds ask all their questions for now.
- Rounds 5–8.
- Express depth (TASK-015).

## Stop condition

**Stop and ask if:**
- The developer names two core subdomains. Press once for one; if they hold, **record both
  and flag it** — do not silently pick. Two cores means depth is spread thin, and that is
  their decision to make knowingly.
- Depth rules seem to need per-file special cases. That means `depth.md` is modelling the
  wrong thing — the class should decide, not the filename.

> Blueprint: ../../../spec-driven-template/02-tasks/02-task-files/TASK-001.md
