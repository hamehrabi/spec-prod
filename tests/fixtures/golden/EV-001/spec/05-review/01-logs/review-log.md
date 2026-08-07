# Review Log

> Source: Ch. 4 §4.3 — `/review` folder: "Stores review notes and decision records."
> A running record of what was **accepted, rejected, or changed**, and why.

---

| Date | Item reviewed | Task / Req | Reviewer | Layers checked | Findings | Decision | Follow-up |
|---|---|---|---|---|---|---|---|

No reviews recorded yet — no code has been produced.

**Decision values:** Accept · Accept with follow-up · Revise · Reject · Block

---

## Entry template

```
Date:
Item reviewed:        [task output, PR, generated tests, spec draft]
Requirement / Task:   REQ-### / TASK-###
Reviewer:

Layers checked:
[ ] Requirement fit   [ ] Architecture fit   [ ] Security & validation
[ ] Performance       [ ] Test evidence      [ ] Change scope
[ ] Maintainability

Findings:
1. [severity] [layer] — [finding] → [action]

Accepted because / Rejected because:

Decision:             Accept / Accept with follow-up / Revise / Reject / Block
Follow-up tasks:      TASK-###
Spec updates needed:  Yes / No → CHG-###
```

---

## Team review layers (Ch. 29 §29.4)

| Review layer | Main question | Evidence needed | Who helps | Decision |
|---|---|---|---|---|
| Requirement fit | Does this solve the user need? | Requirement ID and acceptance criteria. | Product owner, developer. | Accept / revise. |
| Architecture fit | Does this follow the agreed design? | Technical spec, ADRs, module boundaries. | Developer. | Accept / refactor. |
| Security and privacy | Does this expose data or weaken controls? | Security checklist, permission tests. | Developer. | **Block if unsafe.** |
| Test evidence | Do tests prove expected behavior and failure paths? | Unit, integration, UI, edge-case tests. | Developer. | Accept / add tests. |
| Maintainability | Can the next developer understand this? | Clear naming, useful comments, updated specs. | Developer. | Accept / simplify. |

> Review should not ask only "does this look good?" It asks whether the output satisfies
> requirements, respects architecture, passes tests, protects users, and keeps future
> maintenance clear.

---

> Blueprint: blueprints/05-review/01-logs/review-log.md
