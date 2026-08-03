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
| `DATABASE_URL` | Connects the app to its database. | connection string | all | **Secret** in production. |
| `JWT_SIGNING_KEY` | Signs authentication tokens. | long random value | all | **Secret** — must never be printed in logs. |
| `SESSION_TIMEOUT_MINUTES` | Session inactivity limit. | `30` | all | Not secret. |
| `LOG_LEVEL` | Controls logging detail. | `info` / `warn` / `error` | all | Avoid `debug` in production. |
| `EMAIL_API_KEY` | External email provider. | provider key | test, production | **Secret**. |
| `EXTERNAL_CALL_TIMEOUT_SECONDS` | Max wait for external calls. | `5` | all | Not secret. |
| `EXTERNAL_CALL_MAX_RETRIES` | Bounded retry count. | `2` | all | Not secret. |
| `FEATURE_*` | Feature flags. | `false` | all | Not secret. |

*Replace with your project's real values. Every key here must also exist in
[`../.env.example`](../../.) as a placeholder.*

---

## Values by environment

| Key | Local | Test | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `test` | `production` |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| `DATABASE_URL` | local db | test db | **managed secret** |
| `JWT_SIGNING_KEY` | dev value | test value | **managed secret** |

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
| `JWT_SIGNING_KEY` | environment | | | source, logs, error messages, client responses |
| `DATABASE_URL` | environment | | | source, logs, screenshots |
| `EMAIL_API_KEY` | environment | | | source, logs, examples |

---

## Pre-deploy configuration check

- [ ] Every key in `.env.example` has a real value set in the target environment.
- [ ] No secret is present in the repository history.
- [ ] `LOG_LEVEL` is not `debug` in production.
- [ ] Timeouts and retry limits are set (not defaulting to "forever").
- [ ] Feature flags are set intentionally for this release.

---

# WORKED EXAMPLE — ProjectBoard

## Configuration table as shipped

| Config key | Purpose | Example value | Required in | Security note |
|---|---|---|---|---|
| `APP_ENV` | Identifies the environment. | `production` | all | Not secret. |
| `APP_PORT` | Listening port. | `3000` | all | Not secret. |
| `APP_BASE_URL` | Public base URL (used in invite links). | `https://projectboard.example` | test, prod | Not secret. |
| `DATABASE_URL` | Database connection. | `postgres://…` | all | **Secret** in production. |
| `JWT_SIGNING_KEY` | Signs session tokens. | 64-char random | all | **Secret** — never logged. |
| `SESSION_TIMEOUT_MINUTES` | Idle expiry — implements SEC-A-002. | `30` | all | Not secret. |
| `LOGIN_MAX_ATTEMPTS` | Lockout threshold — REQ-AUTH-006. | `5` | all | Not secret. |
| `LOGIN_LOCKOUT_MINUTES` | Lockout window — REQ-AUTH-006. | `10` | all | Not secret. |
| `LOG_LEVEL` | Logging detail. | `info` | all | `debug` logs request bodies. |
| `EXPORT_MAX_ROWS` | CSV guard. | `50000` | all | Not secret. |
| `EMAIL_API_KEY` | Invite email provider. | provider key | test, prod | **Secret**. |

## Values by environment

| Key | Local | Test | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `test` | `production` |
| `LOG_LEVEL` | `debug` | `info` | `info` |
| `SESSION_TIMEOUT_MINUTES` | `480` | `30` | `30` |
| `DATABASE_URL` | local SQLite | test Postgres | **managed secret** |
| `JWT_SIGNING_KEY` | dev value | test value | **managed secret** |
| `EXPORT_MAX_ROWS` | `100` | `50000` | `50000` |

## Secret inventory

| Secret | Where configured | Rotation owner | Last rotated | Must never appear in |
|---|---|---|---|---|
| `JWT_SIGNING_KEY` | environment | Tech lead | 2026-03-11 | source, logs, error messages, client responses |
| `DATABASE_URL` | environment | Tech lead | 2026-03-11 | source, logs, screenshots |
| `EMAIL_API_KEY` | environment | Developer | 2026-04-02 | source, logs, examples |

## Pre-deploy check — v1.0.0

- [x] Every key in `.env.example` has a real value in production.
- [x] No secret is present in repository history *(see incident below)*.
- [x] `LOG_LEVEL` is not `debug` in production.
- [x] Timeouts and retry limits are set.
- [x] Feature flags set intentionally.

## The incident this table exists because of

> On 2026-03-10 the first commit included a `.env` file with a development
> `JWT_SIGNING_KEY`. It was a throwaway value, but it was in git history. The key was
> rotated anyway, `.env` was added to `.gitignore`, and `SESSION_TIMEOUT_MINUTES` was
> discovered to be **undefined in production** during the same audit — the app was
> defaulting to "never expire". That is how SEC-A-002 came to be written.
