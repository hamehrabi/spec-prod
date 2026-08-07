// UTEST-082 — the blueprint library is what the manifest PACKAGES, not everything it mentions.
// Requirement: REQ-F-043 (derive, never hardcode) · validation check 13 · ai-evals.md §2.
//
// WHY THIS FILE EXISTS. MANIFEST.md holds two tables. The first lists the 81 blueprints that
// ship, each with a SHA-256. The second is `## Deliberately not packaged` — a record of what the
// library does NOT contain, kept so an absence reads as a decision rather than an oversight.
//
// `library()` matched any row whose first cell was backticked, so it read both and returned 88
// members. Four of the seven extras are not paths at all: `Architecture.png,
// architecture-types.png` is a sentence, and `04-src/01-pages…05-data/.gitkeep` is a range.
//
// Check 13 consumes that list. A workspace that had filled every blueprint the kit actually
// ships still came back "6 blueprint(s) neither filled nor skipped", so `structural_checks`
// printed BREACH for a perfect run exactly as it does for an empty sandbox — and a check that
// cannot be satisfied by correct work is a check somebody switches off.
//
// The same three lines were copy-pasted into ci/generate-workspace.mjs, carrying the same defect.
// There is one reading of the manifest now, and this file is why.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { library, parseLibrary } from '../../ci/golden.mjs'
import { CHECKS } from '../../ci/validation.mjs'
import { blueprintOf } from '../../ci/fill.mjs'

const MANIFEST = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')

test('UTEST-082: the library is exactly the count the manifest declares', () => {
  // Derived from the manifest's own heading rather than written here, so adding a blueprint moves
  // both together. A number typed into a test is a second source of truth (ADR-004's rule, one
  // layer down).
  const declared = Number(MANIFEST.match(/^## Blueprints \((\d+)\)/m)[1])
  assert.equal(library().length, declared)
})

test('UTEST-082: nothing from "Deliberately not packaged" is in the library', () => {
  const notPackaged = MANIFEST.slice(MANIFEST.indexOf('## Deliberately not packaged'))
  const listed = [...notPackaged.matchAll(/^\| `([^`]+)` \|/gm)].map((m) => m[1])
  assert.ok(listed.length >= 5, 'the second table exists — otherwise this test proves nothing')
  for (const entry of listed) assert.ok(!library().includes(entry), `${entry} is recorded as NOT packaged`)
  // The four that are not even paths. Named, because they are the reason a count alone was not
  // enough to notice: `Architecture.png, architecture-types.png` can never resolve to a file.
  for (const notAPath of ['Architecture.png, architecture-types.png', '.gitignore, .env.example, Dockerfile.example'])
    assert.ok(!library().includes(notAPath))
})

test('UTEST-082: every library member is a file that exists', () => {
  // The property the old form could not have: 88 members for 81 files means seven of them named
  // nothing on disk, and nothing said so.
  for (const rel of library()) {
    assert.doesNotThrow(() => readFileSync(`plugin/blueprints/${rel}`, 'utf8'), `blueprints/${rel} is listed and absent`)
  }
})

test('UTEST-082: a workspace that filled every packaged blueprint satisfies check 13', () => {
  // The check the defect broke, run over a workspace fabricated to be perfect. Before the fix it
  // reported six uncovered blueprints for this input — a failure on correct work.
  const workspace = Object.fromEntries(
    library().map((rel, i) => [`spec/${rel}`, `# File ${i}\n\n> Blueprint: blueprints/${rel}\n`])
  )
  const result = CHECKS[13].run(workspace, library())
  assert.equal(result.state, 'passed', JSON.stringify(result.detail))
  // Nothing here filters `appendix-index.md` out, and it passes anyway: the manifest already
  // records that file as deliberately not packaged, so ci/validation.mjs:249's hardcoded
  // exclusion for it is now dead weight rather than the load-bearing exemption it looked like.
  assert.ok(!library().includes('01-docs/10-reference/appendix-index.md'))
})

test('UTEST-082: and it still FAILS when a packaged blueprint is neither filled nor skipped', () => {
  // The other direction. A parser narrowed until nothing matches would also make check 13 pass.
  const workspace = { 'spec/README.md': '# W\n\n> Blueprint: blueprints/README.md\n' }
  const result = CHECKS[13].run(workspace, library())
  assert.equal(result.state, 'failed')
  assert.match(result.detail[0], /neither filled nor skipped/)
})

test('UTEST-082: a row is a library member only when it carries a digest', () => {
  // The digest column is what tells the two tables apart, so it is what the row has to have.
  const fabricated = [
    '## Blueprints (2)',
    '',
    '| Blueprint | SHA-256 |',
    '|---|---|',
    `| \`a/one.md\` | \`${'a'.repeat(64)}\` |`,
    `| \`b/two.md\` | \`${'b'.repeat(64)}\` |`,
    '',
    '## Deliberately not packaged',
    '',
    '| Path | Why |',
    '|---|---|',
    '| `MASTER-PROMPT.md` | Question text |',
    '| `Architecture.png, architecture-types.png` | Illustrations |',
  ].join('\n')
  assert.deepEqual(parseLibrary(fabricated), ['a/one.md', 'b/two.md'])
  // And it must be able to grow: a new digest row is a new member, or the parser is a hardcode.
  assert.deepEqual(
    parseLibrary(`${fabricated}\n`.replace('## Deliberately', `| \`c/three.md\` | \`${'c'.repeat(64)}\` |\n\n## Deliberately`)),
    ['a/one.md', 'b/two.md', 'c/three.md']
  )
})

test('UTEST-082: the runner reads the manifest through the same function, not a second copy', () => {
  // ci/generate-workspace.mjs held its own three-line copy and inherited the same defect. One
  // reading, so the next correction cannot land in one place and not the other.
  const runner = readFileSync('ci/generate-workspace.mjs', 'utf8')
  assert.match(runner, /import \{ library \} from '\.\/golden\.mjs'/)
  assert.doesNotMatch(runner, /MANIFEST\.md`, 'utf8'\)\s*\n\s*\.split/, 'the copy is back')
})

test('UTEST-082: every generated file in the golden set points at a real library member', () => {
  // The consumer side, asserted against the fixture rather than a fabrication: a back-link that
  // does not resolve is check 3's failure, and the inflated library was hiding the question.
  const back = blueprintOf(readFileSync('tests/fixtures/golden/EV-001/spec/README.md', 'utf8'))
  assert.ok(back, 'the fixture carries a back-link')
  assert.ok(library().includes(back), `${back} is not in the library`)
})
