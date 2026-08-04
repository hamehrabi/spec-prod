# The boundary — where writes are allowed, and what a refusal says

**Run this before proposing any write. Every write, every time, no exceptions for a file that
looks harmless.**

The kit runs with the developer's own filesystem permissions. It *could* write anywhere. This
file is the rule it holds itself to — and the host's per-file permission prompt is the only
enforcement that does not depend on the kit's own good behaviour, which is why the kit must
never ask for that prompt to be turned off.

---

## The ordered check

Order is the whole control. Normalising **after** comparing is the same as not comparing.

```
Before proposing ANY write:

  1. NORMALISE the destination path.        <- FIRST. Never after.
       Resolve . and .. segments. Treat \ as a separator.

  2. Is it one of the developer's protected files?   -> STOP. Never propose it at all.
       <repo>/CLAUDE.md      <repo>/.gitignore

  3. Does it resolve INSIDE <repo>/spec/ ?
       no  -> STOP and ask, naming the PATH ONLY.
       yes -> continue.

  4. Propose the write, and let the host's per-file prompt decide.

Never invert this: do not write and then check. There is no undo.
```

### Compare as a path, not as a string

A `startsWith("spec/")` test is the obvious implementation and it is wrong in **both**
directions at once:

| Destination | A prefix check says | The correct verdict | Why |
|---|---|---|---|
| `spec/01-docs/intent.md` | allow | **allow** | The ordinary case |
| `spec/` | allow | **allow** | The workspace root itself |
| `spec/../spec/01-docs/x.md` | allow | **allow** | It normalises back inside |
| `spec/../../etc/hosts` | **allow** | **reject** | Starts with `spec/` and is not inside it |
| `spec/../README.md` | **allow** | **reject** | One level out is still out |
| `specimen/x.md` | **allow** | **reject** | A prefix match is not containment |
| `/etc/hosts` | reject | **reject** | Absolute — never the kit's to write |
| `../outside.md` | reject | **reject** | Escapes above the repository root |

Normalise, then compare **segment by segment**. One line of ordering; the whole boundary.

---

## No working files, anywhere

**The kit never creates a file in order to do its own work.** No script, no helper, no
scratch file, no temporary file, no notes-to-self — not in `spec/`, not in the developer's
repository, not in a temp directory.

The only files this kit ever creates are **the specification artifacts it was asked for**,
each one proposed singly and approved by the developer.

This rule exists because it was broken. On the first end-to-end run the intake needed to
compare 79 checksums, had no sanctioned way to do it, and wrote two shell scripts into the
developer's repository root to manage — **before the preamble, before a single question**
(BUG-004). Nothing the developer owned was modified, but two files appeared in their project
that they never asked for and never saw proposed.

The lesson generalises past checksums: **when a step needs a capability the kit does not
have, the answer is to say so and stop — never to build the capability out of files in
someone else's repository.**

## The two protected files

`<repo>/CLAUDE.md` and `<repo>/.gitignore` are **never written to and never proposed** — not
after asking, not with permission, not when the developer offers.

They are already outside `spec/`, so step 3 would stop them anyway. They get their own step
because a stop that *asks* and a stop that *never asks* are different promises, and only the
second one is what REQ-F-026 and REQ-F-035 actually say.

| File | What happens instead |
|---|---|
| An existing root `CLAUDE.md` | The kit's entry point is written **inside** `spec/`, and the exact line the developer may add to their own file is printed at the end. Their file is untouched, byte for byte |
| An existing `.gitignore` | Nothing. The generated workspace is **meant** to be committed (REQ-F-035), so no rule ignoring `spec/` is added anywhere, by any route |

A `CLAUDE.md` **inside** `spec/` is the kit's own output and is written normally. The
protection is root-only; blocking the kit's own entry point would block the product.

---

## When `spec/` already exists and is not ours

Before the first write of a run: if `spec/` exists and does not look like a kit workspace,
**stop before writing anything**, say what was found, and offer an alternative folder name.

Recognise a kit workspace by **the artifacts it contains** — the numbered stage folders and
the entry point — never by a marker file. A marker file is a state file, and ADR-004 forbids
it (`spec/.kit` would be exactly the thing this product refuses to create).

```
- Failure state: WORKSPACE_COLLISION
  - Trigger:       spec/ exists and holds files this kit did not generate.
  - Recovery path: None automatic. The developer names a different folder, or moves theirs.
  - User message:  "spec/ already exists and contains files I did not generate
                    (<n> files, e.g. <path>). I have written nothing. I can use
                    <alternative>/ instead — or you can move that folder."
  - Never:         merge into it, write alongside its files, or rename the developer's
                   folder for them.
```

---

## What a refusal says

**Name the path. Never the contents.** A blocked write frequently concerns exactly the file
whose contents are private — an `.env`, a key, someone's notes. Quoting it to explain the
refusal leaks the thing the refusal exists to protect.

| Situation | The message |
|---|---|
| Outside `spec/` | `<path> is outside spec/. Here is what would change — may I write it?` |
| Resolves outside despite starting inside | `<path> resolves outside spec/ despite starting inside it. Nothing was written.` |
| Absolute path | `<path> is an absolute path, outside this repository. Nothing was written.` |
| A protected file | `<path> is yours, not the kit's. It is never written to and never proposed — not even with permission.` |

Name **which** of these it is. "Write blocked" sends the developer looking for the wrong
thing: outside is a decision they can make, protected is one they cannot, and a traversal is
probably a bug worth reporting.

---

## What must never happen

| Temptation | Why not |
|---|---|
| Request blanket write permission, to save ~90 prompts | **SEC-Z-002.** The per-file prompt is the only enforcement independent of the kit's own behaviour. Asking for it to be lifted turns every rule on this page into an intention |
| Build an allowlist, a policy file, or a configurable root | **TASK-004.** One rule, hard-coded. A configurable boundary is a boundary someone can widen, and `spec/` is fixed by ADR-004 |
| Write outside `spec/` because the change looked harmless | Harmless is not a category the kit gets to assign to someone else's repository |
| Write application source code, even inside `spec/` | **BR-001**, and it is a different rule from this one. Containment is about *where*; BR-001 is about *what*. A code sample inside `spec/` passes this check and still violates the product's defining boundary |
| Drop a marker file so the collision check is easier | **ADR-004.** Derive it from the artifacts instead |
