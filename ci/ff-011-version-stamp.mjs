#!/usr/bin/env node
// FF-011 — every golden workspace's entry point carries a plugin version, and it matches the
// manifest. Threshold: 100% present and matching. On failure: block merge.
//
// Guards ADR-005. A workspace outlives the kit that produced it. Without a stamp, "why does my
// specification not look like the documentation" has no answer, and neither does "was this
// written before or after the blueprint changed". The version answers which library produced
// this; it is deliberately not a timestamp, which answers nothing anyone asks.
//
// A version that cannot be read is written as a [TODO] and never invented (entrypoint.md), so
// an honest gap passes here and only a WRONG or absent stamp fails.

import { readFileSync } from 'node:fs'
import { walkGolden } from './golden.mjs'
import { PAYLOAD_ROOT } from './payload.mjs'

const VERSION = JSON.parse(readFileSync(`${PAYLOAD_ROOT}/.claude-plugin/plugin.json`, 'utf8')).version
const entryPoint = (ws) => Object.entries(ws).find(([p]) => /(^|\/)CLAUDE\.md$/.test(p))

process.exit(
  walkGolden({
    id: 'FF-011',
    guards: `ADR-005 — a workspace records which library produced it (plugin ${VERSION})`,
    threshold: '100% of entry points carry a version matching the manifest',
    applies: (ws) => Boolean(entryPoint(ws)),
    measure: (ws) => {
      const [path, text] = entryPoint(ws)
      if (/\[TODO:[^\]]*version[^\]]*\]/i.test(text)) return []
      const stamped = [...text.matchAll(/\b\d+\.\d+\.\d+\b/g)].map((m) => m[0])
      if (!stamped.length) return [`VIOLATION: ${path} carries no plugin version (ADR-005)`]
      return stamped.includes(VERSION)
        ? []
        : [`VIOLATION: ${path} stamps ${stamped.join(', ')}; the manifest says ${VERSION}`]
    },
    scope: ['whether the version is the RIGHT one to have shipped — only that it matches the manifest'],
  })
)
