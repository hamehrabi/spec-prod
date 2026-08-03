# requirements.md — Requirements Document

> **Purpose (Ch. 4 §4.4):** Lists functional and non-functional requirements.
> **When you use it:** Before product and technical specs.
> **Source:** Ch. 5.

A useful requirement is **clear, testable, bounded, and traceable**.

**Project name:** spec-driven-devkit

**Problem statement:** *(from [`intent.md`](../01-intent/intent.md))* Developers building
production-intended applications with an AI coding assistant have no predefined
specification for the assistant to work inside, so they cannot tell what was built, whether
it matches their intent, or what it changed unasked. The system should give a developer a
ready-made spec-driven kit that turns a raw idea into a traceable specification workspace
inside their own repository.

**Primary users:**
- **Developer** — installs the kit and answers the intake, in their own repository
- **Intake agent** — the Claude Code session running the interview and writing the workspace
- **Build agent** — a later Claude Code session that reads the generated workspace and writes the developer's application code
- **Kit author** — maintains the blueprint library and releases versions

> **Vocabulary warning.** *The system* below always means **the kit**. What the kit produces
> is always called the **generated workspace**. The distinction is defined in
> [`project-brief.md`](../01-intent/project-brief.md) and requirements are ambiguous without it.

---

## 1. Functional requirements

Format: `REQ-F-###: [Actor] must be able to [action] [object] so that [outcome].`

### Installation and entry

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-001 | A developer must be able to install the kit into an existing repository using Claude Code's own plugin mechanism, so that no separate installer, script, account, or API key is required. | Must |
| REQ-F-002 | A developer must be able to start the guided intake with a single command, so that no setup step stands between installing the kit and using it. | Must |
| REQ-F-003 | The kit must ship the complete blueprint library inside the plugin, so that intake works with no network access. | Must |
| REQ-F-042 | The shipped blueprint library must be **byte-identical to its source** and carry an integrity manifest listing every blueprint with its checksum. The intake must **verify integrity before writing anything**, and must stop with a named failure if any blueprint is missing, altered, or unlisted. | Must |
| REQ-F-043 | The set of files a stage must produce must be **derived from the blueprint library**, not hardcoded in the intake instructions — so that adding a blueprint adds a required output without any change to orchestration. | Must |
| REQ-F-004 | The kit must state, before the first question, what is about to happen and roughly how many question rounds there will be, so that a developer can decide whether to start now. | Must |

### The interview — the core subdomain

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-005 | The intake agent must ask the developer questions in **rounds of at most four grouped questions**, so that related decisions are made together rather than one at a time. | Must |
| REQ-F-006 | Every multiple-choice question must present a **recommended option first, marked as recommended, with a one-line reason**, so that a developer who does not know the answer can proceed without guessing blindly. | Must |
| REQ-F-007 | The intake agent must accept a **free-text answer** on any question, so that a developer whose situation is not in the options is not forced into a wrong one. | Must |
| REQ-F-008 | The intake agent must ask at least one question that **cannot** be reduced to fixed options — the problem statement in the developer's own words — so that the workspace is grounded in their problem rather than in the option list. | Must |
| REQ-F-009 | The intake agent must **not ask a question whose answer is derivable** from an earlier answer, and must state the inference it made instead, so that the interview stays short and the developer can challenge the inference. | Must |
| REQ-F-010 | The intake agent must **stop and quote both statements** when two answers contradict each other, rather than silently choosing one, so that the developer resolves the conflict rather than discovering it in the generated files. | Must |
| REQ-F-011 | The intake agent must complete the interview in **no more than eight rounds**, recording anything still unknown as an open question rather than asking a ninth round. | Must |
| REQ-F-012 | The intake agent must ask the developer to name the **one capability they compete on**, so that a single core subdomain is identified and spec depth can be scaled against it. | Must |
| REQ-F-013 | The intake agent must **refuse more than three driving characteristics**, pushing back once with the reason and recording the rejected candidates, so that the generated workspace prioritises something. | Must |
| REQ-F-033 | A developer must be able to run the intake at an **express depth** that produces a thinner workspace in fewer rounds, so that a small or exploratory project is not forced to carry full depth. | Must |
| REQ-F-034 | Express depth must be a **parameter on the single intake flow** — not a second command, not a second code path, not a branch with its own file-writing logic — so that both depths are exercised by the same logic and neither can rot. | Must |

