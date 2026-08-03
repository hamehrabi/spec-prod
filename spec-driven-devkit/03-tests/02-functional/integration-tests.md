# Integration Test Plan

> Source: Ch. 4 §4.6, Ch. 17 §17.3, Ch. 18 §18.6.
> Integration tests check whether **separate parts of the system work together** — when a
> requirement depends on more than one component: an API endpoint, a database table, and
> an authentication rule.

Generating a specification file is not just a file write. The instruction set must select
the blueprint, copy it, strip the worked example, fill every placeholder, mint identifiers,
emit a back-link at the right depth, and pass the boundary check. That is integration
behavior.

> **The integration points here are the three contracts** in
> [`api-specification.md`](../../01-docs/06-api-and-data-design/api-specification.md):
> command (C1), blueprint → artifact (C2), and workspace → build agent (C3). Each has two
> sides that can break each other silently.

---

| Test ID | Requirement | Integration point | Scenario | Expected result | Side effect to verify | Status |
|---|---|---|---|---|---|---|
| TEST-001 | REQ-F-001 | Plugin + host | Install into a clean repository | Command is registered and available | **No file created anywhere** — installing is not running | Planned |
| TEST-002 | REQ-F-002 | Command + host (C1) | Invoke with no arguments | Preamble then Round 1 | `spec/` created; nothing outside it | Planned |
| TEST-003 | REQ-F-003 | Plugin + filesystem | Read every blueprint with the network blocked | All ~90 read from local disk | Zero outbound requests | Planned |
| TEST-004 | REQ-F-014 | Command + filesystem | Complete an intake | Workspace at `spec/` at the repository root | **Nothing written outside `spec/`** | Planned |
| TEST-005 | REQ-F-016 | Blueprint + artifact (C2) | Generate one file from one blueprint | Headings match the blueprint, in order | The blueprint file itself is **unmodified** | Planned |
| TEST-006 | REQ-F-016 | Blueprint + artifact (C2) | Check the back-link on files at three different depths | Each resolves to a real blueprint | Blueprint library unchanged | Planned |
| TEST-007 | REQ-F-018 | Artifact + artifact | Mint identifiers across a whole workspace | Every ID unique; every reference resolves | No ID reused after a deletion | Planned |
| TEST-008 | REQ-F-019 | Artifact + open-questions | Withhold a fact | `[TODO]` in the file **and** a matching `Q-###` row | No substituted value anywhere in that file | Planned |
| TEST-009 | REQ-F-020 | Workspace + entry point (C3) | Finish an intake | Entry point exists, under 100 lines, all paths resolve | It was written **after** every file it links to | Planned |
| TEST-010 | REQ-F-021 | Workspace + tests (C3) | Inspect a generated workspace's permission rules | Each has ≥1 deny test | — | Planned |
| TEST-011 | REQ-F-022 | Workspace + fitness functions (C3) | Inspect a generated workspace's drivers | Each has ≥1 build-failing fitness function | — | Planned |
| TEST-012 | REQ-F-023, BR-001 | Command + filesystem | Complete an intake | No generated file holds application source code | No source file created in any folder | Planned |
| TEST-013 | REQ-F-026 | Command + existing repo | Intake in a repo with a root `CLAUDE.md` | Kit's entry point is inside `spec/`; the line to add is printed | **Their `CLAUDE.md` checksum is unchanged** | Planned |
| TEST-014 | REQ-F-027, BR-002 | Blueprint + artifact (C2) | Search a workspace for example content | Zero occurrences of the example product name or `# WORKED EXAMPLE` | Blueprint still contains its example | Planned |
| TEST-015 | REQ-F-029 | Workspace + validation | Validate a workspace with a dangling identifier | Reports the check as **failed**, naming file and ID | **No success claim emitted** | Planned |
| TEST-016 | REQ-NF-002 | Artifact ordering | Generate `.gitignore` and `.env.example` | `.gitignore` exists first and excludes `.env` | No credential in either file | Planned |
| TEST-017 | REQ-NF-005 | Question set + blueprint library | Change one question; separately change one blueprint | Each change compiles alone | **Zero files changed in the other module** | Planned |
| TEST-018 | REQ-R-005 | Workspace + task files (C3) | Inspect every generated task file | Each names allowed **and** forbidden files | — | Planned |

---

## Integration points to cover (Ch. 17 §17.3)

| Integration point | What you should verify | Applies here? |
|---|---|---|
| API + database | A valid request creates the right record and returns the correct response. | **Translated:** a filled blueprint produces the right artifact at the right path. TEST-005, TEST-006. |
| Authentication + API | Only an authenticated user can perform the action. | **n/a** — no authentication exists (`security-specification.md` §1). |
| Authorization + API | Only a permitted role can perform the action. | **Yes** — the boundary check. Covered as denials in [`security-tests.md`](../03-non-functional/security-tests.md). |
| Validation + response handling | Invalid input returns a clear error **without creating bad data**. | **Yes, and it is the most important row.** TEST-004, TEST-013, TEST-015. |
| Service + external dependency | Dependency success, failure, and timeout. | **Partly** — the host is the only dependency; failure is a missing blueprint (FTEST-004). No timeouts exist. |
| Job + queue | A queued job runs, retries, and records its status. | **n/a** — no jobs, no queue (`reliability-specification.md` §6). |

