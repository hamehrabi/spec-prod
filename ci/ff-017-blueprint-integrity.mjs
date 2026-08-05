#!/usr/bin/env node
// FF-017 — blueprint integrity. Every checksum matches the manifest, every manifest entry
// exists, and no blueprint is unlisted. Threshold: 100% match, 0 unlisted, 0 modified by a
// run. On failure: block merge.
//
// Guards REQ-F-042. The library is the authority: every generated specification is a copy of
// a blueprint, filled in. An altered blueprint does not produce an obvious error — it
// produces a specification that is subtly wrong and entirely plausible.
//
// Usage:
//   ff-017-blueprint-integrity.mjs                  # verify
//   ff-017-blueprint-integrity.mjs --root=<dir>     # verify another copy (tests)
//   ff-017-blueprint-integrity.mjs --regenerate     # rewrite MANIFEST.md, deliberately
//
// REGENERATION IS NEVER AUTOMATIC. Nothing in the gate, and nothing in an intake, may run
// --regenerate. A control that rewrites itself to pass is not a control.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PAYLOAD_ROOT, walk, toPosix, report } from './payload.mjs'

const arg = (n) => process.argv.slice(2).find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3)
const has = (n) => process.argv.slice(2).includes(`--${n}`)

const root = arg('root') ?? join(PAYLOAD_ROOT, 'blueprints')
const MANIFEST = join(root, 'MANIFEST.md')

// The manifest is not a blueprint. It describes them, it produces no generated file, and it
// cannot contain its own checksum.
const isManifest = (rel) => rel === 'MANIFEST.md'

// Raw bytes, not normalised content. .gitattributes pins the payload to LF on every
// platform, which is what makes a raw-byte hash portable — normalising here instead would
// hide a real alteration behind an encoding change.
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')

/**
 * ONE digest for the whole library — SHA-256 over the per-file digests, lowercased, sorted,
 * one per line, each ending `\n`.
 *
 * WHY IT EXISTS. A traced run spent nine minutes on the integrity check, and only five of them
 * hashing: it had all 81 digests at 5m27s and then spent four and a half minutes trying to make
 * a shell compare them, because eyeballing 81 SHA-256 strings for one flipped character is not
 * something anyone should trust. The check asked for a comparison nobody can do by hand and
 * gave no permitted way to do it by machine. This makes the comparison one string long.
 *
 * WHY THE DEFINITION LOOKS LIKE THIS. It hashes digests, not paths or tool output:
 *   - no paths     — a path separator differs between platforms, and a leading `./` differs
 *                    between two invocations of the same tool
 *   - lowercased   — `sha256sum` prints lowercase and `Get-FileHash` prints uppercase
 *   - sorted       — enumeration order is not guaranteed by any of them
 * What remains is pure ASCII with no encoding question, which is the only reason two platforms
 * can be expected to arrive at the same value.
 *
 * Sorting is done on the lowercased form, but the order does not actually depend on case: in
 * ASCII, digits sort below both letter cases, so two hex strings compare the same either way.
 */
export const libraryDigest = (digests) =>
  createHash('sha256')
    .update(
      digests
        .map((d) => d.toLowerCase())
        .sort()
        .map((d) => `${d}\n`)
        .join(''),
      'utf8'
    )
    .digest('hex')

/** The one digest, read back out of a manifest. Null when the manifest predates it. */
export const declaredDigest = (text) => text.match(/^\*\*Library digest:\*\*\s*`([0-9a-f]{64})`/m)?.[1] ?? null

const onDisk = walk(root)
  .map((f) => toPosix(f).slice(toPosix(root).length + 1))
  .filter((rel) => !isManifest(rel))
  .sort()

// Deliberate exclusions, carried in the manifest so an absence is a decision on the record
// rather than something nobody noticed.
const EXCLUSIONS = [
  ['MASTER-PROMPT.md', 'Question text. ADR-001 forbids it inside the blueprint library'],
  ['steps.md', 'Template documentation; no generated counterpart'],
  ['01-docs/10-reference/appendix-index.md', 'Template scaffolding, not a project artifact (TASK-003)'],
  ['Architecture.png, architecture-types.png', 'Illustrations; a binary would fail FF-009'],
  ['04-src/01-pages…05-data/.gitkeep', 'Scaffolding for empty folders; no generated counterpart'],
  ['.gitignore, .env.example, Dockerfile.example', 'Not Markdown. DD-020 — see Q-024 for the REQ-NF-002 cost'],
  ['03-tests/05-executable/{unit,integration,end-to-end}/.gitkeep', 'Not Markdown. DD-020'],
]

// The checks below RUN. Everything above is importable — a test that wants `libraryDigest`
// must not trigger a full verification and a process exit by asking for it.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {

