// The eleven deterministic scorers (ai-evals.md §2).
//
// SCORERS LIVE HERE; THE ENGINE LIVES NEXT DOOR. Adding a scorer means adding an entry to
// this array and nothing else — get that split wrong and every experiment becomes a harness
// change, forever (Ousterhout Ch. 6: one general mechanism, specialised behaviour at the
// edges).
//
// Eleven of thirteen are deterministic, and that ratio is a decision rather than an accident.
// Deterministic scorers are free, fast, and not themselves model-driven. THERE IS NO
// MODEL-GRADED SCORER: grading a model-driven system with a model drifts on both sides at
// once, and the drift is invisible because both sides move together.
//
// The other two scorers are human and sampled. They measure the one thing no count can —
// whether the workspace SAYS anything — and they gate the release rather than the merge.

import { unfilled, todos, blueprintOf } from './fill.mjs'
import { validate } from './validation.mjs'
import { forbiddenStateFiles } from './acceptance.mjs'

const files = (ws) => Object.entries(ws)
const markdown = (ws) => files(ws).filter(([p]) => p.endsWith('.md'))
const text = (ws) => Object.values(ws).join('\n')

/** Every fictional product the blueprint library's worked examples name, plus the heading
 *  itself. Kept beside `NO_EXAMPLE_EXPECTED` in the C2 test conceptually: adding a worked
 *  example about a new fictional product means adding its name here, or the leak is silent. */
export const EXAMPLE_MARKERS = /ProjectBoard|TeamTask Lite|SaaS task app|# WORKED EXAMPLE/g

/** Code in the shape real code has it — the same two patterns validation check 11 uses, and for
 *  the reason recorded there: bare keywords matched "definition" and "classification". */
