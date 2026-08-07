// UTEST-070 — three workspace fitness functions, each seen to reach the verdict it could not
// reach before.
// Requirement: BR-009 · BR-010 · ADR-005 · C2 · cicd-pipeline.md stage 4.
//
// WHY. Each of these was a check that could not fail on the input it exists to judge, or that
// failed on input the kit itself prescribes. All three are demonstrated in both directions,
// because a check that fails on everything proves as little as one that fails on nothing.
//
//   FF-014  `applies` used `.some`, so ONE of checks 8 and 9 having run marked the whole case
//           measured. `measure` filters on `failed`, so the sibling's not-run contributed
//           nothing and disappeared — and `walkGolden` prints "not measured" only for cases
//           `applies` rejects outright, so no line anywhere said the other half had not run.
//           The file's own comment states the rule it broke: a not-run check "must not be read
//           as satisfied". BR-009 breached inside the tooling built to enforce BR-009.
//
//   FF-011  the `[TODO]` exemption was file-wide and keyword-matched, and returned before the
//           stamp was examined. `entrypoint.md` makes todos routine in the Commands and
//           Where-things-stand sections, so `[TODO: which API version do we target?]` excused a
//           flatly wrong version stamp — the thing that same module calls worse than a missing
//           one, because it will be trusted.
//
//   FF-007  `spec/.gitignore` and `spec/.env.example` are the two artifacts the kit deliberately
//           writes that are not filled blueprints. `headings()` reads their `#` comment lines as
//           Markdown headings, so a byte-perfect `.gitignore` diverged at heading 1 and
//           `.env.example` produced eleven phantom headings. A .gitignore cannot stop using `#`
//           for comments, so no blueprint edit could fix it: the day a workspace reached Round 6
//           the check blocked the merge on correct work, and the way out is to switch it off —
//           taking the three genuine findings it reports against the golden fixture with it.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { run, check } from '../_helpers.mjs'
import { blueprintText } from '../../ci/golden.mjs'
import { wrapperArtifact } from '../../ci/fill.mjs'

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

/** Every workspace check reads its golden root from argv, so a test can point it elsewhere. */
const onSet = (script, files) => {
  const set = goldenSet(files)
  try {
    return run(check(script), [set.root])
  } finally {
    set.cleanup()
  }
}

const VERSION = JSON.parse(readFileSync('plugin/.claude-plugin/plugin.json', 'utf8')).version

const ROLES =
  '# Roles\n\n| Role | Can do | Cannot do |\n|---|---|---|\n' +
  '| Cook | Save their own recipes. | See another account\'s records. |\n'

const DRIVERS =
  '# Pick Three\n\n| # | Characteristic | Observable measure | Fitness function |\n|---|---|---|---|\n' +
  '| 1 | **Simplicity** | No import cycles | FF-001 |\n'

// --- FF-014: half a measurement is not a measurement ---------------------------------------------

test('UTEST-070: FF-014 is NOT RUN when only one of its two checks could run', () => {
  // Check 8 runs — there is a roles table. Check 9 cannot: no drivers file exists, which is the
  // ordinary state of every workspace before Round 4. Exit 2 is not-run; 0 would be a pass over
  // a driver check that never happened.
  const r = onSet('ff-014-drivers-and-denials.mjs', { 'spec/x.md': ROLES })
  assert.equal(r.code, 2, `FF-014 must not report a pass here:\n${r.stdout}`)
  assert.match(r.stdout, /NOT RUN/)
  assert.match(r.stdout, /no claim is made about the kit either way/)
})

test('UTEST-070: FF-014 passes when BOTH checks ran and both are clean', () => {
  const r = onSet('ff-014-drivers-and-denials.mjs', {
    'spec/x.md': ROLES,
    'spec/01-docs/02-requirements/driving-characteristics.md': DRIVERS,
  })
  assert.equal(r.code, 0, r.stdout)
  assert.match(r.stdout, /RESULT: pass/)
})

test('UTEST-070: FF-014 still FAILS when a check that ran found something', () => {
  const r = onSet('ff-014-drivers-and-denials.mjs', {
    'spec/x.md': ROLES,
    'spec/01-docs/02-requirements/driving-characteristics.md':
      DRIVERS.replace('| FF-001 |', '| |'),
  })
  assert.equal(r.code, 1, r.stdout)
  assert.match(r.stdout, /driving characteristic with no fitness function/)
})

const entryPoint = (body) => ({ 'spec/CLAUDE.md': `# Map\n\n- [P](README.md)\n\n${body}\n`, 'spec/README.md': '# P\n' })

// --- FF-013: the same rule, one file over ---------------------------------------------------------

