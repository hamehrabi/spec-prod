# Team Workflow Pack

> Source: Ch. 29 §29.8.
> A repeatable way for product managers, developers, reviewers, and AI agents to move from
> product idea to reviewed output **without losing the source of truth**.

---

## Pack

```
Project:
Current release goal:
Source-of-truth location:
Decision owner:
Product owner:
Engineering owner:
Reviewer(s):
AI agent role:

Current requirements:
Current technical spec:
Active tasks:
Test plan:
Open questions:
Scope changes:
Feedback items:

Next review date:
Definition of done:
```

---

## The eight-step workflow (Ch. 29 §29.8)

| Step | Owner | Input | Output | Quality gate |
|---|---|---|---|---|
| 1. Clarify product intent | Product manager | Idea, user problem, stakeholder input. | Problem statement, users, success measure. | Non-goals and risks are stated. |
| 2. Write requirements | Product + engineering | Product intent and constraints. | Requirements with acceptance criteria. | Each requirement is testable. |
| 3. Prepare engineering plan | Developers | Requirements and product spec. | Technical spec, tasks, tests, architecture decisions. | Design matches scope and constraints. |
| 4. Create agent context pack | Developer | Relevant specs and task boundary. | Bounded AI task brief. | Agent has enough context and clear limits. |
| 5. Generate and review output | Agent + team | Task brief and source artifacts. | Draft code, tests, docs, or analysis. | Output passes the review checklist. |
| 6. Capture feedback | Team | Review notes, user input, test results. | Feedback register and decisions. | Every item has an owner and status. |
| 7. Update specs | Assigned owner | Accepted feedback and decisions. | Updated requirements, tasks, tests, traceability. | Source of truth reflects reality. |
| 8. Release or iterate | Team lead | Reviewed output and updated specs. | Accepted change or next task cycle. | No unresolved high-risk gaps remain. |

---

## Alignment rhythm (Ch. 29 §29.7)

Alignment is not a one-time meeting. It is a rhythm.

| Practice | When to use it | What to check | Output |
|---|---|---|---|
| Spec review session | Before implementation, or after major changes. | Requirements, non-goals, risks, open questions. | Approved spec or action list. |
| Task kickoff | Before assigning work to a developer or agent. | Task boundary, context, tests, review rule. | Clear task brief. |
| Mid-work checkpoint | When ambiguity appears. | Assumptions, blockers, design choices. | Decision or revised task. |
| Review meeting | After a meaningful AI-generated change. | Requirements, architecture, tests, security. | Accept, revise, or reject. |
| Spec update review | After feedback or release learning. | Changed behavior, tests, docs, traceability. | Updated source of truth. |

### Weekly alignment questions (Ch. 29 §29.7)

1. What requirement changed this week?
2. What decision did we make that must be recorded?
3. Which AI outputs were accepted, revised, or rejected?
4. Which tests were added because of feedback?
5. Which task is too vague for an AI agent to execute safely?
6. What is now out of scope?
7. What must be updated before the next implementation cycle?

---

## Team workflow checklist (Ch. 29)

| Area | Checklist item | Status |
|---|---|---|
| Shared source | The team agrees where requirements, specs, tasks, tests, decisions, and feedback live. | [ ] |
| Product handoff | Each feature has a problem statement, users, acceptance criteria, risks, and non-goals. | [ ] |
| Engineering handoff | Developers convert product intent into technical design, tasks, and tests. | [ ] |
| Agent handoff | Each AI-agent task includes scope, context, constraints, expected output, and review rules. | [ ] |
| Review | AI output is reviewed against requirements, architecture, security, tests, and maintainability. | [ ] |
| Feedback | Feedback items have affected artifacts, owners, decisions, and status. | [ ] |
| Scope change | Accepted changes update requirements, design, tests, tasks, and traceability. | [ ] |
| Alignment rhythm | The team has regular reviews for open questions, decisions, drift, and next tasks. | [ ] |

---

> Blueprint: blueprints/06-agent/04-handoffs/team-workflow-pack.md
