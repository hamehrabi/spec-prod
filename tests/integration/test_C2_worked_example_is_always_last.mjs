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

const blueprints = walk(LIB)
  .map(toPosix)
  .filter((f) => f.endsWith('.md') && !f.endsWith('MANIFEST.md') && !f.endsWith('blueprints/README.md'))

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
