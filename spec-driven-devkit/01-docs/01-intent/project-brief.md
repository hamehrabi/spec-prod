# Project Brief

> Source: Ch. 16 §16.2 — Project Brief Template.
> Plain language. Not technical. Written before requirements exist.

**Project name:** spec-driven-devkit

**Problem you want to solve:** Developers who build production-intended applications with
an AI coding assistant have no agreed structure for the assistant to work inside. The
assistant produces plausible code quickly, but the developer cannot tell what was actually
built, whether it matches what they meant, or what it silently changed. Without a
specification defined up front, the developer loses control of their own project.

**Primary users:** Developers using Claude Code to build an application they intend to run
in production — solo developers and small teams, working in their own repository.

**Secondary users:** The coding agent itself. It is not a person, but it is the main
*reader* of what this kit produces, and the kit fails if the agent cannot act on the output
without further explanation.

**Main outcome:** A developer can take a raw idea and, in one session, end up with a
complete specification workspace inside their own project — so that every later instruction
to the coding agent is governed by a specification the developer set in advance, and every
change the agent makes can be traced back to a numbered requirement.

**Must-have features:**
- Install into an existing project without requiring a service, account, or network call
- Run a structured intake that converts a raw idea into a filled specification workspace
- Supply the blueprint library the intake fills in
- Produce an entry-point file that a fresh agent session can read to work the project correctly
- Leave the developer's application code untouched

**Out-of-scope features:**
- Writing the developer's application code (that is the *next* session's job, not this kit's)
- Hosting, accounts, dashboards, or any server component
- Mandating a particular language, framework, or data store
- Support for AI assistants other than Claude Code in version one

**Known constraints:**
- Ships as a Claude Code plugin — files in a repository, installed locally; there is no
  runtime service to deploy and no database
- Fewer than 50 users in the first six months
- Version one built in two to four weeks
- Everything runs on the developer's own machine, inside their own repository

**Success signal:** A developer who has never seen this kit runs one command, answers the
interview, and finishes with a specification workspace they did not have to write by hand —
then opens a new session, gives one instruction, and the agent produces work that names the
requirement it satisfies.

---

## Separate vision from implementation (Ch. 2 §2.2)

Do not let implementation ideas contaminate the vision. The left column is what must become
true. The right column is only *one possible way* to get there and may be replaced.

| Vision statement (what should improve) | Implementation idea (how it might be built) |
|---|---|
| A developer stays in control of what an AI assistant builds for them. | Numbered requirements the agent must cite before and after it changes anything. |
| Starting a serious project should not require inventing a process first. | A ready-made blueprint library installed by a plugin, and an interview that fills it in. |
| A fresh agent session should be productive without the developer re-explaining the project. | A single small entry-point file at the project root that maps everything else. |
| The developer should be able to see what the agent did *not* do, as well as what it did. | A traceability matrix with deliberately visible blank cells. |
| Effort should go where the product actually competes. | Classify each area as core / generic / supporting, and vary spec depth by class. |
| Rules the developer set should still hold on day thirty. | Decisions recorded as ADRs, plus automated checks that fail the build when violated. |

---

## Raw-idea interrogation (Ch. 2 §2.1)

| Question | Answer |
|---|---|
| Who is this for? (the actual user, not the requester) | A developer using Claude Code to build an application they intend to put in front of real users. Not a non-technical person; not a team that already runs a specification process it is happy with. |
| What problem hurts enough to solve? | Loss of control. The assistant generates a large amount of plausible code, and the developer has no predefined standard to check it against, so they cannot confidently accept or reject it. |
| What outcome should improve? | The developer can name the requirement behind every change, and can hand a brand-new session one short instruction and get correct, in-scope work back. |
| What must the system **not** do? | It must not write application code, choose the developer's stack for them, require a hosted service, or make a small project carry heavyweight process. |
| What constraints already exist? | Claude Code plugin distribution (local files, no server); under 50 users; two-to-four-week v1; runs entirely on the developer's machine. |

---

## Problem statement formula (Ch. 2 §2.3)

> [Affected user] currently faces [difficulty], which causes [consequence].
> The system should [desired improvement].

**Your problem statement:**

> Developers building production-intended applications with an AI coding assistant currently
> have no predefined specification for the assistant to work inside, so they cannot tell what
> was built, whether it matches their intent, or what it changed without being asked. This
> causes rework, code nobody can review with confidence, and projects that stall before they
> reach production. The system should give a developer a ready-made spec-driven kit that turns
> a raw idea into a traceable specification workspace inside their own repository, so the
> assistant builds to a standard the developer set in advance.

---

## A note on recursion — read this before anything else in this workspace

This project is a tool that produces specifications. This workspace is a specification
*of that tool*. Two different things share almost identical vocabulary, and confusing them
will corrupt every requirement downstream. The convention used throughout:

| Term | Means |
|---|---|
| **the kit** | This product — the plugin being specified here. |
| **the kit author** | Whoever builds the kit. The reader of this workspace. |
| **the developer** | The kit's *user* — someone who installs the kit into their own project. |
| **the developer's project** | The application the developer builds. The kit never contains it. |
| **generated workspace** | The specification files the kit produces inside the developer's project. |

When a requirement says "the system", it means **the kit**. When it needs to talk about what
the kit produces, it says **generated workspace** explicitly.

> Blueprint: ../../../spec-driven-template/01-docs/01-intent/project-brief.md
