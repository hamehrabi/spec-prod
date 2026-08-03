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
