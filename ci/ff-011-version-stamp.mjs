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

// THE ONE SANCTIONED MARKER, MATCHED EXACTLY. entrypoint.md names a single string for this and
// nothing else: `[TODO: plugin version could not be determined]`.
//
// The rule used to be `/\[TODO:[^\]]*version[^\]]*\]/i` tested against the WHOLE FILE, and
// returned before the stamp was looked at — so any todo anywhere mentioning a version disabled
// the check for the entire entry point. entrypoint.md makes todos routine in the Commands and
// Where-things-stand sections, so `[TODO: which API version do we target?]` two sections away
// excused a stamp that was flatly wrong — and entrypoint.md's own words are that a wrong stamp
// is worse than a missing one, because it will be trusted.
const HONEST_GAP = /\[TODO: plugin version could not be determined\]/

process.exit(
  walkGolden({
    id: 'FF-011',
    guards: `ADR-005 — a workspace records which library produced it (plugin ${VERSION})`,
    threshold: '100% of entry points carry a version matching the manifest',
    applies: (ws) => Boolean(entryPoint(ws)),
    measure: (ws) => {
      const [path, text] = entryPoint(ws)
      const stamped = [...text.matchAll(/\b\d+\.\d+\.\d+\b/g)].map((m) => m[0])
      // The exemption excuses an ABSENT stamp and only that. A version that could not be read
      // is an honest gap; a version that was read wrong is the failure this check is for, and
      // no marker anywhere in the file makes it honest.
      if (!stamped.length) {
        return HONEST_GAP.test(text) ? [] : [`VIOLATION: ${path} carries no plugin version (ADR-005)`]
      }
      return stamped.includes(VERSION)
        ? []
        : [`VIOLATION: ${path} stamps ${stamped.join(', ')}; the manifest says ${VERSION}`]
    },
    scope: ['whether the version is the RIGHT one to have shipped — only that it matches the manifest'],
  })
)
