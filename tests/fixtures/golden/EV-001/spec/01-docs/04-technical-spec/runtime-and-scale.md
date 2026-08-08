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
| Login | a small number of attempts | short window | per IP + per account | 429 + `Retry-After` | ✅ even a single-user app benefits against credential stuffing; the concrete limit is set with the auth model (`Q-009`). |
| Write endpoints | — | — | per user | — | ☐ Not needed — one user, cheap writes. *Revisit when:* the user count grows (`Q-001`). |
| Expensive / AI endpoints | — | — | — | — | ☐ Not needed — no paid or AI APIs (`Q-007`). *Revisit when:* one is added. |
| Everything else | — | — | — | — | ☐ Not needed — single user, no paid APIs. *Revisit when:* a real multi-user count appears (`Q-001`). |

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
| Static assets | CDN / app | 1 year | content hash in filename | yes | ☐ Not needed now — one user, tiny assets. *Revisit when:* assets exceed ~1 MB or a second region appears. |
| Reference data | — | — | — | — | ☐ Not needed — negligible single-user data. *Revisit when:* a real multi-user count appears (`Q-001`). |
| Expensive query | — | — | — | — | ☐ Not needed — performance is not a driver and the data is one cook's library. *Revisit when:* list generation is slow (`Q-010`). |
| Per-user data | — | — | — | **usually no** | ☐ Not needed — one account; a shared cache would add an invalidation bug for no gain. *Revisit when:* a real multi-user count appears (`Q-001`). |

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
| Is the app **stateless**? | Yes — no important state lives in the process; all state is in the database. |
| Where do **sessions** live? | In a token or shared store, per the auth model (`Q-009`). **No sticky sessions.** |
| Scaling trigger | n/a — single instance in version one. |
| Min / max instances | 1 / 1 |
| **Background workers** | None in version one; nothing to scale separately. |
| **Database connections** | A small pool on a single instance; well under any store's limit. |
| Long-running work | None — every action is synchronous. |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit. Even if you never scale out, being
> stateless means a restart is not an incident.

☐ **Single instance is fine** — *why:* one user in version one; statelessness is kept anyway
because it costs nothing now and makes a restart invisible. *revisit when:* the user count
grows past a real multi-user level (`Q-001`).

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | A container, so the deployment target stays open (`Q-017`). |
| Instance size | The smallest that runs the app comfortably for one user. |
| **Monthly cost ceiling** | Not set — no budget constraint was given (`Q-005`); set one before deploying. |
| Cost per unit | One user in version one. |
| Biggest cost driver | The runtime instance, then private photo storage. |
| Quotas & hard limits | Depend on the deployment target (`Q-017`). |
| Alert at | Once a ceiling is set (`Q-005`). |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

---

> Blueprint source: this file is new to the template — added to close the runtime layers
> (rate limiting, cache/CDN, scaling, cost) that the spec-driven method does not cover.

---

> Blueprint: blueprints/01-docs/04-technical-spec/runtime-and-scale.md
