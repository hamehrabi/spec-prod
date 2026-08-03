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
/spec-driven-devkit:spec-intake
```

The command takes no arguments, and running it bare is the ordinary case.

## What this version does

`0.1.0` is the first vertical slice: it installs, registers the command, and prints the
preamble — the two sentences describing the interview, and the number of rounds it takes.
Then it stops. **It asks no question and writes no file.** Installing this plugin creates
nothing in your repository, and neither does running it.

The interview rounds themselves arrive in later versions. This release exists to prove the
delivery path — install, invoke, respond — end to end before any of it can write to a
repository.

## What is inside

```
.claude-plugin/plugin.json   the manifest: name, version, description
commands/spec-intake.md      the single command. There is exactly one, deliberately
instructions/intake.md       orchestration: what happens, in what order
```

Nothing here executes. The plugin ships Markdown and one manifest, and it has no code of its
own to run — which is why it needs no runtime and behaves the same on every platform.