const CODE = [
  /```(js|ts|python|java|go|rb|php|cs|rust|jsx|tsx)\b/i,
  /^\s*(function\s+\w+\s*\(|class\s+\w+[\s({:]|def\s+\w+\s*\(|import\s+[\w{*].*\sfrom\s|const\s+\w+\s*=\s*\()/m,
]

/**
 * Files in the workspace that are not Markdown — the half validation check 11 cannot see.
 *
 * A wrapper artifact is the one legitimate non-Markdown file a run produces (Q-024): `.gitignore`
 * and `.env.example` are written by the fill procedure and carry its back-link as a comment.
 * They are recognised BY THAT BACK-LINK and not by name, because an exemption list keyed on
 * filenames is how the exemption grows until the check means nothing — and a file that carries a
 * back-link and still looks like code is counted anyway.
 */
export const sourceFiles = (ws) =>
  Object.entries(ws)
    .filter(([p]) => !p.toLowerCase().endsWith('.md'))
    .filter(([, t]) => blueprintOf(t) === null || CODE.some((re) => re.test(t)))
    .map(([p]) => p)

/** A scorer: { name, kind, measure(run) -> number, floor, hardFail, requires }.
 *  `run` is { workspace, library, rounds, outside, notices, suppressed, coreFiles, supportingFiles }.
 *
 *  `requires` names the fields a scorer cannot measure without. A run that does not supply them
 *  makes the scorer NOT RUN rather than zero — see `score()` in ci/eval-runner.mjs. */
export const SCORERS = [
  {
    name: 'structural_checks',
    kind: 'deterministic',
    measure: (r) => validate(r.workspace, r.library).failed,
    floor: 0,
    hardFail: true,
    note: 'the whole validation walk, failing on any check that failed',
  },
  {
    name: 'ids_resolve',
    kind: 'deterministic',
    measure: (r) => (validate(r.workspace, r.library).results.find((c) => c.n === 1)?.state === 'failed' ? 1 : 0),
    floor: 0,
    hardFail: true,
  },
  {
    name: 'no_leftover_template',
    kind: 'deterministic',
    measure: (r) => markdown(r.workspace).reduce((n, [, t]) => n + unfilled(t).length, 0),
    floor: 0,
    hardFail: true,
  },
  {
    name: 'no_example_content',
    kind: 'deterministic',
    // Every product the library's worked examples name — not just ProjectBoard. 24 blueprints
    // had an example that ADR-003 step 2 could not strip, and the two that leaked "TeamTask
    // Lite" and "SaaS task app" were invisible to a one-name check. A leak detector that knows
    // one name reports zero leaks for every other name (BR-002).
    measure: (r) => (text(r.workspace).match(EXAMPLE_MARKERS) ?? []).length,
    floor: 0,
    hardFail: true,
  },
  {
    name: 'todo_density',
    kind: 'deterministic',
    measure: (r) => {
      const n = markdown(r.workspace).length
      return n === 0 ? 0 : Number((markdown(r.workspace).reduce((s, [, t]) => s + todos(t).length, 0) / n).toFixed(3))
    },
    // Deliberately unset. Q-014 stays open until ten real runs exist — guessing it now would
    // invent the definition of "hollow", which is the one thing this metric is for.
    floor: null,
    hardFail: false,
    note: 'reported, not gated: no threshold until ten real runs exist (Q-014)',
  },
  {
    name: 'todo_pairing',
    kind: 'deterministic',
    measure: (r) => (validate(r.workspace, r.library).results.find((c) => c.n === 6)?.state === 'failed' ? 1 : 0),
    floor: 0,
    hardFail: true,
  },
  {
    name: 'boundary_respected',
    kind: 'deterministic',
    // Both halves: files created outside spec/, AND state files anywhere. The second is the
    // one a run can fail while looking tidy.
    measure: (r) => (r.outside ?? []).length + forbiddenStateFiles(Object.keys(r.workspace)).length,
    floor: 0,
    hardFail: true,
  },
  {
    name: 'no_code_written',
    kind: 'deterministic',
    // BR-001 IS "THE KIT WRITES SPECIFICATIONS, NEVER CODE", AND A `.js` FILE IS CODE.
    // Validation check 11 walks `.md` only, so `{'spec/app.js': 'function start(p){return p}'}`
    // scored 0 — a perfect score — from the one scorer that exists to catch exactly that. The
    // scorer for the product's defining boundary was blind to the plainest possible breach of it.
    //
    // Both halves are counted: the Markdown one check 11 already reads, plus every file in the
    // workspace that is not Markdown at all. Counted here rather than delegated, because a
    // workspace made of source files has to be visible to this scorer whatever check 11 grows
    // into next.
    measure: (r) =>
      (validate(r.workspace, r.library).results.find((c) => c.n === 11)?.state === 'failed' ? 1 : 0) +
      sourceFiles(r.workspace).length,
    floor: 0,
    hardFail: true,
  },
  {
    name: 'rounds_within_limit',
    kind: 'deterministic',
    measure: (r) => r.rounds ?? 0,
    floor: 8,
    comparator: 'at-most',
    hardFail: true,
  },
  {
    name: 'inference_stated',
    kind: 'deterministic',
    // Suppressed questions carrying no notice. A silent inference is a hidden assumption.
    //
    // NOTHING PRODUCES THESE TWO NUMBERS YET. Only the tests supply them, so every real run this
    // scorer has ever appeared in reported 0 out of `?? 0` and printed "at floor" — and this is
    // the only scorer that would notice express answering a question it never asked. Named as a
    // requirement so the report says NOT RUN instead of inventing the best possible answer.
    requires: ['suppressed', 'notices'],
    measure: (r) => Math.max(0, r.suppressed - r.notices),
    floor: 0,
    hardFail: false,
  },
  {
    name: 'depth_scaled',
    kind: 'deterministic',
    // A supporting-area specification longer than the core area's means depth went to the
    // wrong place — the failure the subdomain map exists to prevent.
    //
    // Same gap as `inference_stated`: no caller supplies the two file lists, so `?? []` made the
    // comparison over an empty set and the answer was always 0. An inversion measured over no
    // files is not an absence of inversions.
    requires: ['coreFiles', 'supportingFiles'],
    measure: (r) => {
      const len = (p) => (r.workspace[p] ?? '').split('\n').length
      const core = Math.max(0, ...r.coreFiles.map(len))
      return r.supportingFiles.filter((p) => len(p) > core).length
    },
    floor: 0,
    hardFail: false,
  },
]

/** The two that gate a RELEASE rather than a merge. Listed so their absence is visible. */
export const HUMAN_SCORERS = [
  { name: 'decision_quality', kind: 'human', asks: 'Would a competent developer build the right thing from this? Are the decisions decisions?' },
  { name: 'depth_felt', kind: 'human', asks: 'Is this substantively deep, or structurally complete and hollow?' },
]
