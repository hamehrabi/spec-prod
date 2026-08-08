# 04-src/ — Application Code

> Source: Ch. 4 §4.3 (`/src` stores the application code) + Ch. 12 §12.4 (file map).

This folder is where Pantry's application **source** will live. Right now this workspace
holds only the **specification** — **no code exists yet**. The AI coding agent writes code
here one thin vertical slice at a time.

- **Build order:** follow [`../02-tasks/`](../02-tasks/) (TASK-001 → TASK-006).
- **Rules for the agent:** read [`../06-agent/AGENT.md`](../06-agent/AGENT.md) before writing any code.

The layout below mirrors the file map given to the agent so it does not create duplicate
folders, place code in the wrong layer, or ignore the structure. Adapt it to the chosen
stack (Q-018), then **update the file map in
[`../06-agent/02-context/context-pack.md`](../06-agent/02-context/context-pack.md)** so the agent sees the real structure.

```
04-src/
  pages/          # screen-level frontend pages
  components/     # reusable interface pieces
  api/            # API route handlers or client calls
  services/       # business logic (Recipes, Planning, ShoppingList, Account/Auth modules)
  data/           # data access and schema helpers (relational store, ADR-002)
```

---

## Layer responsibilities (Ch. 8 §8.4, Ch. 20 §20.3)

| Folder | Owns | Must **not** do |
|---|---|---|
| `pages/`, `components/` | Screens, forms, display states, user actions. | Contain database queries or hidden business rules. |
| `api/` | Routes, request validation, response formatting. | Hide complex domain logic in route handlers. |
| `services/` | Business rules and core decisions (BR-001…004). | Depend directly on screen layout or format HTTP responses. |
| `data/` | Database access, queries, persistence. | Decide user-facing business behavior. |

> **Architecture rule:** a boundary is useful only when you can tell whether a piece of
> code belongs inside or outside it. Module boundaries follow ADR-001 (modular monolith).

---

## Rules for code in this folder

- Every module traces back to a requirement → [`../01-docs/08-traceability/traceability.md`](../01-docs/08-traceability/traceability.md)
- Validation runs **before** business logic.
- Secrets come from the environment, never from source.
- Error messages are safe for users; details go to logs.
- Behavior changes ship with tests in [`../03-tests/`](../03-tests/).

> Blueprint: blueprints/04-src/README.md