### Generating the workspace

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-014 | The intake agent must create the generated workspace at a **fixed folder at the repository root**, so that every relative link inside it is computable and a later agent always knows where to look. | Must |
| REQ-F-015 | The intake agent must **write files after each round, not at the end**, and report which files were written, so that an interrupted intake still leaves usable output. | Must |
| REQ-F-016 | Each generated file must use the **section structure of its blueprint** and end with a link back to that blueprint, so that the developer can see the original template and its worked example. | Must |
| REQ-F-017 | The intake agent must **scale the depth of each generated file to the subdomain class** of the area it describes — full chain for core, one page for supporting, integration contract only for generic. | Must |
| REQ-F-018 | The intake agent must assign **stable identifiers from the first file written** (`REQ-F-###`, `REQ-NF-###`, `REQ-R-###`, `BR-###`, `CON-###`, `AC-###`, `US-###`, `ADR-###`, `TASK-###`, `TEST-###`, `SEC-A-###`, `Q-###`, `FF-###`, `EV-###`, `RISK-###`) and keep them consistent across every file, so that the traceability matrix resolves. | Must |
| REQ-F-019 | The intake agent must record any fact it does not have as a **`[TODO]` marker naming the exact question**, and list it in the generated open-questions file, so that a gap is visible rather than filled with a guess. | Must |
| REQ-F-020 | The intake agent must write the generated workspace's **entry-point map file last**, after every file it points at exists, so that no link in it is broken on the day it is written. | Must |
| REQ-F-021 | The intake agent must produce, for every permission rule in the generated workspace, at least one **denial** test — not only an allow path. | Must |
| REQ-F-022 | The intake agent must produce, for every driving characteristic in the generated workspace, at least one **fitness function stated as an automated check with a threshold that fails a build**. | Must |
| REQ-F-038 | After each round's files are written, the intake agent must **present what that round produced and wait for the developer to accept it before asking the next round's questions**. The presentation must name the files written, the decisions recorded, every inference drawn instead of asking, and every `[TODO]` created. | Must |
| REQ-F-039 | At each acceptance gate the developer must be able to **accept**, **revise** (re-answer that round and rewrite its files), or **stop** (end the session leaving a resumable workspace). All three must leave the workspace in a valid, resumable state. | Must |
| REQ-F-040 | Every blueprint in the shipped library must, for each completed intake, either **produce a generated file** or be **recorded as deliberately skipped with a reason**. No blueprint may be silently unused. | Must |
| REQ-F-041 | Stage acceptance must be recorded as a dated row in the generated change-control artifact — **never in a state, progress, or approval file** (ADR-006). Which stages are accepted must be derivable by reading the workspace. | Must |

### Boundaries and safety

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-023 | The kit must **not write application source code** in the intake session — not even an illustrative sample. | Must |
| REQ-F-024 | The kit must **not write any file outside the generated workspace folder** without an explicit confirmation that names the file, so that an existing repository is never silently modified. | Must |
| REQ-F-025 | The kit must **not request blanket write permission**; it must allow the host's per-file confirmation to stand on a first run, so that the developer sees each file before it is created. | Must |
| REQ-F-026 | When the repository already contains a `CLAUDE.md` at its root, the kit must write its own entry point **inside the generated workspace** and print the exact line the developer can add to their existing file, so that their file is never touched. | Must |
| REQ-F-027 | The kit must **not copy any content from a blueprint's worked example** into a generated file. | Must |
| REQ-F-035 | The generated workspace is intended to be **committed to the developer's repository** as the project's source of truth. The kit must therefore **not modify the developer's `.gitignore`** and must not add an ignore rule for the workspace folder. | Must |
| REQ-F-036 | If the workspace folder already exists and is **not** a kit workspace, the intake must **stop, explain why, and offer to use an alternative folder name** — never writing into a folder it did not create. | Must |
| REQ-F-037 | A generated file that fails a structural check must be **re-filled once**. If it fails a second time, the gap must be marked `[TODO]` with a matching open question and named in the closing report — never retried indefinitely and never accepted silently. | Must |

