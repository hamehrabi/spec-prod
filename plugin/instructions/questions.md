# Questions — Round 1: the idea

This module holds **question text only**. It contains no orchestration and no template
content: it does not decide when a round runs, what gets written, or in what order. Those
belong to `instructions/intake.md`, and mixing them is a boundary violation (ADR-001).

**Ask at most four.** Not five, and not "four plus a quick follow-up" — the limit is a
requirement, and when a round needs more, the question set is what changes, not the limit.

Every option below carries a **text label and a one-line reason**. The first is marked
`(Recommended)` **in words**, never implied by position — ordering is invisible to a reader
who is not comparing, and to anyone using a screen reader.

A developer may type their own answer to any question. **Use it verbatim.** Never snap it to
the nearest listed option: the options are a convenience, and someone whose situation is not
in the list is exactly the person the list would mislead.

---

## Q1. What kind of application is this?

- **Web application with a UI** — *(Recommended)* the most common shape, and the easiest to narrow later once the rest is known.
- **API or backend service only** — no interface of its own; something else consumes it.
- **Dashboard or internal admin tool** — a known, named set of users inside one organisation.
- **AI-powered application** — an assistant, retrieval, or generation product.
- **CLI or developer tool** — used from a terminal, by people who build software.

## Q2. Who is the primary user?

- **A team inside one company** — *(Recommended)* the fewest unknowns: you can name the actual users and ask them, which nothing else on this list lets you do.
- **Paying business customers (B2B)** — buying decisions and daily use come from different people.
- **Individual consumers (B2C)** — the widest range of devices, expectations, and abandonment.
- **Developers, as API consumers** — the contract *is* the product; a breaking change is a public event.

## Q3. How many people will use it in the first six months?

- **Under 50** — *(Recommended)* true for most first versions, and it removes scaling work you would otherwise pay for before anyone arrives.
- **50 to 1,000** — one ordinary server, but backups and uptime start to matter.
- **1,000 to 50,000** — performance becomes a design input rather than an afterthought.
- **Not yet known** — answered honestly, this is better than a guess; it becomes an open question with a named owner.

## Q4. What is your build horizon for version one?

- **Two to four weeks** — *(Recommended)* long enough to finish something real, short enough that scope has to be decided rather than deferred.
- **About one week** — a prototype. Say so plainly, and the specification stays proportionate.
- **One to three months** — enough room that the risk shifts from "unfinished" to "built the wrong thing".
- **Ongoing, with no fixed date** — no deadline means no forcing function; the specification has to supply one instead.

---

## The free-text question

This one **cannot** be multiple choice, and asking it as one would defeat the purpose. It is
the only part of the workspace grounded in the developer's own problem rather than in an
option list.

> In one or two sentences: **who is affected, what difficulty do they face today, what does
> that cost them, and what should improve?**
>
> Please do not describe features — describe the problem. Features are what we work out
> together afterwards.

**Accept whatever comes back.** Never reject it, never re-ask it in a loop, and never
rewrite it into something tidier. If it is too vague to build requirements from, that becomes
an **open question with a decision owner** — not a rejection, and not a second attempt to
extract a better sentence from someone who has already answered.

The shape of a good answer is stated *because* asking for a problem statement without saying
what one looks like reliably produces a feature list.
