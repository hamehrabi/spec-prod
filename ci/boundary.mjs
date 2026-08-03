// The boundary rule, made executable.
//
// `plugin/instructions/boundary.md` states this rule for the agent. This file is the same
// rule as a function, so the twelve denial tests can assert an OUTCOME rather than assert
// that a sentence exists. security-tests.md is blunt about why that distinction matters:
//
//   "A rule stated in the instruction set is not a passing security test. An agent reading
//    them will usually comply. Usually is not a boundary."
//
// The honest limit, stated rather than glossed: this checks the RULE, not the agent's
// adherence to it. Only a full run can do that (STEST-004, FF-010), and that needs TASK-006.
//
// ONE RULE: normalise the destination, then test containment as a path. No allowlist, no
// policy layer, no configurability — TASK-004 forbids all three, and Security is a constraint
// here rather than a driver precisely so this stays small enough to be read in one sitting.

/** Paths the kit must never propose a write to, even if the developer offers (EV-036). */
export const PROTECTED = ['CLAUDE.md', '.gitignore']

export const WORKSPACE = 'spec'

const isAbsolute = (p) => p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.startsWith('\\\\')

/**
 * Resolve a path to repo-root-relative segments, or null if it escapes above the root.
 * Backslash counts as a separator on every platform: a Windows path handed to a Linux run
 * must reach the same verdict (CON-004), and rejecting is the safe direction if a genuine
 * filename ever contains one.
 */
function normalise(destination) {
  const raw = destination.replace(/\\/g, '/')
  const segments = []
  for (const part of raw.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      // Escaping above the repository root is not something to resolve away silently.
      if (segments.length === 0) return null
      segments.pop()
      continue
    }
    segments.push(part)
  }
  return segments
}

/**
 * @returns {{allowed: boolean, reason: string, normalised: string}}
 *   reason: 'inside' | 'protected' | 'absolute' | 'traversal' | 'outside'
 */
export function verdict(destination) {
  if (typeof destination !== 'string' || destination.trim() === '') {
    return { allowed: false, reason: 'outside', normalised: '' }
  }

  // An absolute path names a location the kit was never given. It is not resolved against
  // the repository and then argued about — it is simply not the kit's to write.
  if (isAbsolute(destination)) {
    return { allowed: false, reason: 'absolute', normalised: destination.replace(/\\/g, '/') }
  }

  const segments = normalise(destination)
  if (segments === null) {
    return { allowed: false, reason: 'traversal', normalised: destination.replace(/\\/g, '/') }
  }

  const normalised = segments.join('/')

  // Protected before outside: both stop, but they stop DIFFERENTLY. Outside asks; protected
  // never asks at all, so it must not be reported as something a developer could approve.
  if (segments.length === 1 && PROTECTED.includes(segments[0])) {
    return { allowed: false, reason: 'protected', normalised }
  }

  // Containment as a PATH, not as a string. A prefix check accepts both
  // "spec/../../etc/hosts" and "specimen/x.md"; segment comparison accepts neither.
  const inside = segments[0] === WORKSPACE
  if (!inside) {
    // Did it start inside and normalise its way out? Worth naming separately — it is the
    // difference between a mistake and a traversal, and the message should say which.
    const startedInside = destination.replace(/\\/g, '/').split('/')[0] === WORKSPACE
    return { allowed: false, reason: startedInside ? 'traversal' : 'outside', normalised }
  }

  return { allowed: true, reason: 'inside', normalised }
}

/**
 * Is this directory a workspace this kit generated?
 *
 * Derived from the artifacts, never from a marker file. `spec/.kit` would be exactly the
 * state file ADR-004 forbids — and it would also be trivially wrong the moment someone
 * copied a workspace without it.
 *
 * @param entries top-level names inside the candidate folder
 */
export function looksLikeKitWorkspace(entries) {
  if (entries.length === 0) return true // Empty is not a collision; it is somewhere to write.
  const stages = entries.filter((e) => /^0[1-7]-[a-z]/.test(e))
  return stages.length >= 2 || entries.includes('CLAUDE.md')
}

/** The folder offered when `spec/` is occupied. Never renames the developer's folder. */
export function alternativeName(taken, workspace = WORKSPACE) {
  let n = 2
  while (taken.includes(`${workspace}-${n}`)) n += 1
  return `${workspace}-${n}`
}

/**
 * The refusal message. Names the path and the reason; NEVER the target file's contents
 * (STEST-013) — a blocked write often concerns exactly the file whose contents are private.
 */
export function refusal(destination) {
  const { reason, normalised } = verdict(destination)
  switch (reason) {
    case 'protected':
      return `${normalised} is yours, not the kit's. It is never written to and never proposed — not even with permission. The line you may add is printed at the end instead.`
    case 'absolute':
      return `${normalised} is an absolute path, outside this repository. Nothing was written.`
    case 'traversal':
      return `${normalised} resolves outside ${WORKSPACE}/ despite starting inside it. Nothing was written.`
    case 'outside':
      return `${normalised} is outside ${WORKSPACE}/. Here is what would change — may I write it?`
    default:
      return `${normalised} is inside ${WORKSPACE}/.`
  }
}
