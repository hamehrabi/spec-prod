# Integration Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.3, Ch. 18 §18.6.
> Integration tests check whether **separate parts of the system work together** — when a
> requirement depends on more than one component: an API endpoint, a database table, and
> an authentication rule.

Creating a task is not just a database operation. The API must accept the request,
validate the fields, check the user, save the task, and return the correct response.
That is integration behavior.

---

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| ITEST-001 | REQ-### | API + database | | | | Planned |
| ITEST-002 | | Auth + API | | | | |

---

## Integration points to cover (Ch. 17 §17.3)

| Integration point | What you should verify |
|---|---|
| API + database | A valid request creates the right record and returns the correct response. |
| Authentication + API | Only an authenticated user can perform the action. |
| Authorization + API | Only a permitted role can perform the action. |
| Validation + response handling | Invalid input returns a clear error **without creating bad data**. |
| Service + external dependency | The system handles dependency success, failure, and timeout cases. |
| Job + queue | A queued job runs, retries, and records its final status. |

---

## API contract tests (Ch. 18 §18.6)

A strong API test does not only ask whether the endpoint responds. It checks the method,
URL, request body, status code, response body, validation rules, **and side effects**.

| Test name | Request input | Expected status | Expected response body | Side effect to verify |
|---|---|---|---|---|
| Valid credentials create session | `{email, correct password}` | 200 | Session token exists | Session record created |
| Wrong password is rejected | `{email, wrong password}` | 401 | Authentication error | No session created |
| Missing email is rejected | `{password only}` | 400 | Email required error | No session created |
| Missing password is rejected | `{email only}` | 400 | Password required error | No session created |
| Unknown email is rejected | `{unknown email, password}` | 401 | Authentication error | No session created |

**What one row becomes (Ch. 18 §18.6).** Specify each row as three assertions and nothing
else: the status code, the field of the response body that carries the answer, and the side
effect that must **not** have happened. "Missing password is rejected" is therefore *400, the
error names the password field, and no session row exists afterwards* — three statements a
test can be written from without a decision being made in the test file. The side-effect
assertion is the one that catches a handler which returns the right status after it has
already written. The worked example at the end of this file shows the pair written out.

---

## Prompt — generate API tests from an endpoint contract (Ch. 18 §18.6)

```
Use the following API contract to generate API test cases. Do not add endpoints or fields
that are not listed.

Endpoint:          [method and path]
Purpose:           [what it does]
Request Body:      [fields and validation rules]
Success Response:  [status code and body]
Error Responses:   [status codes and bodies]
Side Effects:      [database/session/email/etc.]

Return a table with test name, request input, expected status, expected response body, and
side effects to verify.
```

Executable tests live in [`../tests/integration/`](../05-executable/integration).

---

# WORKED EXAMPLE — ProjectBoard

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| TEST-AUTH-002 | REQ-AUTH-001 | Auth + database | Valid credentials | 200 + session token | Session row created | Passing |
| TEST-AUTH-003 | REQ-AUTH-001 | Auth + API | Wrong password | 401 generic error | **No** session row | Passing |
| TEST-006 | REQ-F-001 | API + database | Valid task payload | 201 + task object | Task row with `status='todo'` | Passing |
| TEST-007 | REQ-F-005 | API + database | PATCH status to `done` | 200 | Row updated; `updated_at` changed | Passing |
| TEST-008 | REQ-F-006 | API + database | List tasks in a project | 200 + max 50 items | Only that project's rows | Passing |
| TEST-009 | BR-004 | Service + database | Delete a project with open tasks | 409 conflict | Project and tasks still present | Passing |

## API contract tests — `POST /api/v1/login`

| Test name | Request input | Expected status | Expected response body | Side effect to verify |
|---|---|---|---|---|
| Valid credentials create session | `{email, correct password}` | 200 | Session token present | Session record created |
| Wrong password is rejected | `{email, wrong password}` | 401 | Authentication error | **No** session created |
| Missing email is rejected | `{password only}` | 400 | "Email is required" | No session created |
| Missing password is rejected | `{email only}` | 400 | "Password is required" | No session created |
| Unknown email is rejected | `{unknown email, password}` | 401 | **Same** message as wrong password | No session created |

```python
def test_login_rejects_missing_password(api_client):
    response = api_client.post('/api/v1/login', json={
        'email': 'ada@example.com'
    })

    assert response.status_code == 400
    assert response.json()['error']['message'] == 'Password is required'
    assert response.json().get('session') is None
```

```python
def test_create_task_rejects_non_member(api_client, viewer_token, other_project):
    response = api_client.post(
        f'/api/v1/projects/{other_project.id}/tasks',
        headers={'Authorization': f'Bearer {viewer_token}'},
        json={'title': 'Should never be created'},
    )

    assert response.status_code in (403, 404)
    # the important half: assert the side effect did NOT happen
    assert Task.query.filter_by(project_id=other_project.id).count() == 0
```

> **What the second test protects:** the first version of `create_task` returned 403
> correctly *after* writing the row. The status code alone looked right. Asserting the
> side effect is what caught it.
