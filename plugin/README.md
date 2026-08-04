# spec-driven-devkit

A Claude Code plugin that turns a raw idea into a **traceable specification workspace** inside
your own repository — so a coding agent builds to a standard you set in advance, and you can
tell afterwards what it built and why.

**Version 0.1.0.**

---

## What it does

You run one command. It interviews you about the software you want to build, and writes the
answers into a `spec/` folder in your repository: intent, requirements, technical spec,
architecture decisions, tasks, tests, and the traceability between them.

The workspace is plain Markdown, committed to your repository, and readable by any later
session — including one that knows nothing about the interview.

## What it does **not** do

- It does not write your application code. Not a sample, not a stub, not an illustration.
- It does not write outside `spec/` without stopping to ask, naming the file, and showing
  what would change.
- It does not modify a `CLAUDE.md` or a `.gitignore` you already have.
- It does not make network calls, keep telemetry, or send anything off your machine.
- It has no account, no API key, no configuration file, and no settings.

## Install

The plugin is Markdown and a manifest. There is nothing to build, no runtime to install, and
no dependency to fetch.

**To try it from a local checkout**, start Claude Code with the plugin directory:

```
claude --plugin-dir path/to/plugin
```

**To check the plugin loads:**

```
claude plugin validate path/to/plugin
```

Both work identically on Windows, macOS, and Linux.

## Use

```
/spec-driven-devkit:spec-intake            # full depth
/spec-driven-devkit:spec-intake express    # thinner, fewer rounds
```

Running it bare is the ordinary case. `depth` is the only argument it will ever take — it
changes how much is asked and written, never which path runs.

## What this version does

The full interview runs: eight rounds of questions, files written after each round, an
acceptance gate you must pass before the next round begins, and — if you stop part-way — a
resume that works out where you were by reading the workspace rather than from a saved
position.

Before it writes anything it verifies the blueprint library against a checksum manifest.
Before it claims anything worked it runs twelve validation checks, and reports each one as
**passed**, **failed** or **not run** — never inferring the first from an absence of the
second.

**Still to come:** golden fixtures and the evaluation harness, blueprint coverage checks, and
a verified run on all three platforms.

## What is inside

```
.claude-plugin/plugin.json   the manifest: name, version, description
commands/spec-intake.md      the single command. There is exactly one, deliberately
blueprints/**                the template library, with a checksum manifest
instructions/
    intake.md        orchestration: what happens, in what order
    questions.md     what to ask, and how it is offered
    inference.md     what not to ask, and what to say instead
    boundary.md      where writes are allowed, and what a refusal says
    fill.md          turning one blueprint into one filled artifact
    integrity.md     verifying the library before anything is written
    depth.md         how much specification each area gets
    governance.md    the rules that make the output governable
    review.md        the acceptance gate
    resume.md        working out where you were, by looking
    validation.md    the twelve checks, and three-state reporting
    entrypoint.md    the map, written last
    report.md        the closing report and the hand-off
```

Nothing here executes. The plugin ships Markdown and one manifest, and it has no code of its
own to run — which is why it needs no runtime and behaves the same on every platform.
