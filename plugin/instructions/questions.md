# Questions — Rounds 1 to 4

This module holds **question text only**. No orchestration, no destinations, no blueprint
structure — those belong to `intake.md`, `fill.md` and the library (ADR-001).

**At most four questions per round.** Not five, and not "four plus a quick follow-up". When a
round seems to need more, the question set is what changes, not the limit.

Every option carries a **text label and a one-line reason**, and the first is marked
`(Recommended)` **in words** — never implied by position, which is invisible to anyone not
comparing and to anyone using a screen reader.

A developer may type their own answer to any question. **Use it verbatim.** Never snap it to
the nearest listed option: someone whose situation is not in the list is exactly the person
the list would mislead.

> **At `express` depth, ask at most TWO questions per round** — the ones whose answers most
> constrain later rounds. The free-text problem statement and the core-subdomain question are
> asked at **both** depths, always: one grounds the workspace in their problem, the other
> decides where the remaining depth goes. See `instructions/depth.md`.

> **Check `instructions/inference.md` before composing any round.** A question whose answer
> the developer has already given is not asked — and the inference drawn instead is always
> stated, never silent.

> **Some questions have options that cannot be written down here**, because they are derived
> from what the developer already said. Those are marked **derived**. The rule still holds:
> present the most likely first, marked `(Recommended)`, each with a one-line reason.

---

# Round 1 — the idea

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

## The free-text question

This one **cannot** be multiple choice, and asking it as one would defeat the purpose. It is
the only part of the workspace grounded in the developer's own problem rather than in an
option list.

> In one or two sentences: **who is affected, what difficulty do they face today, what does
> that cost them, and what should improve?**
>
> Please do not describe features — describe the problem. Features are what we work out
> together afterwards.

**Accept whatever comes back.** Never reject it, never re-ask it in a loop, and never rewrite
it into something tidier. If it is too vague to build requirements from, that becomes an
**open question with a decision owner** — not a rejection, and not a second attempt to
extract a better sentence from someone who has already answered.

---

# Round 2 — scope boundaries

## Q1. Which capabilities must exist in version one? *(multi-select · derived)*

**Derived** from their Round 1 answers. Offer four, most-likely first and marked
`(Recommended)`, each with a one-line reason — for example: create and edit the core record ·
share or assign it to someone · search and filter · export or reporting.

## Q2. Which of these are explicitly out of scope for version one? *(multi-select · derived)*

**Derived** — offer the complements of Q1, most likely first with a one-line reason each:
billing · real-time chat · a mobile app · advanced analytics · third-party integrations ·
multi-language · offline mode.

**An explicit "no" is a decision; silence is an accident.** A capability nobody ruled out
will be assumed in by whoever reads the specification next.

## Q3. What hard constraints already exist? *(multi-select)*

- **No paid third-party services** — *(Recommended to consider first)* it is the constraint most often true and least often stated, and it silently rules out whole designs.
- **Must run on a single small server** — sets the ceiling on every performance answer later.
- **Certain data cannot be stored** — payment, health, or personal data changes the design rather than decorating it.
- **A specific technology is mandated** — a decision already made, which the specification should record rather than re-litigate.

## Q4. Of those capabilities, which ONE do you actually compete on?

**Ask this every time — even when only one capability is in scope.** The answer is the **core
subdomain**, and it decides where depth goes. Getting it wrong is how teams spend their first
three weeks building authentication.

**Derived** — offer their Q1 answers as single-select, most likely first with reasons.

> If they name **two**, press once: *"depth spent in two places is depth spent thinly in
> both — if you could only protect one, which is it?"* If they hold, **record both and flag
> it.** Never silently pick one. Two cores is their decision to make knowingly.

---

# Round 3 — users, roles, and data

## Q1. What is the permission model?

- **Owner / Admin / Member / Viewer** — *(Recommended)* covers most business applications, and it is easier to remove a role later than to retrofit one.
- **Single user only, no sharing** — the simplest thing that works, and honest if true.
- **Two roles: admin and user** — enough for an internal tool where everyone is trusted.
- **Complex or custom RBAC** — real, but expensive; it earns its cost only when the rules differ per record.

## Q2. What are the core things the system must remember? *(multi-select · derived)*

**Derived** from their idea. Typically: the user · the main record · a container or grouping ·
comments or activity · files · audit events. Offer the most likely first with reasons.

