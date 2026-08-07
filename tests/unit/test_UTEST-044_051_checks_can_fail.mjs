// UTEST-044…051 — the seven validation checks that judged nothing, each pinned in BOTH
// directions. Requirement: REQ-F-029 · BR-009 · BR-010 · technical-spec §11.
//
// WHY THIS FILE EXISTS. A 400-agent audit of this repository found seven checks in
// `ci/validation.mjs` that could not do the job their name claims. They were not subtly wrong.
// Five of them could not fail at all, one could not pass, and one could not run:
//
//   check 2   flagged EVERY requirement as a duplicate once the traceability matrix was filled
//   check 6   paired a [TODO] with any Q-### within 300 characters — byte distance, not a citation
//   check 7   required every cell in a row to be blank, so it matched no row the rule is about
//   check 8   counted "must not" and "cannot" anywhere in the workspace; 46 of 81 blueprints ship one
//   check 9   accepted one FF-### anywhere as proof that every driver was governed
//   check 10  could never run, and a not-run check forbids writing the file it needs
//   check 13  matched a recorded skip against manifest paths while the instructions teach a filename
//
// Every test below is a pair: a fixture that must PASS and a fixture that must FAIL. This
// repository's recurring defect is a check that matches nothing, and its second-commonest is a
// check that matches too much — a one-directional test cannot tell either from correct work.
//
// The failing halves were all verified red against the pre-fix module. BR-010: an intent with
// nothing that would notice its absence is decoration.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CHECKS, validate, report } from '../../ci/validation.mjs'

const doc = readFileSync('plugin/instructions/validation.md', 'utf8')
const coverage = readFileSync('plugin/instructions/coverage.md', 'utf8')

/** Prose assertions normalise first. Eleven defects here have been a regex dying on a wrap. */
const flat = (text) => text.replace(/\s+/g, ' ')
const says = (text, phrase) => assert.ok(flat(text).includes(phrase), `the module must state: ${phrase}`)

const back = (bp = 'README.md') => `\n> Blueprint: blueprints/${bp}\n`

// --- UTEST-044: check 2, a citation is not a definition ---------------------------------------

const requirements = (text = 'A cook can save a recipe with its ingredients.') =>
  `# Requirements\n\n| ID | Requirement | Priority |\n|---|---|---|\n| REQ-F-001 | ${text} | Must |\n${back()}`

test('UTEST-044: a filled traceability matrix is not a second definition of every requirement', () => {
  // The false positive, at full size. traceability.md's first column IS the requirement ID —
  // that is what a traceability matrix is — so the old rule reported one failure line per
  // requirement in every workspace that reached Round 8, on correct work.
  const ws = {
    'spec/01-docs/02-requirements/requirements.md': requirements(),
    'spec/01-docs/08-traceability/traceability.md':
      '# RTM\n\n| Req ID | Requirement | Design / Spec section | Task ID | Test ID | Review status |\n' +
      '|---|---|---|---|---|---|\n' +
      '| REQ-F-001 | A cook can save a recipe with its ingredients. | Tech spec §4 | TASK-004 | TEST-012 | Approved |\n' +
      back(),
  }
  const r = CHECKS[2].run(ws)
  assert.equal(r.state, 'passed', r.detail.join(' · '))
  // And the check states its own blind spot rather than hiding it.
  assert.match(r.detail[0], /read as citations, not definitions/)
})

test('UTEST-044: a real second definition, in a second file, still fails', () => {
  // The direction that must survive the fix. Same identifier, a different statement of what it
  // is, in a table that defines things — which is a reused ID, and it silently re-points a
  // test, a task and a matrix row at something else.
  const ws = {
    'spec/01-docs/02-requirements/requirements.md': requirements(),
    'spec/01-docs/03-product-spec/product-spec.md': requirements('A cook can delete an entire meal plan.'),
  }
  const r = CHECKS[2].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /REQ-F-001 is defined in .* and /)
})

