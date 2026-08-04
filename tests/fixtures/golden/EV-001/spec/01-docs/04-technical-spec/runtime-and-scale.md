# runtime-and-scale.md — Limits, Cache, Scale, Cost

> **Purpose:** the four runtime layers that are invisible until they hurt.
> **When you use it:** with the technical spec, before implementation.
> **Covers:** rate limiting · cache & CDN · load balancing & scalability · compute & cost.

> **Most projects will answer "not needed" to half of this file — and that is the point.**
> An explicit *"no CDN: single region, 50 users, static assets are 40 KB"* is a decision.
> Silence is an accident waiting for traffic. Fill it in fifteen minutes and move on.

**Three of these four layers are "not needed" here, and one is unanswerable yet.** Performance
and scalability were both considered as driving characteristics and both rejected — see
[`../02-requirements/driving-characteristics.md`](../02-requirements/driving-characteristics.md)
step 4. This file is where that rejection turns into written decisions with revisit triggers,
rather than into four empty tables that read as an oversight.

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
| Login | [TODO: which authentication model does this project use?] | [TODO: which authentication model does this project use?] | per IP + per account | 429 + `Retry-After` | **Yes** |
| Write endpoints | Not set | — | per user | — | ☐ Not needed — *why:* one account writes its own recipes; there is no shared resource to exhaust and no other user to affect. *Revisit when:* anything is shared between accounts. |
| Expensive / AI endpoints | — | — | — | — | ☐ Not needed — *why:* no endpoint calls a paid API. Shopping-list generation reads rows this account already owns (FF-003 forbids an external call on that path). *Revisit when:* Q-017 names any external service. |
| Everything else | — | — | — | — | ☐ Not needed — *why:* no public unauthenticated endpoint exists. Every route requires a signed-in cook (REQ-R-003). |

**Login is the exception, and it stays "yes" even though nothing else does.** It is the one
endpoint reachable before authentication, so it is the one an attacker can reach at all. The
limit itself is blocked on [`Q-015`](../01-intent/open-questions.md): if sign-in is bought, the
provider sets it and this row records which; if it is built, this row has to carry a number.

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
| Static assets | CDN | — | content hash in filename | yes | ☐ Not needed — *why:* single region, one small asset bundle. *Revisit when:* Q-010 puts users in more than one region. |
| Reference data | — | — | — | — | ☐ Not needed — *why:* there is no reference data. Every row belongs to one account. |
| Expensive query | — | — | — | — | ☐ Not needed — *why:* the largest query is one week of meals. Tens of rows. |
| Per-user data | — | — | — | **no** | ☐ Not needed — *why:* see below. This is the one that stays "no" on principle rather than on volume. |

**The last row is a decision, not a measurement.** Caching per-user data in a shared cache
without the account in the key is the classic cross-account leak, and it passes every
functional test because the tests only ever run one account. This product's single
non-functional requirement, REQ-NF-002, is that no account reads another's data. A cache is the
cheapest way to break it, so the answer is no while performance is not a driver — and if
performance ever becomes one, this row needs an ADR rather than an edit.

**Rules**
- Never cache **per-user data in a shared cache** without the user ID in the key. This is
  the classic cross-tenant leak, and it will pass every functional test.
- Every cached item needs a **named invalidation trigger**. "It expires eventually" is not one.
- Prefer **content-hashed filenames** over CDN purges.
- A cache is a **correctness risk before it is a performance win**. If performance is not
  one of your three driving characteristics, you probably do not need one yet.

**That last rule is the whole section.** Performance is not one of the three, and the file says
so rather than leaving the reader to infer it.

## 3. Load balancing & scalability

| Question | Answer |
|---|---|
| Is the app **stateless**? | Yes. Nothing is held in the process between requests. |
| Where do **sessions** live? | [TODO: which authentication model does this project use?] — token or shared store. **Not sticky sessions**, whichever it is. |
| Scaling trigger | None. Single instance. |
| Min / max instances | 1 / 1 |
| **Background workers** | None. Shopping-list generation is fast enough to be synchronous, and FF-003 keeps it free of external calls. |
| **Database connections** | One instance, so the pool is bounded by definition. Revisit with the instance count, never separately. |
| Long-running work | None exists. If any appears, it does not go in a request handler. |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit. Even if you never scale out, being
> stateless means a restart is not an incident.

☑ **Single instance is fine** — *why:* scalability was considered as a driving characteristic
and rejected, because nobody has said how many accounts there will be
([`Q-010`](../01-intent/open-questions.md)) and the honest reading of *unknown* is not
*large*. *Revisit when:* Q-010 is answered with a number above a few thousand, or when a
single instance's restart becomes something anyone notices.

**Stateless is chosen even though nothing needs it.** It is the one row here that buys
something for free — the sentence above says it costs almost nothing on day one and is
expensive to retrofit, and that is a better reason than any scaling number would be.

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | [TODO: where will this run?] |
| Instance size | [TODO: where will this run?] |
| **Monthly cost ceiling** | [TODO: what hard constraints already exist — budget, platform, data, mandated technology?] |
| Cost per unit | Per account. There is no other unit — no tenants, no per-request paid calls. |
| Biggest cost driver | Whatever hosts the single instance, since nothing else costs anything: no external service, no object storage decided, no paid API. |
| Quotas & hard limits | [TODO: where will this run?] |
| Alert at | Cannot be set before the ceiling is. |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

**This is the only section of the four that is genuinely blocked rather than decided.** The
ceiling comes from the budget constraint nobody has stated
([`Q-003`](../01-intent/open-questions.md)) and the shape comes from
[`Q-016`](../01-intent/open-questions.md). Two of its seven rows *are* answerable now and are
answered, because they follow from decisions already made rather than from the missing ones.

---

> Blueprint source: this file is new to the template — added to close the runtime layers
> (rate limiting, cache/CDN, scaling, cost) that the spec-driven method does not cover.

---

**Next:** [`technical-spec.md`](technical-spec.md)

> Blueprint: blueprints/01-docs/04-technical-spec/runtime-and-scale.md