These become the entity model, so a thing left out here is a thing the data design will not
have.

## Q3. Does data need to be isolated between customers?

**May be narrowed by inference** — see `instructions/inference.md`.

- **No — a single organisation** — *(Recommended if unsure)* it matches the most common first version, and it is the honest answer for an internal tool.
- **Yes — organisations must never see each other's data** — this is a design constraint, not a feature, and it reaches every query.
- **Not yet, but likely later** — say so now; retrofitting isolation is materially harder than designing for it.

---

# Round 4 — product shape

## Q1. What does success look like in the first month?

- **A specific user action completes faster than today** — *(Recommended)* the only option here that is measurable without new instrumentation.
- **Users adopt it without training** — a real goal, and one that shows up in the interface rather than the feature list.
- **A manual process is eliminated** — easy to verify, and it names what to delete.
- **A business number moves** — the strongest claim, and the one most likely to depend on things outside the software.

## Q2. What matters most in the interface?

**May be suppressed entirely by inference** — see `instructions/inference.md`.

- **Speed of the core task** — *(Recommended)* it is the thing users notice daily, and it constrains design decisions usefully.
- **Clarity for non-technical users** — fewer options, more explanation; costs density.
- **Density for power users** — more on screen; costs approachability.
- **Visual polish** — worth naming as a priority only when the first three are already settled.

## Q3. Pick the three qualities that matter most. *(multi-select · maximum three)*

- **Simplicity / feasibility** — *(Recommended for a first version)* it is the one that keeps a version one finishable.
- **Reliability / graceful failure** — what happens when something breaks, rather than whether it does.
- **Auditability** — being able to answer "why is it like this?" six months later.
- **Security and access control** · **Performance** · **Scalability** · **Accessibility** — each real, each expensive.

### Enforce the limit of three — and push back exactly once

If they pick more than three, say plainly:

> "Every characteristic you support adds effort, and they interact — picking six means
>  prioritising none. Which three would you keep if you could only have three?"

**Push back once. Then accept whatever they say and move on.** Asking twice is nagging, and a
developer who has considered the trade-off once has made the decision.

**Record the rejected ones with their reasons.** That list is the evidence a decision was
made rather than a preference expressed — and it is what makes the choice reviewable later.

> A quality that is a hard constraint elsewhere does **not** need a driver slot. Security is
> the usual case: if it is already a constraint and a set of denial tests, spending a driver
> slot on it buys nothing, and the slot is better spent on something that could silently
> degrade.

---

# Round 5 — architecture and stack

## Q1. Which architecture style?

- **Modular monolith** — *(Recommended)* structure without deployment complexity, and it is the only option here you can reverse cheaply once you know more.
- **Simple monolith** — fine while one person builds it; the boundaries live in someone's head rather than in the folder layout.
- **Service-based or microservices** — real independence, paid for in operations, deployment and debugging across a network.
- **Serverless functions** — no servers to run; different constraints rather than fewer, and cold starts become a design input.

> **Default to a modular monolith** unless the developer names a characteristic that
> genuinely requires distribution. *The most expensive failure is not a badly executed
> decomposition — it is a beautifully executed one along the wrong lines.*

## Q2. Which data store? *(derived)*

**Derived** — offer options that fit the stack and scale already established, most likely
first with a one-line reason each. Typically: a relational database for anything with
relationships worth enforcing · an embedded database for local or small-scale · a document
store where the shape genuinely varies · the managed database their platform already offers.

## Q3. Which authentication model?

- **Email and password with server-side sessions** — *(Recommended if no external dependency is allowed)* nothing to buy and nothing to depend on, at the cost of owning password handling.
- **A third-party identity provider** — someone else owns the hardest part; you inherit their outage and their pricing.
- **OAuth or social login** — no password to store, and a dependency on accounts you do not control.
- **Magic link, passwordless** — no password at all; it moves the whole problem into email delivery.

## Q4. What must be true before this is safe to run for real? *(derived)*

**Derived** from their drivers and constraints, most likely first with reasons. This is the
question that turns the three chosen qualities into something checkable, and its answers
become the fitness functions.

---

# Round 6 — security, reliability, and integrations

## Q1. What must never leak or be logged? *(multi-select)*

- **Passwords, credentials, session tokens and API keys** — *(Recommended to select first)* these are the ones that turn a log file into an incident, and they leak through error messages more often than through databases.
- **Personal data** — names, emails, addresses. What regulation is usually about.
- **Payment information** — storing it at all is a decision with obligations attached.
- **Customer business data** — the thing your users would consider theirs, whatever the law says about it.

