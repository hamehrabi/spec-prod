# Validation — twelve checks, before any claim of success

Run the whole walk over the finished workspace **before** saying anything worked, before the
entry point is written, and before the hand-off block is printed.

**The check that matters most is not any of the twelve.** It is that a check which did not
run is never reported as passed.

**The walk runs twice** — once before the entry point is written and once after. See *The walk
runs twice* below; it is an ordering rule, and skipping the second run is the same failure as
skipping a check.

---

## Three states, never two

Every check reports **passed**, **failed**, or **not run** — and none is ever inferred from
another.

> **"No failures" and "nothing was checked" produce identical output if you only print
> failures.** That identity is exactly how a workspace ships looking complete and hollow.

So the report states **the number of checks that ran**, as an assertion in its own right:

```
All 12 checks ran; all 12 passed.
```

```
11 of 12 checks ran. Check 3 could not run: the blueprint library was not readable.
This workspace is NOT fully validated.
```

Never report the second case as a success with a footnote. It is not a success.

---

## The walk runs twice, and check 10 is the reason

**Check 10 reads the entry point. The entry point is the last file written. A check that did
not run forbids writing anything further.** Those three rules together are a deadlock: the
walk ran before the entry point existed, so check 10 could never run, so the entry point could
never be written — and every clean eight-round interview ended with no map, no hand-off, and
*"This workspace is NOT fully validated"*.

It is broken by **ordering, not by leniency**. Nothing here is ever reported as passed on the
strength of not having been performed.

| Pass | When | Question it answers |
|---|---|---|
| **First walk** | after the last round, before the entry point | *May the entry point be written?* |
| **Second walk** | after the entry point is written | *May success be claimed?* |

**The entry point may be written when every check has passed except check 10, and check 10's
only complaint is that the entry point does not exist yet.** That is the one not-run state
this permission tolerates, and it tolerates it because the file it is waiting for is the very
file about to be written.

**Every other not-run still blocks it.** An unreadable blueprint library or a missing manifest
blocks the entry point exactly as a failure does — a map to a workspace nobody could verify is
precisely what this rule exists to prevent.

Then **run the whole walk again.** The second run is where check 10 has something to read, and
success may be claimed only from that second result. Reporting the first walk as the finished
one is the same act as calling a check that did not run passed.

> `12 of 13 checks ran; 1 could not run. This workspace is NOT fully validated. Check 10 is
> waiting for the entry point: write it, then run the walk again.`

That line is an honest incomplete state **with a next step**, and saying so is the point. The
version without the last sentence is indistinguishable from a broken run, and a reader whose
only visible option is to stop will stop.

*(`instructions/integrity.md` runs its check twice for a comparable reason, and says so in the
same way. Neither is a retry.)*

---

## The twelve

| # | Check | What it proves |
|---|---|---|
| 1 | Every referenced identifier resolves to a definition in this workspace | The traceability chain is real, not decorative |
| 2 | No identifier is defined twice | A reused ID silently re-points a test, a task, and a matrix row |
| 3 | Every file ends with a back-link naming a blueprint in the library | The workspace can be audited against what produced it |
| 4 | No worked-example content survives | The developer has not inherited requirements about someone else's product |
| 5 | No surviving placeholder or instructional italic | The copy-then-fill method's characteristic failure |
| 6 | Every `[TODO]` has a matching `Q-###` row | A gap is a recorded question, not an abandoned sentence |
| 7 | No table row requiring a decision is blank | *We decided* is distinguishable from *nobody looked* |
| 8 | Every permission rule has at least one deny test | Allow-only tests pass on a system with no enforcement |
| 9 | Every driving characteristic has at least one fitness function | A driver without one is documented, not governed |
| 10 | The entry point is under 100 lines and its paths resolve | It is loaded into every later context window |
| 11 | No generated file contains application source code | BR-001, the defining boundary of this product |
| 12 | No credential appears, and `.gitignore` excludes `.env` | The one mistake here that cannot be undone |

**Twelve, fixed.** Not a rules engine, not a schema language, not configurable. Validation is
a supporting concern and is built simply — a check list that grows into a policy engine has
become a second product.

| 13 | Every blueprint was filled, or recorded as skipped with a reason | A workspace can be internally consistent and missing a whole document |

**Check 13 names every uncovered blueprint by path.** A count tells the developer something
is missing without telling them what, and the path is the only actionable part. See
`instructions/coverage.md`.

