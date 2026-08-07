// FF-018 — the payload carries no assumption about which platform reads it.
// Requirement: REQ-NF-008 · CON-004 · FTEST-009 · DD-022.
//
// Usage:
//   node ci/ff-018-platform-assumptions.mjs
//
// FTEST-009 names three failures — "no POSIX-only path · no `/`-hardcoded link · no
// case-sensitivity assumption" — and until now nothing checked any of them. Its sibling
// ETEST-012 (×3) needs the kit driven on three real hosts and stays Planned; this is the half
// that can be decided by reading, and it is the half that catches the defect early.
//
// THE COMPARISON IS BETWEEN STRINGS, NEVER AGAINST THE FILESYSTEM. A case-wrong link opens
// perfectly on Windows and macOS and 404s on Linux, so a check that asked the filesystem would
// pass on the machine this kit is developed on and fail for the developer. Reading the manifest
// and comparing text finds it everywhere, including here.
//
// BUG-027 is why this exists at all: Step 0 shipped naming only `sha256sum` and `shasum`, both
// POSIX, and on a Windows host with no Git Bash the kit refused to start. Nothing in the
// repository would have noticed, because the machine that wrote it had Git Bash.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PAYLOAD_ROOT } from './payload.mjs'

/** Every Markdown file the plugin ships, as repo-relative POSIX paths. */
export function payloadFiles(root = PAYLOAD_ROOT, acc = []) {
  for (const entry of readdirSync(root)) {
    const p = join(root, entry)
    if (statSync(p).isDirectory()) payloadFiles(p, acc)
    else acc.push(p.split(/[\\/]/).join('/'))
  }
  return acc
}

/**
 * Inline markdown links, with the anchor split off.
 *
 * Deliberately NOT matching bare backticked paths. A path in prose is a thing being talked
 * about — `boundary.md` names `/etc/hosts` as a path the kit must refuse — while a link is a
 * promise that something is there. Conflating them makes the check fail on correct writing,
 * which is how a check gets switched off.
 */
export const linksIn = (text) =>
  [...text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1])

const EXTERNAL = /^(https?:|mailto:|#)/

/** POSIX-only absolute paths, each exempt for a written reason rather than by pattern. */
export const POSIX_PATH_EXEMPTIONS = {
  'plugin/blueprints/07-ops/01-deployment/cicd-pipeline.md':
    '`#!/usr/bin/env` shebangs inside a CI-script template — the developer runs these on their own CI, and a shebang has no Windows spelling',
  'plugin/instructions/boundary.md':
    '`/etc/hosts` is named as an example of a path the kit must REFUSE to write; it is the counter-example, not an instruction',
}

const POSIX_ABSOLUTE = /(^|[^\w`.])(\/usr\/|\/etc\/|\/var\/|\/home\/|\/tmp\/|~\/)/

/**
 * Two paths that differ only by case cannot coexist on Windows or macOS, so a library holding
 * both cannot be installed on two of the three platforms it claims to serve.
 *
 * PURE, AND TAKING A LIST, because it cannot be tested any other way. Creating `README.md` and
 * `readme.md` on Windows creates ONE file — the second write silently replaces the first — so a
 * test that built the failing case on disk would find nothing and pass, on the platform this kit
 * is developed on. The check that guards against a case assumption must not itself contain one.
 */
export const caseCollisions = (files) =>
  Object.values(files.reduce((acc, f) => (((acc[f.toLowerCase()] ??= []).push(f)), acc), {}))
    .filter((group) => group.length > 1)
    .map((group) => ({
      kind: 'case-collision',
      where: group.join(' vs '),
      detail: 'these differ only by case and cannot both exist on Windows or macOS',
    }))

export function check(root = PAYLOAD_ROOT) {
  const files = payloadFiles(root)
  const known = new Set(files)
  const violations = []

  violations.push(...caseCollisions(files))

  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const dir = file.split('/').slice(0, -1)

    // 2. A backslash in a link is a Windows path written into a document that POSIX hosts read.
    for (const raw of linksIn(text))
      if (raw.includes('\\'))
        violations.push({ kind: 'backslash-link', where: `${file} -> ${raw}`, detail: 'a link separator must be `/` on every platform' })

    // 3. Case-exact resolution. Compared as text, so a link that works here still fails here if
    //    it would fail on Linux.
    for (const raw of linksIn(text)) {
      if (EXTERNAL.test(raw) || raw.includes('\\')) continue
      const target = raw.split('#')[0]
      if (!target) continue
      const resolved = []
      for (const part of [...dir, ...target.split('/')]) {
        if (part === '.' || part === '') continue
        if (part === '..') resolved.pop()
        else resolved.push(part)
      }
      const path = resolved.join('/')
      if (known.has(path)) continue
      // A directory link, or a target outside the payload, is not this check's business —
      // DD-022 already decides what must resolve. What THIS check owns is the case-only miss.
      const caseBlind = files.find((f) => f.toLowerCase() === path.toLowerCase())
      if (caseBlind)
        violations.push({ kind: 'case-mismatch', where: `${file} -> ${raw}`, detail: `resolves to nothing; the file on disk is \`${caseBlind}\`` })
    }

    // 4. POSIX-only absolute paths, outside the two files that name them for a reason.
    if (!(file in POSIX_PATH_EXEMPTIONS)) {
      for (const line of text.split('\n')) {
        const m = POSIX_ABSOLUTE.exec(line)
        if (m) violations.push({ kind: 'posix-only-path', where: `${file}: ${line.trim().slice(0, 70)}`, detail: 'a POSIX-only path has no Windows spelling' })
      }
    }
  }

  return { files: files.length, violations }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  const { files, violations } = check()
  console.log('FF-018 — guards REQ-NF-008, CON-004 — the payload names no one platform')
  console.log('  threshold: 0 case collisions, 0 backslash links, 0 case-only misses, 0 POSIX-only paths')
  console.log(`  found:     ${violations.length}`)
  console.log(`    payload files read: ${files}`)
  for (const v of violations) console.log(`    VIOLATION [${v.kind}] ${v.where}\n      ${v.detail}`)
  for (const [f, why] of Object.entries(POSIX_PATH_EXEMPTIONS)) console.log(`    exempt: ${f}\n      ${why}`)
  console.log('\n  this check does NOT assert:')
  console.log('    that a run BEHAVES the same on three platforms — that is ETEST-012, and it needs three hosts')
  console.log('    anything about line endings — git normalises them and the workspaces are compared by structure')
  console.log(violations.length ? '\n  RESULT: FAIL — FF-018 blocks the merge' : '\n  RESULT: pass')
  process.exit(violations.length ? 1 : 0)
}
