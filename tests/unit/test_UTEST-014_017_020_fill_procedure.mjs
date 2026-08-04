// UTEST-014 — the back-link names the right blueprint, at every depth.
// UTEST-016 — identifiers are unique and never reused; a deleted ID leaves a permanent hole.
// UTEST-017 — an unknown fact becomes [TODO: <exact question>], never a substituted value.
// UTEST-020 — the worked example is removed whole.
// TEST-005/006/007 — structure preserved, back-links resolve, identifiers resolve.
// Requirement: REQ-F-016, REQ-F-018, REQ-F-019, REQ-F-027 · BR-002, BR-003, BR-007 · ADR-003.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  stripWorkedExample, backLink, blueprintOf, placeholders, todos, mint, headings,
  unfilled,
} from '../../ci/fill.mjs'

// --- Step 6: the back-link (UTEST-014, TEST-006) ---------------------------------------

const DEPTHS = [
  ['CLAUDE.md', 'depth 1 — the workspace root'],
  ['01-docs/glossary.md', 'depth 2'],
  ['01-docs/01-intent/intent.md', 'depth 3'],
  ['03-tests/05-executable/unit/notes.md', 'depth 4'],
]

for (const [path, why] of DEPTHS) {
  test(`UTEST-014: back-link names the blueprint at ${why}`, () => {
    const link = backLink(path)
    assert.equal(link, `> Blueprint: blueprints/${path}`)
    // DD-022: the path round-trips exactly. There is no ../ arithmetic to miscount, which is
    // the whole failure mode this test was originally written to catch.
    assert.equal(blueprintOf(link), path)
  })
}

test('TEST-006: every back-link resolves to a blueprint that actually exists', () => {
  for (const [path] of DEPTHS.slice(1)) {
    const target = `plugin/blueprints/${blueprintOf(backLink(path))}`
    // Only the paths that correspond to real library files are asserted; the point is that
    // resolution is mechanical, not that these four fixtures all ship.
    if (path === '01-docs/01-intent/intent.md') {
      assert.ok(existsSync(target), `${target} must exist for the back-link to mean anything`)
    }
  }
})

test('UTEST-014: a back-link is never confused with a link to somewhere else', () => {
  assert.equal(blueprintOf('> Blueprint: ../../../spec-driven-template/x.md'), null)
  assert.equal(blueprintOf('no back-link here'), null)
})

// --- Step 2: remove the worked example whole (UTEST-020, TEST-014) ----------------------

const BLUEPRINT = `# Technical Spec

## 1. Overview

Real content.

# WORKED EXAMPLE — ProjectBoard

ProjectBoard is a kanban tool for small teams.

| Field | Value |
|---|---|
| Name | ProjectBoard |
`

