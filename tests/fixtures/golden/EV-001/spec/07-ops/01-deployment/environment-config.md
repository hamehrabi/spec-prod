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
| `DATABASE_PATH` | Path to the SQLite database file (ADR-002). | `./data/pantry.db` | all | Not secret — but the file it names holds the recipe library. |
| `PHOTO_STORAGE_PATH` | Directory for private dish photos (Round 6). | `./data/photos` | all | Not secret — the directory's contents are private. |
| `LOG_LEVEL` | Controls logging detail. | `info` / `warn` / `error` | all | Avoid `debug` in production. |

The authentication secret joins this table when Q-009 chooses the model — it will be a
**secret**, configured in the environment, never printed. No external-service key exists:
version one has no external services (Round 6), so there is no `EMAIL_API_KEY`, no
external timeout, and no retry knob to configure.

Every key here must also exist in [`../.env.example`](../../.) as a placeholder — and does.

---

## Values by environment

| Key | Local | Test | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `test` | `production` |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| `DATABASE_PATH` | `./data/pantry.db` | a disposable test file | the production path — location follows Q-018 |
| `PHOTO_STORAGE_PATH` | `./data/photos` | a disposable test directory | follows Q-018 |

The Test column applies only if a test environment exists — Q-019 is open.

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
| The Q-009 authentication secret (name decided with the model) | environment | The developer | — | source, logs, error messages, client responses |

---

## Pre-deploy configuration check

- [ ] Every key in `.env.example` has a real value set in the target environment.
- [ ] No secret is present in the repository history.
- [ ] `LOG_LEVEL` is not `debug` in production.
- [ ] Timeouts and retry limits are set (not defaulting to "forever") — the 10 s request cap from reliability §4.
- [ ] Feature flags are set intentionally for this release — none exist in version one.

> Blueprint: blueprints/07-ops/01-deployment/environment-config.md
