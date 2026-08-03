#!/usr/bin/env node
// FF-001 — exactly one user-invocable intake command, and exactly one end-to-end path
// through intake. Depth must be an argument, not a branch. Threshold: 1 and 1.
// On failure: block merge.
//
// Guards the Simplicity driver, whose measure literally counts paths (DD-006). A second
// command is not a feature; it is a second thing to keep correct, and the second one rots.

import { readFileSync, existsSync } from 'node:fs'
import { PAYLOAD_ROOT, walk, frontmatter, isFalse, report } from './payload.mjs'

const root = process.argv[2] ?? PAYLOAD_ROOT

// Everything Claude Code turns into a /name the developer can type: flat command files,
// skill directories, and a plugin-root SKILL.md. All three count; a skill added later would
// register a second entry point just as surely as a second command file would.
const candidates = [
  ...walk(`${root}/commands`).filter((f) => f.endsWith('.md')),
  ...walk(`${root}/skills`).filter((f) => f.toUpperCase().endsWith('SKILL.MD')),
  ...(existsSync(`${root}/SKILL.md`) ? [`${root}/SKILL.md`] : []),
]

const invocable = candidates.filter((f) => !isFalse(frontmatter(f)['user-invocable']))

// The manifest may redirect the command directory elsewhere, which would hide a second
// entry point from the scan above. Reading it is cheaper than being surprised.
let manifestPaths = []
const manifestFile = `${root}/.claude-plugin/plugin.json`
if (existsSync(manifestFile)) {
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
  manifestPaths = [manifest.commands, manifest.skills].flat().filter(Boolean)
}

// One path: intake must hand off to exactly one orchestration module. Counted across ALL
// entry files, not just the user-invocable ones — the register counts commands and paths
// separately, and a command hidden from the menu still routes somewhere. Deduplicated,
// because two commands pointing at the same module is one path (and already fails above).
const entryRefs = [
  ...new Set(candidates.flatMap((f) => readFileSync(f, 'utf8').match(/instructions\/[\w-]+\.md/g) ?? [])),
]

const problems = [
  ...(invocable.length === 1 ? [] : [`VIOLATION: ${invocable.length} user-invocable commands; exactly 1 is allowed`]),
  ...(entryRefs.length === 1 ? [] : [`VIOLATION: ${entryRefs.length} orchestration entry points referenced; exactly 1 is allowed`]),
  ...manifestPaths.map((p) => `VIOLATION: manifest redirects components to ${p}; the default commands/ scan is then incomplete`),
]

process.exit(
  report({
    id: 'FF-001',
    guards: 'Simplicity — one command, one end-to-end path (ADR-001, DD-006)',
    threshold: 'exactly 1 user-invocable command, exactly 1 entry path',
    found: problems.length,
    detail: [
      `commands and skills found: ${candidates.length ? candidates.join(', ') : '(none)'}`,
      `user-invocable: ${invocable.length}`,
      `orchestration entry points referenced: ${entryRefs.length ? entryRefs.join(', ') : '(none)'}`,
      ...problems,
    ],
    scope: [
      'whether the orchestration Markdown itself branches on depth — prose is not parseable,',
      '  and asserting on it would be the decoration fitness-functions.md warns against',
    ],
  })
)
