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

# WORKED EXAMPLE — refactoring an AI-built API module (Ch. 20 §20.8)

**Before — AI-built draft.** Compiles, looks clean, and fails review: no title validation,
no membership check, no controlled errors, and request handling / validation / business
rules / persistence all in one place.

```python
@app.post('/projects/{project_id}/tasks')
def create_task(project_id, request):
    user = get_current_user(request)
    data = request.json()
    task = Task(project_id=project_id, title=data.get('title'), status='todo')
    db.session.add(task)
    db.session.commit()
    return {'id': task.id, 'title': task.title, 'status': task.status}
```

**After — safer structure.** Validation has a clear function. Business rules live in a
service function. The endpoint coordinates request and response. Each layer is now a
separate test target.

```python
def validate_task_input(data):
    title = data.get('title', '').strip()
    if not title:
        raise ValidationError('Task title is required.')
    return {'title': title}

def create_task_for_project(project_id, user_id, data):
    if not is_project_member(project_id, user_id):
        raise PermissionError('You cannot add tasks to this project.')
    clean_data = validate_task_input(data)
    task = Task(project_id=project_id, title=clean_data['title'], status='todo')
    db.session.add(task)
    db.session.commit()
    return task

@app.post('/projects/{project_id}/tasks')
def create_task(project_id, request):
    user = get_current_user(request)
    try:
        task = create_task_for_project(project_id, user.id, request.json())
        return {'id': task.id, 'title': task.title, 'status': task.status}
    except ValidationError as error:
        return {'error': str(error)}, 400
    except PermissionError as error:
        return {'error': str(error)}, 403
```

---

## Rules for code in this folder

- Every module traces back to a requirement → [`../docs/traceability.md`](../01-docs/08-traceability/traceability.md)
- Validation runs **before** business logic.
- Secrets come from the environment, never from source.
- Error messages are safe for users; details go to logs.
- Behavior changes ship with tests in [`../tests/`](../03-tests/).
