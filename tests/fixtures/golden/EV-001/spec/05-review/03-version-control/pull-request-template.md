# Pull Request / Review Package Template

> Source: Ch. 15 §15.6, Ch. 28 §28.10, Appendix L.
> A pull request is a **review packet** — code changes, test evidence, requirement links,
> and review notes collected before work is merged. Treat it as your final safety gate,
> not a formality.

> **If a pull request cannot explain what changed and why, it is not ready to merge.**

---

## Template

```
Title: [REQ-ID] Short behavior summary

Requirement Link:
- REQ-###: [requirement summary]

Related Task:
- TASK-###

What Changed:
- 
- 
- 

How I Tested It:
- 
- 
- 

Files Changed:
- 
- 

Tests Added / Updated:
- TEST-###

Security Notes:
- [auth, authorization, validation, secrets, data exposure]

Database or API Changes:
- [schema changes, contract changes, breaking vs. non-breaking]

Rollback Notes:
- [how to return to the previous stable state]

Assumptions Made:
- 

Open Questions:
- 

Reviewer checklist:
[ ] Requirement is satisfied
[ ] Tests prove the behavior
[ ] Security boundary is preserved
[ ] Only approved files changed
[ ] Spec and traceability matrix are updated
```

---

## Workflow steps (Ch. 28 §28.10)

| Step | Purpose | Required evidence | AI-agent rule |
|---|---|---|---|
| Create branch | Separate one change from the main working version. | Branch name includes task ID. | Agent works on one task only. |
| Commit small changes | Make progress reviewable. | Commit message names requirement and task. | No large mystery commits. |
| Open review request | Explain what changed and why. | Summary, tests, screenshots if useful. | AI output must be reviewed by a human. |
| Run checks | Prove the change is safe. | Tests, linting, security review, smoke check. | Do not merge failing checks. |
| Merge after approval | Move verified change into the main line. | Reviewer approval and updated traceability. | Update specs if behavior changed. |

> Blueprint: blueprints/05-review/03-version-control/pull-request-template.md
