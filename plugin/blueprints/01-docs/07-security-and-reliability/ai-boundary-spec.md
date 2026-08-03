# ai-boundary-spec.md — The AI Boundary

> **Purpose:** make the model replaceable, its behaviour measurable, its output governable,
> and responsibility explicit.
> **When you use it:** any feature that calls a model. Skip this file if you have none.
> **Sources:** Richards & Ford Ch. 26 (AI position) · Hohpe Ch. 9 (options) ·
> Ousterhout Ch. 8 (configuration knobs).

> **Model capability, pricing, and vendor viability are more volatile than almost anything
> else in your system.** Option value rises with volatility — so a replaceable model
> boundary is worth more here than the same abstraction would be anywhere else.

---

## 1. The one budget that structures the system

Pick **one**. Let it shape the architecture; keep everything else simple.

| Constraint | Target | Why this one |
|---|---|---|
| p95 latency / cost per request / quality floor | | |

## 2. Model boundary

| Item | Decision |
|---|---|
| Provider(s) | |
| Abstraction | *Where does provider-specific code stop?* |
| What is exposed | *Token accounting? Streaming? Tool-call format?* |
| What is hidden | |
| Swap cost | *Files to change to replace the provider. If > 3, the abstraction is wrong.* |
| Pinned version | *Never "latest" in production.* |

> **The trap is false abstraction.** Hiding token counts or streaming semantics behind a
> uniform façade when callers demonstrably need them produces obscurity, not abstraction.
> If people read your adapter source to find out what really happens, expose it.

## 3. Derived, not configured

For each knob ask: **can the caller determine a better value than I can here?** If no,
compute it.

| Knob | Configured or derived? | Why |
|---|---|---|
| Temperature | | |
| Retrieval count (k) | | |
| Similarity threshold | | |
| Max tokens | | |

## 4. Guardrails

| Layer | Rule | On violation |
|---|---|---|
| Input | | |
| Output | | |
| Refusal | *Never mask a content refusal — callers must be able to build on it.* | |
| PII | | |

## 5. Failure behaviour

Apply all four error techniques (Ousterhout Ch. 10):

| Failure | Technique | Behaviour |
|---|---|---|
| Malformed JSON output | **Define away** | Schema-coercing parser clamps/coerces/fills defaults |
| Rate limit, timeout | **Mask low** | Retry with backoff inside the transport layer |
| Any request-level error | **Aggregate high** | One handler at the request boundary |
| Missing API key, bad model name | **Just crash** | Fail at **startup** with a clear message |
| Content refusal, persistent outage | **Never mask** | Surface it — callers need it |

## 6. Human in the loop

| Question | Answer |
|---|---|
| Where does the human sit? | Approve before / review after / spot-check / none |
| What happens when the model is wrong? | **Retry / compensate / write off** |
| What can the model do without approval? | |
| What is logged for review? | |

## 7. Observability

| Signal | Captured |
|---|---|
| Prompt version, model, params | |
| Tokens in/out, cost, latency | |
| Refusals, guardrail trips, fallbacks | |
| **Never logged** | Prompt content with PII, API keys, raw user documents |

## 8. Prompts as artifacts

Prompts are code. One authoritative version, not four near-duplicates in three services.
Each prompt file states: **intent, the failure it was written to fix, its version, and
its eval set.** → [`../../03-tests/03-non-functional/ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md)

## 9. Tool schemas (agents only)

> A tool schema is the purest **deep module** problem you will face: the interface is
> consumed by a model that cannot read your source. Everything informal — call ordering,
> what null means, idempotency, units — **must be in the description or it does not exist.**

- [ ] Six deep tools, not forty shallow ones
- [ ] Each hides meaningful work (not a one-line forward)
- [ ] Description states units, ordering, idempotency, and null meaning
- [ ] Destructive tools require confirmation

---

## WORKED EXAMPLE — ProjectBoard "summarise my week"

### The one budget

| Constraint | Target | Why |
|---|---|---|
| **Cost per request** | < $0.01 | 50 users × daily = the whole feature must cost under $15/month or it does not ship (CON-006). Latency is secondary — this runs on a button press, not a page load. |

### Model boundary

| Item | Decision |
|---|---|
| Provider | One provider, pinned model version. |
| Abstraction | `src/04-services/ai/client.py` — the **only** file importing the provider SDK. |
| Exposed | Token counts and finish reason. Callers need both for the cost budget. |
| Hidden | Retry logic, backoff, request shaping. |
| Swap cost | **1 file.** ADR-006 records this as the option being bought. |
| Pinned | Yes — model + version string in config, never "latest". |

### Derived, not configured

| Knob | Decision | Why |
|---|---|---|
| Temperature | **Configured**, `0.2` | A caller summarising vs. drafting genuinely differs. |
| Retrieval count | **Derived** | Take tasks above the median relevance score. A fixed `k=5` goes stale the moment a project has 400 tasks instead of 12. |
| Max tokens | **Derived** from the cost budget | `budget / cost_per_token`. Nobody can set this better than the code can. |

### Failure behaviour, as shipped

| Failure | Technique | Behaviour |
|---|---|---|
| Model returns prose instead of JSON | Define away | Coercing parser; unparseable → plain-text summary, feature still works |
| 429 / timeout | Mask low | 2 retries, backoff, invisible above transport |
| Any error at request level | Aggregate high | One handler returns "Summary unavailable — your tasks are unchanged" |
| Missing API key | **Crash at startup** | Was a silent runtime 500 until BUG-005 |
| Content refusal | **Never masked** | Surfaced and logged — it is a signal, not noise |

### Human in the loop

| Question | Answer |
|---|---|
| Where | **Review after.** The summary is displayed, never saved or sent. |
| When wrong | **Write off.** User ignores it. No compensating action needed — which is exactly why this was a safe first AI feature. |
| Without approval | Read tasks in projects the user can already see. Nothing else. |
| Logged | Prompt version, model, tokens, cost, latency, whether the user clicked "regenerate". |

### What this spec prevented

> The first implementation called the provider SDK directly from the API handler, with
> `temperature`, `k`, and `max_tokens` as request parameters threaded through four
> signatures. Provider swap cost: **9 files**. After this spec: **1 file**, and two of the
> three knobs stopped existing.
>
> It also caught the real risk. The draft feature let the assistant **update task status**
> from the summary screen. Section 6 forced the question *"what happens when the model is
> wrong?"* — the answer was "it silently changes someone's work", which is a *compensate*,
> not a *write off*. The capability was cut from v1.

---

> Blueprint source: this file is new to the template — added from the architecture review.
