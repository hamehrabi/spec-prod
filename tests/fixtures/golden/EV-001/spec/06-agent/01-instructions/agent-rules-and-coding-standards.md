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
| Naming | Clear names such as `saveRecipe`, `generateShoppingList`, `validateIngredientLines`. |
| Functions | Prefer small functions that do one job — if it validates **and** persists, split it. |
| Validation | Validate at the API boundary, before business logic, before any write (technical-spec §6). |
| Errors | Return safe user-facing messages; scope every error to what SEC rules allow (security-specification §6). |
| Tests | Add or update tests for every behavior change, named for their test IDs. |
| Structure | Handler → service → data (ADR-001); shopping-list generation lives in its own domain service; business logic never in route handlers or UI components. |
| Logging | Include a request ID; never log secrets, credentials, or photo storage paths. What must never be logged beyond that is open — Q-012. |
| Comments | Explain *why*, not *what*. |
| Transactions | Every multi-row write is one transaction; carry a `version` field for optimistic concurrency (ADR-002, reliability §A2). |

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
| AGENT v1.0 | 2026-08-08 | Initial rules. | — | — |

> Blueprint: blueprints/06-agent/01-instructions/agent-rules-and-coding-standards.md
