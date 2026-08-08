# runtime-and-scale.md — Limits, Cache, Scale, Cost

> **Purpose:** the four runtime layers that are invisible until they hurt.
> **When you use it:** with the technical spec, before implementation.
> **Covers:** rate limiting · cache & CDN · load balancing & scalability · compute & cost.

> **Most projects will answer "not needed" to half of this file — and that is the point.**
> An explicit *"no CDN: single region, 50 users, static assets are 40 KB"* is a decision.
> Silence is an accident waiting for traffic. Fill it in fifteen minutes and move on.

> ### What every "Needed?" cell must contain
>
> **`☐ Not needed` on its own is not an answer.** It is the same blank as an empty cell, spelled
> differently, and it reads as a row somebody skipped rather than a row somebody decided.
>
> Every refusal takes both halves:
>
> - ***why:*** — the fact that makes it unnecessary *today*. "Single user, 40 KB of assets",
>   not "not required".
> - ***revisit when:*** — the change that would make it necessary. A number, an event, a
>   question id. **Without one, a refusal expires silently**: the project grows past the reason
>   and nothing says so, because the reason was never written as a threshold.
>
> **One exception, and it must be stated in the row:** a refusal on *principle* has no revisit
> trigger, because no number could reverse it — *"refused on principle: the health check has to
> answer during an incident, and no traffic level makes throttling it correct."* Write
> ***why:*** and then say which kind of refusal it is. That is a stronger answer than a
> threshold, and it is only honest when the row says so rather than leaving the trigger off.

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
| Sign-in | [TODO: which authentication model? — Q-009] | — | per IP + per account | 429 + `Retry-After` | Yes in principle — the sign-in surface exists whatever Q-009 decides; its numbers follow the model. |
| Write endpoints | — | — | per user | — | ☐ Not needed — *why:* a single-user personal tool; traffic is one person's. *Revisit when:* Q-001 is answered above 1,000 users, or abuse is observed. |
| Expensive / AI endpoints | — | — | per user per day | — | ☐ Not needed — *why:* no paid API is known to exist (Q-014 open). *Revisit when:* Q-014 names a paid dependency. |
| Everything else | — | — | — | — | ☐ Not needed — *why:* reads are cheap at personal-library scale. *Revisit when:* Q-001 is answered above 1,000 users. |

**Rules**
- Return **429** with `Retry-After`. Never fail silently or drop the request.
- Rate limiting is **authorization-adjacent**: it must be enforced server-side, and it
  needs a **deny test** like any other rule.
- Login needs limiting **per account as well as per IP** — otherwise a distributed
  attempt walks straight past an IP limit.
- If a paid API sits behind an endpoint, an unlimited endpoint is an **unlimited invoice**.

## 2. Cache & CDN

> The hard part is never the cache. It is **invalidation** — decide it now, in writing.

| What | Where | TTL | Invalidated by | Stale is acceptable? | Needed? |
|---|---|---|---|---|---|
| Static assets | — | — | content hash in filename | yes | ☐ Not needed — *why:* a small app's assets from one origin; no measured problem. *Revisit when:* asset payload exceeds a megabyte or load time is measured slow. |
| Reference data | — | — | — | — | ☐ Not needed — *why:* Pantry has no shared reference data; everything is per-account. *Revisit when:* shared data (e.g. a public ingredient catalogue) appears. |
| Expensive query | — | — | — | — | ☐ Not needed — *why:* performance is not a driving characteristic, and generation is cheap aggregation at personal scale. *Revisit when:* FF-004 breaches its threshold. |
| Per-user data | — | — | — | **usually no** | ☐ Not needed — *why:* the classic cross-user leak for no measurable gain. *Revisit when:* FF-004 breaches and profiling names a specific query. |

**Rules**
- Never cache **per-user data in a shared cache** without the user ID in the key. This is
  the classic cross-tenant leak, and it will pass every functional test.
- Every cached item needs a **named invalidation trigger**. "It expires eventually" is not one.
- Prefer **content-hashed filenames** over CDN purges.
- A cache is a **correctness risk before it is a performance win**. If performance is not
  one of your three driving characteristics, you probably do not need one yet.

## 3. Load balancing & scalability

| Question | Answer |
|---|---|
| Is the app **stateless**? | Intended stateless — no important state in process memory. Session storage depends on Q-009. |
| Where do **sessions** live? | [TODO: which authentication model? — Q-009] |
| Scaling trigger | n/a — single instance. |
| Min / max instances | 1 / 1 |
| **Background workers** | None in version one (technical-spec §9.5). |
| **Database connections** | SQLite is in-process — no connection pool to size. Revisit at the Postgres move (ADR-002). |
| Long-running work | None — generation completes in the request at personal scale. |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit. Even if you never scale out, being
> stateless means a restart is not an incident.

☑ **Single instance is fine** — *why:* a single-user personal tool; user volume is open
(Q-001) but nothing suggests more than one instance is needed. *Revisit when:* Q-001 is
answered above 1,000 users, or FF-004 breaches under normal load.

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | [TODO: where will this run? — Q-018] |
| Instance size | [TODO: where will this run? — Q-018] |
| **Monthly cost ceiling** | [TODO: what hard constraints already exist? — Q-005] |
| Cost per unit | Unknown until Q-018 is answered. |
| Biggest cost driver | Unknown until Q-018 is answered. |
| Quotas & hard limits | Unknown until Q-018 is answered. |
| Alert at | Follows the ceiling once Q-005 sets one. |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

---

> Blueprint source: this file is new to the template — added to close the runtime layers
> (rate limiting, cache/CDN, scaling, cost) that the spec-driven method does not cover.

> Blueprint: blueprints/01-docs/04-technical-spec/runtime-and-scale.md
