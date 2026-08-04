# Inference and contradiction

Before composing a round, check what the developer has **already told you**.

**This is where depth comes from.** The kit promises deep documents *and* an interview people
finish, and the only way to have both is to derive what can be derived instead of asking for
it. Every question asked that did not need asking is spent from the same budget the depth
comes out of (DD-007).

That makes this load-bearing rather than an efficiency.

---

## Never suppress a question silently

A suppressed question always produces a notice naming **the conclusion and the answer it came
from**:

> Not asking about the interface — you said this is an API-only service, so I've taken it
> that there is no user interface to design. Say if that's wrong.

**A silent inference is a hidden assumption**, and this kit forbids those in every file it
writes. Doing it in the interview instead would be the same failure, one step earlier and
harder to see.

The notice is what makes an inference **challengeable**. Without it the developer never learns
a decision was made on their behalf.

---

## The derivation rules

| If they said | Then this is settled | Confidence |
|---|---|---|
| Round 1 Q1 = **API or backend service only** | Round 4 Q2 (what matters in the interface) — **do not ask.** There is no interface. The interface component specification is skipped, with the reason recorded | **Full** |
| Round 1 Q2 = **a team inside one company** | Round 3 Q3 (isolation between customers) — infer *single organisation*, **state it**, and let them correct it | Partial |
| Round 2 Q3 includes **no paid third-party services** | Round 6 Q2 (external dependencies) — narrow the options to those with a free tier, and say why the others are missing | Partial |
| Round 1 Q3 = **under 50 users** | Scaling and caching rows are *not needed*, with that reason and a revisit trigger. **Performance is not automatically ruled out as a driver** — ask it | Partial |
| Round 6 Q2 = **none in version one** | The integration specification has no external blocks, and no paid-API rate limit is needed. Say both | **Full** |

### Partial means narrow the question, not skip it

When an answer *probably* follows, **ask a smaller version** and state what you already
assumed:

> You said this is for a team inside one company, so I've assumed a single organisation
> rather than isolated customers. Is that right, or is multi-tenancy coming later?

That is one question instead of four options, and it is still a question. **Inferring the
whole thing would be guessing with extra steps.**

### Do not infer aggressively

**A wrong inference silently produces a wrong specification** — and it is worse than a wrong
answer, because the developer never saw the question.

REQ-F-009's licence is for what follows **obviously**, not for what merely seems likely.

**An inference that would change the architecture gets asked, never derived.** Detail can be
inferred; shape cannot. If the conclusion would alter what gets built rather than how deeply
it is described, that is a question.

### When a whole round is inferable

Skip it **with a notice** covering every suppressed question. Never render it as an empty
round, and never as a round that failed — an interview that appears to skip a stage reads as
a bug, and a developer who thinks the tool is broken stops.

---

## Contradiction: stop, quote both, choose neither

When two answers cannot both hold, **stop the interview.**

```
Two of your answers can't both be true, and I don't want to pick for you.

  Round 2: "no paid third-party services"
  Round 6: "payments"

Taking payments means a payment provider, and every one of them charges.
Which of these should hold?
```

| Do | Do not |
|---|---|
| Quote **both**, verbatim, in their own words | Paraphrase either into something tidier |
| Name why they conflict | Explain which is more sensible |
| Ask which holds | Offer a default, rank them, or hint |

**Offer no default.** The moment a preference is visible, the developer agrees with it, and a
product decision has quietly transferred from them to the kit. That is the whole failure this
rule exists to prevent — they own the contradiction, because they own the product.

### Tension is not contradiction

Some answers pull against each other without being impossible:

| Tension | Not a contradiction, because |
|---|---|
| *Under 50 users* + *scalability as a driver* | They may know growth is coming |
| *Two to four weeks* + *thorough test plan* | Ambitious, not impossible |
| *Solo developer* + *a team workflow pack* | They may be hiring |

**Proceed on a stated assumption and record it**, rather than stopping:

> You picked scalability as a driver with under 50 users expected. I've taken it that growth
> is expected rather than current, and noted it as an assumption.

A stated assumption is recoverable. A silent one is the thing this kit exists to prevent.

### When the rules do not recognise a conflict

**Stop and quote both anyway.**

Under-detecting a contradiction is recoverable — someone notices later. Resolving one
silently is not: the specification is then internally consistent and wrong, which is the
hardest defect in this product to see.

---

## The eighth round is the last

**There is no ninth round, for any reason** — not for one more question, not because something
important is still unclear, not if the developer offers.

Anything still unknown becomes a `[TODO]` with a matching open question and a named decision
owner. That is a **better outcome** than a longer interview: a recorded gap is visible, and an
interview that expands to fit the ambiguity gets abandoned — which is the primary risk this
product faces, and it loses everything rather than one answer.
