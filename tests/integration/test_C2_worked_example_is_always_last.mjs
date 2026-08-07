// Contract C2 — "A `# WORKED EXAMPLE` section, always last, always removable as a whole."
// Requirement: REQ-F-027, BR-002, ADR-003 step 2.
//
// BUG-003. ADR-003 removes the worked example by deleting from its heading to the end of the
// file. That is only safe while C2's "always last" guarantee actually holds. Three blueprints
// broke it, putting 224 lines of real template guidance after the example — which the fill
// procedure would have deleted silently, producing a file that looked complete and was
// missing a whole section.
//
// This test is the guarantee made checkable, so the next blueprint that breaks it fails here
// rather than in someone's generated workspace.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { walk, toPosix } from '../../ci/payload.mjs'

const LIB = 'plugin/blueprints'

// MANIFEST.md is the integrity control, not a blueprint: it has no source counterpart and
// produces no generated file (TEST-003 draws the same line).
//
// `blueprints/README.md` used to be excluded here too, with no reason written down — the one
// exclusion in this file that nobody had to justify, in a file whose own principle at the
// NO_EXAMPLE_EXPECTED comment is that an unjustified exemption is how twenty-four blueprints
// stayed invisible. It is a packaged blueprint (MANIFEST.md), it is written in Round 1, it
// carries `# WORKED EXAMPLE — ProjectBoard`, and it is the first file anyone opens in the
// workspace. It is now asserted like every other blueprint.
const blueprints = walk(LIB)
  .map(toPosix)
  .filter((f) => f.endsWith('.md') && !f.endsWith('MANIFEST.md'))

/** H1 headings after `# WORKED EXAMPLE` that are NOT inside a fenced code block.
 *  Headings inside fences (`# BEFORE`, `# WRONG`) are the example's own content and are
 *  removed correctly by deleting to the end. Headings outside a fence are real sections. */
function contentAfterWorkedExample(file) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const start = lines.findIndex((l) => /^# WORKED EXAMPLE/.test(l))
  if (start === -1) return []
  let fenced = false
  const found = []
  for (const line of lines.slice(start + 1)) {
    if (/^\s*```/.test(line)) fenced = !fenced
    else if (!fenced && /^# /.test(line)) found.push(line.trim())
  }
  return found
}

test('C2: no blueprint has a real section after its worked example', () => {
  const offenders = blueprints
    .map((f) => ({ file: f, sections: contentAfterWorkedExample(f) }))
    .filter((r) => r.sections.length > 0)

  assert.deepEqual(
    offenders.map((o) => `${o.file}: ${o.sections.join(' | ')}`),
    [],
    'ADR-003 deletes from the worked example to the end of file. Anything real down there is lost silently.'
  )
})

test('C2: every worked example is removable as a whole, leaving the template intact', () => {
  for (const file of blueprints) {
    const text = readFileSync(file, 'utf8')
    if (!/^# WORKED EXAMPLE/m.test(text)) continue
    const kept = text.slice(0, text.search(/^# WORKED EXAMPLE/m))
    assert.match(kept, /^#\s+\S/m, `${file}: removing the example must leave a titled document behind`)
    assert.doesNotMatch(kept, /^# WORKED EXAMPLE/m, `${file}: exactly one worked-example heading`)
  }
})

// --- The gap the two tests above could not see -----------------------------------------------
//
// Both of them start by locating `# WORKED EXAMPLE`, so a blueprint that never uses that
// heading was skipped by BOTH and passed by DEFAULT. 24 of 81 blueprints were in that state:
// their example sat under `## Worked example (Ch. 9 §9.5)`, `## Filled example — "TeamTask
// Lite"` or `## Completed example`, mid-file, with real template content after it.
//
// ADR-003 step 2 deletes from `# WORKED EXAMPLE` to end-of-file. With no such heading it
// deletes NOTHING, and someone else's product ships into the developer's specification as
// their own decision — which is BR-002 exactly, and the failure C2 exists to prevent.
//
// A `continue` on absence is not a skip, it is a silent pass. The contract has to be asserted
// POSITIVELY or it only ever checks the files that were already correct.

/** Blueprints with no worked example, each for a stated reason. Named rather than inferred:
 *  an exemption nobody has to justify is how the 24 stayed invisible. */
const NO_EXAMPLE_EXPECTED = {
  'plugin/blueprints/gitignore.md': 'wrapper blueprint — carries a .gitignore in a fenced block; an example ignore file would be the artifact itself',
  'plugin/blueprints/env-example.md': 'wrapper blueprint — carries a .env.example in a fenced block; every value in it is already a placeholder',
}

test('C2: every blueprint carries a worked example, or is a NAMED exemption', () => {
  const missing = blueprints.filter((f) => !/^# WORKED EXAMPLE/m.test(readFileSync(f, 'utf8')))

  assert.deepEqual(
    missing.map(toPosix).sort(),
    Object.keys(NO_EXAMPLE_EXPECTED).sort(),
    'A blueprint with no `# WORKED EXAMPLE` heading is invisible to every other C2 check — ' +
      'ADR-003 step 2 finds nothing to delete and the example ships to the developer (BR-002). ' +
      'Give it the heading, or add it to NO_EXAMPLE_EXPECTED with a reason.'
  )
})

test('C2: an example heading at the wrong LEVEL does not count', () => {
  // `## WORKED EXAMPLE` reads correct to a human and is invisible to `/^# WORKED EXAMPLE/m`.
  // Eight blueprints were in exactly this state, which is why the level is asserted and not
  // just the words.
  const offenders = blueprints.filter((f) => {
    const text = readFileSync(f, 'utf8')
    return /^#{2,} +WORKED EXAMPLE/mi.test(text) || /^#{2,} +(Filled|Completed) example/mi.test(text)
  })
  assert.deepEqual(offenders.map(toPosix), [], 'the worked example is an H1, so deleting to end-of-file removes it whole')
})