test('UTEST-044: the rule is written down, with the shapes it reads as citations', () => {
  says(doc, 'a row that cites an identifier is not a second definition of it')
  says(doc, 'the table declares two or more ID columns')
  says(doc, 'the row cites two or more other identifiers')
  says(doc, 'no cell after the first holds prose')
  says(doc, 'This errs toward missing a duplicate rather than inventing one')
})

// --- UTEST-045: check 6, a citation is not a distance -------------------------------------------

const openQuestions = (...rows) =>
  '# Open Questions\n\n| ID | Question | Why it matters | Owner | Status |\n|---|---|---|---|---|\n' +
  rows.map((r) => `| ${r} |\n`).join('')

test('UTEST-045: a Q-### row near an unrelated [TODO] does not pair with it', () => {
  // The defect, reproduced. The marker and the question are about different things and sit
  // close together, which used to be the entire test. Nothing about the workspace says who
  // owns the gap or when it closes.
  const ws = {
    'spec/x.md': `# X\n\n| Q-001 | Which units are supported? | Scope | Owner | Open |\n\n| Retention | [TODO: how long is data kept?] |\n${back()}`,
  }
  const r = CHECKS[6].run(ws)
  assert.equal(r.state, 'failed', 'proximity is not a citation')
  assert.match(r.detail[0], /how long is data kept/)
})

test('UTEST-045: the same marker, ~520 characters away, used to flip the verdict — now it does not', () => {
  // The proof that the old verdict was byte distance: padding changed nothing about either the
  // marker or the question, and reversed the result. Both spacings must now agree.
  const near = { 'spec/x.md': `# X\n\n| Q-001 | Which units? | Scope | Owner | Open |\n\n[TODO: how long is data kept?]\n${back()}` }
  const far = { 'spec/x.md': `# X\n\n| Q-001 | Which units? | Scope | Owner | Open |\n${'\nfiller line of prose that pushes the marker away.'.repeat(12)}\n\n[TODO: how long is data kept?]\n${back()}` }
  assert.equal(CHECKS[6].run(near).state, CHECKS[6].run(far).state)
  assert.equal(CHECKS[6].run(near).state, 'failed')
})

test('UTEST-045: a citation inside the marker pairs — and only to a question that exists', () => {
  const cited = {
    'spec/01-docs/01-intent/open-questions.md': openQuestions('Q-004 | Retention period for a list | Storage | Owner | Open'),
    'spec/x.md': `# X\n\n| Retention | [TODO: how long is data kept? — Q-004] |\n${back()}`,
  }
  assert.equal(CHECKS[6].run(cited).state, 'passed')

  // The same citation with no row behind it is the orphan case wearing an identifier.
  const invented = { 'spec/x.md': `# X\n\n| Retention | [TODO: how long is data kept? — Q-004] |\n${back()}` }
  const r = CHECKS[6].run(invented)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /cites Q-004, which has no Q-### row/)
})

test('UTEST-045: the written rule says what "beside itself" means', () => {
  says(doc, "inside the marker's brackets or in the row that carries it")
  says(doc, 'It used to mean *within 300 characters*, which is byte distance rather than a citation')
})

// --- UTEST-046: check 7, touched and not decided ------------------------------------------------

const rateLimits = (loginRow) =>
  `# Runtime\n\n| Endpoint | Limit | Window | Keyed by | On breach | Notes |\n|---|---|---|---|---|---|\n${loginRow}\n${back()}`

test('UTEST-046: a row that names its subject and decides nothing FAILS', () => {
  // The real row, from runtime-and-scale.md. The endpoint is named; the limit and the window
  // are not. Check 5 passes it (one cell is filled), FF-004 passes it (no placeholder), and
  // check 7 used to pass it because the FIRST cell is not empty — which exempted exactly the
  // rows the rule is written about.
  const ws = { 'spec/x.md': rateLimits('| Login | | | per IP + per account | 429 + `Retry-After` | |') }
  const r = CHECKS[7].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail[0], /spec\/x\.md line \d+/, 'a failure must name what and where')
  assert.match(r.detail[0], /Login/)
})

