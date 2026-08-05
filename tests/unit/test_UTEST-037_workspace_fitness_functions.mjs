// UTEST-037 — the fitness functions that walk a generated workspace (FF-004…FF-008).
// Requirement: TASK-016 · cicd-pipeline.md stage 4 · BR-002 · BR-009 · ADR-003 · C2.
//
// Each is demonstrated BOTH ways: clean input passes, broken input fails and names what broke.
// cicd-pipeline.md's rule — "a check that has never been seen to fail is untested" — is not
// ceremony here. Six of the last ten defects in this repository were checks that passed by
// matching nothing, and FF-007's first version failed by matching too much: it reported ten
// violations in a workspace that had four, because it compared raw blueprint headings and knew
// nothing about the three fill steps that legitimately change them.
//
// The synthetic workspaces below are deliberately tiny. A fixture large enough to be realistic
// is a fixture whose author decides what the check sees.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { run, check } from '../_helpers.mjs'
import { isPromptHeading, expectedHeadings, headingMatches } from '../../ci/fill.mjs'
import { goldenWorkspaces } from '../../ci/golden.mjs'

/** A golden root holding one case, with whatever files a test needs. */
function goldenSet(files) {
  const root = mkdtempSync(join(tmpdir(), 'ff-golden-'))
  for (const [rel, text] of Object.entries(files)) {
    const full = join(root, 'EV-TEST', rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, text)
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) }
}

const FF = {
  '004': 'ff-004-complete-looking-partial.mjs',
  '005': 'ff-005-no-surviving-template.mjs',
  '006': 'ff-006-no-worked-example.mjs',
  '007': 'ff-007-structure-matches-blueprint.mjs',
  '008': 'ff-008-identifier-integrity.mjs',
}

/** Every workspace check reads its golden root from argv, so a test can point it elsewhere. */
const onSet = (id, files) => {
  const set = goldenSet(files)
  try {
    return run(check(FF[id]), [set.root])
  } finally {
    set.cleanup()
  }
}

const CLEAN = { 'spec/README.md': '# A project\n\nNothing unfinished here.\n' }

// --- An empty golden set is NOT a pass ---------------------------------------------------------

test('UTEST-037: no golden workspace is NOT RUN, never a pass', () => {
  // The shape of every check this repository has had to fix: zero violations across zero
  // workspaces, reported as success. Three states, never two (BR-009).
  const empty = mkdtempSync(join(tmpdir(), 'ff-empty-'))
  try {
    for (const id of Object.keys(FF)) {
      const { code, stdout } = run(check(FF[id]), [empty])
      assert.equal(code, 2, `FF-${id} claimed something about an empty set`)
      assert.match(stdout, /RESULT: NOT RUN/)
      assert.doesNotMatch(stdout, /RESULT: pass/)
    }
  } finally {
    rmSync(empty, { recursive: true, force: true })
  }
})

test('UTEST-037: a golden case is a directory, and the answer record beside it is not swept in', () => {
  // EV-001-answers.md sits next to EV-001/ on purpose. Walking it into the workspace would check
  // an INPUT as though the kit had produced it.
  const set = goldenSet(CLEAN)
  try {
    writeFileSync(join(set.root, 'EV-TEST-answers.md'), '# answers\n')
    const cases = goldenWorkspaces(set.root)
    assert.deepEqual(cases.map((c) => c.id), ['EV-TEST'])
    assert.deepEqual(Object.keys(cases[0].workspace), ['spec/README.md'])
  } finally {
    set.cleanup()
  }
})

// --- FF-004: complete-looking but partial -------------------------------------------------------

test('UTEST-004: a placeholder with no [TODO] fails; with one, it passes', () => {
  const partial = { 'spec/a.md': '# A\n\nOwner: [who owns this]\n' }
  const declared = { 'spec/a.md': '# A\n\nOwner: [TODO: who owns this — Q-001]\n' }
  const bad = onSet('004', partial)
  assert.equal(bad.code, 1)
  assert.match(bad.stdout, /unfilled placeholder\(s\) and no \[TODO\]/)
  assert.equal(onSet('004', declared).code, 0, 'a declared gap is honest and must pass')
})

// --- FF-005: surviving template -----------------------------------------------------------------

test('UTEST-005: a surviving prompt box fails', () => {
  const bad = onSet('005', { 'spec/a.md': '# A\n\n> **Prompt — clarify the idea**\n' })
  assert.equal(bad.code, 1)
  assert.match(bad.stdout, /prompt box/)
  assert.equal(onSet('005', CLEAN).code, 0)
})

// --- FF-006: worked-example leakage --------------------------------------------------------------

test('UTEST-006: every example product name is detected, not just one', () => {
  // A leak detector that knows one name reports zero leaks for every other name (BUG-008).
  for (const leak of ['ProjectBoard', 'TeamTask Lite', 'SaaS task app', '# WORKED EXAMPLE']) {
    const bad = onSet('006', { 'spec/a.md': `# A\n\nBuilt like ${leak}.\n` })
    assert.equal(bad.code, 1, `${leak} leaked undetected`)
  }
  assert.equal(onSet('006', CLEAN).code, 0)
})

// --- FF-007: structure matches the blueprint ------------------------------------------------------

test('UTEST-007: the expected outline drops what the fill procedure removes', () => {
  const blueprint = [
    '# [project name] — spec',
    '## The document',
    '## Prompts',
    '## Prompt — clarify a raw idea (Prompt box 2.1)',
    '# WORKED EXAMPLE — "TeamTask Lite"',
    '## Not this one either',
  ].join('\n\n')
  assert.deepEqual(expectedHeadings(blueprint), ['# [project name] — spec', '## The document'])
})

test('UTEST-007: a filled heading matches its placeholder; a changed one does not', () => {
  assert.ok(headingMatches('# [project name] — spec', '# Pantry — spec'))
  assert.ok(!headingMatches('## Users and goals', '## Users, goals, and constraints'))
  assert.ok(!headingMatches('## Users and goals', undefined), 'a missing heading is not a match')
})

test('UTEST-007: "## Prompting rules" is not a prompt section', () => {
  // The word boundary matters. Without it this check would silently stop requiring any heading
  // that happens to start with those letters.
  assert.ok(isPromptHeading('## Prompts'))
  assert.ok(isPromptHeading('## Prompt — clarify a raw idea'))
  assert.ok(!isPromptHeading('## Prompting rules'))
})

test('UTEST-007: a file with no back-link cannot be checked, and says so', () => {
  const bad = onSet('007', { 'spec/a.md': '# A\n\nNo back-link here.\n' })
  assert.equal(bad.code, 1)
  assert.match(bad.stdout, /carries no blueprint back-link/)
})

test('UTEST-007: a back-link to a blueprint that does not exist fails', () => {
  const bad = onSet('007', { 'spec/a.md': '# A\n\n> Blueprint: blueprints/nowhere.md\n' })
  assert.equal(bad.code, 1)
  assert.match(bad.stdout, /not in the library/)
})

// --- FF-008: identifier integrity ------------------------------------------------------------------

test('UTEST-008: a referenced identifier with no definition fails', () => {
  // BUG-023's detector. A run stopped at Round 1 referenced Q-001..Q-005 with nowhere to define
  // them, and no check in CI could see it.
  const bad = onSet('008', { 'spec/a.md': '# A\n\nSee `Q-001` for the open question.\n' })
  assert.equal(bad.code, 1)
  assert.match(bad.stdout, /Q-001 is referenced but never defined/)
  assert.equal(onSet('008', CLEAN).code, 0)
})
