# Constraints and Non-Goals

> Source: Ch. 30 §30.2, Ch. 5 §5.6, Ch. 6 §6.5.
> Out-of-scope decisions are as important as in-scope decisions — they protect focus and
> stop the agent from adding features you never approved.

## Constraints

A constraint is a fixed condition that limits the solution. State real-world limits before
implementation, because AI agents invent ideal solutions.

| ID | Type | Constraint |
|---|---|---|
| CON-001 | Technology | The kit ships as a **Claude Code plugin** — a set of files installed into a repository. There is no server, no runtime process the kit owns, and no database. Everything the kit does happens inside a Claude Code session on the developer's machine. |
| CON-002 | Time | Version one must be small enough to build in **two to four weeks**. |
| CON-003 | Data | **No network calls at runtime.** The kit must work with no internet connection beyond whatever Claude Code itself requires. Nothing about the developer's idea, repository, or generated workspace may be transmitted anywhere. |
| CON-004 | Environment | Must behave **identically on Windows, macOS, and Linux**. This forbids POSIX-only shell scripts, hard-coded `/` path separators, `sh`/`bash` built-ins as the execution mechanism, and any assumption about case-sensitive filesystems. |
| CON-005 | Integration | Installing or running the kit must **never modify an existing file in the developer's repository without asking first** — including their `CLAUDE.md`, `README.md`, `.gitignore`, and any file the intake would otherwise overwrite. Creating new files in a new folder is permitted; touching what is already there is not. |
| CON-006 | Budget | **No paid third-party services and no API keys** beyond Claude Code itself. A developer with nothing but Claude Code installed must be able to use the kit completely. |
| CON-007 | Compliance / privacy | The developer's idea, requirements, and source code **stay on their machine**. No telemetry, no usage analytics, no error reporting, no phone-home. This is a direct consequence of CON-003 and is stated separately because it is a promise to the user, not only a technical limit. |
| CON-008 | Team skill | **One developer directing an AI coding agent, one task at a time** (Round 7). This is the kit's own method applied to itself, so the kit is its own first user. Consequences: task files are **boundaries, not guidance** — an agent that cannot see the whole project needs the allowed-file and do-not-change lists to be exact; and the handoff pack stays short, because there is no team to align. `[TODO: the developer's familiarity with Claude Code plugin internals is still unknown — it decides how much of the plugin manifest work needs a spike first. See Q-008.]` |

> **Warning:** do not let a constraint become an excuse for poor design. A constraint
> guides the solution; it does not lower the quality standard.

### What these constraints actually forbid

Constraints are only useful if they can stop something. Each row below is a design an agent
would plausibly propose, and the constraint that rejects it:

| A reasonable-sounding proposal | Rejected by | Because |
|---|---|---|
| "Add an opt-in analytics ping so we can measure completion rate." | CON-003, CON-007 | There is no such thing as an exception here. Opt-in telemetry is still telemetry, and the promise is the product. See the conflict logged as Q-002. |
| "Ship an install script (`install.sh`) that copies the templates in." | CON-004 | Will not run on Windows without a POSIX shell. If installation needs a script, it needs one the host runs cross-platform. |
| "Append the kit's rules to the developer's existing `CLAUDE.md` on install." | CON-005 | That is exactly the silent modification the constraint forbids. Ask, or write a separate file and tell the user to link it. |
| "Fetch the newest blueprint templates from GitHub at intake time." | CON-003 | The library ships with the plugin. A plane, a locked-down corporate network, and an air-gapped machine are all supported environments. |
| "Use an embedding model to classify the developer's idea into a subdomain type." | CON-003, CON-006 | Extra model calls and probably an extra key. The interview asks the developer instead — which is also the core subdomain. |
| "Store the developer's answers in a local SQLite file so intake can resume." | CON-001 | The generated workspace *is* the state. Resume works by reading the files already written. Introducing a second store creates two sources of truth. |

---

## Non-goals / out of scope

State whether each item is excluded **permanently**, **deferred**, or **waiting for
information**.

| Item | Reason it is excluded now | Future status |
|---|---|---|
| **Writing the developer's application code** | This is the defining boundary of the product, not a scoping compromise. The kit produces specifications; a separate session, governed by those specifications, produces code. A kit that writes code has become the thing it was built to control. | **Rejected — permanently.** |
| **Support for AI assistants other than Claude Code** (Cursor, Copilot, Codex, Gemini CLI) | Supporting a second host doubles the surface area before the first one is known to work. The generated workspace is plain Markdown and is portable by nature; only the *intake mechanism* is host-specific. | Deferred. Revisit once the intake is proven on one host. |
| **Non-interactive / scripted intake** (fill from a config file, run in CI) | The interview is the core subdomain. Replacing it with a config file removes the part of the product that carries the value, and the answers a developer types are exactly what a config file cannot supply. | Deferred. |
| **Automatic spec-drift detection** (reading the developer's code to find where it diverged) | Genuinely valuable and materially harder than generating specs — it requires understanding an arbitrary codebase, not filling a template. Out of reach for a two-to-four-week v1. | Deferred. The manual `spec-drift-checklist.md` in the generated workspace covers the need for now. |
| **Any hosted or team component** (shared specs, dashboards, sync, accounts) | **Inferred, not stated by the kit author.** CON-003 forbids network calls at runtime, which makes a hosted component impossible rather than merely unwanted. Recorded as an inference so it can be challenged. | **Rejected for v1** — reopening it means reopening CON-003. |
| **Telemetry, usage analytics, or error reporting** | CON-007. See Q-002 — this exclusion makes success measure SM-2 unmeasurable, which is an unresolved conflict rather than a settled decision. | **Rejected for v1**, pending Q-002. |
| **A standalone re-runnable validation command** | **Assumed, not decided.** Validation currently sits as the final step of the intake. Whether it is *also* separately invokable later is open — see Q-001. | Waiting for information. |
| **Redesigning the blueprint library** | The ~90 templates already exist in `spec-driven-template/`. v1 packages and versions them; it does not rewrite them. | Deferred — treat as a supporting subdomain, per `subdomain-map.md`. |

---

## Scope control habit (Ch. 6 §6.4)

For every feature you include, write one sentence explaining why it belongs in **this**
version. If you cannot explain the value, move it to the table above.

**Prioritization test (Ch. 6 §6.8):** if this feature is missing, can you still test the
main product idea? If yes, it is probably not a must-have for v1.

### Why each in-scope capability belongs now

| Capability | One-sentence justification |
|---|---|
| The guided intake interview | It **is** the product — the only capability the kit author named as must-have, and the one identified as the core subdomain. |
| The blueprint library, packaged and shipped | The interview has nothing to fill in without it; it fails the prioritization test as a *separate* build item only because it already exists. |
| Generating the agent governance contract into the workspace | Not a separate capability — it is output of the interview. Without it the workspace is documentation rather than governance, which is failure mode RSK-5. |
| Resume from a partially complete workspace | An intake that must be finished in one sitting will be abandoned in the middle, which is failure mode RSK-1. |
| Validation before the intake reports success | The intake claiming a complete workspace it has not checked is how RSK-2 (hollow specs) ships undetected. |

> Blueprint: ../../../spec-driven-template/01-docs/01-intent/constraints-and-non-goals.md
