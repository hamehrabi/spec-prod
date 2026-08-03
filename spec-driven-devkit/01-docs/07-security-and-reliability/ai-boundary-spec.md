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

## 0. Adaptation note — the model is not called, it is the runtime

This kit never calls a model API. There is no SDK, no key, no request, no token count, and
no bill (ADR-002, CON-003, CON-006). By the blueprint's own instruction — *"skip this file
if you have none"* — it could be skipped.

It is kept, because the underlying relationship is present in an unusually pure form:
**a language model executes this product.** The instruction set is the prompt, the agent is
the runtime, and every failure mode this file exists to govern is present — non-determinism,
drift, output that looks right and is not, and the question of what happens when the model
is wrong.

The sections that genuinely do not apply are marked **n/a with the reason**, not deleted.

| Blueprint concept | Here |
|---|---|
| Provider / SDK | The host (Claude Code) and the model behind it. Not called — inhabited. |
| Prompt | The intake instruction set and the question set (ADR-001's two modules). |
| Model parameters (temperature, k, max tokens) | **Do not exist.** The kit sets none and cannot. |
| Cost per request | Real, but **the developer's**, on their own account, and unmeasurable (CON-007). |
| Eval set | [`ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md) — how to know an instruction change helped. |

---

## 1. The one budget that structures the system

Pick **one**. Let it shape the architecture; keep everything else simple.

| Constraint | Target | Why this one |
|---|---|---|
| **Quality floor** | A generated workspace passes **all 14** structural checks (FF-001…FF-014). Any failure blocks the release. | **Inferred, not asked** — the other two are not the kit author's to set. *Cost per request* is paid by the developer on their own account and is unmeasurable under CON-007. *p95 latency* is the host model's thinking time, which the kit neither controls nor can optimise. The only budget this product actually owns is whether its output is structurally sound, so that is the one that gets to shape the architecture. |

**What choosing it changed.** Every check in the register is a count with a threshold of
zero or an exact number, because a quality floor that cannot be computed is not a floor. It
is also why `technical-spec.md` §11 asserts structure and never prose: prose quality would
have been the intuitive floor and is not measurable, so it would have decayed into a vibe.

## 2. Model boundary

| Item | Decision |
|---|---|
| Provider(s) | Claude Code, and whichever model the developer runs it with. The kit does not select, pin, or know the model. |
| Abstraction | **None, and none possible.** The kit does not wrap the model; it is executed by it. There is no adapter to write because there is no call to make. |
| What is exposed | Everything. The instruction set is plain Markdown the developer can read, edit, and disagree with. There is no hidden layer. |
| What is hidden | Nothing. This is unusual and worth stating: a developer can inspect the entire "implementation" of this product by reading it. |
| **Swap cost** | **To run on a different host: 2 of 5 modules.** The plugin manifest and the host-specific parts of the intake instruction set change. The question set, the ~90-file blueprint library, and the validation checklist are **portable as-is** — they are Markdown that says what to ask and what to write, not how to ask it. |
| Pinned version | The *plugin* is pinned and stamped into every workspace (ADR-005). The *model* is not pinned and cannot be — the developer chooses it. **This is the largest uncontrolled variable in the product.** |

> **The trap is false abstraction.** Hiding token counts or streaming semantics behind a
> uniform façade when callers demonstrably need them produces obscurity, not abstraction.

**The swap-cost number is worth reading twice.** "Support for AI assistants other than
Claude Code" is a deferred non-goal, and this row says what deferring it actually costs:
about 40% of the modules, and none of the content. That is a much cheaper option than it
looked when it was deferred, and it is cheap **because** ADR-001 separated the modules. If
the blueprint library or the question set ever acquires host-specific content, this number
rises silently — which is the thing to watch for.

## 3. Derived, not configured

For each knob ask: **can the caller determine a better value than I can here?** If no,
compute it.

The blueprint's knobs (temperature, retrieval count, similarity threshold, max tokens) do
not exist. The kit has its own knobs, and the same question applies to each:

| Knob | Configured or derived? | Why |
|---|---|---|
| Temperature, top-p, max tokens | **n/a** — do not exist | The kit issues no model call and has nothing to parameterise. |
| **Intake depth** (default / express) | **Configured** — the one argument | Only the developer knows whether this is a throwaway prototype or a system that will outlive them. Nothing in the repository reveals that. |
| Number of rounds | **Derived** from depth | Never a separate setting. A depth argument that did not determine the round count would be two knobs pretending to be one. |
| Which questions to ask | **Derived** from prior answers (REQ-F-009) | The whole of DD-007 rests on this. A configured question list would let a derivable question be asked, which spends the budget depth is supposed to come from. |
| Spec depth per area | **Derived** from the subdomain map (BR-013) | The developer already answered it by naming their core subdomain. Asking again per file would be asking the same question ninety times. |
| Workspace location | **Fixed**, not configured (ADR-004) | Considered and rejected: a setting is a branch, and FF-001 counts branches. |

> Four derived, one configured, one fixed. That ratio is the point — every knob that
> survives is one the developer genuinely knows better than the kit does.

## 4. Guardrails

| Layer | Rule | On violation |
|---|---|---|
| **Input** | The developer's free-text answer is accepted as given. It is never rejected, never re-asked in a loop, never "improved". A path-like answer must normalise inside `spec/`. | Vague input becomes an open question with a decision owner — not a rejection. A traversal path is rejected and re-asked, naming the problem. |
| **Output** | Every generated file must pass the structural checks: headings match the blueprint, no surviving placeholder, no worked-example content, identifiers resolve, back-link resolves. | Retry that one file once; if it fails again, mark the gap `[TODO]` with a matching `Q-###` and report it. Never accept silently. |
| **Refusal** | If the host model declines to produce something, **surface it verbatim**. Never paraphrase it into a generic error, and never work around it. | Reported to the developer as a refusal, with the file it concerned. It is a signal, not noise. |
| **PII / secrets** | The kit never reads `.env` or secret files (SEC-A-002), never copies repository content into a generated file beyond what the developer typed, and transmits nothing (BR-014). | A generated file containing a credential is a validation failure (check 12, FF-009's sibling), not a warning. |

## 5. Failure behaviour

Apply all four error techniques (Ousterhout Ch. 10):

| Failure | Technique | Behaviour |
|---|---|---|
| A generated file's structure drifts from its blueprint | **Define away** | **ADR-003 removes the failure rather than handling it.** The structure is *copied*, not regenerated, so drift has no route in. This is the single most valuable line in this file: the most likely model failure was designed out of existence rather than caught. |
| One file comes out hollow or with surviving template text | **Mask low** | Detected by validation; that one file is re-filled **once**, silently, at the point of failure. The developer is not asked to care about a transient. |
| Anything still failing after the retry | **Aggregate high** | Collected into **one** validation report at the end of intake, naming every check, file, and identifier. Not eleven scattered mid-round warnings the developer scrolls past. |
| A required blueprint is missing from the plugin | **Just crash** | Stop at that file. Name the missing blueprint. Prior rounds intact. **Never improvise a structure** — an invented file is indistinguishable from a real one. |
| The repository is not writable | **Just crash** | Fail *before* the first question, naming the path — not after the developer has answered eight rounds. |
| A model refusal, or a contradiction in the developer's answers | **Never mask** | Surfaced immediately and verbatim. Both quotes shown for a contradiction (BR-012). The developer decides; the agent does not. |

> **The retry is bounded at one, deliberately.** Unbounded retry on a non-deterministic
> generator is how a session burns twenty minutes on one stubborn file — and a file that
> failed twice is evidence about the *instruction*, which is information worth surfacing,
> not a transient worth grinding through.

## 6. Human in the loop

| Question | Answer |
|---|---|
| Where does the human sit? | **Both ends. Approve before, review after.** Before: the developer approves every file write on a first run (REQ-F-025) — no blanket permission is ever requested. After: the closing report names every `[TODO]`, every blocking question, and every assumption made rather than asked. |
| **What happens when the model is wrong?** | **Retry once, then compensate.** One silent re-fill of the failing file; if it fails again, the gap is *named* — `[TODO]` plus a matching open question plus a line in the report. Never a write-off, because a hollow file that nobody flags is RSK-2 shipping undetected. |
| What can the model do without approval? | Ask questions. Read blueprints. Read the workspace to determine progress. **Nothing that writes.** Every write passes the host's per-file prompt on a first run. |
| What is logged for review? | **Nothing persistent, by design** (CON-007). The developer-visible output is the review surface: a round summary per round, a validation report naming each check as passed / failed / **not run**, and the closing report. The workspace in version control is the durable audit trail — which is exactly why it is committed rather than ignored. |

**Why "retry once, then compensate" and not "write off".** The blueprint offers three
answers and they are not equivalent here. A write-off is correct when a wrong output is
visibly wrong and costs the user nothing — a summary they ignore. This product's wrong
output is a specification file that **looks finished**, gets committed, and is then read as
authoritative by a build agent weeks later. Nobody ignores it; they act on it. That moves the
answer from *write off* to *compensate*, and compensating means naming the gap loudly enough
that it cannot be mistaken for an answer.

## 7. Observability

| Signal | Captured |
|---|---|
| Prompt version, model, params | **Prompt version: yes** — the plugin version stamped into every workspace (ADR-005) identifies the instruction set that produced it. **Model and params: no** — the kit does not know which model ran it. |
| Tokens in/out, cost, latency | **No.** Not measurable by the kit, and forbidden to transmit (CON-007). The developer's own host may show it; the kit neither sees nor records it. |
| Refusals, guardrail trips, fallbacks | **In-session only.** A refusal, a retry, and a validation failure are all reported to the developer as they happen and summarised at the end. Nothing persists beyond the workspace. |
| **Never logged** | Everything — because **there is no log**. No file, no telemetry, no error reporting. |

> **The gap this leaves, stated plainly.** The kit cannot see its own failure rate. If the
> fill step fails on one file in ten across all users, nobody finds out — there is no
> aggregate anywhere. That is the same hole as **Q-002**, arriving from a different
> direction, and `ai-evals.md` is the only substitute: a golden set the kit author runs
> themselves, standing in for the field data CON-007 forbids.

## 8. Prompts as artifacts

Prompts are code. One authoritative version, not four near-duplicates in three services.
Each prompt file states: **intent, the failure it was written to fix, its version, and
its eval set.** → [`ai-evals.md`](../../03-tests/03-non-functional/ai-evals.md)

**Here the prompt *is* the product.** The intake instruction set and the question set are
not adjuncts to an implementation — they are the implementation (ADR-002). Consequences:

- **One authoritative version.** The instruction set exists once, in the plugin, versioned
  with it. There is no second copy in a README or a docs site to drift out of sync.
- **Every question carries its intent.** A question's one-line reason (REQ-F-006) is not
  only for the developer — it is the record of why that question exists, read by whoever
  edits it next.
- **A changed question needs an eval, not an opinion.** "This wording is clearer" is
  untestable. `ai-evals.md` defines the golden set that decides.
- **Versioning is the release process.** A question change ships as a plugin version, is
  stamped into every workspace generated after it, and is therefore attributable.

## 9. Tool schemas (agents only)

The kit **defines no tools.** It uses the host's file and question tools and adds none, so
the checklist below is not applicable in its literal form.

- [ ] ~~Six deep tools, not forty shallow ones~~ — n/a, the kit defines zero tools
- [ ] ~~Each hides meaningful work~~ — n/a
- [x] **Description states units, ordering, idempotency, and null meaning** — applies, and
      matters more here than usual. See below.
- [x] **Destructive operations require confirmation** — every file write passes the host's
      per-file prompt (REQ-F-025)

> **The deep-module problem is present, just relocated.** The blueprint's insight is that a
> tool schema is consumed by a model that cannot read your source, so *everything informal
> must be in the description or it does not exist*. In this product the **blueprint files and
> the instruction set are that interface** — read by an agent with no access to the reasoning
> behind them.
>
> That is precisely why each ADR carries a *"rule the AI assistant must follow"* field and
> why `adr-index.md` requires those rules to be copied verbatim into `AGENT.md`. A decision
> recorded only as prose in an ADR does not exist to the agent that must obey it. Ordering
> (`.gitignore` before `.env.example`, entry point last), idempotency (re-running a complete
> stage is safe), and null meaning (a blank row is an accident; *not needed, because…* is a
> decision) are all written down for exactly this reason.

---

## What this file changed

- **The one budget was inferred rather than asked, and the inference is stated.** Two of the
  three candidate budgets belong to someone else — the developer's account and the host's
  latency. Naming that is what makes "quality floor" a decision instead of a default.
- **ADR-003 was reclassified as an error technique.** Copy-then-fill was chosen for
  detectability; §5 shows it is really *define away* — the most likely model failure was
  removed rather than handled. That reframing is worth more than the original justification.
- **The retry bound came from asking what happens when the model is wrong.** Unbounded retry
  and write-off were both live options until §6 forced the question of who reads a wrong file
  and when.
- **The host swap cost turned out to be 2 modules of 5, and none of the content.** A deferred
  non-goal is much cheaper than it looked — and the file now names the thing that would
  silently make it expensive again.

> Blueprint: ../../../spec-driven-template/01-docs/07-security-and-reliability/ai-boundary-spec.md