### Resuming and finishing

| ID | Requirement | Priority |
|---|---|---|
| REQ-F-028 | When a generated workspace already exists, the intake agent must **read it, report which stages are complete, and resume from the first incomplete stage**, so that a developer never restarts an interview they partly finished. | Must |
| REQ-F-029 | The intake agent must **validate the generated workspace before reporting success**, and must not report success on checks it did not run. | Must |
| REQ-F-030 | The intake agent must report, on completion: how many files were created, which items are still `[TODO]` and why, every open question blocking coding, and anything it assumed rather than asked. | Must |
| REQ-F-031 | The intake agent must print a **hand-off instruction** naming the single command a developer gives in a fresh session to begin building. | Must |
| REQ-F-032 | A developer must be able to see **which round they are on and how many remain** at each step, so that the interview has a visible end. | Should |

---

## 2. Non-functional requirements

Format: `REQ-NF-###: [Quality condition with a measurable limit].`

| ID | Category | Requirement |
|---|---|---|
| REQ-NF-001 | Performance | The developer must never wait more than **one question round** to see written output. Files for round *N* exist on disk before round *N+1*'s questions are asked. |
| REQ-NF-002 | Security | No generated file may contain a credential, token, key, or password. The generated `.gitignore` must exclude `.env` and secret files before any `.env.example` is written. |
| REQ-NF-003 | Reliability | An intake interrupted at any point — closed session, cancelled write, machine restart — must leave a workspace that is **resumable, not corrupt**. Partial output is acceptable; a half-written file that claims to be complete is not. |
| REQ-NF-004 | Usability | A developer who has not read any documentation must be able to install the kit and answer the first round using only the command's own output. |
| REQ-NF-005 | Maintainability | Blueprint content and interview logic must be **separately changeable**. Editing a blueprint template must require no change to the question flow, and adding a question must require no change to a template. |
| REQ-NF-006 | Accessibility | All output is plain Markdown and plain terminal text, readable without colour. No meaning may be carried by colour or by a symbol alone. |
| REQ-NF-007 | Privacy | The kit makes **zero network calls** and adds no network dependency beyond what Claude Code already requires. Nothing about the developer's idea, repository, or generated workspace is transmitted or persisted outside their machine. |
| REQ-NF-008 | Portability | Behaviour must be **identical on Windows, macOS, and Linux**. No POSIX-only shell, no hard-coded `/` separator, no assumption of a case-sensitive filesystem. |
| REQ-NF-009 | Maintainability | The generated entry-point file must be **under 100 lines**, because it is loaded into every later context window. |

> **Do not write impossible quality claims.** Avoid "the app must never fail" or "the
> system must always be fast." Replace them with measurable expectations, known limits,
> and graceful failure behavior.

---

## 3. User roles and permissions

Format: `REQ-R-###`. Define these **before** design begins, or the agent may build
features that expose data to the wrong users.

There is no login and no account in this product. The roles below are **actor boundaries**:
who or what may do which action, enforced by the kit's own rules rather than by
authentication. They are written as roles because they produce the same obligation — every
"can do" needs a matching denial test.

