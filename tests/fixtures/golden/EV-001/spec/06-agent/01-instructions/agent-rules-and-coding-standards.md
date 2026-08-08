# Agent Rules and Coding Standards

> Source: Ch. 30 §30.5 + Ch. 12 §12.4.
> AI agents need rules because they are **powerful pattern generators, not responsible
> engineers**. Your standards tell the agent how code should be structured, what it must
> not change, how errors should be handled, how tests should be written, and what must be
> explained before review.

**Version:** AGENT v1.0

---

## Standards summary (Ch. 30 §30.5)

| Standard area | Rule example | Why it matters | Review evidence |
|---|---|---|---|
| Scope control | Do not modify files outside the task scope unless asked first. | Prevents hidden unrelated changes. | File-change summary. |
| Code style | Use clear names, small functions, predictable module boundaries. | Keeps generated code maintainable. | Reviewer readability check. |
| Error handling | Return safe user messages; log technical details internally. | Protects users and helps diagnosis. | Error-path tests. |
| Security | Never hardcode secrets or bypass authorization checks. | Prevents serious production risk. | Security review checklist. |
| Testing | Every behavior change must include relevant tests. | Makes output provable. | Passing test list and coverage notes. |
| Explanation | Summarize assumptions, trade-offs, and files changed. | Makes review faster and safer. | Agent completion note. |

---

## Reusable agent rules template (Ch. 30 §30.5)

```
General behavior:
- Follow the linked requirement and technical specification.
- Ask questions before filling major gaps.
- Do not expand scope without approval.

Coding standards:
- Keep functions small and readable.
- Use clear names and simple control flow.
- Add comments only where they explain non-obvious decisions.

Security rules:
- Do not hardcode secrets.
- Do not weaken authentication or authorization.
- Validate all external input.

Testing rules:
- Add or update tests for every behavior change.
- Include success paths, failure paths, and edge cases.

Completion note:
- List files changed.
- List assumptions.
- List tests added or updated.
- List remaining risks or questions.
```

---

## Coding standards for this project (Ch. 12 §12.4)

| Standard area | Rule |
|---|---|
| Naming | Use clear names such as `saveRecipe`, `generateShoppingList`, `getRecipeById`. |
| Functions | Prefer small functions that do one job. |
| Validation | Validate inputs before saving or processing data. |
| Errors | Return safe user-facing messages. Do not expose internal details. |
| Tests | Add or update tests for every behavior change. |
| Structure | Keep validation separate from request handling; keep business logic out of route handlers and UI components; each feature area lives in its named module (Recipes, Planning, ShoppingList, Account/Auth) per ADR-001. |
| Data access | Use only portable SQL and types; no SQLite-only feature, function, or extension; every migration is reversible (ADR-002). |
| Ownership | Scope every read and write by `account_id`; a request for another account's data returns a safe not-found (BR-002, SEC-Z-001). |
| Logging | Include a request ID; never log secrets, passwords, or credentials (SEC-A-002). |
| Comments | Explain *why*, not *what*. |

*These are Pantry's real conventions. Keep it short — the goal is to prevent avoidable
inconsistency, not to write a style manual.*

---

## Project rules from ADRs and boundaries (must match AGENT.md)

| Rule | Source |
|---|---|
| Each feature area lives in its named module; route handlers contain no business rules; business logic never lives in UI components; no module reaches another account's data. | ADR-001, FF-001 |
| Use only portable SQL and types; no SQLite-only feature/function/extension; every migration is reversible. | ADR-002, FF-001 |
| The ShoppingList list-generation logic (REQ-F-004, BR-001) stays separate from recipe storage and Account/Auth; it must not import UI or store-specific code. | ADR-001, REQ-NF-005, FF-001 |
| Every read/write is scoped by `account_id`; another account's data returns a safe not-found. | BR-002, SEC-Z-001, FF-002 |
| Build only what the current task cites; no sharing, nutrition, pricing, or recipe import; one task at a time; every behaviour change adds/updates a test; report unclear requirements before coding. | Scope discipline |
| Do not treat an open question (Q-###) as an assumption — stop and ask. | Scope discipline |

---

## Layer responsibilities (Ch. 20 §20.3)

| Layer | Main responsibility | Must not do |
|---|---|---|
| Endpoint / controller | Receive input, call the service layer, return the response. | Contain deep business rules. |
| Validation layer | Reject invalid input before business logic runs. | Perform persistence. |
| Service layer | Apply business rules and coordinate the use case. | Format HTTP responses. |
| Data access layer | Read and write data through a clear boundary. | Decide user-facing business behavior. |
| Error handling layer | Turn expected failures into safe, clear responses. | Leak stack traces to users. |

---

## Rule versioning

Update this file when a **repeated AI mistake** or a **new coding boundary** appears
(Ch. 30 §30.3). Every update needs a reason and an example.

| Version | Date | Change | Reason | Example that triggered it |
|---|---|---|---|---|
| AGENT v1.0 | 2026-08-08 | Initial rules. | Project start. | — |

---

> Blueprint: blueprints/06-agent/01-instructions/agent-rules-and-coding-standards.md