test('UTEST-046: a row with a single unfilled cell is sparse, not undecided', () => {
  // The false positive this must not trade for. A traceability row with no code link yet is
  // how a legitimately sparse table reads, and failing those would fail correct work in every
  // workspace that reaches Round 8.
  const ws = {
    'spec/x.md':
      '# RTM\n\n| Req ID | Requirement | Task | Code link | Status |\n|---|---|---|---|---|\n' +
      '| REQ-F-001 | A cook can save a recipe. | TASK-004 | | Approved |\n' + back(),
  }
  assert.equal(CHECKS[7].run(ws).state, 'passed')
})

test('UTEST-046: a row with every cell blank still fails, and is not read as a delimiter', () => {
  // `| | |` matches the shape of a `|---|---|` separator in every respect but the dash. A
  // parser that skipped it would make check 7 silent on its own subject.
  assert.equal(CHECKS[7].run({ 'spec/x.md': `# X\n\n| A | B |\n|---|---|\n| | |\n${back()}` }).state, 'failed')
})

test('UTEST-046: the written rule names the row it is about', () => {
  says(doc, 'A row with every cell blank is a row nobody has opened')
  says(doc, 'Two or more adjacent empty cells, wherever they fall in the row')
})

// --- UTEST-047: check 8, a deny test per rule ---------------------------------------------------

const roles = (cannot) => `| Role | Can do | Cannot do |\n|---|---|---|\n| Cook | Save their own recipes | ${cannot} |\n\n`
const roleRules = (rows) => `| ID | Role requirement |\n|---|---|\n${rows}\n\n`

test('UTEST-047: permission rules with no deny test FAIL, however much prose surrounds them', () => {
  // The defect exactly. Every "must not" and "cannot" below is ordinary English about
  // something else — and one of them is the column header of the roles table itself. The old
  // check counted them and passed.
  const ws = {
    'spec/x.md':
      '# Roles\n\nOpen questions must not be treated as assumptions, and a reader cannot be\n' +
      'expected to guess. This section must not be skipped.\n\n' +
      roles('') +
      roleRules('| REQ-R-001 | The system supports exactly one role, the cook. |') +
      back(),
  }
  const r = CHECKS[8].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /not one denial|nothing it cannot do/)
})

test('UTEST-047: a denial rule with no test citing it is named', () => {
  const ws = {
    'spec/x.md':
      '# Roles\n\n' + roles('Read another account’s records') +
      roleRules(
        '| REQ-R-001 | The system supports exactly one role, the cook. |\n' +
        '| REQ-R-002 | A cook must not be able to read a record owned by another account. |'
      ) + back(),
  }
  const r = CHECKS[8].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /REQ-R-002 is a denial with no acceptance criterion or test citing it/)
})

test('UTEST-047: the rule, its denial, and the criterion that cites it — passes', () => {
  const ws = {
    'spec/x.md':
      '# Roles\n\n' + roles('Read another account’s records') +
      roleRules(
        '| REQ-R-001 | The system supports exactly one role, the cook. |\n' +
        '| REQ-R-002 | A cook must not be able to read a record owned by another account. |'
      ) +
      '\n| ID | Requirement | Criterion |\n|---|---|---|\n' +
      '| AC-005 | REQ-R-002 | **Given** another account’s recipe, **When** it is requested, **Then** the response is 404. |\n' +
      back(),
  }
  const r = CHECKS[8].run(ws)
  assert.equal(r.state, 'passed', r.detail.join(' · '))
  assert.match(r.detail[0], /denial\(s\), each with a test that cites it/)
})

