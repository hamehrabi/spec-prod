# Recommended Tools

> Source: Ch. 4.
> **Each tool justified against a constraint** — plus what was rejected and why. A tool list
> with no rejections is a wish list.

---

## Chosen

| Tool | Used for | Justified against | Why this one |
|---|---|---|---|
| **Claude Code** | The host: command registration, the question mechanism, file tools, and the per-file permission prompt | CON-001, CON-006 | The kit *is* a plugin for it. Not a choice so much as the premise — and the swap cost to another host is 2 modules of 5, none of it content (`ai-boundary-spec.md` §2) |
| **Markdown** | Everything the kit ships: instructions, questions, blueprints | **ADR-002**, CON-004 | No runtime to install, no packaging, cross-platform for free. Also readable by the developer, who can inspect the entire implementation |
| **Git** | Version control; the kit's only backup mechanism | `backup-and-recovery.md` | `git push` **is** the RPO. Also why REQ-F-035 keeps generated workspaces committed |
| **A plugin marketplace** | Distribution and updates | `subdomain-map.md` — distribution is **generic** | Adopt the host's mechanism. A private channel would be waste, and CON-003 forbids the network call |
| **A CI provider** | The gate and the scheduled install test | `fitness-functions.md` | The only place a check can actually block something (ADR-002 leaves no build on a developer's machine). `[TODO: not chosen]` |
| **Semantic versioning** | Release numbering | ADR-005 | There is no API to break, but there **is** a contract — blueprint paths in other people's repositories. Semver is what signals a rename |

## Rejected

| Tool / category | Rejected because |
|---|---|
| **Any language runtime** (Node, Python, …) | ADR-002. Something a developer must have installed, on three platforms, to run a folder of Markdown. The hybrid option lost on its failure mode: validation silently skipped where the runtime is absent |
| **A templating engine** | `subdomain-map.md` names this as the predicted over-engineering. Blueprints are Markdown; substitution is a fill, not a render |
| **A schema or validation DSL** | Validation is **supporting** — twelve fixed checks, built simply. A specification schema language would be a fine product; it is not this one, and not in four weeks |
| **A database, or any local store** | ADR-004. The generated workspace is the state. A store creates a second source of truth that begins disagreeing immediately |
| **Shell scripts** (`install.sh`) | CON-004. Will not run on Windows without a POSIX shell |
| **Docker** | Nothing to containerise — no process, no entrypoint. See `Dockerfile.example`, which is an explanation rather than a build |
| **Any analytics, error reporting, or telemetry SDK** | CON-007, BR-014. **Including opt-in.** The promise is part of the product; it costs SM-2 and that cost was accepted (Q-002) |
| **An embedding or classification model** | CON-003, CON-006. The interview asks the developer instead — which is also the core subdomain |
| **A model-graded eval scorer** | Grading a model-driven system with another model drifts on both sides at once, with no budget to calibrate it. Eleven deterministic scorers plus two honest human ones instead |
| **An issue tracker, project board, or planning tool** | One person (CON-008). `task-index.md` **is** the board, and it lives with the specs it references |

---

## The pattern in the rejections

Nine of the ten are rejected by **ADR-002, ADR-004, CON-003, or CON-007** — four decisions
doing almost all the work. That is what a small set of well-chosen constraints buys: most
tooling questions stop being questions.

The one exception is the model-graded scorer, rejected on its own merits. It is worth noting
because it is the only place where the answer came from thinking rather than from a rule —
and therefore the one most likely to be revisited by someone who does not know it was
considered.

## What would change this page

| If | Then |
|---|---|
| ADR-002 were superseded | A runtime, a package manager, a lockfile, a dependency policy, and a security review that currently does not need to exist |
| CON-003 or CON-006 were reopened | Telemetry becomes possible, an eval-grading model becomes affordable, and **`runtime-and-scale.md`'s rate-limit rows stop being "not needed"** |
| A second person joined | An issue tracker might start earning its place. Not before |

> Blueprint: ../../../spec-driven-template/01-docs/10-reference/recommended-tools.md
