// The eval engine.
//
// ONE GENERAL MECHANISM. It runs any script against any run-result and collects any scorer.
// It knows nothing about what a scorer measures, and nothing about what a case is testing.
//
// The split is the point: adding a scorer means adding an entry to ci/scorers.mjs and
// touching nothing here. Get it wrong and every experiment costs a harness change — an hour
// each, forever (Ousterhout Ch. 6).
//
// WHY THIS EXISTS AT ALL: CON-007 forbids telemetry, so the kit is structurally unable to
// observe its own failure rate in the field. This golden set is the only substitute there is,
// and the only way to answer "did rewording that question help?" — which, for a product made
// entirely of prose, is every question worth asking.

import { SCORERS, HUMAN_SCORERS } from './scorers.mjs'

/**
 * Score one run.
 * @param run   { workspace, library, rounds, outside, notices, suppressed, ... }
 * @param scorers defaults to the deterministic set; pass your own to experiment
 */
export function score(run, scorers = SCORERS) {
  const results = scorers.map((s) => {
    const value = s.measure(run)
    const atFloor =
      s.floor === null ? true : s.comparator === 'at-most' ? value <= s.floor : value === s.floor
    return { name: s.name, value, floor: s.floor, atFloor, hardFail: Boolean(s.hardFail), note: s.note }
  })
  const breaches = results.filter((r) => !r.atFloor && r.hardFail)
  return {
    results,
    breaches,
    // A hard-fail scorer below its floor blocks the merge. Soft ones are reported and watched.
    passes: breaches.length === 0,
    ungated: results.filter((r) => r.floor === null).map((r) => r.name),
  }
}

/** Run a whole set of cases. Reports per case and in aggregate. */
export function runSet(cases, execute, scorers = SCORERS) {
  const scored = cases.map((c) => ({ id: c.id, category: c.category, ...score(execute(c), scorers) }))
  return {
    cases: scored,
    failed: scored.filter((c) => !c.passes),
    passes: scored.every((c) => c.passes),
    byCategory: ['happy', 'edge', 'adversarial', 'must-refuse'].map((k) => ({
      category: k,
      total: scored.filter((c) => c.category === k).length,
      failed: scored.filter((c) => c.category === k && !c.passes).length,
    })),
  }
}

/** What gates a release rather than a merge — named so its absence is visible, not implied. */
export const releaseGate = () => ({
  humanScorers: HUMAN_SCORERS,
  rule: 'at least four cases read by a person before each release; no escalations',
  why: 'a suite of only deterministic scorers would pass a beautifully-formatted empty workspace',
})