test('UTEST-047: a workspace with no permission rules is NOT RUN, never passed', () => {
  const r = CHECKS[8].run({ 'spec/x.md': `# X\n\nNothing here declares a role. A list cannot be empty.\n${back()}` })
  assert.equal(r.state, 'not-run')
})

test('UTEST-047: the written rule says where the denial words may be read', () => {
  says(doc, 'The same words still mark a denial. The difference is entirely in **what the check is allowed to read them in**')
  says(doc, 'a **deny test** is an `AC-###` or `*TEST-###` row that **cites that rule by identifier**')
  says(doc, 'an allow-only rule set passes identically on a system with no enforcement')
})

// --- UTEST-048: check 9, per driver ------------------------------------------------------------

const drivers = (...cells) =>
  '# Pick Three\n\n| # | Characteristic | Precise definition | Observable measure | Fitness function |\n' +
  '|---|---|---|---|---|\n' +
  cells.map((ff, i) => `| ${i + 1} | **Driver ${i + 1}** | It is defined here at length. | It is measured here. | ${ff} |\n`).join('') +
  back()

test('UTEST-048: one FF-### elsewhere in the workspace no longer governs three drivers', () => {
  // Three drivers, the first one measured, the other two adjectives. The old check tested
  // /FF-\d{3}/ against the whole workspace, so this passed and reported "3 drivers declared".
  const ws = {
    'spec/01-docs/02-requirements/driving-characteristics.md': drivers('FF-001', '', 'to be decided'),
    'spec/01-docs/04-technical-spec/fitness-functions.md': `# FFs\n\n| ID | Guards | Check |\n|---|---|---|\n| FF-001 | Driver 1 | counts things |\n${back()}`,
  }
  const r = CHECKS[9].run(ws)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /driver 2 .* names no fitness function/)
  assert.match(r.detail.join(' '), /driver 3/)
})

test('UTEST-048: every driver naming its own fitness function passes', () => {
  const ws = {
    'spec/01-docs/02-requirements/driving-characteristics.md': drivers('FF-001', 'FF-002, FF-003', 'FF-004'),
  }
  const r = CHECKS[9].run(ws)
  assert.equal(r.state, 'passed', r.detail.join(' · '))
  assert.match(r.detail[0], /^3 drivers declared/)
})

test('UTEST-048: the written rule says the evidence is in the row', () => {
  says(doc, "And it is asked per driver, from the driver's own row")
  says(doc, 'The row names its own fitness function, or that driver is documented rather than governed')
})

// --- UTEST-049: check 10, the walk runs twice ---------------------------------------------------

/** Everything a finished workspace needs, minus the entry point — so twelve checks can run. */
const finished = () => ({
  'spec/01-docs/01-intent/intent.md':
    '# Intent\n\n| ID | Requirement | Priority |\n|---|---|---|\n| REQ-F-001 | A cook can save a recipe. | Must |\n\n' +
    roles('Read another account’s records') +
    roleRules('| REQ-R-002 | A cook must not be able to read a record owned by another account. |') +
    '| ID | Requirement | Criterion |\n|---|---|---|\n' +
    '| AC-005 | REQ-R-002 | **Given** another account’s recipe, **When** it is requested, **Then** the response is 404. |\n' +
    back('01-docs/01-intent/intent.md'),
  'spec/01-docs/02-requirements/driving-characteristics.md':
    drivers('FF-001').replace(back(), back('01-docs/02-requirements/driving-characteristics.md')),
  'spec/README.md': `# Project\n\n| ID | Guards | Check |\n|---|---|---|\n| FF-001 | Driver 1 | counts the commands this plugin adds |\n${back()}`,
  'spec/.gitignore': '.env\n\n# Blueprint: blueprints/gitignore.md\n',
})
const LIBRARY = [
  '01-docs/01-intent/intent.md',
  '01-docs/02-requirements/driving-characteristics.md',
  'README.md',
  'gitignore.md',
]

