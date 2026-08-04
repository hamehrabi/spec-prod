# Validation — twelve checks, before any claim of success

Run the whole walk over the finished workspace **before** saying anything worked, before the
entry point is written, and before the hand-off block is printed.

**The check that matters most is not any of the twelve.** It is that a check which did not
run is never reported as passed.

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

*(Checks 14 and 15 — stage acceptance and library integrity — join the same walk from their
own modules. They report in the same three states.)*

### Check 6: matching means matching

**A `[TODO]` pairs with the question that asks it** — never with the mere existence of a question
somewhere in the workspace. Two things count, and both are a real link a reader can follow:

- the marker **cites** a `Q-###` beside itself, or
- an open-question row **asks the same question**, in the same words

The second is the ordinary case, because step 4 writes the marker and the row from one source.

**The rewritten check is stricter than the one it replaces, and that was the defect.** The old
rule went quiet as soon as one `Q-###` existed anywhere — and Round 2 creates the open-questions
file, so from the second round on it passed unconditionally (BUG-013). A check that exempts
every workspace old enough to break it is not a lenient check; it is an absent one that prints
a green line.

**Rewording one side and not the other now fails.** That is drift, and drift is what this check
is for — a marker whose question has quietly become a different question has no owner and no
deadline, while still looking recorded.

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

---

## The empty state, stated positively

Zero failures is reported as **an assertion**, never as silence:

> All 12 checks ran; all 12 passed.

Silence would be indistinguishable from a validation step that never happened — which is the
same failure as reporting only failures, arriving by a different route.
