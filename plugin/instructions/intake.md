# Intake — orchestration

This is the orchestration module. It decides **what happens and in what order**. It holds no
question text and no template content; those are separate modules, and mixing them here is a
boundary violation.

At this version the intake does one thing: it states what the interview is and how long it
takes, and then stops.

---

## Step 1 — Print the preamble

Print the following as plain terminal text, before anything else. Do not add a heading, a
banner, a symbol, a colour, or a progress indicator — every piece of meaning must survive
being read aloud.

```
This command runs a guided interview about the software you want to build, then writes your
answers into a specification workspace in the spec/ folder of this repository. It asks the
questions and records the decisions; you make every decision, and you approve every file
before it is written.

At default depth the interview takes eight rounds.
```

The round count is stated **in words**, and it is stated every time. A developer who cannot
see where an interview ends has no way to decide whether to start one now.

## The blueprint library

The library ships inside this plugin at **`blueprints/`**, relative to the plugin root. It is
**read-only for the whole run.** Nothing in an intake ever writes to it, renames a file in it,
or repairs one.

### Where a blueprint's output goes

The mapping is a **rule, not a list**:

```
blueprints/<relative-path>     ->     <repo>/spec/<relative-path>
```

A blueprint's path below `blueprints/` **is** its destination path below `spec/`. Nothing else
determines it, and the folder depth is carried across unchanged — the back-link written at the
foot of each generated file is computed from that depth, so flattening or re-nesting a path
silently breaks it.

**Never hardcode the set of files a stage produces.** Read the library and derive it. A list
written here would mean adding a blueprint changes nothing until someone remembers to edit
this file, and the whole point is that it changes something immediately.

### A blueprint that is missing

```
- Failure state: MISSING_BLUEPRINT
  - Trigger:       A blueprint required for the file being written is absent from the
                   installed plugin.
  - Recovery path: Stop at that file. Everything already written stays written.
  - Message:       "Blueprint <path> is missing from the installed plugin.
                    Rounds 1-N are intact. Stopping here."
  - Never:         improvise a structure, substitute a similar blueprint, or write the
                   file from memory of what that template usually contains.
```

A missing blueprint is a **named gap**, and naming it is the whole behaviour. A structure
invented to keep going produces a specification that looks complete and answers to nothing —
which is worse than stopping, because it is not visibly wrong.

### What the library does not contain

Six template artifacts are **deliberately not packaged**: `.gitignore`, `.env.example`,
`Dockerfile.example`, and three `.gitkeep` files. They are not Markdown, and this plugin ships
Markdown and its manifest only. **A generated workspace therefore has no `.gitignore` and no
`.env.example`, and the intake must not improvise either one** — writing a `.gitignore` from
memory is exactly the invention this file forbids everywhere else.

## Step 2 — Stop

Stop. This version of the plugin ends after the preamble.

- Ask **no** question.
- Create, modify, or delete **no** file — not in `spec/`, not anywhere.
- Read nothing from the developer's repository.
- Make no network call.

Printing the preamble is the whole of the run. Ending here is the correct outcome, not an
incomplete one, and it must not be reported as an error or as a failure to start.

---

## Rules that bind this module

| Rule | Why |
|---|---|
| No question text lives in this file | Questions are their own module; this one sequences, it does not ask |
| No template or blueprint content lives in this file | Templates are their own module, and are read-only while the intake runs |
| This module never writes a file itself | It directs; the host's file tools write, and only after the developer approves each one |
| Meaning is carried in words, never in colour, symbol, or ordering alone | The output must be equally readable in a plain terminal, a log, or a screen reader |
| Behaviour is identical on Windows, macOS, and Linux | Nothing here assumes a shell, a path separator, or a case-sensitive filesystem |
| There is one command and one path through it | A second entry point is a second thing to keep correct, and the second one rots |