test('UTEST-049: before the entry point exists, the walk permits writing it and refuses success', () => {
  // THE DEADLOCK. Validation runs before the entry point is written; check 10 reads the entry
  // point; a not-run check forbids writing anything further. Three rules, one loop, and every
  // clean eight-round interview ended with no map and "NOT fully validated".
  const v = validate(finished(), LIBRARY)
  assert.equal(v.results.find((c) => c.n === 10).state, 'not-run')
  assert.equal(v.failed, 0, 'nothing is wrong with this workspace')
  assert.equal(v.mayWriteEntryPoint, true, 'so the file check 10 is waiting for may be written')
  assert.equal(v.mayClaimSuccess, false, 'and success is still not claimable — the walk must run again')
  assert.match(report(v), /Check 10 is waiting for the entry point: write it, then run the walk again/)
})

test('UTEST-049: the second walk, with the entry point written, may claim success', () => {
  const ws = finished()
  ws['spec/CLAUDE.md'] = `# Map\n\n## Start here\n\n| You need | Read |\n|---|---|\n| The project | [README](README.md) |\n${back()}`
  const v = validate(ws, LIBRARY)
  assert.equal(v.mayClaimSuccess, true, JSON.stringify(v.results.filter((c) => c.state !== 'passed')))
  assert.equal(report(v), `All ${v.total} checks ran; all ${v.total} passed.`)
})

test('UTEST-049: any OTHER not-run still blocks the entry point', () => {
  // The permission is exactly one state wide. A workspace nobody could check for coverage must
  // not get a map saying it is finished.
  const v = validate(finished(), null)
  assert.equal(v.mayWriteEntryPoint, false)
  assert.equal(v.mayClaimSuccess, false)
})

test('UTEST-049: a failing check blocks the entry point too', () => {
  const ws = finished()
  ws['spec/README.md'] += '\nSee REQ-F-404, which nothing in this workspace defines.\n'
  const v = validate(ws, LIBRARY)
  assert.equal(v.failed, 1, 'check 1 must be the thing that failed')
  assert.equal(v.mayWriteEntryPoint, false)
})

test('UTEST-049: the ordering is written down, both passes and their questions', () => {
  says(doc, 'The walk runs twice, and check 10 is the reason')
  says(doc, 'May the entry point be written?')
  says(doc, 'May success be claimed?')
  says(doc, 'It is broken by **ordering, not by leniency**')
  says(doc, 'Every other not-run still blocks it')
})

// --- UTEST-050: check 10 reads the paths a map actually writes ----------------------------------

test('UTEST-050: a Start-here table of backticked paths is read, and a broken one fails', () => {
  // "0 paths resolve" printed as a pass. The library's own README writes paths in backticks,
  // so an entry point in the house style was checked against nothing at all.
  const ws = {
    'spec/CLAUDE.md': '# Map\n\n## Start here\n\n| You need | Read |\n|---|---|\n| Why | `01-docs/01-intent/intent.md` |\n',
    'spec/01-docs/01-intent/intent.md': '# Intent\n',
  }
  assert.equal(CHECKS[10].run(ws).state, 'passed')

  const broken = { ...ws, 'spec/CLAUDE.md': ws['spec/CLAUDE.md'].replace('intent.md', 'nowhere.md') }
  const r = CHECKS[10].run(broken)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /nowhere\.md, which does not exist/)
})

test('UTEST-050: a Start-here section that resolves no path at all fails', () => {
  const r = CHECKS[10].run({ 'spec/CLAUDE.md': '# Map\n\n## Start here\n\nRead the requirements, then the tasks.\n' })
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /resolves no path/)
})

// --- UTEST-051: check 13, the skip row as the instructions teach it ------------------------------