if (has('regenerate')) {
  const digests = onDisk.map((rel) => sha256(join(root, rel)))
  const rows = onDisk.map((rel, i) => `| \`${rel}\` | \`${digests[i]}\` |`).join('\n')
  const excl = EXCLUSIONS.map(([p, why]) => `| \`${p}\` | ${why} |`).join('\n')
  writeFileSync(
    MANIFEST,
    `# Blueprint Integrity Manifest

> **Generated by \`ci/ff-017-blueprint-integrity.mjs --regenerate\`. Never edit by hand, and
> never regenerate to make a check pass** — a control that rewrites itself to pass is not a
> control (TASK-021). Regenerating is a deliberate, reviewable act that belongs in a commit
> of its own, alongside the blueprint change that caused it.

**What is checksummed:** SHA-256 over the file's **raw bytes**. \`.gitattributes\` pins the
payload to LF on every platform, so the same blueprint hashes identically on Windows, macOS,
and Linux. The hash is deliberately *not* taken over line-ending-normalised content — that
would hide a genuine alteration behind an encoding change.

**Verified twice per run** (\`instructions/integrity.md\`): once before the first question, as
a precondition, and once at the end — the second run proving the library was read and never
written.

**Three failures, each named separately:** *altered* (on disk, checksum differs), *missing*
(listed here, absent on disk), *unlisted* (on disk, absent here). An unlisted blueprint is a
failure, not a bonus.

## Library digest

**Library digest:** \`${libraryDigest(digests)}\`

One value for the whole library: SHA-256 over the ${digests.length} digests below —
lowercased, sorted, one per line, each ending in a newline. **Compare this first.** It matches
or it does not, and that is a comparison anyone can make correctly; cross-checking
${digests.length} SHA-256 strings by eye is not. The per-file table exists to name *which*
blueprint moved once this line says something did.

It hashes digests rather than paths or tool output, so it does not change with a path
separator, a leading \`./\`, or whether the hasher printed upper or lower case.

## Blueprints (${onDisk.length})

| Blueprint | SHA-256 |
|---|---|
${rows}

## Deliberately not packaged

Recorded so an absence is a decision, not an oversight.

| Path | Why |
|---|---|
${excl}
`
  )
  console.log(`MANIFEST.md regenerated: ${onDisk.length} blueprints`)
  process.exit(0)
}

if (!existsSync(MANIFEST)) {
  console.log('FF-017 — guards REQ-F-042 — blueprint integrity')
  console.log(`  RESULT: FAIL — no manifest at ${toPosix(MANIFEST)}; the library is unverifiable`)
  process.exit(1)
}

const manifestText = readFileSync(MANIFEST, 'utf8')
const listed = new Map(
  [...manifestText.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([0-9a-f]{64})`\s*\|/gm)].map((m) => [m[1], m[2]])
)

const altered = onDisk.filter((rel) => listed.has(rel) && listed.get(rel) !== sha256(join(root, rel)))
const unlisted = onDisk.filter((rel) => !listed.has(rel))
const missing = [...listed.keys()].filter((rel) => !existsSync(join(root, rel)))

// The one-line digest is checked too, and its absence is a failure rather than a shrug. A run
// is told to compare that line first; a manifest without one sends it back to cross-checking 81
// strings, which is the nine minutes this whole thing exists to remove. A stale one is worse —
// it would report a healthy library as altered, or an altered one as healthy.
const declared = declaredDigest(manifestText)
const computed = libraryDigest(onDisk.map((rel) => sha256(join(root, rel))))
const digestFault = declared === null ? 'absent' : declared !== computed ? 'stale' : null

// The command a run is given drops the manifest's own line with `grep -v MANIFEST`, because a
// filename glob cannot exclude one file. That is only correct while no blueprint path contains
// the word — the day one does, the documented command silently hashes 80 files and matches
// nothing, and the failure would look like an altered library rather than a bad instruction.
const collides = onDisk.filter((rel) => /MANIFEST/i.test(rel))

process.exit(
  report({
    id: 'FF-017',
    guards: 'REQ-F-042 — the library ships verifiably unmodified (ADR-001, SEC-Z-004)',
    threshold: '100% checksum match, 0 unlisted, 0 missing, library digest current',
    found: altered.length + unlisted.length + missing.length + (digestFault ? 1 : 0) + collides.length,
    detail: [
      `manifest: ${toPosix(MANIFEST)}`,
      `listed: ${listed.size} · on disk: ${onDisk.length}`,
      `library digest: ${declared ?? '(none declared)'}`,
      ...(digestFault === 'absent'
        ? ['VIOLATION: the manifest declares no library digest, so a run must cross-check every file by eye']
        : []),
      ...(digestFault === 'stale' ? [`VIOLATION: the library digest is stale — computed ${computed}`] : []),
      ...collides.map((f) => `VIOLATION: ${f} contains "MANIFEST"; the documented verify command would skip it`),
      ...altered.map((f) => `VIOLATION: ALTERED — ${f} is on disk but its checksum differs from the manifest`),
      ...missing.map((f) => `VIOLATION: MISSING — ${f} is listed in the manifest but absent from the library`),
      ...unlisted.map((f) => `VIOLATION: UNLISTED — ${f} is in the library but absent from the manifest`),
      ...(altered.length + unlisted.length + missing.length > 0
        ? [
            'Nothing was written. Reinstall the plugin, or regenerate the manifest deliberately',
            'if the change was intended — never to make this check pass.',
          ]
        : []),
    ],
    scope: [
      'provenance — a checksum detects accident and casual tampering, not a supply chain',
      'whether a blueprint is any good; only that it is the one the manifest recorded',
    ],
  })
)

}
