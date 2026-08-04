// A produced workspace, and what two of them are allowed to disagree about.
//
// TASK-016 states the constraint this whole file exists to obey:
//
//     "Never diff a golden workspace byte-for-byte. ADR-002 makes output non-deterministic;
//      assert structure, score quality."
//
// A byte diff of generated prose fails on every run, for reasons that mean nothing. A check
// that always fails is read as noise inside a week — and then the difference that does matter
// arrives wearing the same clothes as the noise, and nobody looks. That is a worse position
// than having no comparison at all, because it comes with the belief that one is running.
//
// So a workspace is split into two kinds of fact, and only one of them is gated:
//
//   GATED     what the procedure determines. Same blueprints, same round map, same answers,
//             and the file set, the heading outline of each file, its back-link, and the
//             accepted stages are all fixed. A difference here means the derivation went
//             wrong — or that a file was AUTHORED rather than produced, which is precisely
//             the claim GOLD-001 makes in its own header and has never been able to check.
//
//   REPORTED  what judgement determines. How many requirements four capabilities become is a
//             decision, not a derivation; so is how many [TODO]s a thin round leaves. Counted,
//             shown, never gated — the same reason todo_density has no floor. A threshold
//             invented before the evidence exists does not measure the thing, it defines it.
//
// The split is the argument. Putting a fact on the wrong side is how this stops working:
// gate a judgement and the check gets switched off; report a derivation and the check was
// never there.

import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { headings, blueprintOf, todos, unfilled } from './fill.mjs'
import { acceptedStages } from './acceptance.mjs'
import { toPosix } from './payload.mjs'

/** Where a workspace records how far its run got. There is no state file (ADR-004); this is it. */
export const CHANGE_LOG = 'spec/01-docs/09-change-control/spec-change-log.md'

/**
 * Every file under `root`, as a `{ relative POSIX path -> text }` map.
 *
 * Paths are POSIX on every platform, because a comparison that reported `spec\README.md` and
 * `spec/README.md` as two different files would fail on Windows for a reason that has nothing
 * to do with the kit (CON-004, REQ-NF-008).
 */
export function loadWorkspace(root, skip = /(^|\/)\.git(\/|$)/) {
  const base = root.replace(/[\\/]+$/, '')
  const out = {}
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name)
      const rel = toPosix(full.slice(base.length + 1))
      if (skip.test(rel)) continue
      if (statSync(full).isDirectory()) walk(full)
      else out[rel] = readFileSync(full, 'utf8')
    }
  }
  walk(base)
  return out
}

/**
 * Identifiers a file carries, counted per prefix.
 *
 * Reported rather than gated: the same answers can honestly produce six requirements or eight,
 * and a run that produced seven where the golden has six has not necessarily done anything
 * wrong. The count is still worth seeing — a round that produced ZERO where the golden has
 * eight is a different kind of event, and a human reading the report will notice it.
 *
 * The leading `[A-Z]` keeps ISO dates out: `2026-08-04` is not an identifier.
 */
export function idsByPrefix(text) {
  const seen = {}
  for (const m of text.matchAll(/\b([A-Z][A-Z]*(?:-[A-Z]+)*)-(\d{3})\b/g)) (seen[m[1]] ??= new Set()).add(m[0])
  return Object.fromEntries(
    Object.entries(seen)
      .map(([prefix, ids]) => [prefix, ids.size])
      .sort(([a], [b]) => a.localeCompare(b))
  )
}

/** The structural facts about a workspace — everything a comparison is allowed to look at. */
export function fingerprint(workspace) {
  const perFile = {}
  for (const [path, text] of Object.entries(workspace)) {
    perFile[path] = {
      headings: headings(text),
      blueprint: blueprintOf(text),
      todos: todos(text).length,
      unfilled: unfilled(text).length,
      ids: idsByPrefix(text),
      lines: text.split(/\r?\n/).length,
    }
  }
  return {
    files: Object.keys(workspace).sort(),
    accepted: acceptedStages(workspace[CHANGE_LOG] ?? ''),
    perFile,
  }
}

/** The first index at which two ordered lists disagree, or null when they do not. */
export function firstDifference(a, b) {
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i
  return null
}

/**
 * Compare a produced workspace against a golden one.
 *
 * @returns { gated, reported, produced, golden } — `gated` empty means the run reproduced the
 *          golden workspace's structure. It does NOT mean the two say the same thing; that is
 *          what the scorers and the two human scorers are for.
 */
export function compare(produced, golden) {
  const a = fingerprint(produced)
  const b = fingerprint(golden)
  const gated = []
  const reported = []
  const shared = a.files.filter((p) => b.files.includes(p))

  for (const path of a.files.filter((p) => !b.files.includes(p)))
    gated.push({ kind: 'extra-file', path, detail: 'produced, but the golden workspace does not have it' })
  for (const path of b.files.filter((p) => !a.files.includes(p)))
    gated.push({ kind: 'missing-file', path, detail: 'in the golden workspace, but this run did not produce it' })

  if (a.accepted.join(' | ') !== b.accepted.join(' | '))
    gated.push({
      kind: 'accepted-stages',
      path: CHANGE_LOG,
      detail: `produced [${a.accepted.join(', ') || 'none'}], golden [${b.accepted.join(', ') || 'none'}]`,
    })

  for (const path of shared) {
    const x = a.perFile[path]
    const y = b.perFile[path]

    // The heading outline is copied from the blueprint by ADR-003 step 1 and never invented.
    // If it differs, the file did not come through the fill procedure — which is the single
    // most valuable thing this comparison can tell anyone.
    const i = firstDifference(x.headings, y.headings)
    if (i !== null)
      gated.push({
        kind: 'headings',
        path,
        detail: `outline diverges at heading ${i + 1}: produced ${quote(x.headings[i])}, golden ${quote(y.headings[i])}`,
      })

    if (x.blueprint !== y.blueprint)
      gated.push({ kind: 'back-link', path, detail: `produced ${quote(x.blueprint)}, golden ${quote(y.blueprint)}` })

    for (const [field, label] of [
      ['todos', '[TODO] markers'],
      ['ids', 'identifiers'],
      ['lines', 'lines'],
    ]) {
      const delta = field === 'ids' ? idDelta(x.ids, y.ids) : x[field] === y[field] ? null : `${y[field]} -> ${x[field]}`
      if (delta) reported.push({ kind: field, path, detail: `${label}: ${delta}` })
    }
  }

  return { gated, reported, produced: a, golden: b }
}

const quote = (v) => (v === undefined ? '(nothing)' : v === null ? '(none)' : `"${v}"`)

/** Per-prefix identifier counts, shown only where they moved. */
function idDelta(produced, golden) {
  const parts = []
  for (const prefix of [...new Set([...Object.keys(produced), ...Object.keys(golden)])].sort())
    if ((produced[prefix] ?? 0) !== (golden[prefix] ?? 0))
      parts.push(`${prefix} ${golden[prefix] ?? 0} -> ${produced[prefix] ?? 0}`)
  return parts.length ? parts.join(', ') : null
}
