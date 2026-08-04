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

/** A scorer: { name, kind, measure(run) -> number, floor, hardFail }.
 *  `run` is { workspace, library, rounds, outside, notices, suppressed }. */
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
    measure: (r) => (text(r.workspace).match(/ProjectBoard|# WORKED EXAMPLE/g) ?? []).length,
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
    measure: (r) => (validate(r.workspace, r.library).results.find((c) => c.n === 11)?.state === 'failed' ? 1 : 0),
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
    measure: (r) => Math.max(0, (r.suppressed ?? 0) - (r.notices ?? 0)),
    floor: 0,
    hardFail: false,
  },
  {
    name: 'depth_scaled',
    kind: 'deterministic',
    // A supporting-area specification longer than the core area's means depth went to the
    // wrong place — the failure the subdomain map exists to prevent.
    measure: (r) => {
      const len = (p) => (r.workspace[p] ?? '').split('\n').length
      const core = Math.max(0, ...(r.coreFiles ?? []).map(len))
      return (r.supportingFiles ?? []).filter((p) => len(p) > core).length
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