## Q2. Which external services will you depend on? *(multi-select)*

**May be narrowed by inference** — see `instructions/inference.md`.

- **None in version one** — *(Recommended if budget-constrained)* every dependency you do not add is an outage you cannot have and a bill you do not pay.
- **Email delivery** — the most commonly needed, and the one most likely to fail silently.
- **File or object storage** — cheap to add, and it brings its own access-control problem.
- **Payments, an AI model API, or analytics** — each a real cost and a real dependency; name them individually rather than as a group.

## Q3. When something is slow or fails, what should the user see?

- **A clear message and a retry option** — *(Recommended)* it tells the truth and gives them something to do, which is the whole job of an error.
- **A queued or pending status they can check later** — right for genuinely long work; wrong if it hides a failure.
- **Silent retry, telling them only if it finally fails** — the best experience when it works, and the worst when the retry loop is the bug.

## Q4. Does the system store files that users upload or generate?

- **No** — *(Recommended if unsure)* files bring their own transactional problem: the row and the file can disagree, and almost none of the database rules apply to them.
- **Yes, and they are private to one user or organisation** — access control now has a second surface that database permissions do not cover.
- **Yes, and some are shared or public** — the case where a signed URL and a public bucket look identical right up until they do not.

---

# Round 7 — tasks and tests

## Q1. How should the work be sequenced?

- **Thin vertical slices — one feature end to end at a time** — *(Recommended)* every slice is reviewable by using it, which is the only review that catches "built the wrong thing".
- **Layer by layer — all data, then all API, then all interface** — feels orderly, and nothing works until the last layer lands.
- **Riskiest part first** — right when one unknown dominates everything else; it front-loads the pain deliberately.

## Q2. How thorough should the test plan be?

- **Standard — acceptance, unit, integration, failure, key security** — *(Recommended)* covers the failures that actually happen without turning the suite into a second product.
- **Minimal — acceptance and critical failure paths only** — honest for a prototype; say so rather than pretending.
- **Thorough — all six levels, including performance and full negative RBAC** — earned when a driver demands it, expensive when it does not.

## Q3. Who or what will write the code?

- **An AI coding agent, one task at a time** — *(Recommended)* this whole system exists for that case, and it is why task files carry a do-not-change list.
- **A human developer using AI assistance** — the specification is a reference rather than a contract; keep it, lighten the enforcement.
- **A team of developers** — the workspace becomes a shared agreement, and the handoff files start earning their place.

---

# Round 8 — operations

## Q1. Where will this run?

- **Not decided yet** — *(Recommended if unsure)* perfectly fine; plan for a container and the decision stays open at no cost.
- **A managed platform** — least operational work, most constraints you do not control.
- **A container on a cloud virtual machine** — the most portable answer, and you own the operating system.
- **Serverless functions** — different constraints rather than fewer; cold starts become a design input.

## Q2. Which environments will exist?

- **Local and production, with a test environment between them** — *(Recommended)* somewhere to run the gate that is not someone's laptop and not the live system.
- **Local and production only** — honest for a small project, as long as nobody pretends production is a test environment.
- **Local only, for now** — fine while nothing is deployed; the decision arrives the day something is.

## Q3. What is your monitoring appetite?

- **Structured logs plus error alerts** — *(Recommended starting point)* it answers "did it break?" without building an observability practice first.
- **Logs only** — you will find out from a user; sometimes that is an acceptable trade at small scale.
- **Full metrics, tracing and dashboards** — real value at real scale, and a project of its own before then.

## Q4. If the data were lost right now, how much could you afford to lose, and how long could you be down?

- **Up to a day of data, up to four hours down** — *(Recommended default)* what a nightly backup actually buys, stated honestly.
- **Up to an hour of each** — needs more than a nightly job, and the backup frequency has to match the number.
- **Almost nothing, minutes of downtime** — expensive and rarely true. **Confirm they mean it**, then design for it.
- **Not decided yet** — record it as an open question with an owner rather than defaulting quietly.

> **These two answers become numbers, not adjectives.** A recovery objective stated as
> "quickly" cannot be tested, and the backup schedule must match the number it claims — a
> stated one-hour objective with a nightly backup is a one-day objective with a nicer name.