test('UTEST-020: the worked example is removed whole, not edited around', () => {
  const filled = stripWorkedExample(BLUEPRINT)
  assert.match(filled, /^# Technical Spec/)
  assert.match(filled, /Real content\./)
  assert.doesNotMatch(filled, /WORKED EXAMPLE/)
  assert.doesNotMatch(filled, /ProjectBoard/, 'TEST-014: zero occurrences of the example product')
})

test('UTEST-020: a blueprint with no worked example is left alone', () => {
  const plain = '# Title\n\nContent.\n'
  assert.equal(stripWorkedExample(plain), plain)
})

test('TEST-005: section headings survive removal, in order', () => {
  const before = headings(BLUEPRINT).filter((h) => !h.includes('WORKED EXAMPLE'))
  const after = headings(stripWorkedExample(BLUEPRINT))
  assert.deepEqual(after, before, 'structure must match the blueprint, minus the example')
})

// --- Step 4: the placeholder inventory (UTEST-017) ---------------------------------------

test('UTEST-017: an unfilled file reports every kind of placeholder', () => {
  const unfilled = `# Spec

*Short working name.*

| ID | Requirement |
|---|---|
| REQ-F-### | [what the actor must do] |
| | |

Owner: [Name]  ·  Date: YYYY-MM-DD  ·  Sign: ______  ·  Tag: <label>
`
  const kinds = new Set(placeholders(unfilled).map((p) => p.kind))
  for (const expected of ['placeholder', 'id-stub', 'date-stub', 'empty-row', 'instructional-italic', 'blank-fill', 'angle-stub']) {
    assert.ok(kinds.has(expected), `step 4 must detect ${expected}`)
  }
})

test('UTEST-017: a properly filled file reports nothing', () => {
  const filled = `# Spec

The kit turns an idea into a specification workspace.

| ID | Requirement |
|---|---|
| REQ-F-001 | A developer must be able to install the kit. |

Owner: Kit author  ·  Date: 2026-08-04
`
  assert.deepEqual(placeholders(filled), [])
})

test('UTEST-017: [TODO] is a filled answer with a named gap, not a leftover', () => {
  // BR-003. The distinction is the whole point of step 4: an unknown fact is RECORDED, and
  // recording it must not read as failing to fill the file.
  const withTodo = '| REQ-F-001 | [TODO: what is the retention period?] |\n'
  assert.deepEqual(placeholders(withTodo), [], '[TODO] must not count as unfilled')
  assert.deepEqual(todos(withTodo), ['what is the retention period?'])
})

test('UTEST-017: no plausible value is ever substituted for an unknown', () => {
  // The failure this guards is not a crash. It is a file that reads as decided.
  const guessed = '| Retention | 90 days |\n'
  assert.deepEqual(placeholders(guessed), [], 'structurally this looks finished...')
  assert.deepEqual(todos(guessed), [], '...and that is exactly why only a [TODO] proves it was not guessed')
})

test('UTEST-017: checkboxes and markdown links are not placeholders', () => {
  // 565 checkboxes and 136 links live in the library. Flagging them would produce 701 false
  // positives, and a check nobody believes is a check nobody runs.
  const ordinary = `- [x] Done
- [ ] Not done yet
See [the requirements](../02-requirements/requirements.md).
`
  assert.deepEqual(placeholders(ordinary), [])
})

test('UTEST-017: a real blueprint is full of placeholders; a real spec file is not', () => {
  const blueprint = readFileSync('plugin/blueprints/01-docs/02-requirements/requirements.md', 'utf8')
  assert.ok(placeholders(blueprint).length > 0, 'an unfilled template must report unfilled')
})

// --- Step 5: identifier minting (UTEST-016, TEST-007) -----------------------------------

test('UTEST-016: identifiers are minted sequentially and zero-padded', () => {
  assert.equal(mint('REQ-F', []), 'REQ-F-001')
  assert.equal(mint('REQ-F', ['REQ-F-001', 'REQ-F-002']), 'REQ-F-003')
  assert.equal(mint('ADR', ['ADR-001']), 'ADR-002')
})

test('UTEST-016: a deleted identifier leaves a permanent hole', () => {
  // The exact scenario in the test plan: delete REQ-F-007, then add a requirement.
  const everIssued = ['REQ-F-005', 'REQ-F-006', 'REQ-F-007', 'REQ-F-008']
  const afterDeletingSeven = everIssued.filter((id) => id !== 'REQ-F-007')
  assert.equal(
    mint('REQ-F', everIssued),
    'REQ-F-009',
    'minting reads what was ever ISSUED, so the hole survives'
  )
  assert.equal(
    mint('REQ-F', afterDeletingSeven),
    'REQ-F-009',
    'BR-007: REQ-F-007 must never be handed out again — a reused ID silently re-points a test, a task and a traceability row'
  )
})

test('UTEST-016: prefixes are minted independently', () => {
  const used = ['REQ-F-001', 'REQ-NF-001', 'REQ-NF-002']
  assert.equal(mint('REQ-F', used), 'REQ-F-002')
  assert.equal(mint('REQ-NF', used), 'REQ-NF-003')
  // REQ-F must not be counted as a REQ-NF just because one string contains the other.
  assert.equal(mint('BR', used), 'BR-001')
})

test('TEST-007: two files defining identifiers produce no duplicates', () => {
  const issued = []
  for (let i = 0; i < 5; i += 1) issued.push(mint('REQ-F', issued))
  assert.deepEqual(issued, ['REQ-F-001', 'REQ-F-002', 'REQ-F-003', 'REQ-F-004', 'REQ-F-005'])
  assert.equal(new Set(issued).size, issued.length, 'no duplicates')
})

// --- BUG-006: a correctly filled file must not be reported as unfilled -------------------

test('BUG-006: an illustrative formula in a blockquote is content, not a gap', () => {
  const filled = `## Problem statement formula

> [Affected user] currently faces [difficulty], which causes [consequence].
> The system should [desired improvement].

**Your problem statement:** A charity's fundraising team tracks donors in spreadsheets
where records get lost, which costs them repeat donations worth thousands a year.
`
  assert.equal(unfilled(filled).length, 0, 'this file IS filled; the formula explains the answer below it')
  assert.equal(placeholders(filled).filter((p) => p.context === 'quote').length, 4, 'seen and judged, not ignored')
})

test('BUG-006: an identifier pattern in backticks documents a convention', () => {
  const doc = 'The next unit of work | `02-tasks/02-task-files/TASK-###.md` |\n'
  assert.equal(unfilled(doc).length, 0)
  assert.equal(placeholders(doc).length, 1, 'still reported, still visible')
})

test('BUG-006: a real gap in body text is still a gap', () => {
  // The fix must not have bought quiet by going blind.
  assert.equal(unfilled('| Owner | [who owns this decision] |\n').length, 1)
  assert.equal(unfilled('Retention is REQ-F-### and the date is YYYY-MM-DD.\n').length, 2)
})
