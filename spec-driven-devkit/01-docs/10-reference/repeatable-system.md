# The Repeatable System

> Source: Ch. 25, Ch. 30.
> The process that produced this workspace, the library it drew on, and an **empty
> improvement log** to fill in after the project.

---

## The process

```
1. Capture the idea        intent, constraints, non-goals, open questions, subdomain map
2. Define requirements     IDs, acceptance criteria, the THREE driving characteristics
3. Product specification   personas, scope, stories, flows - each with a failure path
4. Technical specification architecture, ADRs, contracts, fitness functions, AI boundary
5. Create tasks            bounded work, each with allowed AND forbidden files
6. Plan tests              six levels, from acceptance criteria; plus the eval harness
7. Generate code           a SEPARATE session, governed by the artifacts above
8. Review                  seven layers; risk storming
9. Prepare for release     deployment, migration, rollback, readiness, backup
10. Maintain the spec       monitoring, drift, change log
```

**Steps 1–6 and 8–10 are complete for this project. Step 7 begins at TASK-001.**

## The intake that ran it

| | |
|---|---|
| Rounds | 8, at most 4 questions each — a hard ceiling |
| Free-text questions | 1 (the problem statement) plus follow-ups on contradictions |
| Files written | ~95, after every round rather than at the end |
| Push-backs | 1 — four driving characteristics reduced to three |
| Contradictions surfaced | 1 — "developers finish the intake" against "depth of the generated documents" |
| Inferences stated rather than asked | Several, including that a hosted component is impossible under CON-003 |
| Open questions at the end | 8, of which **2 block release** |

## The library

~90 blueprints in [`spec-driven-template/`](../../../spec-driven-template/), implementing
*Spec-Driven AI Engineering* (Gem Iroko) plus six files from an architecture review drawing on
Richards & Ford, Ousterhout, Khononov, and Hohpe.

**Every generated file links back to its blueprint.** That back-link is what makes the library
navigable from any file — and it is also the contract that a rename breaks (ADR-005).

---

## What made this run work, and what did not

Written now, while it is fresh, because the improvement log below is worthless if nobody
records what actually happened.

| Worked | Why |
|---|---|
| **Writing after every round** | Two rounds in, there was already a usable brief. Nothing depended on finishing |
| **The three-driver limit, enforced** | Four were chosen; one push-back removed security, and the reason (already a hard constraint) was better than the original selection |
| **The seven-questions worksheet** | Found the two-sessions-one-repo gap that no design review would have. Cheapest finding in the whole intake |
| **"Not needed, because…" rows** | `runtime-and-scale.md` is almost entirely *not needed* — and each row names what would change that. Fifteen minutes, several tripwires |
| **Refusing to fill `[TODO]`s** | The workspace is honest about eight open questions instead of looking complete |
| **Asking for the rejected list** | `driving-characteristics.md` Step 2 is more useful than Step 3 |

| Did not work as well | Why |
|---|---|
| **The four-option limit on questions** | Round 4 needed seven driving-characteristic candidates and could show four. The other three had to be named in prose — workable, but the tool constrained the method |
| **Adapting ops files to a product with no ops** | Deployment, monitoring, and migration all needed reframing rather than filling. Valuable, but slow, and easy to do badly by leaving blanks |
| **The recursion** | A tool that produces specs, specified in a spec. The glossary fixed it; it needed fixing in Round 1 and would have corrupted everything downstream if written later |
| **Solo risk storming** | Step 1 of the method is *score independently*. With one person it cannot run as designed |

---

## Improvement log

**Fill this in after the project, not now.** Predictions written during intake are worth less
than observations written after building.

| Date | What happened | What to change in the process | Changed? |
|---|---|---|---|
| | | | |

### Questions to answer when filling it in

1. **Which specification files were actually read during implementation?** Any never opened
   were written for a reader who does not exist.
2. **Which `[TODO]`s were closed, and which are still open?** A stable count means the
   open-questions file became a graveyard.
3. **Did any ADR get reversed?** If so, was it superseded properly or quietly?
4. **Which test caught a real defect first?** That level deserves more weight next time.
5. **Did the interview produce a decision that turned out wrong?** Which question would have
   caught it — and should it be in the kit's own question set?
6. **Did the specs get updated during coding, or abandoned?** SM-4. This is the one that
   decides whether the method worked.

> Question 6 is the one that matters. Everything else is refinement; that one is the
> difference between spec-driven engineering and a folder of documents written once.

> Blueprint: ../../../spec-driven-template/01-docs/10-reference/repeatable-system.md
