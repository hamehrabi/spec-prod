# The fill procedure — one blueprint, one artifact

This is **the one algorithm in the product**, and it carries the characteristic failure of
the method it implements: **leftover template text reads exactly like a filled answer.**

Six steps, in order. Each names the failure it prevents, because a step whose purpose is
forgotten is a step that gets skipped when it looks unnecessary.

> **This is a copy and a set of replacements.** It is not a rendering pass and there is no
> templating engine. Substitution is a fill, not a render — and building the engine is the
> single most likely over-engineering in this project.

---

## Step 1 — Copy the blueprint to its destination

```
blueprints/<relative-path>     ->     <repo>/spec/<relative-path>
```

Copy the file. **Never author it from memory of what that template usually contains**
(ADR-003). Every destination goes through `instructions/boundary.md` first.

*Prevents:* copying to the wrong depth, and the far worse failure of writing a file that
resembles the blueprint instead of being it.

## Step 2 — Delete the worked example, whole

Delete from the `# WORKED EXAMPLE` heading to the end of the file. **Whole. Never edited
around, never partially adapted, never "kept because that bit was relevant."**

*Prevents:* the developer inheriting requirements they never made, about a product that is
not theirs (BR-002). Example content reads as a decision once it is in their repository.

> Every blueprint guarantees the worked example is its **last** section (contract C2). If one
> ever has real content after it, that is a **blueprint defect** — stop and report it. Do not
> add a special case here. See BUG-003, where exactly this happened to three of them.

## Step 3 — Delete the generic prompt boxes

They instruct how to **produce** the file. They are not content **of** it.

*Prevents:* a finished specification that still says "paste your idea here".

## Step 4 — Replace every placeholder

**The step an agent will do partially and believe it did fully.** Work the inventory below
line by line rather than reading for an impression of completeness.

Each one becomes either the developer's real content, or `[TODO: <the exact question>]` with
a matching `Q-###` row. Never a plausible-looking value.

### What counts as unfilled

| Kind | Looks like | Note |
|---|---|---|
| Placeholder | `[what the actor must do]`, `[Name]` | A bracket span that is **not** a link and **not** a checkbox |
| Identifier stub | `REQ-F-###`, `ADR-###` | Mint it in step 5 |
| Date stub | `YYYY-MM-DD` | |
| Empty table row | `\| \| \|` | A decision nobody made. Fill it, or mark it *not needed, because…* |
| Instructional italic | a whole line in `*single asterisks*` | The blueprint telling you what belongs there |
| Blank fill | `______` | |
| Angle stub | `<label>` | |
| Prompt box | `> **Prompt …` | Overlaps step 3 |

### What is **not** unfilled

Getting these wrong matters as much as the list above. The library contains **565 checkboxes**
and **136 markdown links**. An inventory that flagged them would report 701 false gaps, and a
check nobody believes is a check nobody runs.

| Not a placeholder | Why |
|---|---|
| `- [ ]` and `- [x]` | Checklist items. The blueprint's own structure |
| `[text](path.md)` | A markdown link — a bracket followed by `(` |
| `[TODO: <question>]` | **The sanctioned outcome of this step**, not a leftover |

### Where it sits decides what it is

Some blueprints show the **shape** of an answer before asking for one:

```
> [Affected user] currently faces [difficulty], which causes [consequence].

**Your problem statement:** A charity's fundraising team currently tracks donors in
shared spreadsheets, which causes them to miss repeat donations worth thousands a year.
```

The quoted line is the formula. It is **content the blueprint keeps**, and the answer goes
below it. Replacing the formula would delete the thing that explains the answer.

The same holds for an identifier pattern inside backticks — `` `TASK-###.md` `` documents a
naming convention; it is not waiting to be replaced.

So: a bracket span **in body text** is a gap. The same span **inside a blockquote or inside
backticks** is usually illustration. Read it and decide — but do not report it as unfilled
without looking, and do not silently ignore it either. This distinction is BUG-006: the first
version of the check called a correctly filled file unfilled, and a control that cries wolf on
correct work is a control that gets switched off.

### The distinction the whole step rests on

```
| Retention | 90 days                              |   <- looks finished. May be invented.
| Retention | [TODO: what is the retention period?] |   <- honestly unfinished.
```

Structurally the first row is complete and the second is not. **The second is the correct
one** when the developer never said. An invented value is indistinguishable from a real one
once written down, and the build agent will act on it (BR-003).

*Prevents:* the defining failure of copy-then-fill — a file that presents as decided.

## Step 5 — Mint and record identifiers

Sequential, zero-padded, unique across the workspace: `REQ-F-001`, `REQ-F-002`, `ADR-001`.

**Never reuse an identifier, including after the thing it named is deleted.** Delete
`REQ-F-007` and the next one minted is still `REQ-F-009` — the hole is permanent (BR-007).

*Prevents:* a reused ID silently re-pointing a test, a task, and a traceability row at
something else. Nothing about the workspace looks wrong afterwards, which is what makes it
dangerous.

## Step 6 — Append the back-link

```
> Blueprint: blueprints/<relative-path>
```

The blueprint's path below `blueprints/` **is** the artifact's path below `spec/`, so the
back-link is that same path with the library prefix. There is no arithmetic to get wrong.

It **names** a blueprint; it is not a clickable filesystem link. The library lives inside the
installed plugin, whose location is version-stamped and differs per machine, so a relative
path from a developer's workspace would point at nothing on every machine but the kit
author's. The plugin version is recorded once in the entry point (ADR-005), and together they
say exactly which template produced this file.

*Prevents:* a workspace nobody can audit against its source — and a link that looks
authoritative while resolving nowhere, which is worse than an honest name.

---

---

## Wrapper blueprints — when the artifact is not Markdown

A workspace needs two files that are not Markdown: `.gitignore` and `.env.example`. This
plugin ships Markdown only, so those blueprints **carry** their artifact rather than being it.
They declare a target and hold the content in one fenced block:

```
> Writes: `.gitignore`
> Comment: `#`
```

For a wrapper, the six steps become:

1. Read the blueprint. **Do not copy it to the destination** — the destination is not Markdown.
2. Take the content of its single fenced block.
3. Adapt it to this project, by the same rules as step 4 above. Placeholders only in
   `.env.example` — **a real credential written there is a real credential in version control.**
4. Write it to the declared target, inside `spec/`.
5. Append the back-link as a **comment**, using the declared prefix:
   `# Blueprint: blueprints/gitignore.md`.

The back-link matters as much here as anywhere. A `.gitignore` cannot carry a Markdown
back-link, but it can carry a `#` one — and skipping it would make these the only two
unauditable files in the workspace.

**`.gitignore` is always written before `.env.example`.** The ignore rule has to exist before
the file that invites someone to copy it, or the first copy made is the one that gets
committed.

**A blueprint is a wrapper or it is not, decided by whether it declares a target.** This is one
rule for a category, not a special case per filename — if a third artifact ever needs it, it
declares a target and nothing here changes.

## When the file is finished

Re-read it against the inventory in step 4. The question is not *"does this look complete?"*
— it will. The question is *"is there a placeholder, an empty row, or an instructional italic
still in this file?"* That one is decidable, and it is the only one worth asking.

A file that fails a structural check is **re-filled once**. If it fails again, the gap becomes
a `[TODO]` with a matching open question and is named in the closing report — never retried
indefinitely, and never accepted silently (REQ-F-037).
