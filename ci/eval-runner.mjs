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
    // A SCORER WHOSE INPUT WAS NEVER SUPPLIED HAS NOT MEASURED ANYTHING, AND MUST NOT SAY IT IS
    // AT ITS FLOOR. `inference_stated` and `depth_scaled` both read fields no caller was
    // passing, so both computed 0 out of `?? 0` and `?? []` and printed the best possible score
    // on no evidence — indistinguishable in the report from `no_example_content`, which had
    // genuinely scanned every file to get there. That is BR-009's exact failure, committed
    // inside the harness built to enforce it, and it inflated the only recorded baseline the
    // product has (ai-evals.md §5).
    //
    // Declared per scorer rather than inferred from an undefined result, because `undefined` is
    // also what a broken measure returns, and the two must not be reported the same way.
    const missing = (s.requires ?? []).filter((k) => run[k] === undefined)
    if (missing.length)
      return {
        name: s.name,
        value: null,
        floor: s.floor,
        atFloor: false,
        notRun: true,
        why: `no ${missing.join(' or ')} was supplied, so nothing was measured`,
        hardFail: Boolean(s.hardFail),
        note: s.note,
      }
    const value = s.measure(run)
    const atFloor =
      s.floor === null ? true : s.comparator === 'at-most' ? value <= s.floor : value === s.floor
    return { name: s.name, value, floor: s.floor, atFloor, notRun: false, hardFail: Boolean(s.hardFail), note: s.note }
  })
  const notRun = results.filter((r) => r.notRun)
  const breaches = results.filter((r) => !r.notRun && !r.atFloor && r.hardFail)
  return {
    results,
    breaches,
    /** Scorers that did not run. Their own outcome — never a pass, never a failure (BR-009). */
    notRun,
    // A hard-fail scorer below its floor blocks the merge. Soft ones are reported and watched.
    passes: breaches.length === 0,
    /** The only condition under which the scorer set may be described as clean. Same rule, and
     *  the same name, as `validate()` in ci/validation.mjs: "no failures" and "nothing was
     *  measured" are different facts and only one of them is good news. */
    mayClaimSuccess: breaches.length === 0 && notRun.length === 0,
    ungated: results.filter((r) => !r.notRun && r.floor === null).map((r) => r.name),
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
