// The golden set, and the one shape every workspace fitness function has.
//
// FF-004 to FF-014 all do the same thing: walk every golden workspace, count something that
// must be zero, and name each occurrence. Written eleven times that is eleven chances to
// enumerate the set differently, eleven report formats, and eleven places to remember when a
// case is added. Written once it is a loop.
//
// The split follows ci/eval-runner.mjs and ci/scorers.mjs, for the same reason: the mechanism
// is general, the measurement is specialised, and adding a measurement must not require
// touching the mechanism (Ousterhout Ch. 6).
//
// WHY THESE ARE NOT IN THE MERGE GATE YET. A fitness function is only as good as what it walks,
// and the one golden workspace that exists was partly authored by hand — a run driven from its
// own answers produced a different heading outline for `intent.md`, because the fixture dropped
// a heading the blueprint has. Gating on it would fail every merge for a reason that is true
// about the fixture rather than about the kit. They go into gate.yml when the golden set is
// something a run produced (TASK-016, cicd-pipeline.md stage 4).

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { PAYLOAD_ROOT, toPosix, report } from './payload.mjs'

export const GOLDEN_ROOT = 'tests/fixtures/golden'

/**
 * Every blueprint the manifest lists, as payload-relative POSIX paths.
 *
 * ONLY THE ROWS THAT CARRY A DIGEST. The manifest holds two tables and the second one is
 * `## Deliberately not packaged` — a record of what the library does NOT contain, kept so an
 * absence reads as a decision. A pattern that matched any backticked first cell read both, so
 * this returned **88** members for an 81-file library, and four of the seven extras are not
 * paths at all: `Architecture.png, architecture-types.png` is a sentence.
 *
 * Validation check 13 consumes this list, so a workspace that had filled every real blueprint
 * still came back "6 blueprint(s) neither filled nor skipped", and `structural_checks` printed
 * BREACH for a perfect run exactly as for an empty sandbox. A check that fails on correct work
 * is a check somebody switches off.
 *
 * The digest column is the thing that tells the two tables apart, so the row has to have one.
 * `tests/unit/test_ATEST-050_round_map_covers_the_manifest.mjs` already reads it this way.
 *
 * ONE DERIVATION SHORT OF WHERE THIS SHOULD END UP. PR #57 adds `manifestBlueprints()` to
 * ci/validation.mjs — the same rule, found independently, from the check-13 side. It is not on
 * main yet, so importing it here would put this branch's suite on an unmerged one. When it lands,
 * this function becomes `export const parseLibrary = manifestBlueprints` or goes entirely: one
 * derivation, three callers. Removing the runner's copy was the half that could be done today.
 */
export const parseLibrary = (text) =>
  text
    .split('\n')
    .map((l) => (l.match(/^\| `([^`]+)` \| `[0-9a-f]{64}` \|\s*$/) || [])[1])
    .filter(Boolean)

export const library = () => parseLibrary(readFileSync(`${PAYLOAD_ROOT}/blueprints/MANIFEST.md`, 'utf8'))

/** A blueprint's own text, for the checks that compare a generated file against its source. */
export const blueprintText = (rel) => {
  const p = join(PAYLOAD_ROOT, 'blueprints', rel)
  return existsSync(p) ? readFileSync(p, 'utf8') : null
}

const walk = (dir, acc = []) => {
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}

/**
 * Every golden workspace, as `{ id, root, workspace }`.
 *
 * A case is a DIRECTORY under the golden root. `EV-001-answers.md` sits beside `EV-001/` rather
 * than inside it precisely so that walking the case does not sweep the answer record into the
 * workspace — an input would then be checked as though the kit had produced it.
 */
export function goldenWorkspaces(root = GOLDEN_ROOT) {
  if (!existsSync(root)) return []
  return readdirSync(root)
    .filter((name) => statSync(join(root, name)).isDirectory())
    .sort()
    .map((id) => {
      const caseRoot = join(root, id)
      return {
        id,
        root: caseRoot,
        workspace: Object.fromEntries(
          walk(caseRoot).map((p) => [toPosix(p.slice(caseRoot.length + 1)), readFileSync(p, 'utf8')])
        ),
      }
    })
}

/**
 * Run one measurement over every golden workspace and report it the way every other check
 * reports.
 *
 * @param measure  (workspace, case) -> string[]  one line per violation, empty when clean
 *
 * AN EMPTY GOLDEN SET IS NOT A PASS. Zero violations across zero workspaces is the shape of
 * every check this repository has had to fix: it matches nothing and reports success. The
 * caller gets `notRun`, and BR-009 decides what that means — never "passed".
 */
export function walkGolden({
  id,
  guards,
  threshold,
  measure,
  scope = [],
  // Some checks only have something to say about a FINISHED workspace. The entry point is the
  // last file a run writes (intake.md step 4), so a workspace stopped at Round 3 has none —
  // and "no entry point, therefore no broken links in it" is a pass earned by having nothing
  // to check. `applies` lets a case be reported as not measured instead.
  applies = () => true,
  root = process.argv[2] ?? GOLDEN_ROOT,
}) {
  const cases = goldenWorkspaces(root)
  const why = (reason) => {
    console.log(`${id} — guards ${guards}`)
    console.log(`  threshold: ${threshold}`)
    console.log(`  RESULT: NOT RUN — ${reason}`)
    console.log('  no claim is made about the kit either way.')
    return 2
  }
  if (!cases.length) return why(`no golden workspace exists under ${root}/, so nothing was walked`)

  const measurable = cases.filter((c) => applies(c.workspace, c))
  const skipped = cases.filter((c) => !measurable.includes(c))
  if (!measurable.length)
    return why(`none of ${cases.length} golden workspace(s) is far enough along to measure: ${cases.map((c) => c.id).join(', ')}`)

  const violations = measurable.flatMap((c) => measure(c.workspace, c).map((v) => `${c.id}: ${v}`))
  return report({
    id,
    guards,
    threshold,
    found: violations.length,
    detail: [
      `golden workspaces walked: ${measurable.map((c) => c.id).join(', ')}`,
      // Named, never silent. A check that quietly skips half the set reports a pass over the
      // half it liked, and the number it prints is indistinguishable from full coverage.
      ...skipped.map((c) => `not measured: ${c.id} is not far enough along for this check`),
      ...violations,
    ],
    scope,
  })
}

/** Only the files a run generated. A case directory holds nothing else, but say so rather than assume. */
export const generated = (workspace) => Object.entries(workspace).filter(([p]) => p.startsWith('spec/'))
