# Prompt Library

> Source: Ch. 25, Appendix J.
> Prompts adapted to **this** project's stack, identifiers, and rules. Generic prompts are
> worse than none — they invite generic answers to a specific project.

---

## 1. Start a task

```
Read spec/CLAUDE.md, then implement TASK-### only.

Before changing anything: restate the task, list the files you will touch, and name
every assumption. Then wait.

Constraints for this project:
- No script, package manifest, lockfile, or dependency (ADR-002). If the task appears
  to need executable code, the task is wrong - stop and ask.
- No state, progress, session, cache, or answer file (ADR-004).
- Never edit spec/ in this repository. It is the specification, not the product.
- Only the files this task's allowed list names.
```

## 2. Review a change against the spec

```
Review this change against spec/.

Requirement: REQ-###
Change: [paste the diff]

Check, in order:
1. Does it do ONLY what REQ-### asks?
2. Does it reverse ADR-001, ADR-002, ADR-003, ADR-004, or ADR-005?
   Check specifically: a script? a state file? question text inside a blueprint?
3. Were any files changed outside the task's allowed list?
4. Do the tests come from acceptance criteria, or from the change itself?
5. Does any test assert generated PROSE rather than structure?

Report problems first. Do not rewrite anything until you have listed them.
```

## 3. Write tests before implementation

```
Using ONLY the acceptance criteria below, write the test plan for REQ-###.
Do not implement anything.

Acceptance criteria: [paste from requirements.md §6]

Rules for this project:
- Assert structure, never generated prose - the system is non-deterministic (ADR-002).
- Every write test asserts the NEGATIVE half: files outside spec/ unchanged, by checksum.
- Every permission rule needs a DENY test, and it must be seen to FAIL before it is trusted.
- Give one normal, one edge, and one failure case.

Return: test ID, level, preconditions, input, expected result, and "must NOT happen".
```

## 4. Find the hidden assumptions

```
Review the specification below. List missing details, contradictions, risky assumptions,
and anything two competent developers could build differently. Do not implement anything.

Specification: [paste]

Pay particular attention to:
- Ordering that is stated as a list but is actually load-bearing
- Rules that say what to do but not what NOT to do
- Anything phrased as "handle appropriately" or "as needed"

Return: missing details · contradictions · questions I should answer · safe assumptions.
```

## 5. Draft an ADR

```
Draft an ADR for [the decision], using spec/01-docs/05-architecture/architecture-decisions/
ADR-000-template.md.

Requirements:
- Compare at least TWO GENUINELY DIFFERENT options - not one option and two strawmen.
- Name a real trade-off. If no downside is visible, keep looking: a choice with no cost
  was compared in the abstract rather than weighted for this context. Say so out loud
  rather than writing a one-sided ADR.
- Fill the Compliance field with a fitness function ID, or "manual review by <role>".
- Fill "Revisit when" with an OBSERVABLE change, not a date.
- End with the rule the AI assistant must follow - it must also go in AGENT.md.
```

## 6. Debug — evidence first

```
Do not propose a fix yet.

Expected:   [from the requirement or acceptance criterion]
Actual:     [quoted from the output, not paraphrased]
Failing test: [test ID, or "none exists" - if none, we write it first]
Evidence:   [report text / file listing / checksums]
Repro:      [version, platform, answer script, repository fixture]
Reproduced: [how many times - this system is non-deterministic; once may be variance]

Tell me:
1. The root cause in one sentence - NOT a restatement of the symptom.
2. Whether this is a rule that is WRONG, or a rule that is RIGHT and was not followed.
   Those need different fixes.
3. Which test should have caught it, and if it exists, why it passed.
4. Whether this class of defect could exist elsewhere.
```

## 7. Check for scope creep

```
Compare this change against TASK-###.

List anything present in the change that the task did not ask for. For each, say whether
it is:
  (a) required by the task and merely unstated,
  (b) a scope change that needs to go through scope-change-log.md, or
  (c) unrequested and should be removed.

Include files, rules, questions, checks, and tests. Be specific; "minor tidying" is (c)
until proven otherwise.
```

## 8. Evaluate a question change

```
I am changing this question in the intake:

BEFORE: [paste]
AFTER:  [paste]

Before running the golden set, tell me:
1. Which generated file(s) does this question's answer feed?
2. Does the change alter what can be INFERRED from it later? (REQ-F-009 / DD-007)
3. Could a developer now answer in a way the old question prevented?
4. Which of the 36 eval cases would exercise the difference?

Then I will run the golden set. Do not assume clearer wording is better wording - that
is what the eval set is for.
```

---

## Prompt rules for this project

| Rule | Why |
|---|---|
| **Always name the task or requirement ID.** | An agent without one will infer scope, and inferred scope expands. |
| **Always say "do not implement yet" when you want analysis.** | Otherwise you get a change instead of an answer. |
| **Name the three prohibitions explicitly** — no script, no state file, no editing `spec/`. | They are the three most likely well-intentioned violations, and each supersedes an ADR. |
| **Ask for problems before rewrites.** | A rewrite hides what was wrong. |
| **Never ask "is this good?"** | Ask what it fails to satisfy, and name what it should satisfy. |

> Blueprint: ../../../spec-driven-template/06-agent/03-prompts/prompt-library.md