---

## Contract tests — C2, blueprint → generated artifact

A strong contract test does not only ask whether the file appeared. It checks the structure,
the removals, the fills, the identifiers, the back-link, **and the side effects** — including
the side effects that must *not* have happened.

| Test name | Input | Expected result | Side effect to verify |
|---|---|---|---|
| Structure is preserved | A blueprint with 14 sections | All 14 headings present, in the blueprint's order | The blueprint file is byte-for-byte unmodified |
| Worked example is removed | A blueprint with a `# WORKED EXAMPLE` section | That heading and everything after it are absent | The blueprint still contains its own example |
| Placeholders are filled | A blueprint with 30 placeholders | Zero placeholder tokens and zero instructional italics survive | — |
| Unknowns become gaps | A fact the developer never supplied | `[TODO: <exact question>]` present | A matching `Q-###` row exists in the open-questions file |
| Back-link depth is right | Files at depths 1, 2, and 3 | Each back-link resolves | — |
| Identifiers are minted once | Two files defining IDs | No ID defined twice | Every reference elsewhere resolves |
| **Generic prompt boxes are removed** | A blueprint containing "paste your idea here" | Absent from the artifact | The adapted prompts appear in `06-agent/03-prompts/` instead |

---

## The assertion pattern this project needs most

The worked example in the blueprint makes the point that a status code alone can look right
while the side effect is wrong. **The same trap exists here in a sharper form**, because the
side effect is someone else's file:

```
For every test that involves a write, assert BOTH halves:

  1. The thing that should have happened, happened.
       -> spec/01-docs/01-intent/intent.md exists and matches its blueprint

  2. The thing that must NOT have happened, did not.
       -> checksum(<repo>/CLAUDE.md)  is unchanged
       -> checksum(<repo>/.gitignore) is unchanged
       -> the set of files outside spec/ is IDENTICAL before and after
       -> no file inside the installed plugin was modified
       -> no state, progress, session, or cache file exists anywhere

Half 2 is the half that catches real defects. An intake that produced a perfect
workspace AND quietly appended to the developer's CLAUDE.md would pass every
test that only checks half 1.
```

**Written out — the test that would catch the worst plausible defect:**

```
TEST-013
Requirement: REQ-F-026
Integration point: command + an existing repository

Given  a repository containing:
         CLAUDE.md   (checksummed before the run)
         .gitignore  (checksummed before the run)
         src/        (a file listing taken before the run)
When   a complete intake runs to the closing report
Then   spec/ contains the workspace, including the kit's own entry point
And    the exact line the developer may add to CLAUDE.md was printed
And    checksum(CLAUDE.md)  is IDENTICAL to before        <- the real assertion
And    checksum(.gitignore) is IDENTICAL to before        <- the real assertion
And    the file listing outside spec/ is IDENTICAL to before
And    no write to CLAUDE.md was ever proposed, not even for approval

Evidence: both checksums before and after, the full outside-spec/ file listing,
          the printed line, the complete list of proposed writes
Status: Planned
```

> **Why the last clause is separate from the checksum.** A run that *proposed* a write to
> their `CLAUDE.md` and had it declined would leave the checksum unchanged and still be a
> defect — REQ-F-026 forbids proposing it at all. The checksum proves nothing happened; the
> proposal log proves nothing was attempted.

Executable tests live in [`../05-executable/integration/`](../05-executable/integration).

---

## Contract tests — C3, workspace → build agent

These are the ten guarantees in `api-specification.md` §C3, tested as a set against every
golden workspace. They are grouped here rather than split into ten tests because they share
one fixture and one walk.

| Guarantee | Assertion | Test |
|---|---|---|
| Entry point exists at the workspace root | File present | TEST-009 |
| Under 100 lines; every path resolves | Line count and path resolution | TEST-009 |
| Every referenced identifier resolves | Zero dangling | TEST-007 |
| No identifier defined twice or reused | Zero duplicates | TEST-007 |
| Task files name allowed **and** forbidden files | Both lists present in each | TEST-018 |
| Every permission rule has a deny test | Count ≥ 1 per rule | TEST-010 |
| Every driver has a fitness function | Count ≥ 1 per driver | TEST-011 |
| Every `[TODO]` has a `Q-###` row | Zero orphans | TEST-008 |
| Plugin version is recorded | Present and matches the manifest | TEST-009 |
| No application source code | Zero source files | TEST-012 |

> Blueprint: ../../../spec-driven-template/03-tests/02-functional/integration-tests.md
