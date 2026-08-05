# Coverage — every blueprint used, or skipped with a reason

**This exists because of a gap nothing else caught.**

The structural checks verify that a generated file *matches* its blueprint. A blueprint the
intake never reached produces no file, no mismatch and no complaint — so a workspace could
pass every check while missing an entire specification document.

It only became visible when someone asked *"will it use all the templates?"*

---

## The required set is derived, never listed

**The manifest is the authority.** Every entry in `blueprints/MANIFEST.md` is required unless
it is recorded as skipped.

**Never write a list of files into the instructions.** A hardcoded list means adding a
blueprint changes nothing until someone remembers to edit the orchestration — and the whole
point is that it changes something immediately.

### Rounds own directories, not files

Each round owns a set of **directories**. Everything the manifest lists under an owned
directory is that round's responsibility.

**An entry ending in `/` or `-` is a prefix and covers everything beneath it.** Anything else
is one exact path, and naming a file is how a directory gets split between two rounds.

| Round | Owns |
|---|---|
| 1 | `01-docs/01-intent/intent.md` · `01-docs/01-intent/project-brief.md` · `01-docs/01-intent/open-questions.md` · `01-docs/09-change-control/` · `README.md` |
| 2 | `01-docs/01-intent/constraints-and-non-goals.md` · `01-docs/01-intent/subdomain-map.md` |
| 3 | `01-docs/02-requirements/requirements.md` · `01-docs/06-api-and-data-design/` |
| 4 | `01-docs/02-requirements/driving-characteristics.md` · `01-docs/03-product-spec/` · `01-docs/04-technical-spec/` |
| 5 | `01-docs/05-architecture/` |
| 6 | `01-docs/07-security-and-reliability/` · `gitignore.md` · `env-example.md` |
| 7 | `02-tasks/` · `03-tests/` |
| 8 | `05-review/` · `06-agent/` · `07-ops/` · `01-docs/08-` · `01-docs/10-` · `04-src/` |

**Every path in that table is written in full, and that is what makes it checkable.** It used
to name the split files in prose — *(intent, brief)* — which reads well and cannot be compared
against anything. A round map nobody can compare to the manifest is a claim, and the whole
point of deriving the file set was to stop making claims about coverage.

The comparison is now a test: every blueprint the manifest lists resolves to **exactly one**
round. Nought is a hole, two is a file written twice.

### A file is owned by the round that can fill it

`driving-characteristics.md` sits in `01-docs/02-requirements/`, so Round 3 owned it. Every one
of its three steps is the answer to **Round 4's** question — pick three qualities, keep the
rejected candidates, state a measure for each. Round 3 could only have written it as a page of
markers for a question the developer had not been asked yet.

That is not fatal, because a later round may close a marker it answers. It is still wrong:
the gate at the end of Round 3 would show the developer a document with nothing in it, one
round before the question that fills it. **An interview that appears to produce empty files
reads as a broken tool**, and a developer who thinks the tool is broken stops
(`instructions/inference.md`).

So the file moved to Round 4 and the directory is split — the second half of the same rule that
moved the change log to Round 1 (BUG-010). There, a file every round writes to belongs to the
first round that writes to it. Here, a file **one** round can fill belongs to that round.

**A few later-round fields in a file is normal and is not this.** `api-specification.md` has an
auth model it cannot know until Round 5, and it stays with Round 3, because the rest of it is
Round 3's answer. The test is whether the round that owns it can write something real.

### The change log belongs to Round 1, not to the round that reads like its home

`01-docs/09-change-control/spec-change-log.md` is **infrastructure for all eight rounds**,
not an artifact of the eighth. Every round appends its acceptance row to it
(`instructions/review.md`), and every skip is recorded in it (below) — so it has to exist
before Round 1's gate is answered.

Filed under `01-docs/09-…` it looks like late-stage bookkeeping and was originally owned by
Round 8. That ordering is unsatisfiable: Round 1 would have to append to a file five rounds
away from being created, and the only ways out are to record no acceptance at all or to
write a Round 8 file during Round 1 — which check 13 would then read as coverage the run
had not actually reached.

**A file that every round writes to is created by the first round that writes to it.**

### Open questions belong to Round 1, for the same reason

