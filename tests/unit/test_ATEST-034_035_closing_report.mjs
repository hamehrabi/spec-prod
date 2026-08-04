// ATEST-034/035, ETEST-003/010 — the closing report and hand-off block.
// Requirement: REQ-F-030, REQ-F-031 · BR-009.
//
// The assumptions section is the only part of this a developer cannot reconstruct. Every
// other fact is somewhere in the workspace; what the intake assumed rather than asked exists
// nowhere else, and once the report scrolls past it is gone.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { validate, report as reportLine } from '../../ci/validation.mjs'

const doc = readFileSync('plugin/instructions/report.md', 'utf8')
const intake = readFileSync('plugin/instructions/intake.md', 'utf8')

test('ATEST-034: all five sections are named', () => {
  for (const section of [
    /What was created/i,
    /What is still `\[TODO\]`/i,
    /Which open questions block coding/i,
    /What was assumed rather than asked/i,
    /Where the entry point is/i,
  ]) {
    assert.match(doc, section)
  }
})

test('the assumptions section is identified as the one irreplaceable part', () => {
  assert.match(doc, /the only part they cannot reconstruct for themselves/i)
  // Because the developer saw those notices once, in passing, several rounds ago.
  assert.match(doc, /saw them once, in passing, several\s*\n?rounds ago/i)
  assert.match(doc, /exists\s*\n?nowhere else/i)
})

test('an incomplete assumptions list is worse than none', () => {
  // It implies completeness, which is the specific harm.
  assert.match(doc, /worse than no list\*\*, because it implies completeness/i)
  assert.match(doc, /say that instead of listing some/i)
})

test('every empty section is stated as a sentence, never left blank', () => {
  assert.match(doc, /No open `\[TODO\]` markers/)
  assert.match(doc, /No open question blocks starting work/)
  assert.match(doc, /No assumptions were made; every fact came from an answer/)
  assert.match(doc, /A blank section reads as a section\s*\n?that was forgotten/i)
  // The reader cannot otherwise tell "nothing to report" from "nobody looked".
  assert.match(doc, /nothing to report\* and\s*\n?\*nobody looked/i)
})

test('the file count is counted, never asserted', () => {
  assert.match(doc, /\*\*Count them\*\* — never state a number without having counted/i)
})

// --- BR-009: the hand-off is gated on validation -------------------------------------------

test('ATEST-035 / BR-009: a failed or unrun check suppresses the hand-off', () => {
  assert.match(doc, /Gate it on validation, first/i)
  assert.match(doc, /do not print the hand-off block/i)
  assert.match(doc, /handing\s*\n?off an unvalidated workspace is how it gets built from/i)
  // The report still runs — only the hand-off is withheld.
  assert.match(doc, /The report still runs\. \*\*The hand-off does not\.\*\*/i)
  assert.match(intake, /print no hand-off block/i)
})

test('BR-009: the gate is driven by the same rule the validator enforces', () => {
  // A workspace with a not-run check has zero failures and still may not claim success —
  // so the hand-off is withheld on exactly that condition, not on "any failures".
  const ws = {
    'spec/CLAUDE.md': '# Map\n\n> Blueprint: blueprints/README.md\n',
    'spec/README.md': '# P\n\n> Blueprint: blueprints/README.md\n',
  }
  const v = validate(ws, ['README.md'])
  assert.equal(v.failed, 0, 'nothing failed...')
  assert.equal(v.mayClaimSuccess, false, '...and the hand-off is still withheld')
  assert.match(reportLine(v), /NOT fully validated/)
})

// --- ATEST-035: the block itself ------------------------------------------------------------

test('ATEST-035: the hand-off is copy-pasteable with no placeholder left', () => {
  assert.match(doc, /no placeholder left in it/i)
  // Because of who pastes it and how.
  assert.match(doc, /pasted into a fresh\s*\n?session by someone who will not proofread it/i)
  assert.match(doc, /A hand-off naming `TASK-###` sends someone to a file that does not exist/i)
})

test('the hand-off tells the next session to restate and WAIT', () => {
  assert.match(doc, /Restate the task, list the files you will touch, name every assumption — and wait/i)
  assert.match(doc, /spec\/06-agent\/01-instructions\/AGENT\.md/)
})

test('the three human-only actions are named with this project\'s specifics', () => {
  assert.match(doc, /Wire the fitness functions into CI/i)
  assert.match(doc, /Buy the generic subdomains\*\* — \*name them\*/i)
  assert.match(doc, /Perform one restore before launch/i)
  assert.match(doc, /A backup nobody has restored is a hypothesis/i)
  // And which of the three actually gets skipped.
  assert.match(doc, /the one that matters at 3am/i)
})

// --- What it is not --------------------------------------------------------------------------

test('the report says what is unresolved, not what exists', () => {
  assert.match(doc, /Do not summarise the workspace|says what is \*\*unresolved\*\*/i)
  assert.match(doc, /It reports; the developer decides/i)
  assert.match(doc, /Later runs do not re-raise the same/i)
  // CON-007: shown once, to one person, recorded nowhere.
  assert.match(doc, /There is no telemetry and no log/i)
})

test('ETEST-003 failing is raised, not patched by rewording', () => {
  assert.match(doc, /that is not a\s*\n?defect in this report/i)
  assert.match(doc, /the generated workspace does not govern/i)
  assert.match(doc, /Do not reword the hand-off until the symptom goes away/i)
})

test('the report runs after validation in the intake, never before', () => {
  assert.ok(intake.search(/## Step \d+ — Validate/) < intake.search(/## Step \d+ — Report/))
  assert.match(intake, /After validation, never before/i)
})
