# 04-src/ — Application Code

> Source: Ch. 4 §4.3 (`/src` stores the application code) + Ch. 12 §12.4 (file map).

The layout below mirrors the file map the book gives an AI agent so it does not create
duplicate folders, place code in the wrong layer, or ignore the structure you already
chose. Adapt it to your stack, then **update the file map in
[`../agent/context-pack.md`](../06-agent/02-context/context-pack.md)** so the agent sees the real
structure.

```
04-src/
  pages/          # screen-level frontend pages
  components/     # reusable interface pieces
  api/            # API route handlers or client calls
  services/       # business logic
  data/           # data access and schema helpers
```

For Pantry the modules inside those layers follow ADR-001: recipes, plans, lists,
accounts — with shopping-list generation in its own domain service (`services/`), never
in a route handler.

---

## Layer responsibilities (Ch. 8 §8.4, Ch. 20 §20.3)

| Folder | Owns | Must **not** do |
|---|---|---|
| `pages/`, `components/` | Screens, forms, display states, user actions. | Contain database queries or hidden business rules. |
| `api/` | Routes, request validation, response formatting. | Hide complex domain logic in route handlers. |
| `services/` | Business rules and core decisions. | Depend directly on screen layout or format HTTP responses. |
| `data/` | Database access, queries, persistence. | Decide user-facing business behavior. |

> **Architecture rule:** a boundary is useful only when you can tell whether a piece of
> code belongs inside or outside it.

---

## Rules for code in this folder

- Every module traces back to a requirement → [`../docs/traceability.md`](../01-docs/08-traceability/traceability.md)
- Validation runs **before** business logic.
- Secrets come from the environment, never from source.
- Error messages are safe for users; details go to logs.
- Behavior changes ship with tests in [`../tests/`](../03-tests/).

> Blueprint: blueprints/04-src/README.md