**A recorded skip is resolved against the manifest, not compared to it.** `coverage.md` shows
the skip row with a bare filename — `| 2026-08-04 | Skipped | frontend-component-spec.md |
API-only product |` — and the check matched it against full manifest paths with an exact
comparison, so a skip recorded exactly as documented matched nothing and its blueprint stayed
uncovered. Every API-only product failed check 13 for doing what it was shown.

**Both forms resolve now: the full manifest path, or the filename when the manifest holds
exactly one blueprint with that name.** A filename that names two is reported as ambiguous and
asks for the full path — resolving it to whichever came first would be a guess recorded as
coverage.

**The manifest's own permanent exclusion is named in the result, not applied in silence.**
`appendix-index.md` is never generated and never skipped; it is scaffolding rather than an
artifact of anyone's project. The check says so where the coverage claim is read, because an
exemption nobody can see is an exemption nobody can audit.

**The manifest lists two kinds of entry**, and only one of them is a blueprint: the blueprints
carry a checksum, and *Deliberately not packaged* carries a reason. A reader that takes both
hands this check six paths no run can ever fill, and check 13 then fails every possible
complete run. Read the table with the checksums.

*(Checks 14 and 15 — stage acceptance and library integrity — join the same walk from their
own modules. They report in the same three states.)*

### Check 2: a row that cites an identifier is not a second definition of it

**The traceability matrix is a table whose first column is the requirement ID, by design.** So
is the task index, the test plan, the release notes, and the traceability review. A check that
read every first-cell identifier as a definition reported *every requirement in the workspace*
as defined twice, the moment Round 8 filled the matrix — one failure line per requirement, on
correct work, with "go and delete the traceability chain" as the obvious repair.

A row is read as a **citation**, not a definition, when any of these holds:

| Shape | Example |
|---|---|
| the table declares two or more ID columns | `\| Req ID \| … \| Task ID \| Test ID \|` |
| the row cites two or more other identifiers | `\| REQ-F-001 \| … \| TEST-006, FTEST-001 \|` |
| no cell after the first holds prose | `\| REQ-001 \| ✔ \| ✔ \| ✔ \| ✔ \| \|` |

**This errs toward missing a duplicate rather than inventing one, deliberately.** A missed
reuse costs one identifier nobody caught. A false positive costs the whole check, because a
control that cries wolf on correct work is switched off within a week — and the genuine
findings go with it. The count of rows read as citations is reported, so the blind spot is
stated rather than hidden.

### Check 7: the row it is about has been touched, and not decided

**A row with every cell blank is a row nobody has opened, and check 5 already reports it** as
an unfilled placeholder. Check 7 asking the same question found nothing check 5 had not.

What it exists for is the row that was started and abandoned:

```
| Login | | | per IP + per account | 429 + `Retry-After` | |
```

The endpoint is named. The limit and the window are not. *We decided* is not distinguishable
from *nobody looked*, which is the whole of this check.

**Two or more adjacent empty cells, wherever they fall in the row.** A single gap is how a
legitimately sparse table reads — a traceability row with no code link yet, a matrix cell that
does not apply — and flagging those would fail correct work in every workspace that reaches
Round 8. A *run* of them is a decision nobody made.

### Check 8: the deny test is paired to the rule, per rule

**This check could not fail.** It counted the words *must not* and *cannot* across the whole
workspace and passed on one — and those are ordinary English. Forty-six of the library's
eighty-one blueprint bodies ship one; on a real workspace the matches included the column
header `| Role | Can do | Cannot do |`. A three-rule permission table with no denial test
anywhere passed, reporting *"27 denial statements"*.

The same words still mark a denial. The difference is entirely in **what the check is allowed
to read them in**:

- a **permission rule** is a `REQ-R-###` row, or a row of a table whose first column is *Role*
  or *Actor* — the two ways this library writes one
- a rule is a **denial** when its own row prohibits something, not when the document does
- a **deny test** is an `AC-###` or `*TEST-###` row that **cites that rule by identifier**

**Every denial rule needs a test that cites it**, and a rule set with no denial in it at all
fails outright — because an allow-only rule set passes identically on a system with no
enforcement, which is the sentence this check was written from. A role declared with an empty
*Cannot do* cell fails too: a role with nothing it cannot do is not a permission model.

### Check 9: ask the file that declares them

