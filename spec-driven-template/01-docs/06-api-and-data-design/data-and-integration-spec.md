# Data, API, and Integration Specification

> Source: Ch. 9 §9.7–9.9 — "Technical Specification Template: Data, API, and Integration".
> Use this when a feature crosses the boundary into an external service.

**Feature name:**
**Requirement:** REQ-###

---

## 1. Entities

- **[Entity name]** — [purpose]
  - Key fields:
  - Relationships:

## 2. Database rules

- Primary keys:
- Foreign keys:
- Unique constraints:
- Required indexes:
- Deletion behavior:

## 3. API endpoints

- Method and path:
- Purpose:
- Permission:
- Request body:
- Success response:
- Error responses:

## 4. Validation rules

- Required fields:
- Allowed values:
- Relationship checks:
- Permission checks:

## 5. Integration rules

An integration connects your system to something outside it: payments, email, calendars,
identity providers, storage, analytics, AI model APIs. Outside services fail, change,
rate-limit, and return the unexpected — specify that **before** implementation.

| Item | Definition |
|---|---|
| Provider | *The external service being used.* |
| Purpose | *Why the system needs the service.* |
| Data sent | *The exact fields sent out of your system.* |
| Data received | *The exact fields returned to your system.* |
| Data stored | *What of that is persisted, and where.* |
| Timeout | *Maximum wait before giving up.* |
| Retry rule | *How many times, with what delay, and for which error classes only.* |
| Idempotency | *Is this operation safe to retry without duplicate effects?* |
| Failure behavior | *Retry / show message / log error / queue for later / mark pending.* |
| Security rule | *How secrets, tokens, and sensitive data are protected.* |
| Rate limits | *Known provider limits and how we stay inside them.* |

> **Security reminder (Ch. 9 §9.7):** never design an integration that exposes secrets to
> the frontend or stores tokens in plain text.

## 6. Versioning rules

- Current version:
- Breaking-change policy:
- Compatibility notes:

---

## Integration checklist

- [ ] Provider, purpose, and data flow are documented in both directions.
- [ ] Timeout is set — the system never waits forever.
- [ ] Retries are bounded and only applied to safe (idempotent) operations.
- [ ] Failure behavior is defined, including what the user sees.
- [ ] Secrets are configured through the environment, never hardcoded.
- [ ] Failure paths have tests (`../tests/edge-cases-and-failures.md`).
- [ ] Monitoring covers this integration (`../ops/monitoring-plan.md`).

---

# WORKED EXAMPLE (Ch. 22 §22.5)

```
Reliability rule example — external email service
- Timeout: stop waiting after 5 seconds.
- Retry: retry up to 2 times for temporary network errors.
- Do not retry: invalid email address or rejected permission.
- If retries fail: mark the email as pending_review.
- Log: EMAIL_SEND_FAILED with request_id, user_id, and safe error_code.
- User message: "Your action was saved, but the email could not be sent yet."
```