const MANIFEST = [
  '01-docs/01-intent/intent.md',
  '01-docs/04-technical-spec/frontend-component-spec.md',
  '01-docs/10-reference/appendix-index.md',
]
const withSkip = (row) => ({
  'spec/01-docs/01-intent/intent.md': '# Intent\n\n> Blueprint: blueprints/01-docs/01-intent/intent.md\n',
  'spec/01-docs/09-change-control/spec-change-log.md':
    `# Change log\n\n| Date | Stage or type | Artifact | Reason |\n|---|---|---|---|\n${row}`,
})

test('UTEST-051: the skip row exactly as coverage.md shows it satisfies the check', () => {
  // The instruction shows a bare filename; the check compared full manifest paths with `===`.
  // A skip recorded exactly as documented matched nothing, so every API-only product failed
  // check 13 for doing what it was shown.
  says(coverage, '| 2026-08-04 | Skipped | frontend-component-spec.md | API-only product; no interface to describe |')
  const r = CHECKS[13].run(withSkip('| 2026-08-04 | Skipped | frontend-component-spec.md | API-only product; no interface |\n'), MANIFEST)
  assert.equal(r.state, 'passed', r.detail.join(' · '))
})

test('UTEST-051: the full manifest path is accepted too, and the exclusion is named out loud', () => {
  const r = CHECKS[13].run(
    withSkip('| 2026-08-04 | Skipped | 01-docs/04-technical-spec/frontend-component-spec.md | API-only product |\n'),
    MANIFEST
  )
  assert.equal(r.state, 'passed')
  assert.match(r.detail.join(' '), /appendix-index\.md is a permanent manifest exclusion/)
})

test('UTEST-051: a skip that resolves to nothing is a finding, not a silent pass', () => {
  const r = CHECKS[13].run(withSkip('| 2026-08-04 | Skipped | no-such-blueprint.md | we did not need it |\n'), MANIFEST)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /matches no blueprint in the manifest/)
})

test('UTEST-051: an ambiguous filename asks for the path rather than guessing', () => {
  const twins = ['a/README.md', 'b/README.md']
  const r = CHECKS[13].run(withSkip('| 2026-08-04 | Skipped | README.md | not needed in either place |\n'), twins)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /matches 2 blueprints — record the full manifest path/)
})

test('UTEST-051: a blueprint neither filled nor skipped still fails, named by path', () => {
  const r = CHECKS[13].run(withSkip(''), MANIFEST)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /frontend-component-spec\.md/)
})

test('UTEST-051: given the manifest itself, only the blueprints are required', () => {
  // MANIFEST.md holds two tables of backticked paths: blueprints with a checksum, and
  // "Deliberately not packaged" with a reason. A reader that takes both demands coverage of
  // six entries no run can ever fill — four of which are not paths at all — and check 13 then
  // fails every possible complete run.
  const manifest = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')
  const scraped = manifest.split('\n').map((l) => (l.match(/^\| `([^`]+)` \|/) || [])[1]).filter(Boolean)
  const blueprints = [...manifest.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`[0-9a-f]{64}`\s*\|/gm)].map((m) => m[1])
  assert.ok(scraped.length > blueprints.length, 'the two tables are distinguishable, and this is the difference')

  // A workspace that filled every blueprint. Given the manifest text, check 13 can pass; given
  // the over-scraped list it cannot, and the difference is the entries that carry no checksum.
  const complete = Object.fromEntries(blueprints.map((b, i) => [`spec/f${i}.md`, `# F\n\n> Blueprint: blueprints/${b}\n`]))
  assert.equal(CHECKS[13].run(complete, manifest).state, 'passed')
  const r = CHECKS[13].run(complete, scraped)
  assert.equal(r.state, 'failed')
  assert.match(r.detail.join(' '), /MASTER-PROMPT\.md|steps\.md/)
})

test('UTEST-051: the two forms and the exclusion are written down', () => {
  says(doc, 'A recorded skip is resolved against the manifest, not compared to it')
  says(doc, 'the full manifest path, or the filename when the manifest holds exactly one blueprint with that name')
  says(doc, "The manifest's own permanent exclusion is named in the result, not applied in silence")
})
