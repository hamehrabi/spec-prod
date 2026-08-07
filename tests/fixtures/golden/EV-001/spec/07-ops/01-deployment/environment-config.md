# Environment Configuration

> Source: Ch. 23 §23.3 + Ch. 21 §21.6.
> Configuration = the values that change between environments **without changing the code**.
> Good configuration management prevents the most common AI-generated-code mistake:
> environment-specific values placed directly inside source files.

---

## Configuration table

| Config key | Purpose | Example value | Required in | Security note |
|---|---|---|---|---|
| `APP_ENV` | Identifies the current environment. | `local` / `test` / `production` | all | Not secret. |
| `APP_PORT` | Port the app listens on. | `3000` | all | Not secret. |
| `APP_BASE_URL` | Public base URL. | `https://…` | test, production | Not secret. |
| `DATABASE_URL` | Connects the app to its database (Postgres). | connection string | test, production | **Secret** in production. |
| `SQLITE_PATH` | Local SQLite file path. | `./pantry.sqlite` | local | Not secret. |
| `PHOTO_STORAGE_DIR` | Where private dish photos are stored. | `./uploads` or a bucket | all | Not secret (contents are private). |
| `SESSION_SECRET` | Auth secret — depends on the chosen auth model (Q-006). | long random value | all | **Secret** — never logged. |
| `LOG_LEVEL` | Controls logging detail. | `info` / `warn` / `error` | all | Avoid `debug` in production. |

Every key here must also exist in [`../.env.example`](../../.) as a placeholder. No external
service keys appear — Pantry depends on no external services in v1 (Q-007).

---

## Values by environment

> [TODO: which environments will exist? — Q-017]. Shown for the standard three.

| Key | Local | Test | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `test` | `production` |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| Store | SQLite file | test store | **managed / chosen at deploy (Q-012)** |
| `SESSION_SECRET` | dev value | test value | **managed secret** |

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
| `SESSION_SECRET` | environment | Developer | — | source, logs, error messages, client responses |
| `DATABASE_URL` | environment | Developer | — | source, logs, screenshots |

---

## Pre-deploy configuration check

- [ ] Every key in `.env.example` has a real value set in the target environment.
- [ ] No secret is present in the repository history.
- [ ] `LOG_LEVEL` is not `debug` in production.
- [ ] Timeouts and retry limits are set (not defaulting to "forever").
- [ ] The store and photo-storage location are set for this environment.

---

> Blueprint: blueprints/07-ops/01-deployment/environment-config.md
