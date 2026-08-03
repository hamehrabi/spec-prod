# runtime-and-scale.md — Limits, Cache, Scale, Cost

> **Purpose:** the four runtime layers that are invisible until they hurt.
> **When you use it:** with the technical spec, before implementation.
> **Covers:** rate limiting · cache & CDN · load balancing & scalability · compute & cost.

> **Most projects will answer "not needed" to half of this file — and that is the point.**
> An explicit *"no CDN: single region, 50 users, static assets are 40 KB"* is a decision.
> Silence is an accident waiting for traffic. Fill it in fifteen minutes and move on.

**This project answers "not needed" to nearly all of it**, and the reasons matter more than
usual, because they all trace to one fact: **ADR-002 means there is no runtime.** No process
serves a request, no endpoint exists to be limited, no instance exists to be scaled, and no
bill accrues to anyone. Every row below is filled anyway — with the reason and the revisit
trigger — because a blank row is an accident and an explicit *no, because there is nothing
running* is a decision.

---

## 1. Rate limiting

Protects three different things. Say which one you are protecting — they need different limits.

| Protecting against | Typical limit | Applies to |
|---|---|---|
| **Abuse / DoS** | per IP | public endpoints |
| **Runaway cost** | per user per day | anything that calls a paid API |
| **Noisy neighbour** | per tenant | shared infrastructure |

| Endpoint / group | Limit | Window | Scope | On exceed | Needed? |
|---|---|---|---|---|---|
| Login | — | — | — | — | ☐ **Not needed** — *why:* there is no login, no account, no session, and no credential anywhere in this product (§7.1 of the technical spec). Nothing exists to brute-force. *Revisit when:* the kit ever gains an account, a licence check, or any authenticated call. |
| Write endpoints | — | — | — | — | ☐ **Not needed** — *why:* there is no server and no endpoint. "Writes" are local file writes performed by the developer's own agent with the developer's own permissions, gated by the host's per-file prompt (REQ-F-025). A rate limit here would be a limit on the developer's own machine, against themselves. *Revisit when:* the kit gains any component that accepts a request from someone other than the person running it. |
| Expensive / paid-API endpoints | — | — | — | — | ☐ **Not needed** — *why:* **the kit calls no paid API.** CON-003 forbids network calls and CON-006 forbids paid services; FF-009 enforces that the shipped payload contains nothing that could make a call. *Revisit when:* CON-003 or CON-006 is reopened — at which point this row becomes mandatory, not optional. |
| Everything else | — | — | — | — | ☐ **Not needed** — *why:* nothing is reachable. There is no listening socket, no URL, and no invocation path except a developer typing a command in their own terminal. |

**Rules**
- Return **429** with `Retry-After`. Never fail silently or drop the request.
- Rate limiting is **authorization-adjacent**: it must be enforced server-side, and it
  needs a **deny test** like any other rule.
- Login needs limiting **per account as well as per IP** — otherwise a distributed
  attempt walks straight past an IP limit.
- If a paid API sits behind an endpoint, an unlimited endpoint is an **unlimited invoice**.

> **The one rule that still binds.** The template's hardest requirement — *always rate-limit
> login and any endpoint that calls a paid API* — is satisfied here by **not having either**.
> That is a legitimate way to satisfy it and an illegitimate way to forget it. The
> distinction is this row: if either ever appears, this file is wrong from that day, and
> both revisit triggers above name it explicitly.

## 2. Cache & CDN

> The hard part is never the cache. It is **invalidation** — decide it now, in writing.

| What | Where | TTL | Invalidated by | Stale is acceptable? | Needed? |
|---|---|---|---|---|---|
| Static assets | — | — | — | — | ☐ **Not needed** — *why:* nothing is served. The plugin's files are read from the local filesystem by the host. |
| Reference data (the blueprint library) | — | — | — | — | ☐ **Not needed** — *why:* ~90 local Markdown files, read at most once each per intake. Caching them would add an invalidation problem to save a local file read. *Revisit when:* a blueprint library grows large enough that a full intake is perceptibly slower for reading alone. |
| Expensive query | — | — | — | — | ☐ **Not needed** — *why:* there are no queries. The store is a folder (`database-design.md` §0). |
| Per-user data | — | — | — | **no** | ☐ **Not needed** — *why:* there is one user per run, on their own machine, and nothing shared between runs. |

**Rules**
- Never cache **per-user data in a shared cache** without the user ID in the key. This is
  the classic cross-tenant leak, and it will pass every functional test.
