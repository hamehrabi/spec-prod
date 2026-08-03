# 04-src/ — The Plugin

> **No code in this folder yet, and none was written during the specification session.**
> The plugin is built from `02-tasks/02-task-files/`, starting at TASK-001.

---

## Layer boundaries

The template's default layers (pages, components, API, services, data) do not apply — there is
no application here. **The five modules of ADR-001 are the layers**, and their boundaries are
enforced by FF-002.

```
.claude-plugin/plugin.json     MANIFEST      registration only. No logic, no content.
commands/<command>.md          ENTRY         one command. Never two (FF-001).
instructions/
    intake.md                  ORCHESTRATION round order, limits, resume entry
    questions.md               QUESTIONS     what to ask, and what makes it derivable
    boundary.md                BOUNDARY      where writes are allowed; what refusal says
    fill.md                    TRANSFORM     the six-step blueprint -> artifact procedure
    depth.md                   DEPTH         subdomain class -> spec depth; express
    inference.md               INFERENCE     derivation rules; contradiction detection
    validation.md              CHECKS        the twelve checks; three-state reporting
    resume.md                  STATE         stage derived by inspection
    entrypoint.md              OUTPUT        the entry-point file
    report.md                  OUTPUT        closing report; hand-off block
blueprints/**                  LIBRARY       ~90 templates. READ-ONLY at run time.
```

## What each layer must not do

| Module | Must never contain |
|---|---|
| `plugin.json` | Any logic or content. It is a declaration |
| `intake.md` | Question text · blueprint structure |
| `questions.md` | Orchestration · blueprint paths |
| `boundary.md` | Anything about content |
| `fill.md` | Which blueprint belongs to which round |
| `validation.md` | How to fix what it finds — it reports |
| `blueprints/**` | Question text · orchestration. **Never written to at run time** |

### The rule that replaces "a handler never imports the data layer"

> **A blueprint never contains a question, and the instruction set never contains a
> blueprint's structure.**

Same purpose as the template's layering rule: it keeps the two things the kit author edits
most often — questions and templates — independently changeable (REQ-NF-005). It is decidable
by looking, which is what makes **FF-002** computable rather than aspirational.

---

## What does **not** go here

| Not here | Where instead | Why |
|---|---|---|
| Tests, fixtures, golden workspaces | `03-tests/05-executable/` | Never in the published payload (FF-009) |
| CI workflows and check scripts | `ci/`, `.github/` | Same — they check the kit, they are not the kit |
| **Any script, package manifest, lockfile, or dependency** | **Nowhere** | ADR-002. FF-009 fails the build |
| Any state, progress, cache, or answer file | **Nowhere** | ADR-004 |
| The developer's application code | **Nowhere. Ever.** | BR-001 — the defining boundary of the product |

## Before writing anything here

1. Read [`spec/CLAUDE.md`](../CLAUDE.md), then [`AGENT.md`](../06-agent/01-instructions/AGENT.md).
2. Read the task file. **Only** the specs it names.
3. Restate the task, list the files, name your assumptions — **and wait**.
4. **TASK-004 (the boundary layer) is built before TASK-006 (the first write).** Not
   negotiable: a kit that can write before it can refuse to write will write in the wrong
   place during its own development.

> **If a task seems to require executable code, the task is wrong — stop and ask.** ADR-002 is
> load-bearing: it is what makes the kit work on three platforms with nothing installed, and
> what gives it no code-execution surface at all.

> Blueprint: ../../spec-driven-template/04-src/README.md
