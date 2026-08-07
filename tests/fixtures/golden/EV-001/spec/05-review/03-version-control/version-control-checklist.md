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
feature/REQ-F-002-save-recipe
fix/REQ-F-005-list-combine-rule
chore/TASK-001-project-structure
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
| `update recipe` | `feat(recipes): add save-recipe validation for REQ-F-002` |
| `fix bug` | `fix(api): reject a recipe with no ingredient line for BR-002` |
| `tests` | `test(list): add combine-rule tests for REQ-F-005` |
| `changes` | `docs(spec): record the ingredient combine rule after review` |

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
git add spec/ .gitignore
git commit -m "chore(project): create initial spec-driven workspace"
```

The first commit should not contain random code. It creates a clean baseline you can
return to before the AI agent starts changing files.

---

## Alternative tracking methods (Ch. 4 §4.8)

| Method | Best for | How to use it |
|---|---|---|
| Simple change log | If you are not ready for Git. | Write dated entries in `05-review/change-log.md`. |
| Local Git | Version history without publishing online. | Commit after meaningful spec, task, test, or code changes. |
| Manual snapshots | A simple backup method. | Copy the project folder before major changes and label it clearly. |

---

> Blueprint: blueprints/05-review/03-version-control/version-control-checklist.md
