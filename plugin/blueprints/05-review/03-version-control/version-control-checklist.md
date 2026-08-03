# Version Control / GitHub Workflow Checklist

> Source: Appendix L + Ch. 15.
> GitHub-**compatible**, not GitHub-**dependent**. Use the same flow with any platform, a
> local Git repository, or a structured review folder. The habit is *controlled change*,
> not a specific website.

---

## Why AI coding needs version control discipline (Ch. 15 §15.1)

| AI coding risk | Version control response |
|---|---|
| The agent changes more files than expected | Review the diff before accepting the change. |
| The agent mixes multiple features together | Use one branch or change set per task. |
| The agent removes working behavior | Compare against the previous commit and restore safely. |
| The agent fixes a bug but breaks a requirement | Run tests and check the requirement ID before merging. |
| You forget why a file changed | Use clear commit messages linked to specs and tasks. |

> **Working rule:** do not let the agent make a large uncontrolled change and then ask you
> to trust it. Let the agent work in small steps. Review each step. Commit only the work
> you understand.

---

## Before work starts

- [ ] Requirement ID and task ID are known.
- [ ] The branch or working copy has a clear purpose.
- [ ] The agent has the current context pack.
- [ ] Acceptance criteria and tests are listed.
- [ ] Out-of-scope files and behaviors are named.

**Branch naming**
```
feature/REQ-AUTH-006-login-lockout
fix/REQ-TASK-004-due-date-validation
chore/TASK-012-config-cleanup
```

## During work

- [ ] Changes are small enough to review.
- [ ] Commit or change notes explain **why** the change exists.
- [ ] Tests are added or updated **with** the code.
- [ ] No unrelated formatting or dependency changes are mixed in.
- [ ] Secrets and credentials are not committed.

**Commit message format (Ch. 15 §15.3)**
```
type(scope): action linked to requirement ID
```

| Weak commit message | Better commit message |
|---|---|
| `update login` | `feat(auth): add login validation for REQ-AUTH-002` |
| `fix bug` | `fix(api): reject missing project name for REQ-PROJ-003` |
| `tests` | `test(tasks): add due-date validation tests for REQ-TASK-004` |
| `changes` | `docs(spec): update task status rules after review` |

| Change type | Suggested message |
|---|---|
| New intent document | `docs(intent): add engineering intent for [project]` |
| Updated requirements | `docs(spec): refine task creation requirements and acceptance criteria` |
| New task file | `docs(tasks): add TASK-001 for task creation API` |
| Test plan added | `test(tasks): add acceptance and failure tests for task creation` |
| Implementation completed | `feat(tasks): implement TASK-001 task creation workflow` |
| Review notes added | `docs(review): record review results for TASK-001` |

## Pull request / review package

- [ ] Summary explains the requirement and behavior changed.
- [ ] Linked issue/task references the requirement ID.
- [ ] Test results are included.
- [ ] Security and data changes are called out clearly.
- [ ] Reviewer can see files changed, risks, assumptions, and rollback notes.

## Merge

- [ ] All checks pass — do not merge failing checks.
- [ ] Reviewer approval recorded.
- [ ] Traceability matrix updated.
- [ ] Specs updated if behavior changed.

---

## Review order before merging (Ch. 15 §15.7)

1. Read the requirement and acceptance criteria again.
2. Check the list of changed files **before** reading the code.
3. Inspect the diff for unexpected deletions or unrelated edits.
4. Run or review the tests connected to the requirement.
5. Check error handling, validation, and security-sensitive paths.
6. Update the traceability matrix and specs if a documented decision changed.
7. Commit or merge only after you understand the change.

---

## Baseline repository setup (Ch. 15 §15.2)

Track more than code — track the documents that explain why the code exists.

```
git init
git status
git add 01-intent 02-specs 03-tasks 04-tests 05-reviews 06-release agent src tests ops README.md .gitignore
git commit -m "chore(project): create initial spec-driven workspace"
```

The first commit should not contain random code. It creates a clean baseline you can
return to before the AI agent starts changing files.

**Branch workflow**
```
git checkout main
git pull                      # if you use a remote repository
git checkout -b feature/REQ-AUTH-006-login-lockout

# Let the agent work on one task.
# Review the files.
# Run the tests.

git status
git diff
git add src tests 02-specs
git commit -m "feat(auth): add login lockout for REQ-AUTH-006"
```

If you are not using a remote repository, use branches locally. The important habit is
**isolation, review, and traceability** — not the hosting platform.

---

## Alternative tracking methods (Ch. 4 §4.8)

| Method | Best for | How to use it |
|---|---|---|
| Simple change log | If you are not ready for Git. | Write dated entries in `05-review/change-log.md`. |
| Local Git | Version history without publishing online. | Commit after meaningful spec, task, test, or code changes. |
| Manual snapshots | A simple backup method. | Copy the project folder before major changes and label it clearly. |

---

# WORKED EXAMPLE — ProjectBoard, REQ-AUTH-006 login lockout

## Before work started

- [x] Requirement ID and task ID known — REQ-AUTH-006 / TASK-016
- [x] Branch purpose clear — `feature/REQ-AUTH-006-login-lockout`
- [x] Agent has the current context pack
- [x] Acceptance criteria and tests listed — TEST-AUTH-010…013
- [x] Out-of-scope files named — registration, password reset, roles, schema

## The session

```
git checkout main
git pull
git checkout -b feature/REQ-AUTH-006-login-lockout

# agent works on TASK-016 only
git status
git diff                     # <- read this BEFORE reading the code

git add src/03-api/auth tests/05-executable/integration docs/08-traceability
git commit -m "feat(auth): add failed-login lockout for REQ-AUTH-006"
git commit -m "test(auth): add lockout and reset tests for REQ-AUTH-006"
git commit -m "docs(spec): record lockout window and reset rule for REQ-AUTH-006"
```

## Commit messages, before and after

| What the agent first proposed | What was committed |
|---|---|
| `update login` | `feat(auth): add failed-login lockout for REQ-AUTH-006` |
| `fix stuff` | `fix(api): return 401 for invalid credentials for REQ-AUTH-002` |
| `tests` | `test(auth): add lockout and reset tests for REQ-AUTH-006` |
| `changes` | `docs(spec): record lockout window and reset rule for REQ-AUTH-006` |

## What the diff review caught

```
$ git diff --stat
 src/03-api/auth/login.py                    | 34 ++++++++++--
 src/04-services/auth/lockout.py             | 41 +++++++++++++++
 src/05-data/users_repo.py                   |  9 ++++      <-- NOT in the task plan
 tests/05-executable/integration/...         | 78 +++++++++++++++++++++++
 docs/08-traceability/traceability.md        |  2 +-
```

`users_repo.py` was outside the declared scope. The agent had added a
`count_failed_attempts()` helper there instead of in the auth service. It was reverted and
the counter moved into `04-services/auth/lockout.py`, where ADR-001 says it belongs.

## Merge gate

- [x] Summary explains the requirement and behavior changed
- [x] Linked task references REQ-AUTH-006
- [x] Test results included (4 new tests, all passing)
- [x] Security change called out — lockout affects account access
- [x] Reviewer can see files changed, risks, assumptions, rollback notes
- [x] Traceability matrix updated
- [x] All checks pass — **merged**

> **The habit, not the platform.** This project used a local repository with no remote for
> the first three weeks. Branch isolation, a readable diff, and a commit message tied to a
> requirement ID delivered every benefit that mattered.
