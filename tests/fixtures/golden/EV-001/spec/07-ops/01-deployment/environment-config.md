# Environment Configuration

> Source: Ch. 23 §23.3 + Ch. 21 §21.6.
> Configuration = the values that change between environments **without changing the code**.
> Good configuration management prevents the most common AI-generated-code mistake:
> environment-specific values placed directly inside source files.

---

## Configuration table

Every key here must also exist in [`../.env.example`](../../.) as a placeholder. Pantry's
`.env.example` defines exactly three keys.

| Config key | Purpose | Example value | Required in | Security note |
|---|---|---|---|---|
| `APP_ENV` | Identifies the current environment. | `local` / `production` | all | Not secret. |
| `DATABASE_URL` | Connects the app to its relational store. | `sqlite:///pantry.db` now; `postgres://…` later (ADR-002) | all | **Secret** in production (once it carries credentials). |
| `APP_SECRET` | Signs the session. | long random value | all | **Secret** — must never be printed in logs. |

*A test environment between local and production is undecided (Q-015), so "Required in"
lists the known environments only.*

---

## Values by environment

| Key | Local | Test | Production |
|---|---|---|---|
| `APP_ENV` | `local` | [TODO: test env undecided (Q-015)] | `production` |
| `DATABASE_URL` | local SQLite file | [TODO: test env undecided (Q-015)] | **managed secret** — Postgres URL (ADR-002) |
| `APP_SECRET` | dev value | [TODO: test env undecided (Q-015)] | **managed secret** — mechanism set with deployment target (Q-017) |

---

## Rules

- **Never hardcode** an environment-specific value in source (Ch. 23 §23.3).
- **Never commit** real secrets — placeholders only in documentation (Ch. 21 §21.6).
- Missing or invalid configuration must **block deployment**, not fail silently at runtime
  (Ch. 28 §28.12).
- A secret that appears in a log is an incident: purge it, rotate the value, and fix the
  log call.
- Every config key is documented here **before** the code reads it.

---

## Secret inventory

| Secret | Where configured | Rotation owner | Last rotated | Must never appear in |
|---|---|---|---|---|
| `APP_SECRET` | environment (secret mechanism set with deployment target — Q-017; signing scheme depends on Q-009) | the owner/developer | Set at the first production deploy | source, logs, error messages, client responses |
| `DATABASE_URL` | environment (managed secret once it points at Postgres) | the owner/developer | Set at the first production deploy | source, logs, screenshots |

---

## Pre-deploy configuration check

- [ ] Every key in `.env.example` has a real value set in the target environment.
- [ ] No secret is present in the repository history.
- [ ] `APP_ENV` is `production` in production.
- [ ] `APP_SECRET` and `DATABASE_URL` come from the environment, not source.
- [ ] Private recipe photos (Q-008) are served only to the signed-in owner.

---

> Blueprint: blueprints/07-ops/01-deployment/environment-config.md
