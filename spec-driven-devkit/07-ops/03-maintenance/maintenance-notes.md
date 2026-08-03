# Maintenance Notes

> Source: Ch. 30.
> What someone needs to know to keep this project alive — including the person who wrote it,
> six months from now.

---

## The five-minute orientation

1. **This is a plugin made of Markdown.** No code, no runtime, no dependencies (ADR-002).
2. **Five modules:** manifest · intake instructions · question set · blueprint library ·
   validation checklist. They change independently, and FF-002 enforces that.
3. **The workspace it generates goes in `spec/` at the developer's repo root** and is
   committed. It is also the only state the intake keeps (ADR-004).
4. **`spec/` in *this* repository is the specification of the kit. Never edit it to make a
   task pass.**
5. **Start at `CLAUDE.md`, then `AGENT.md`.** One is the map, the other is the contract.

## The two things most likely to be got wrong by a returning maintainer

| Mistake | Why it happens | The rule |
|---|---|---|
| Adding a small script | The twelve validation checks are mechanical and code does them better | **ADR-002.** A check that silently skips where the runtime is absent builds BR-009's violation into the architecture |
| Adding a state file | Resume is simpler with one, and it would work | **ADR-004.** A second source of truth that begins disagreeing with the specs immediately |

Both will feel like obvious improvements. Both supersede an accepted ADR. Write the
superseding ADR first, or do not do it.

---

## Routine maintenance

| Task | Cadence | Why |
|---|---|---|
| **Push to the remote** | **At least daily** | This *is* the RPO. A stated RPO of one day and a weekly push habit means a real RPO of a week |
| Watch the scheduled install test | Continuous (it alerts) | RISK-004's only detector |
| Run the eval golden set | On every question or instruction change | The only way to know a reword helped |
| Human eval sample | Before each release | The only detector for hollowness |
| Spec drift checklist | Before each release | Nothing automated catches kit-vs-spec drift |
| Review open questions | Quarterly | Q-002, Q-003, Q-006, Q-007 are all still open |
| Restore test | Before first release, then annually | A backup nobody has restored is not a backup |
| Review the risk register | Quarterly | Track the **trend**, not the snapshot |

## Where things live

| Looking for | Go to |
|---|---|
| Why the product exists | `01-docs/01-intent/` |
| What must be true | `01-docs/02-requirements/requirements.md` |
| The three qualities that settle design arguments | `01-docs/02-requirements/driving-characteristics.md` |
| Binding decisions | `01-docs/05-architecture/architecture-decisions/` |
| What to build next | `02-tasks/01-planning/task-index.md` |
| What proves it works | `03-tests/01-plan/test-plan.md` |
| What is unresolved | `01-docs/01-intent/open-questions.md` |
| The agent's rules | `06-agent/01-instructions/AGENT.md` |

## Known weak points

Each is documented where it belongs; collected here so a returning maintainer sees them
together rather than discovering them one at a time.

| Weakness | Where it is written up |
|---|---|
| **Instruction-driven validation shares a failure mode with instruction-driven generation.** The checker and the checked can be wrong the same way | ADR-002 *Consequences*; RISK-009 |
| **The kit cannot see its own failure rate.** No telemetry, by promise | CON-007; Q-002; `monitoring-plan.md` |
| **The worked-example detector under-detects.** A *reworded* example would pass FF-006 | `fitness-functions.md`, honest limit 1 |
| **Golden fixtures cover what we thought of.** Real intakes cover what we did not | `ai-evals.md` §1 |
| **One person.** No second reviewer, no second restorer, no independent risk scorer | RISK-012; `risk-storming.md` |
| **No user-report channel exists** | `rollback-plan.md`, `runbook.md` — both carry the `[TODO]` |
| **`spec/` here drifts from the blueprint library and nothing detects it** | `spec-drift-checklist.md`, type C |

## Do not do these

- Do not add a dependency, script, or runtime (ADR-002)
- Do not add a state, progress, or cache file (ADR-004)
- Do not make `spec/`'s location configurable (ADR-004 — a setting is a branch)
- Do not edit an accepted ADR — supersede it
- Do not downgrade a fitness function to a warning
- Do not delete a test to make something pass
- Do not add telemetry, even opt-in (CON-007 — the promise is the product)
- Do not edit a blueprint to match this workspace (`spec-drift-checklist.md`, type C)

> Blueprint: ../../../spec-driven-template/07-ops/03-maintenance/maintenance-notes.md