| Role | Can do | Cannot do |
|---|---|---|
| **Developer** | Start, answer, interrupt, and resume the intake. Choose any option or type their own. Hand-edit any generated file afterwards. Approve or decline every file write. | Cannot make the kit write application code. Cannot skip a stage — only reduce its depth. |
| **Intake agent** | Ask questions. Create and update files **inside** the generated workspace folder. Read blueprint templates. Read the developer's repository to detect an existing workspace or an existing `CLAUDE.md`. | Cannot write application source code. Cannot write outside the workspace folder without a confirmation naming the file. Cannot modify the developer's existing `CLAUDE.md`. Cannot invent a fact. Cannot report success on unrun checks. Cannot exceed eight rounds. |
| **Build agent** *(a later session, governed by the generated workspace)* | Change the files a task file lists as allowed. Add or update tests derived from acceptance criteria. | Cannot change a file outside the task's allowed list without saying so first. Cannot weaken or delete a test to make something pass. Cannot reverse an ADR silently. Cannot write code with no requirement behind it. |
| **Kit author** | Add, edit, and version blueprint templates. Change the question flow. Release new versions. | Cannot ship a change to a blueprint that breaks an existing generated workspace's blueprint links without a migration note. |

| ID | Role requirement |
|---|---|
| REQ-R-001 | The system must recognise the four actor boundaries above and enforce the "cannot" column of each. |
| REQ-R-002 | The intake agent must not create, modify, or delete any file outside the generated workspace folder without an explicit confirmation naming that file. |
| REQ-R-003 | The intake agent must not produce a file containing application source code, in any language, in any folder, at any stage of intake. |
| REQ-R-004 | A developer must be able to decline any individual file write and have the intake continue in a resumable state, rather than fail. |
| REQ-R-005 | The generated workspace must instruct the build agent that it may change only the files its current task file lists, and must state what happens when it needs one that is not listed: stop and ask. |

Full permission matrix and enforcement rules → [`technical-spec.md`](../04-technical-spec/technical-spec.md)

---

## 4. Business rules

Policy decisions the software must enforce. Write them **separately from code
instructions** — when the rule changes you update the spec first, then the tests and code.

| ID | Rule | Why it matters |
|---|---|---|
| BR-001 | The kit never writes application source code during intake. | It is the defining boundary of the product. A kit that writes code has become the thing it exists to control. |
| BR-002 | No content from a blueprint's worked example may appear in a generated file. | Example content reads as a decision. A developer would inherit requirements they never made, about a product that is not theirs. |
| BR-003 | An unknown fact is written as `[TODO: <the exact question>]` and listed in the generated open-questions file. It is never guessed, and never filled with a plausible-looking default. | An invented metric or compliance requirement is indistinguishable from a real one once written down, and becomes a silent assumption the build agent acts on. |
| BR-004 | The interview stops at eight rounds. Anything still unknown becomes an open question. | Without a hard stop the interview expands to fit the ambiguity, and the developer abandons it — the primary risk, RSK-1. |
| BR-005 | Files are written after each round. Nothing is held until the end. | An interrupted intake must leave value behind, not nothing. |
| BR-006 | The generated entry-point file is written last and is under 100 lines. | It is written last so its links are verifiable; it is short because it is loaded into every context window, and a long one stops being read. |
| BR-007 | Every identifier is unique within a generated workspace and is never reused, including after the item it named is deleted. | A reused ID silently re-points a test, a task, and a traceability row at something else. |
| BR-008 | A write outside the generated workspace folder requires explicit confirmation naming the file and showing what would change. | The developer's repository is not the kit's to edit. This is the promise that makes the kit safe to try on real work. |
| BR-009 | The intake does not report success on checks it did not run. | Reporting an unverified workspace as complete is how a hollow workspace ships (RSK-2). |
| BR-010 | A generated workspace must not contain a driving characteristic without at least one fitness function, or a permission rule without at least one denial test. | These are the two places where governance is either enforced or decorative. Prose thresholds and allow-only tests are decoration. |
| BR-011 | A generated workspace may name at most three driving characteristics. | Six drivers means none. The rejected list is the evidence that a decision was made. |
| BR-012 | When two developer answers contradict each other, the intake stops and quotes both. It does not choose. | The developer owns the contradiction. Resolving it silently transfers a product decision to the agent. |
| BR-013 | Spec depth is set by the subdomain map, not applied uniformly. | Writing core-depth specs for a supporting area is the failure that makes the whole method feel like paperwork. |
| BR-014 | The kit does not transmit or persist any developer data outside their machine, including for error reporting or usage measurement. | It is a promise to the user, not an implementation detail. See Q-002 — this rule is what makes SM-2 unmeasurable. |

