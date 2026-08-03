# Team Workflow Pack

> Source: Ch. 29.
> **Deliberately short. There is no team** — one developer directing an AI coding agent
> (CON-008). Most of this blueprint is about alignment between people, and inventing
> ceremonies for a team of one is exactly the paperwork this method exists to avoid.

---

## The eight-step workflow

The loop, whoever is running it:

```
1. Intent        why does this exist, and what is it deliberately not?
2. Requirements  what must be true, with IDs and acceptance criteria
3. Product spec  personas, scope, flows - each with a failure path
4. Technical spec architecture, ADRs, contracts, fitness functions
5. Tasks         bounded work, each with allowed and forbidden files
6. Tests         from acceptance criteria, never from the code
7. Code          one task at a time, inside its boundary
8. Review        against the spec, then update the spec when reality changed
```

**Steps 1–6 are complete.** Step 7 begins at TASK-001.

## The rhythm, for one person and an agent

| When | What | Why it survives having no team |
|---|---|---|
| **Per task** | Prepare → Implement → Report. The agent restates and **waits** | This is the alignment step. With no colleague to check scope, the restatement *is* the check |
| **Per merge** | The gate: 14 fitness functions, six test levels | Automated, so it does not depend on remembering |
| **Per release** | Human eval sample · spec drift checklist · readiness checklist | The three things no automation can do |
| **Quarterly** | Open questions · risk register trends · restore test | Slow-moving things that otherwise never get looked at |

**No standups, no planning ceremonies, no review rota.** They coordinate people, and there is
one.

## What is lost by being one person, and what substitutes

Naming it beats pretending the process covers it.

| Lost | Substitute | Honest gap |
|---|---|---|
| A second reviewer | Layers 1 and 4 can be run by a **different session** with no memory of writing the code | Not independence. Better than self-review |
| Independent risk scoring | — | **RISK-004 was found this way** — but a solo grid structurally cannot produce a single-observer finding. One hour of a second person is the cheapest fix in the project |
| Someone who can perform a restore | — | RISK-012, accepted. The specs outlive the person; the credentials may not |
| Disagreement about scope | `scope-change-log.md` — writing it down forces the argument you would have had | Weaker, and it is why the log records **rejected** changes |

## If a second person ever joins

The first four things, in order:

1. **They read `CLAUDE.md` and `AGENT.md`. Nothing else.** If those two are not enough to
   start, that is a defect in them.
2. **They score the risk grid cold**, before reading the analysis. That single hour recovers
   the most valuable thing solo work cannot produce.
3. **They perform a restore from a clean machine.** It closes RISK-012 and tests
   `backup-and-recovery.md` §5 at the same time.
4. **They review one completed task against its requirement**, without being told what to
   look for.

## Alignment artifacts that already exist

Everything a team would need for alignment is written down, because a solo project needs it
*more* — there is no colleague to remember why:

| Question | File |
|---|---|
| Why does this exist? | `01-docs/01-intent/intent.md` |
| Why doesn't it do X? | `05-review/01-logs/change-log.md` — including rejected changes |
| Why was it built this way? | `01-docs/05-architecture/architecture-decisions/` |
| What settles a design argument? | `01-docs/02-requirements/driving-characteristics.md` |
| What is unresolved? | `01-docs/01-intent/open-questions.md` |
| What must the agent never do? | `06-agent/01-instructions/AGENT.md` |

> **The point of writing this down for a team of one:** in six months the author is a
> different person, with no memory of the interview. Every artifact above is a handoff to
> them.

> Blueprint: ../../../spec-driven-template/06-agent/04-handoffs/team-workflow-pack.md
