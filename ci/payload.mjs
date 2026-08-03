// The published payload — the single definition every fitness function reads.
//
// TASK-002 step 2: "Define what the 'published payload' is — the exact paths that ship —
// so FF-009 has a target." ADR-002 governs what is *shipped*, not what checks it, and this
// file is where that distinction stops being a sentence and becomes a path.

import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, relative, sep, posix } from 'node:path'

// Everything under this directory ships to a developer when the plugin is installed.
export const PAYLOAD_ROOT = 'plugin'

// Everything else in the repository does not. Listed rather than implied, because
// TASK-002's acceptance check requires the exclusion to be deliberate and visible.
export const NOT_PAYLOAD = [
  'ci',                    // these checks. They check the kit; they are not the kit
  '.github',               // the workflow that runs them
  'tests',                 // executable tests and fixtures
  'spec-driven-devkit',    // the specification OF the kit, including its 03-tests/
  'spec-driven-template',  // the blueprint sources, until TASK-003 packages them
]

// The only two things allowed inside the payload (ADR-002).
export const MANIFEST = posix.join('.claude-plugin', 'plugin.json')
export const isMarkdown = (p) => p.toLowerCase().endsWith('.md')

// Module boundaries inside the payload (ADR-001). FF-002 reads these.
export const MODULES = {
  questions: [`${PAYLOAD_ROOT}/instructions/questions.md`],
  blueprints: [`${PAYLOAD_ROOT}/blueprints/`],
  // Orchestration and entry: every instruction module except the question set, plus commands.
  flow: [`${PAYLOAD_ROOT}/instructions/`, `${PAYLOAD_ROOT}/commands/`],
}

/** Every file under `dir`, as repo-relative POSIX paths. Missing directory yields []. */
export function walk(dir, root = dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  const out = []
  for (const name of entries.sort()) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full, root))
    else out.push(toPosix(full))
  }
  return out
}

/** Windows and POSIX must produce identical verdicts (CON-004, REQ-NF-008). */
export const toPosix = (p) => p.split(sep).join('/')

/** A payload-relative path, e.g. plugin/commands/x.md -> commands/x.md */
export const inPayload = (p) => toPosix(relative(PAYLOAD_ROOT, p))

/** Parse a Markdown file's YAML frontmatter into a flat string map. Absent block -> {}. */
export function frontmatter(file) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return {}
  }
  const match = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/)
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return fields
}

/** Claude Code treats yes/on/1 as true as well as true. */
export const isFalse = (v) =>
  v !== undefined && ['false', 'no', 'off', '0'].includes(String(v).toLowerCase())

/** Every check reports the same way, so a CI log reads the same whichever one failed. */
export function report({ id, guards, threshold, found, detail = [], scope = [] }) {
  const passed = found === 0
  console.log(`${id} — guards ${guards}`)
  console.log(`  threshold: ${threshold}`)
  console.log(`  found:     ${found}`)
  for (const line of detail) console.log(`    ${line}`)
  if (scope.length) {
    console.log('  this check does NOT assert:')
    for (const line of scope) console.log(`    ${line}`)
  }
  console.log(passed ? `  RESULT: pass` : `  RESULT: FAIL — ${id} blocks the merge`)
  return passed ? 0 : 1
}
