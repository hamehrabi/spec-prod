# runtime-and-scale.md — Limits, Cache, Scale, Cost

> **Purpose:** the four runtime layers that are invisible until they hurt.
> **When you use it:** with the technical spec, before implementation.
> **Covers:** rate limiting · cache & CDN · load balancing & scalability · compute & cost.

> **Most projects will answer "not needed" to half of this file — and that is the point.**
> An explicit *"no CDN: single region, 50 users, static assets are 40 KB"* is a decision.
> Silence is an accident waiting for traffic. Fill it in fifteen minutes and move on.

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
| Login | 5 | 10 min | per IP + per account | 429 + `Retry-After` | ✅ protects the one account from credential guessing |
| Write endpoints | — | — | per user | — | ☐ Not needed — single user |
| Expensive / AI endpoints | — | — | — | — | ☐ Not needed — no paid or AI API (Round 6) |
| Everything else | — | — | — | — | ☐ Not needed — single user, small data. Revisit if multi-user (Q-001). |

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
| Static assets | CDN (optional) | 1 year | content hash in filename | yes | ☐ Optional — small bundle; content-hash if a CDN is used |
| Reference data | — | — | — | — | ☐ Not needed |
| Expensive query | — | — | — | — | ☐ Not needed — small single-user dataset |
| Per-user data | — | — | — | usually no | ☐ Not needed |

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
| Is the app **stateless**? | Aim for stateless; the session mechanism is set with the auth model (Q-006). |
| Where do **sessions** live? | Server-side session or token — decided with the auth model (Q-006). No sticky sessions. |
| Scaling trigger | n/a — single instance. |
| Min / max instances | 1 / 1 |
| **Background workers** | None needed in version one. |
| **Database connections** | Small pool on one instance; well under any store limit. |
| Long-running work | List generation is fast and synchronous; nothing long-running in a request. |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit. Even if you never scale out, being
> stateless means a restart is not an incident.

☐ **Single instance is fine** — *why:* single user, small data.  *revisit when:* the user
count is known and grows (Q-001).

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | Container — the deployment target is not decided yet; plan for a container so the choice stays open (Q-012). |
| Instance size | Small; single instance. |
| **Monthly cost ceiling** | Set once a host is chosen; the target is deferred (Q-012). |
| Cost per unit | Negligible at single-user scale. |
| Biggest cost driver | The one instance, plus dish-photo storage (Round 6). |
| Quotas & hard limits | None expected at this scale. |
| Alert at | Set once a hosting cost ceiling exists (Q-012). |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

---

> Blueprint source: this file is new to the template — added to close the runtime layers
> (rate limiting, cache/CDN, scaling, cost) that the spec-driven method does not cover.

> Blueprint: blueprints/01-docs/04-technical-spec/runtime-and-scale.md