`01-docs/01-intent/open-questions.md` is the other file every round writes to. It is where a
`Q-###` row is **defined**, and a `[TODO]` marker is only half of a pair — check 6 requires the
row, and check 1 requires every identifier a workspace references to be defined somewhere in it.

Round 1 is the first round that can create a `[TODO]`, so it is the first round that writes a
row, so it owns the file. Owning it by Round 2 was unsatisfiable in the same way the change log
was: Round 1 mints the markers and has nowhere to define them.

**This was measured, not reasoned about.** A run driven to Round 1 and stopped produced four
files referencing `Q-001` through `Q-005`, and failed validation check 1 on all five — every
one referenced, none defined, because the file that defines them was a round away. That is
BUG-023.

A run that stops at Round 1 is a normal ending (`instructions/intake.md` 2e), and the workspace
it leaves has to be coherent on its own. Dangling identifiers are not a cosmetic flaw: a marker
pointing at a row that does not exist teaches the reader that markers point at nothing, which is
the same damage BUG-014 described from the other direction.

### The one thing a round does outside its own directories

**A round replaces any `[TODO]` its answers resolve, wherever that marker lives.**

Ownership decides which files a round *produces*. It cannot decide where the answers land,
because the questions and the markers are deliberately out of step: Round 1 marks what it
cannot know, and the later rounds are where those things become known. Round 2 asking which
capabilities exist in version one *is* the answer to a marker Round 1 wrote into `intent.md`.

If ownership were the whole rule, that marker would still be sitting there at the end of the
run with its answer three files away in the same workspace — and a marker its own workspace
contradicts is worse than an open one. An open marker is an honest gap; a stale one teaches
the reader that markers mean nothing, and after that none of them are read (BUG-014).

**The permission is exactly this wide: replace a marker you have the answer to, and flip its
`Q-###` row to *Answered*.** Not tidy the file, not revise the row beside it, not improve a
sentence on the way past. A round that rewrites a neighbouring decision is editing an accepted
round, which `instructions/review.md` forbids outright.

Check 6 fails on a marker whose question is already answered, so this is enforced rather than
requested.

**Adding a blueprint inside an owned directory makes it required, with no change to any
instruction.** That is the property this design exists for.

**A blueprint in a directory no round owns is a coverage failure, not an implicit skip.** It
means either the round map has a hole or the blueprint should not ship — and both are findings
worth raising rather than papering over.

---

## Two end states, and only two

Every blueprint finishes a run either **filled** or **skipped with a reason**.

### A skip must carry a reason

**A skip with no reason is a silent skip wearing a label.** The reason is what lets a later
reader tell a decision from an omission.

Record skips as dated rows in the generated `01-docs/09-change-control/spec-change-log.md` —
the same artifact that already holds the stage acceptance rows. **No new file**: a workspace
that grows a file per bookkeeping concern accumulates files nobody reads.

```
| 2026-08-04 | Skipped | frontend-component-spec.md | API-only product; no interface to describe |
| 2026-08-04 | Skipped | ai-boundary-spec.md | No model is called or embedded |
```

### The legitimate skips

| Blueprint | Skipped when |
|---|---|
| `frontend-component-spec.md` | The product has no interface at all — and *"it is API-only"* is written down |
| `ai-boundary-spec.md`, `ai-evals.md` | The product neither calls nor is driven by a model |
| `data-and-integration-spec.md` | There is no external dependency whatsoever |

`appendix-index.md` is **never generated and never skipped**. It is a permanent exclusion in
the manifest — template scaffolding rather than an artifact of anyone's project, so it is not
a per-run decision at all.

### Never auto-skip what the run did not reach

**Not reaching a blueprint is a coverage failure.** It is not a skip, and it must never be
recorded as one.

The distinction is the whole point: a skip is a decision someone made about this product; an
unreached blueprint is the intake quietly producing less than it promised.

---

## Check 13

Compare the manifest against the workspace and the skip record:

> `Check 13 (blueprint coverage): failed. 2 blueprints were neither filled nor skipped:
>  01-docs/04-technical-spec/runtime-and-scale.md, 07-ops/02-monitoring/runbook.md`

**Name every one, by path.** A count alone tells the developer something is missing without
telling them what, and the paths are the only actionable part.

**Silently unused must be zero.** Anything else fails the check and blocks the success claim,
like any other failure.
