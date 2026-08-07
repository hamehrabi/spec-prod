// Stage acceptance, made checkable (FF-016, REQ-F-041, ADR-006).
//
// Acceptance is a dated row in the generated change-control artifact. It is NEVER a file.
// That is not a style preference: a state file is a second source of truth, and it begins
// disagreeing with the specification the moment either one changes (ADR-004). ADR-006 closed
// this question deliberately, and `.accepted.json` is pre-rejected by name in AGENT.md.
//
// So there are two things to check, and they are opposites: the rows must be THERE, and the
// files must NOT.

/** Dated acceptance rows: | 2026-08-04 | Round 1 — the idea | Developer | … | */
export function acceptanceRows(text) {
  return [...text.matchAll(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([^|]+?)\s*\|/gm)]
    .map((m) => ({ date: m[1], stage: m[2].trim() }))
    .filter((r) => /round\s*\d|stage\s*\d/i.test(r.stage))
}

/** Which stages a workspace records as accepted — derived by reading, never stored. */
export const acceptedStages = (text) => [...new Set(acceptanceRows(text).map((r) => r.stage))]

/**
 * Anything that looks like a stored acceptance/progress record. Threshold: zero.
 *
 * Matched by shape rather than by an exact name, because the failure this guards against is
 * someone adding the convenience under a name nobody thought to forbid.
 */
const FORBIDDEN = /(accept|progress|approval|session|\.state|state\.json|cache|answers?)[^/]*\.(json|ya?ml|txt|lock|db|ini)$|^\.(accepted|progress|intake|kit)\b/i

// A state file in a state directory is still a state file. Without this, `.cache/stages.json`
// passes: the basename is innocent and the incriminating part is a path segment.
//
// `kit`, `intake`, `accepted` and `approval` were in the FILENAME branch above and missing from
// this one — so `spec/.kit` was caught and `spec/.kit/rounds.json` was not, and neither was
// `spec/.accepted/round-1.json`. The guard refused the marker as a file and waved it through
// the moment it became a directory, which is precisely the evasion this branch exists to close.
// `spec/.kit` is the path ADR-004 and boundary.md name by name as what the product refuses to
// create.
const FORBIDDEN_DIR = /^\.?(cache|state|progress|sessions?|tmp|kit|intake|accepted|approval)$/i

export const forbiddenStateFiles = (paths) =>
  paths.filter((p) => {
    const segments = p.split('/')
    return (
      FORBIDDEN.test(segments[segments.length - 1]) ||
      FORBIDDEN.test(p) ||
      segments.slice(0, -1).some((d) => FORBIDDEN_DIR.test(d))
    )
  })

/**
 * A stage written but never accepted — the interrupt-between-write-and-decision case.
 * Its gate is re-presented; the round is NOT re-asked and the run does NOT advance.
 */
export const unacceptedStages = (written, changeLog) => {
  const accepted = new Set(acceptedStages(changeLog).map((s) => s.toLowerCase()))
  return written.filter((s) => ![...accepted].some((a) => a.startsWith(s.toLowerCase())))
}
