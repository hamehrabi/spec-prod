# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:** The host platform boundary — the only thing outside this system
**Requirement:** REQ-F-001, REQ-F-025, REQ-NF-007, REQ-NF-008, CON-003, CON-006

---

## 0. Why this file exists at all

**The kit has no external integrations.** No payments, no email, no storage, no identity, no
analytics, no AI model API. CON-003 forbids network calls and CON-006 forbids paid services,
and FF-009 enforces that the shipped payload contains nothing capable of making a call.

By the blueprint's own scoping rule this file could be skipped. It is kept for one reason:
**the kit depends completely on Claude Code**, and although the host is not a *service*, it
has every property the integration checklist was written to interrogate. It is owned by
someone else, it changes without asking, its behaviour is not guaranteed, and when it breaks
it breaks for every user at once (RSK-3). Treating it as an integration is what turns that
from an assumption into a specified dependency.

---

## 1. Entities

No entities cross a boundary — nothing leaves the machine (BR-014). The internal entity
model is specified in full in [`database-design.md`](database-design.md) §1.

- **Nothing sent** — no field, record, or fragment of the developer's data is transmitted anywhere.
- **Nothing received** — the kit fetches no data at run time. The blueprint library ships inside the plugin.

## 2. Database rules

n/a — there is no database. → [`database-design.md`](database-design.md) §0.

## 3. API endpoints

n/a — there is no HTTP surface. The three contracts that *do* exist (command, blueprint,
workspace) are specified in [`api-specification.md`](api-specification.md).

## 4. Validation rules

The boundary crossed here is not a network but a **filesystem**, and its validation rules
are the ones that matter:

- **Required fields:** none. A bare invocation is valid and is the common case.
- **Allowed values:** `depth` is `default` or `express`. Nothing else is accepted.
- **Relationship checks:** every referenced identifier must resolve within the same workspace.
- **Permission checks:** every destination path must normalise to inside `spec/` **before**
  the check runs — `spec/../../etc` begins with `spec/` and is not inside it (SEC-Z-001).

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

### The only integration: the host platform

| Item | Definition |
|---|---|
| **Provider** | Claude Code. Not a service the kit calls — the environment the kit runs inside. |
| **Purpose** | Four capabilities the kit consumes and does not implement: command registration, the structured question mechanism, cross-platform file read/write tools, and the **per-file permission prompt**. |
| **Data sent** | **Nothing leaves the machine.** The kit passes no data to any endpoint. The developer's answers travel to the model as ordinary conversation — the host's own data path, on the developer's own account, under the host's terms, not the kit's. |
| **Data received** | Nothing at run time. The blueprint library ships inside the plugin and is read from local disk (CON-003). |
| **Data stored** | Only what the developer approves, only under `spec/`, only in their own repository. |
| **Timeout** | **None, and none possible.** There is no call to time out; the only elapsed time is the model's own thinking, which the kit cannot interrupt. |
| **Retry rule** | **One retry, on one operation:** a generated file that failed a structural check is re-filled once (REQ-F-037). Nothing else retries — there is no transient to wait out. |
| **Idempotency** | **Yes, by construction.** Every write is whole-file, so redoing a stage replaces rather than accumulates. This is what makes resume safe without bookkeeping. |
| **Failure behavior** | A missing host capability is a **hard stop with a named cause**, never a degraded run. A missing blueprint halts that file with prior rounds intact. A declined write is recorded and the run continues. Full set: [`reliability-specification.md`](../07-security-and-reliability/reliability-specification.md) §3. |
| **Security rule** | **The kit holds no secret** — nothing to protect, rotate, or leak. It must never request blanket write permission (SEC-Z-002), because the host's per-file prompt is the only enforcement of the boundary that does not depend on the kit's own good behaviour. |
| **Rate limits** | None apply to the kit. The developer's own host usage limits apply to them, on their account. The kit's only influence is how much work it asks for — which is the honest argument for DD-007 (infer rather than ask). |

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.
>
> **Satisfied by having none.** That is a legitimate way to meet the rule and an easy way to
> stop noticing it. If CON-006 is ever reopened and a key appears, this row becomes the most
> important one on the page.

### The dependency risk, specified rather than assumed

```
Dependency:   Claude Code plugin format and session-start conventions
Owned by:     Not us.
Risk ID:      RSK-3
Failure mode: A change to the plugin format breaks installation for EVERY user
              simultaneously. There is no gradual degradation and no partial blast radius.
Mitigation 1: Depend only on documented mechanisms. No undocumented paths, no internals.
Mitigation 2: Keep ALL output plain Markdown. A generated workspace remains readable,
              usable, and committed even if the intake mechanism stops working entirely.
              The developer loses the ability to run new intakes, not their existing specs.
Mitigation 3: ADR-001's module separation keeps the host-specific surface small - the
              swap cost to a different host is 2 modules of 5, and none of the content
              (ai-boundary-spec.md §2).
Detector:     NONE.
              [TODO: does the kit author track Claude Code plugin releases anywhere?
              Without it, RSK-3 has no early warning and will be discovered from a user
              report. Raised in Round 6; still open.]
```

## 6. Versioning rules

- **Current version:** Contract v1.0 (see [`api-specification.md`](api-specification.md)).
- **Breaking-change policy:** the kit follows the host, not the reverse. A host change that
  breaks the plugin requires a kit release; the kit cannot pin, vendor, or shim the host.
- **Compatibility notes:** a generated workspace is **decoupled from both**. It is Markdown
  and stays valid regardless of host or plugin version — which is the deliberate consequence
  of mitigation 2 above, and the reason the version stamp (ADR-005) records the *plugin* that
  produced it rather than the host.

---

## Integration checklist

- [x] Provider, purpose, and data flow are documented in both directions — §5, and the flow out is empty.
- [x] Timeout is set — **n/a with the reason recorded**: nothing waits on anything.
- [x] Retries are bounded and only applied to safe (idempotent) operations — one retry, one operation, whole-file writes.
- [x] Failure behavior is defined, including what the user sees — §5 and `reliability-specification.md` §3, §9.
- [x] Secrets are configured through the environment, never hardcoded — **the kit has no secret**; see [`environment-config.md`](../../07-ops/01-deployment/environment-config.md).
- [ ] Failure paths have tests — written in Round 7 ([`edge-cases-and-failures.md`](../../03-tests/04-failure/edge-cases-and-failures.md)).
- [ ] **Monitoring covers this integration** — **it does not, and cannot** (CON-007). RSK-3 has no detector. This box stays unticked deliberately rather than being quietly reworded into something tickable.

> Blueprint: ../../../spec-driven-template/01-docs/06-api-and-data-design/data-and-integration-spec.md