- Every cached item needs a **named invalidation trigger**. "It expires eventually" is not one.
- Prefer **content-hashed filenames** over CDN purges.
- A cache is a **correctness risk before it is a performance win**. If performance is not
  one of your three driving characteristics, you probably do not need one yet.

> Performance is explicitly **not** one of the three drivers here
> ([`driving-characteristics.md`](../02-requirements/driving-characteristics.md) Step 4), so
> by that last rule the answer was decided before this table was filled in. **The one
> caching idea worth pre-rejecting:** an agent may propose caching the workspace's state —
> which stage is complete, which identifiers are used — to avoid re-reading files on resume.
> That is a state file wearing a different hat, and ADR-004 forbids it.

## 3. Load balancing & scalability

| Question | Answer |
|---|---|
| Is the app **stateless**? | **There is no app process.** The nearest true statement: the kit holds no state of its own — the generated workspace holds all of it (ADR-004), and it is re-read rather than remembered. |
| Where do **sessions** live? | A "session" is a Claude Code conversation, owned entirely by the host. The kit neither creates nor stores one. |
| Scaling trigger | n/a — nothing to scale. One developer, one machine, one repository, one run. |
| Min / max instances | n/a |
| **Background workers** | **None**, and deliberately so — see `technical-spec.md` §9.5. Nothing outlives the session. |
| **Database connections** | n/a — no database. |
| Long-running work | The intake itself is long-running by nature (eight rounds). It is bounded by the round limit, and it writes after every round so that stopping early still leaves value. |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit.

☑ **Single instance is fine** — *why:* there is no instance at all. Scalability was
explicitly rejected as a driver (under 50 users, one machine per run, no contended
resource). *Revisit when:* any part of the kit is ever shared between two people — which
CON-003 currently forbids outright, so this trigger fires only if that constraint is reopened.

> **The statelessness point still applies, in translated form, and it is not decoration.**
> The kit remembers nothing between runs. A crashed session, a closed terminal, or a machine
> restart is not an incident — resume reads the workspace and continues (FF-003). That is
> exactly the "a restart is not an incident" property, bought by ADR-004 rather than by
> a session store.

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | **None.** The kit is Markdown in a folder; the developer's own Claude Code session is the compute, and they already pay for it. |
| Instance size | n/a |
| **Monthly cost ceiling** | **$0 to run.** No hosting, no service, no API key, no per-seat charge — CON-006 makes this a product requirement, not a happy accident. |
| Cost per unit | **$0** per user, per run, and per generated workspace, to the kit author. |
| Biggest cost driver | **The kit author's CI**, which is the only thing here that costs money: golden-workspace generation and 14 fitness functions on every change. `[TODO: cost ceiling and alert threshold for CI minutes — kit author to set a number, even if it is $0 on a free tier. See Round 8.]` |
| Quotas & hard limits | CI provider minutes, once chosen (`cicd-pipeline.md`, Round 8). No other quota exists. |
| Alert at | `[TODO: percentage of the CI ceiling — set with the number above.]` |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

**The cost that is real but not the kit author's.** Every intake consumes the developer's
own model usage — ~90 file writes and eight rounds of reasoning. The kit cannot measure it
(CON-007 forbids telemetry) and does not pay it, but it does *influence* it: every question
that could have been inferred (REQ-F-009) and every file rewritten unnecessarily is spend on
someone else's account. **That is the honest argument for DD-007** — inference is not only
about finishing the interview, it is the only lever the kit has on a cost it imposes and
cannot see.

---

## What this file changed

- **Two revisit triggers now exist that would otherwise have been silent.** If CON-003 or
  CON-006 is ever reopened, the "expensive endpoint" row stops being *not needed* and becomes
  mandatory — an unlimited paid endpoint is an unlimited invoice, and this file is where that
  will be noticed.
- **A state cache was pre-rejected.** "Cache the workspace state to speed up resume" is a
  reasonable-sounding proposal that is ADR-004's forbidden state file in disguise. Naming it
  here means it gets a one-line rejection rather than a design discussion.
- **A cost nobody was tracking got named** — the developer's own model usage, which the kit
  imposes, cannot see, and directly influences through how many questions it asks.
- **Four sections say "not needed", each with a reason and a trigger.** That took fifteen
  minutes and is the difference between *we decided* and *nobody looked*.

> Blueprint: ../../../spec-driven-template/01-docs/04-technical-spec/runtime-and-scale.md
