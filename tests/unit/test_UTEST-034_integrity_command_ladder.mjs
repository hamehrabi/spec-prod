// UTEST-034 — the integrity check is performable, on a host that refuses things.
// Requirement: FF-017 · REQ-NF-001 · BUG-005 · BUG-021 · BUG-022 · BR-009.
//
// Three traced runs, three lessons, all of them in this file:
//
//   BUG-005  hashing one file at a time meant thirty minutes and no preamble. Fixed by
//            requiring ONE command.
//   BUG-021  every command the fix named was refused in a guarded session, and the run went
//            back to per-file hashing — because the escape hatch only covered a host that
//            "cannot compute a digest at all", and it plainly could, one file at a time.
//   BUG-022  the run reached all 81 digests in 5m27s and then spent 4m25s trying to make a
//            shell COMPARE them: Compare-Object, subexpressions, .Count, parenthesised
//            sub-pipelines, each refused by a different guard. Nine minutes on Step 0.
//
// The shape that survives all three: one command to compute one value, one string compared by
// reading, and an explicit ban on composing anything else. These tests hold that shape.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DOC = readFileSync('plugin/instructions/integrity.md', 'utf8')
const MANIFEST = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')

const blueprints = (dir = 'plugin/blueprints', acc = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) blueprints(p, acc)
    else if (entry !== 'MANIFEST.md') acc.push(p.split(/[\\/]/).slice(2).join('/'))
  }
  return acc
}
const LIBRARY = blueprints()

/** The commands the doc actually tells a run to execute. */
const COMMANDS = [...DOC.matchAll(/^\s{3}\S[^\n]*?\s{2,}(sha256sum .+|shasum .+)$/gm)].map((m) => m[1])

test('UTEST-034: the doc gives at least one runnable command', () => {
  assert.ok(COMMANDS.length >= 1, 'no command found in the doc')
})

test('UTEST-034: the comparison is one string, not eighty-one', () => {
  // BUG-022. The manifest carries a single library digest precisely so that a run never has to
  // cross-check the per-file table, and the doc has to send it there first.
  assert.match(DOC, /\*\*Library digest\*\* line/)
  assert.match(MANIFEST, /^\*\*Library digest:\*\*\s*`[0-9a-f]{64}`/m)
  assert.match(DOC, /do not also compare the\s*\n?\s*per-file table/i)
})

test('UTEST-034: the per-file table is named as a second step, not the first', () => {
  const purpose = DOC.slice(DOC.indexOf('What the per-file table is for'))
  assert.match(purpose, /only when.*the two strings differ/is)
  assert.match(purpose, /never the first comparison/i)
})

test('UTEST-034: composing your own command is forbidden', () => {
  // The run did not disobey a rule; there was no rule. It improvised because improvising was
  // open to it, and every improvisation cost a guard rejection.
  assert.match(DOC, /Do not compose your own/i)
  assert.match(DOC, /do not fold the comparison into the command/i)
})

test('UTEST-034: the command reaches every blueprint in the library', () => {
  // THE FIXED DEPTH IS THE RISK. A glob written for three levels silently misses the fourth,
  // and a check that misses files is the failure this repository has hit six times.
  const deepest = Math.max(...LIBRARY.map((p) => p.split('/').length))
  for (const command of COMMANDS) {
    const depths = [...command.matchAll(/(?:\*\/)+\*\.md|(?<![*/])\*\.md/g)].map((m) => m[0].split('/').length)
    assert.ok(
      Math.max(...depths) >= deepest,
      `"${command.slice(0, 40)}…" reaches ${Math.max(...depths)} levels; the library is ${deepest} deep`
    )
  }
})

test('UTEST-034: the manifest is excluded, and nothing else is', () => {
  // Forms cannot exclude one file by glob, so the manifest line is dropped by name. FF-017
  // fails the merge if a blueprint path ever contains that word — assert the premise here too,
  // because this doc is what would be silently wrong.
  for (const command of COMMANDS) assert.match(command, /grep -v MANIFEST/)
  assert.deepEqual(LIBRARY.filter((p) => /MANIFEST/i.test(p)), [])
})

test('UTEST-034: a refused command is not permission to hash one file at a time', () => {
  assert.match(DOC, /refused command is not permission to hash one file at a time/i)
  assert.match(DOC, /Per-file hashing is forbidden even when it is the only thing that works/i)
})

test('UTEST-034: the stop message distinguishes no hasher from refusal', () => {
  // Different causes, different fixes: one is a missing tool, the other a permission rule the
  // developer can change. One message for both helps with neither — the same argument the
  // altered/missing/unlisted split already makes.
  assert.match(DOC, /no hasher, or refused/i)
})

test('UTEST-034: the doc counts the library correctly', () => {
  const claimed = [...DOC.matchAll(/Hashing all (\d+) blueprints/g)].map((m) => Number(m[1]))
  assert.deepEqual(claimed, [LIBRARY.length], `the doc says ${claimed}; the library has ${LIBRARY.length}`)
})