---

## 5. System constraints

Maintained in [`constraints-and-non-goals.md`](../01-intent/constraints-and-non-goals.md).
Referenced here as `CON-###`.

| ID | Constraint | Affects requirements |
|---|---|---|
| CON-001 | Ships as a Claude Code plugin; no server, no database | REQ-F-001, REQ-F-003, REQ-F-028 |
| CON-002 | v1 buildable in two to four weeks | Priority of every `Should`; scope of REQ-F-032 |
| CON-003 | No network calls at runtime | REQ-F-003, REQ-NF-007, BR-014 |
| CON-004 | Identical on Windows, macOS, Linux | REQ-NF-008, REQ-F-001 |
| CON-005 | Never modify an existing file unasked | REQ-F-024, REQ-F-025, REQ-F-026, REQ-R-002, BR-008 |
| CON-006 | No paid services or API keys | REQ-F-001, REQ-F-003 |
| CON-007 | Developer data stays local; no telemetry | REQ-NF-007, BR-014 |
| CON-008 | `[TODO: team size and plugin-internals experience — see Q-008]` | — |

---

## 6. Acceptance criteria

Format: Given–When–Then. These become the acceptance tests in
[`acceptance-tests.md`](../../03-tests/02-functional/acceptance-tests.md).

| ID | Requirement | Criterion |
|---|---|---|
| AC-001 | REQ-F-001 | **Given** a repository with no prior setup and no network access beyond Claude Code, **When** the developer installs the kit through the plugin mechanism, **Then** the kit is available and no account, key, or download was required. |
| AC-002 | REQ-F-002 | **Given** the kit is installed, **When** the developer runs the intake command, **Then** the interview begins without any intermediate configuration step. |
| AC-003 | REQ-F-004 | **Given** a fresh intake, **When** it starts, **Then** the developer is told what will happen and roughly how many rounds there will be, before the first question. |
| AC-004 | REQ-F-005, REQ-F-006 | **Given** any question round, **When** it is presented, **Then** it contains at most four questions and every multiple-choice question lists a recommended option first with a one-line reason. |
| AC-005 | REQ-F-007 | **Given** a question whose options do not fit the developer's situation, **When** they supply their own answer instead, **Then** it is accepted and used, and no option is substituted for it. |
| AC-006 | REQ-F-009 | **Given** an answer that determines a later question, **When** intake reaches that question, **Then** it is not asked, and the inference drawn is stated to the developer. |
| AC-007 | REQ-F-010 | **Given** two developer answers that cannot both be true, **When** intake detects the conflict, **Then** it stops, quotes both statements, and asks the developer to resolve it — and does not pick one. |
| AC-008 | REQ-F-011, BR-004 | **Given** an intake that still has unknowns after eight rounds, **When** the eighth round completes, **Then** no ninth round is asked and every remaining unknown appears in the generated open-questions file. |
| AC-009 | REQ-F-013, BR-011 | **Given** a developer who selects more than three driving characteristics, **When** they submit, **Then** intake pushes back once with the reason, accepts at most three, and records the rejected candidates. |
| AC-010 | REQ-F-014 | **Given** any repository, **When** intake creates the workspace, **Then** it is at the documented fixed folder at the repository root. |
| AC-011 | REQ-F-015, BR-005 | **Given** an intake interrupted immediately after round three, **When** the developer inspects the repository, **Then** the files for rounds one to three exist on disk and are readable. |
| AC-012 | REQ-F-016 | **Given** any generated file, **When** it is opened, **Then** its section structure matches its blueprint and its final line links to that blueprint. |
| AC-013 | REQ-F-018 | **Given** a completed workspace, **When** every identifier referenced in a task or test is looked up, **Then** it exists in the generated requirements file. |
| AC-014 | REQ-F-019, BR-003 | **Given** a fact the developer never supplied, **When** intake writes the file needing it, **Then** the file contains a `[TODO]` naming the exact question and the open-questions file lists it — and no plausible value was substituted. |
| AC-015 | REQ-F-020, REQ-NF-009 | **Given** a completed workspace, **When** the entry-point file is checked, **Then** it is under 100 lines and every path in it resolves to a file that exists. |
| AC-016 | REQ-F-021, BR-010 | **Given** a generated workspace containing a permission rule, **When** its tests are checked, **Then** at least one denial test exists for that rule. |
| AC-017 | REQ-F-022, BR-010 | **Given** a generated workspace naming a driving characteristic, **When** its fitness functions are checked, **Then** at least one automated check with a build-failing threshold exists for it. |
| AC-018 | REQ-F-023, BR-001 | **Given** any complete intake, **When** every generated file is inspected, **Then** none contains application source code in any language. |
| AC-019 | REQ-F-024, BR-008 | **Given** an intake that would write outside the workspace folder, **When** it reaches that write, **Then** it stops and asks, naming the file and showing what would change. |
| AC-020 | REQ-F-025 | **Given** a first run, **When** files are written, **Then** the developer is prompted per file and no blanket write permission was requested. |
| AC-021 | REQ-F-026 | **Given** a repository that already has a root `CLAUDE.md`, **When** intake completes, **Then** that file is byte-for-byte unchanged and the developer has been shown the exact line they may add. |
| AC-022 | REQ-F-027, BR-002 | **Given** a completed workspace, **When** it is searched for the blueprint worked example's product name, **Then** there are no matches. |
| AC-023 | REQ-F-028 | **Given** a workspace complete through round four, **When** the developer runs intake again, **Then** it reports rounds one to four complete and asks round five's questions — and does not re-ask round one. |
| AC-024 | REQ-F-029, BR-009 | **Given** a workspace with a requirement ID referenced by a task but absent from the requirements file, **When** intake reaches its validation step, **Then** it reports that failure and does not claim success. |
| AC-025 | REQ-F-030 | **Given** a completed intake, **When** it reports, **Then** the report states the file count, every remaining `[TODO]`, every blocking open question, and every assumption made rather than asked. |
| AC-026 | REQ-NF-003 | **Given** an intake cancelled mid-write, **When** the developer resumes, **Then** intake identifies the incomplete stage and continues — and no file claims to be complete while containing a partial section. |
| AC-027 | REQ-NF-007, BR-014 | **Given** a complete intake run with network access blocked at the operating system, **When** it finishes, **Then** it completed successfully and made no outbound request. |
| AC-028 | REQ-NF-008 | **Given** the same answers supplied on Windows, macOS, and Linux, **When** each intake completes, **Then** the generated workspaces differ only in line endings, and every relative link resolves on all three. |
| AC-029 | REQ-R-004 | **Given** a developer who declines one file write, **When** they decline, **Then** intake continues and the workspace remains resumable rather than failing. |
| AC-030 | REQ-F-017, BR-013 | **Given** an area classified as supporting in the generated subdomain map, **When** its specification is written, **Then** it is one page with acceptance-level tests, not the full chain given to the core area. |
| AC-031 | REQ-F-033 | **Given** a developer who selects express depth, **When** intake completes, **Then** the workspace is thinner and took fewer rounds than the default depth — and every structural rule still holds: identifiers resolve, blueprint links resolve, and unknowns are `[TODO]` with matching open questions. |
| AC-032 | REQ-F-034 | **Given** the built kit, **When** its intake paths are counted, **Then** exactly one intake command and one end-to-end execution path exist, with depth passed as an argument rather than selecting a different flow. |
| AC-033 | REQ-F-035 | **Given** a repository with an existing `.gitignore`, **When** a complete intake finishes, **Then** that file is byte-for-byte unchanged and no rule ignoring the workspace folder was added anywhere. |
| AC-034 | REQ-F-036 | **Given** a repository whose `spec/` folder contains unrelated files, **When** intake starts, **Then** it stops before writing anything, explains that the folder is not a kit workspace, and offers an alternative name — and `spec/` is unchanged. |
| AC-035 | REQ-F-037 | **Given** a generated file that fails a structural check twice, **When** intake finishes, **Then** the file carries a `[TODO]`, a matching `Q-###` row exists, the closing report names it, and no third attempt was made. |
| AC-036 | REQ-F-038 | **Given** a round whose files have just been written, **When** the round completes, **Then** intake presents the files written, the decisions recorded, every inference drawn, and every `[TODO]` created — and **does not ask the next round's questions until the developer responds**. |
| AC-037 | REQ-F-039 | **Given** an acceptance gate, **When** the developer chooses **revise**, **Then** that round's questions are asked again, that round's files are rewritten in place, and the gate is presented again — and no later round's files are affected. |
| AC-038 | REQ-F-039 | **Given** an acceptance gate, **When** the developer chooses **stop**, **Then** the session ends, every accepted round's files remain on disk, and re-running intake resumes at the unaccepted round. |
| AC-039 | REQ-F-040 | **Given** a completed intake, **When** every blueprint in the shipped library is checked, **Then** each one either produced a generated file or appears in the workspace's skipped-blueprint record with a reason — and the count of silently unused blueprints is **zero**. |
| AC-040 | REQ-F-041, ADR-006 | **Given** a workspace with rounds 1–4 accepted, **When** the file listing is inspected, **Then** four dated acceptance rows exist in the generated change-control artifact and **no acceptance, progress, or approval file exists anywhere**. |
| AC-041 | REQ-F-038, REQ-NF-003 | **Given** a session that ends after round 4's files were written but **before** the developer accepted them, **When** intake is re-run, **Then** it re-presents round 4's acceptance gate rather than re-asking round 4's questions or advancing to round 5. |
| AC-042 | REQ-F-042 | **Given** an installed plugin with one blueprint altered by a single byte, **When** intake starts, **Then** it stops **before writing anything**, names the altered blueprint, and does not proceed on a "close enough" match. |
| AC-043 | REQ-F-042 | **Given** a complete intake, **When** every blueprint file in the plugin is checksummed before and after, **Then** all checksums are unchanged — the library was read and never written. |
| AC-044 | REQ-F-043 | **Given** a new blueprint added to the library and listed in the integrity manifest, **When** intake runs, **Then** that blueprint produces a generated file or a recorded skip — with **zero** changes made to the intake instruction set. |

---

## 7. Open questions

→ [`open-questions.md`](../01-intent/open-questions.md)

Q-001, Q-004, and Q-005 were **closed** in Round 3 and are reflected above (validation is
intake-only; an existing `CLAUDE.md` is never touched; the workspace has a fixed root
folder). Q-002, Q-003, Q-006, Q-007, and Q-008 remain open.

---

## Requirement quality checklist (Ch. 5)

| Check | Question | ✔ |
|---|---|---|
| Clear | Can you understand the requirement without guessing? | [x] |
| Actor defined | Does it say who performs the action? | [x] |
| Action defined | Does it say exactly what must happen? | [x] |
| Bounded | Does it avoid hidden extra features? | [x] |
| Testable | Can you prove whether it works? | [x] |
| Traceable | Can it become a task, test, and code change later? | [x] |
| No implementation leak | Does it avoid technical decisions that belong in the technical spec? | [x] — the fixed workspace folder is named in the technical spec, not here |

> **The safest habit:** before you send requirements to an AI agent, read each one and ask
> "could two people interpret this differently?" If yes, rewrite it.

---

**Next:** [`product-spec.md`](../03-product-spec/product-spec.md)

> Blueprint: ../../../spec-driven-template/01-docs/02-requirements/requirements.md
