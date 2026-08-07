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
> trigger, because no number could reverse it. Write ***why:*** and then say so — *"refused on
> principle: a shared cache without the account in the key leaks between users at any size."*
> That is a stronger answer than a threshold, and it is only honest when the row says which
> kind it is.

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
| Login | | | per IP + per account | 429 + `Retry-After` | |
| Write endpoints | | | per user | | |
| Expensive / AI endpoints | | | per user per day | | |
| Everything else | | | | | ☐ Not needed — *why:* …  *revisit when:* … |

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
| Static assets | CDN | | content hash in filename | yes | |
| Reference data | app memory | | | | |
| Expensive query | shared cache | | write to underlying entity | | |
| Per-user data | | | | **usually no** | ☐ Not needed — *why:* …  *revisit when:* … |

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
| Is the app **stateless**? | *If no — what state lives in the process, and why?* |
| Where do **sessions** live? | Token / shared store / **sticky sessions** *(sticky = you are not stateless)* |
| Scaling trigger | CPU / requests / queue depth / manual |
| Min / max instances | |
| **Background workers** | Scale separately from web? |
| **Database connections** | Pool size × instances must stay under the DB limit |
| Long-running work | Must not live in a request handler |

> **Statelessness is the option that buys horizontal scaling later.** It costs almost
> nothing on day one and is expensive to retrofit. Even if you never scale out, being
> stateless means a restart is not an incident.

☐ **Single instance is fine** — *why:* ____________  *revisit when:* ____________

## 4. Compute & cost

| Item | Value |
|---|---|
| Compute shape | container / serverless / VM / managed platform |
| Instance size | |
| **Monthly cost ceiling** | *The number above which someone must be told.* |
| Cost per unit | per user / per request / per tenant |
| Biggest cost driver | |
| Quotas & hard limits | *provider limits you could actually hit* |
| Alert at | *% of ceiling* |

> **Cost is an architectural characteristic.** It behaves like latency: unmeasured, it
> only surfaces as a surprise. A cost ceiling with an alert is the cheapest fitness
> function in this whole template.

---

> Blueprint source: this file is new to the template — added to close the runtime layers
> (rate limiting, cache/CDN, scaling, cost) that the spec-driven method does not cover.

---

# WORKED EXAMPLE — ProjectBoard

Drivers were **simplicity, security, performance**. Scalability was explicitly rejected.
That single fact decided most of this file.

### Rate limiting

| Endpoint | Limit | Window | Scope | On exceed | Needed? |
|---|---|---|---|---|---|
| `POST /login` | 5 | 10 min | **per account** + 20/min per IP | 429 + lockout (REQ-AUTH-006) | ✅ |
| `POST /ai/summary` | 20 | per day | per user | 429 + "daily limit reached" | ✅ **cost control** |
| Write endpoints | 60 | per min | per user | 429 | ✅ |
| Read endpoints | — | — | — | — | ☐ **Not needed** — 50 users, single tenant per project, reads are cheap. Revisit at 1,000 users. |

> **Why the AI endpoint is limited per day, not per minute:** the risk is not load, it is
> **spend**. At $0.003 a call, 20/user/day caps the feature at roughly $15/month across 50
> users — which is exactly the budget in `ai-boundary-spec.md`. A per-minute limit would
> have controlled bursts and let the monthly bill run away.

### Cache & CDN

| What | Where | TTL | Invalidated by | Stale OK? | Needed? |
|---|---|---|---|---|---|
| CSS / JS | CDN | 1 year | content hash in filename | yes | ✅ |
| Project member list | app memory | 5 min | membership change | yes | ✅ |
| Task lists | — | — | — | **no** | ☐ **Not needed** — pagination + index got p95 to 0.34 s (PTEST-003). A cache here would add an invalidation bug for no measurable gain. |

> **The one that was nearly wrong.** The first proposal cached task lists in a shared
> cache keyed by `project_id`. It passed every test — because every test used one user.
> The key omits *who is asking*, and REQ-F-006 scopes visibility per user. Caught in
> review by rule 1 of this section, not by the test suite.

### Load balancing & scalability

| Question | Answer |
|---|---|
| Stateless? | **Yes** — sessions are signed tokens, nothing in process memory |
| Sessions | Token, validated per request. **No sticky sessions.** |
| Scaling trigger | n/a — single instance |
| Min / max | 1 / 1 |
| Background workers | Export + email run in one worker process, separate from web |
| DB connections | Pool 10; single instance; provider limit 100 — fine |

☐ **Single instance is fine** — *why:* 50 users, CON-004 mandates one low-cost instance,
scalability was explicitly rejected as a driver. *Revisit when:* concurrent users exceed
200, **or** p95 breaches 2 s under normal load.

> Statelessness was kept anyway, even with one instance, because it costs nothing now and
> means a restart during deploy is invisible to users. **That is buying an option cheaply.**

### Compute & cost

| Item | Value |
|---|---|
| Compute shape | One container, managed platform |
| Instance size | 1 vCPU / 1 GB |
| **Monthly ceiling** | **$60** — above this, the product owner is told |
| Cost per unit | ~$1.20 / active user / month |
| Biggest driver | AI summaries (~$15), then the managed database (~$25) |
| Quotas | Provider caps outbound email at 500/day — currently at ~40 |
| Alert at | 80% of ceiling ($48) |

### What this file changed

- **Two limits exist that nobody had thought about.** The AI daily cap came directly from
  writing the cost ceiling next to the rate limits.
- **A cross-tenant cache bug was prevented before it was written.**
- **Three sections say "not needed", with reasons and revisit triggers.** That took ten
  minutes and is worth more than an unused Redis instance.