test('UTEST-070: FF-013 reaches all three states, and never a pass on a check that did not run', () => {
  // NOT A FIX — a guard. The audit found FF-013 could pass having resolved zero paths, and
  // that whole defect lives in validation check 10's path extraction, which FF-013 only
  // delegates to. Nothing in this file needed to change.
  //
  // What this file DOES carry is FF-014's shape: `applies` restates check 10's own
  // precondition as a second, independent judgement, and `measure` filters on `failed` — so
  // if the two ever drift, a not-run check contributes nothing and FF-013 prints a pass for
  // a check that never happened. They cannot drift today, so there is no failing case to
  // write and no fix to make. This pins all three outcomes so that the day they do drift,
  // something says so.
  const noMap = onSet('ff-013-entry-point.mjs', { 'spec/README.md': '# P\n' })
  assert.equal(noMap.code, 2, `no entry point is not-run, never a pass:\n${noMap.stdout}`)
  assert.match(noMap.stdout, /NOT RUN/)

  const withMap = onSet('ff-013-entry-point.mjs', entryPoint('Nothing else.'))
  assert.equal(withMap.code, 0, `an entry point whose one link resolves passes:\n${withMap.stdout}`)

  const broken = onSet('ff-013-entry-point.mjs', {
    'spec/CLAUDE.md': '# Map\n\n- [Gone](01-docs/nowhere.md)\n',
    'spec/README.md': '# P\n',
  })
  assert.equal(broken.code, 1, `a broken link still fails:\n${broken.stdout}`)
})

// --- FF-011: an honest gap, and a wrong stamp -----------------------------------------------------

test('UTEST-070: FF-011 FAILS on a wrong stamp, whatever unrelated [TODO] the file carries', () => {
  const r = onSet(
    'ff-011-version-stamp.mjs',
    entryPoint('Plugin version: 0.0.1\n\nCommands: [TODO: which API version do we target?]')
  )
  assert.equal(r.code, 1, `a wrong stamp must fail:\n${r.stdout}`)
  assert.match(r.stdout, /stamps 0\.0\.1/)
})

test('UTEST-070: FF-011 passes on the one sanctioned marker, and only when nothing was stamped', () => {
  const r = onSet('ff-011-version-stamp.mjs', entryPoint('Plugin version: [TODO: plugin version could not be determined]'))
  assert.equal(r.code, 0, r.stdout)
})

test('UTEST-070: FF-011 FAILS on a missing stamp with a differently worded excuse', () => {
  const r = onSet('ff-011-version-stamp.mjs', entryPoint('Plugin version: [TODO: find out the version]'))
  assert.equal(r.code, 1, `only the sanctioned string is an honest gap:\n${r.stdout}`)
  assert.match(r.stdout, /carries no plugin version/)
})

test('UTEST-070: FF-011 passes on the right stamp', () => {
  const r = onSet('ff-011-version-stamp.mjs', entryPoint(`Plugin version: ${VERSION}`))
  assert.equal(r.code, 0, r.stdout)
})

// --- FF-007: the two artifacts the kit writes that are not filled blueprints -----------------------

const wrapper = (rel) => wrapperArtifact(blueprintText(rel), rel)

test('UTEST-070: FF-007 accepts a byte-perfect .gitignore and .env.example', () => {
  const gi = wrapper('gitignore.md')
  const env = wrapper('env-example.md')
  const r = onSet('ff-007-structure-matches-blueprint.mjs', {
    [`spec/${gi.target}`]: gi.content,
    [`spec/${env.target}`]: env.content,
  })
  assert.equal(r.code, 0, `the kit's own output must not fail its own check:\n${r.stdout}`)
})

test('UTEST-070: the exemption is the blueprint\'s declared target, not a file extension', () => {
  // A non-Markdown file whose blueprint declares no target is still checked — so a stray
  // artifact cannot hide behind the same door the two wrappers use.
  const r = onSet('ff-007-structure-matches-blueprint.mjs', {
    'spec/notes.txt': '# Notes\n\n# Blueprint: blueprints/README.md\n',
  })
  assert.equal(r.code, 1, r.stdout)
  assert.match(r.stdout, /notes\.txt diverges/)
})

test('UTEST-070: a Markdown file whose outline diverges still FAILS', () => {
  const r = onSet('ff-007-structure-matches-blueprint.mjs', {
    'spec/README.md': '# Something else entirely\n\n> Blueprint: blueprints/README.md\n',
  })
  assert.equal(r.code, 1, r.stdout)
  assert.match(r.stdout, /diverges from blueprints\/README\.md at heading 1/)
})
