// UTEST-065 — three checks that failed a workspace for doing the right thing.
// Requirement: BR-009 · BR-010 · ADR-005 · BUG-031.
//
// All three were found the same way: by generating rounds 4 to 8 for the first time, which took
// 75 minutes and $49.85 and is the only thing that could have found them. Every one had been
// green for months against a fixture that stopped at Round 3.
//
// They share a shape worth naming. None is a check that failed to catch something — each is a
// check that CAUGHT SOMETHING CORRECT and called it a defect. That direction is the more
// dangerous one here, because the repair a reader would make from the report is destructive:
// the honest response to "ADR-000-template.md has twelve unfilled placeholders" is to fill them
// in, which destroys the template.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHECKS, isTemplate } from '../../ci/validation.mjs'

const back = '\n> Blueprint: blueprints/x.md\n'

// --- Check 3: the entry point is not a filled blueprint ----------------------------------------

test('UTEST-065: check 3 does not demand a back-link from the entry point', () => {
  // `spec/CLAUDE.md` is composed by entrypoint.md from what the workspace already contains.
  // There is no blueprint it is a copy of, so there is nothing for a back-link to point at.
  // The first eight-round run ever produced failed this check for writing it as specified.
  const ws = { 'spec/a.md': `# A${back}`, 'spec/CLAUDE.md': '# Start here\n\nNo back-link, by design.\n' }
  assert.notEqual(CHECKS[3].run(ws, ['x.md']).state, 'failed')
})

test('UTEST-065: every other rootward file still needs one', () => {
  // The exemption is BY NAME. "Files at the workspace root are exempt" would also excuse
  // README.md, which IS a filled blueprint and whose back-link is the only thing tying it to one.
  assert.equal(CHECKS[3].run({ 'spec/README.md': '# R\n\nno back-link\n' }, ['x.md']).state, 'failed')
})

// --- Check 5: a template keeps its placeholders ------------------------------------------------

test('UTEST-065: a file that tells you to copy it keeps its placeholders', () => {
  // Twelve violations against one file on the first eight-round run, every one of them the
  // markers that make the file usable.
  const template = `# ADR-000: [Decision Title]\n\n> Copy this file to \`ADR-001-short-title.md\` and fill it in.\n\n[Option A] vs [Option B]${back}`
  assert.equal(CHECKS[5].run({ 'spec/adr/ADR-000-template.md': template }).state, 'passed')
})

test('UTEST-065: an ordinary file with the same placeholders still fails', () => {
  // The direction that matters more. If the exemption were loose, every unfilled workspace
  // would pass check 5 by looking vaguely template-shaped.
  assert.equal(CHECKS[5].run({ 'spec/a.md': `# A\n\n[Decision Title]${back}` }).state, 'failed')
})

test('UTEST-065: isTemplate reads the file, not the filename', () => {
  // A list of names goes stale the day a template is added. A file that merely has "template"
  // in its name earns nothing; the instruction to copy is what earns it.
  assert.ok(isTemplate('# X\n\n> Copy this file to `y.md` and fill it in.\n'))
  assert.ok(!isTemplate('# template-ish\n\nA document about templates.\n'))
})

test('UTEST-065: the copy instruction must be near the top', () => {
  // It has to be the document telling you to copy IT, not a sentence in the middle telling you
  // to copy something else. Without the anchor, any file that mentions copying a template would
  // excuse its own unfilled placeholders.
  assert.ok(!isTemplate(`${'filler\n'.repeat(40)}> Copy this file to \`y.md\` and fill it in.\n`))
})

// --- Check 6: a citation that wrapped onto the next line ---------------------------------------

test('UTEST-065: a [TODO] whose citation wrapped still counts as paired', () => {
  // The twelfth defect in this repository to be a pattern dying across a hard wrap — and it
  // arrived in the commit that fixed the OPPOSITE failure. Check 6 used to accept any Q-###
  // within 300 characters; tightening it to "the marker or its row" replaced matching too much
  // with matching too little, and a real run produced four of these.
  const ws = {
    'spec/q.md': `| Q-018 | what is the monitoring appetite? | Open |${back}`,
    'spec/m.md':
      '> [TODO: what is the monitoring appetite — structured logs + error alerts, or\n' +
      `> full metrics and tracing? — Q-018]. Version one plans structured logs.${back}`,
  }
  assert.equal(CHECKS[6].run(ws).state, 'passed')
})

test('UTEST-065: a [TODO] citing nothing still fails, wrapped or not', () => {
  // The check must still be able to fail. Widening the search to the marker could have made
  // every TODO pair with whatever Q-### happened to be inside it — there is none here.
  const ws = {
    'spec/q.md': `| Q-018 | something else | Open |${back}`,
    'spec/m.md': '> [TODO: what is the monitoring appetite — structured logs, or\n> full metrics and tracing?]\n' + back,
  }
  assert.equal(CHECKS[6].run(ws).state, 'failed')
})

test('UTEST-065: a [TODO] citing a Q-### that has no row still fails', () => {
  // The other half of "matching means matching". A citation to a row nobody wrote is the
  // dangling half of the pair BR-003 requires, and it reads as answered to a developer.
  const ws = { 'spec/m.md': `> [TODO: what is the appetite? — Q-999]${back}` }
  assert.equal(CHECKS[6].run(ws).state, 'failed')
})