**A driver is a row in `driving-characteristics.md`, not a word that appears in a table.**

The check used to count any row anywhere beginning with a quality word — so `| Performance |
The dashboard must load within three seconds |`, an *example* row the requirements blueprint
keeps as content, was read as a declared driver. It then failed a workspace for having no
fitness function, a round before the file that declares drivers is written (BUG-018).

**A control that cries wolf on correct work is a control that gets switched off.** Where the
drivers file does not exist yet, the check reports **not run** — which blocks a success claim
exactly as firmly as a failure, and says something true while doing it.

**And it is asked per driver, from the driver's own row.** Having found the file, the check
then tested for any `FF-###` *anywhere in the workspace* — so one identifier in one file
proved that every driver was governed. Three drivers with the fitness-function cell filled for
the first one only passed, reporting *"3 drivers declared"*. The evidence is per row and sits
in the row; nothing read it.

That is BUG-013's shape exactly — the defect check 6 records below, where the existence of one
`Q-###` anywhere exempted every `[TODO]` in the workspace. **The row names its own fitness
function, or that driver is documented rather than governed**, and the failure names which
driver.

### Check 6: matching means matching

**A `[TODO]` pairs with the question that asks it** — never with the mere existence of a question
somewhere in the workspace. Two things count, and both are a real link a reader can follow:

- the marker **cites** a `Q-###` beside itself, or
- an open-question row **asks the same question**, in the same words

The second is the ordinary case, because step 4 writes the marker and the row from one source.

**"Beside itself" means inside the marker's brackets or in the row that carries it, and the
question it names has to exist.** It used to mean *within 300 characters*, which is byte
distance rather than a citation: an orphan one line below an unrelated question row paired
with it, and padding the gap to about five hundred characters flipped the same workspace to
failed without a word of either changing. A `Q-###` nobody wrote a row for is the orphan case
wearing an identifier, and it is reported as one.

**The rewritten check is stricter than the one it replaces, and that was the defect.** The old
rule went quiet as soon as one `Q-###` existed anywhere — and Round 2 creates the open-questions
file, so from the second round on it passed unconditionally (BUG-013). A check that exempts
every workspace old enough to break it is not a lenient check; it is an absent one that prints
a green line.

**Rewording one side and not the other now fails.** That is drift, and drift is what this check
is for — a marker whose question has quietly become a different question has no owner and no
deadline, while still looking recorded.

**A marker whose question is already *Answered* fails too, as stale.** Later rounds answer
questions earlier rounds marked, so this is the ordinary end of a marker's life, not an edge
case (BUG-014). A workspace holding a gap whose answer sits three files away is worse than one
holding an open gap — the open gap is honest, and the stale one teaches the reader that the
markers mean nothing.

**The two failures are reported apart, because their fixes are opposite:** an orphan needs a
question added, a stale marker needs the marker removed. One message for both would send half
its readers the wrong way.

---

## Retry once, then flag

A file that fails a **structural** check is re-filled **once**, from its blueprint.

If it fails again:

1. Mark the gap `[TODO: <the exact question>]`
2. Add the matching `Q-###` row
3. Name it in the closing report

**No third attempt.** A file that fails twice is evidence about the **instruction**, not about
the file — and retrying it a third time converts a diagnosable problem into a loop.

---

## Validation reports; it does not repair

Beyond that single re-fill, validation **changes nothing**. It does not edit a file to make a
check pass, and it does not adjust a check to match what it found.

A check that rewrites its input until it agrees is not a check.

---

## When a check cannot run

Say which one, and why:

> Check 3 could not run: the blueprint library was not readable, so back-link targets could
> not be resolved.

Then **do not claim success**, do not write the entry point, and do not print the hand-off
block. A partially validated workspace is a normal outcome and an honest one; a partially
validated workspace announced as finished is the failure this whole module exists to prevent.

**The one exception is check 10 on the first walk**, and it is an exception to the *writing*
half only — never to the claiming half. Check 10 is waiting for the entry point, so the first
walk cannot run it and the second walk can; write the file, walk again, and claim success from
the second result or from nothing. See *The walk runs twice*, above.

---

## The empty state, stated positively

Zero failures is reported as **an assertion**, never as silence:

> All 12 checks ran; all 12 passed.

Silence would be indistinguishable from a validation step that never happened — which is the
same failure as reporting only failures, arriving by a different route.
