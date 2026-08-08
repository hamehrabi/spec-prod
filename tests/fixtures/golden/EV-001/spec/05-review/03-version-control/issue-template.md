# Issue / Work Request Template

> Source: Ch. 15 §15.5.
> In spec-driven AI engineering, an issue must not be vague. It points to the requirement,
> the expected behavior, the files likely involved, and the acceptance criteria.

Use this inside a local document, a tracker, or a GitHub issue.

---

```
Issue Title:    [short behavior summary]
Requirement ID: REQ-###
Spec Source:    01-docs/04-technical-spec/technical-spec.md, [section]
Goal:           [one sentence: what should be true after this is done]

Acceptance Criteria:
- 
- 
- 
- 

Files likely affected:
- 
- 
- 

Out of scope:
- 

Tests required:
- TEST-###

Priority: P0 / P1 / P2 / P3
Owner:
```

---

## Issue quality check

- [ ] Points to a requirement ID that exists.
- [ ] Acceptance criteria are testable, not aspirational.
- [ ] Likely files are named (so unrelated changes are visible in the diff).
- [ ] Out-of-scope items are stated.
- [ ] Tests are identified before implementation.

> Blueprint: blueprints/05-review/03-version-control/issue-template.md
