// UTEST-072 — step 3 removes prompt SECTIONS, and step 4's inventory sees an italic that wrapped.
// Requirement: ADR-003 · C2 · BR-009 · FF-005 · FF-007 · BUG-024.
//
// WHY, part one. `isPromptHeading` was `^#{1,6}\s+Prompts?\b` — any heading, at any level,
// beginning with the word. It ate `# Prompt Library for Spec-Driven AI Engineering`, which is
// the prompt library's own H1 title. That blueprint became the only one of 81 whose expected
// outline does not begin with an H1, so Round 8 produces a correct file, FF-007 fails at heading
// 1, and the move that makes the check green is to delete the title — shipping a titleless
// prompt library. Two more headings went with it: `## Prompt quality checklist` is part of the
// library it sits in, and `## Prompt to use with the pack` is a prompt for using the finished
// pack. Step 3 removes boxes that say how to PRODUCE a file, not content the file exists to
// deliver.
//
// WHY, part two. The instructional-italic shape was line-anchored, and the library hard-wraps at
// ~95 columns — so an instruction longer than one line was invisible to the inventory and to
// check 5. Six of them: three in `ADR-000-template.md`, one each in `environment-config.md`,
// `AGENT.md` and `agent-rules-and-coding-standards.md`. A delivered ADR opens its Context,
// Compliance and Revisit-when sections with the blueprint's own instructions to the author, and
// check 5 reports pass. This is the eleventh line-wrap defect in this repository, and the
// placeholder rule forty lines above it in the same file documents wrap handling at length.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPromptHeading, expectedHeadings, headings, placeholders, unfilled } from '../../ci/fill.mjs'
import { blueprintText, library } from '../../ci/golden.mjs'

// --- A document title is never a prompt section ---------------------------------------------------

test('UTEST-072: the prompt library keeps its own H1', () => {
  const source = blueprintText('06-agent/03-prompts/prompt-library.md')
  assert.ok(source, 'the blueprint is in the library')
  assert.equal(expectedHeadings(source)[0], '# Prompt Library for Spec-Driven AI Engineering')
})

test('UTEST-072: every blueprint expects an H1 first — no outline begins below its title', () => {
  // The general form of the same claim. The prompt library was the only exception, and an
  // exception of one is how the next one hides.
  const headless = library()
    .map((rel) => [rel, blueprintText(rel)])
    .filter(([, t]) => t !== null && headings(t).length > 0)
    .filter(([, t]) => !(expectedHeadings(t)[0] ?? '').startsWith('# '))
    .map(([rel]) => rel)
  assert.deepEqual(headless, [])
})

test('UTEST-072: a heading that merely begins with the word is content, not a box', () => {
  assert.equal(isPromptHeading('# Prompt Library for Spec-Driven AI Engineering'), false)
  assert.equal(isPromptHeading('## Prompt quality checklist (Ch. 13)'), false)
  assert.equal(isPromptHeading('## Prompt to use with the pack (Ch. 12)'), false)
})

test('UTEST-072: the sections step 3 actually removes are still removed', () => {
  assert.equal(isPromptHeading('## Prompts'), true)
  assert.equal(isPromptHeading('### Prompt'), true)
  assert.equal(isPromptHeading('## Prompt — clarify a raw idea (Prompt box 2.1)'), true)
  assert.equal(isPromptHeading('## Prompt – identify entities'), true)
})

// --- An instruction that wrapped is still an instruction --------------------------------------------

const WRAPPED =
  '## Context\n\n' +
  '*Explain the problem, project constraints, and why a decision is needed. A future reviewer\n' +
  'must be able to judge the decision knowing what you knew.*\n'

test('UTEST-072: an italic split across two lines is on the inventory', () => {
  const found = placeholders(WRAPPED).filter((p) => p.kind === 'instructional-italic')
  assert.equal(found.length, 1)
  assert.equal(found[0].line, 3, 'and it is reported where it starts, so it can be found')
})

test('UTEST-072: the six that were invisible are visible, and they are in the shipped library', () => {
  const counts = {}
  for (const rel of library()) {
    const t = blueprintText(rel)
    if (t === null) continue
    const wrapped = placeholders(t).filter((p) => p.kind === 'instructional-italic' && p.text.includes('\n'))
    if (wrapped.length) counts[rel] = wrapped.length
  }
  assert.deepEqual(counts, {
    '01-docs/05-architecture/architecture-decisions/ADR-000-template.md': 3,
    '06-agent/01-instructions/AGENT.md': 1,
    '06-agent/01-instructions/agent-rules-and-coding-standards.md': 1,
    '07-ops/01-deployment/environment-config.md': 1,
  })
})

test('UTEST-072: a blank line still ends the span — an unclosed asterisk cannot eat sections', () => {
  const loose = '*An instruction that never closes\n\n## A later heading\n\nBody with an * in it.*\n'
  assert.deepEqual(placeholders(loose).filter((p) => p.kind === 'instructional-italic'), [])
})

test('UTEST-072: ordinary prose with emphasis in it is not an instruction', () => {
  // The rule is a WHOLE line in single asterisks. Emphasis inside a sentence is not, and a
  // rule that flagged it would fire on every well-written paragraph in the workspace.
  const prose = 'The cook *always* gets one trip, and the list is *never* wrong about it.\n'
  assert.deepEqual(unfilled(prose), [])
})
