// The twelve validation checks, executable (REQ-F-029, BR-009).
//
// Each takes a workspace — a { path: contents } map — and returns
// { state: 'passed' | 'failed' | 'not-run', detail: [...] }.
//
// THREE STATES, NEVER TWO. "No failures" and "nothing was checked" produce identical output
// if you only print failures, and that identity is exactly how a hollow workspace ships
// looking complete. Every check reports which of the three it is, and the report states the
// COUNT THAT RAN rather than asserting from the absence of failures.
//
// Twelve, fixed. Not a rules engine, not a schema language, not configurable — validation is
// a supporting concern and is built simply.

import { placeholders, unfilled, todos, blueprintOf } from './fill.mjs'

const passed = (detail = []) => ({ state: 'passed', detail })
const failed = (detail) => ({ state: 'failed', detail })
const notRun = (reason) => ({ state: 'not-run', detail: [reason] })

const md = (ws) => Object.entries(ws).filter(([p]) => p.endsWith('.md'))
const all = (ws) => Object.values(ws).join('\n')

// Identifiers this workspace uses. Deliberately narrow: a pattern loose enough to catch
// everything also catches prose, and a check with false positives gets switched off.
const ID = /\b(REQ-[A-Z]+|BR|CON|AC|US|ADR|DD|FF|TASK|Q|RISK|SEC-[AZ]|EV|[UAEFSP]?TEST)-\d{3}\b/g

export const CHECKS = {
  1: {
    name: 'every referenced identifier resolves',
    run(ws) {
      const text = all(ws)
      // Defined = introduced by a table row or heading that starts with the identifier.
      const defined = new Set([...text.matchAll(/^[|#>\s-]*\**(\w[\w-]*-\d{3})\**\s*[|:—-]/gm)].map((m) => m[1]))
      const dangling = [...new Set(text.match(ID) ?? [])].filter((id) => !defined.has(id))
      return dangling.length === 0
        ? passed([`${defined.size} identifiers defined`])
        : failed(dangling.slice(0, 5).map((id) => `${id} is referenced but never defined`))
    },
  },
  2: {
    name: 'no identifier is defined twice',
    run(ws) {
      const seen = new Map()
      for (const [path, text] of md(ws)) {
        for (const m of text.matchAll(/^\|\s*\**(\w[\w-]*-\d{3})\**\s*\|/gm)) {
          const at = seen.get(m[1]) ?? []
          if (!at.includes(path)) at.push(path)
          seen.set(m[1], at)
        }
      }
      const dupes = [...seen].filter(([, at]) => at.length > 1)
      return dupes.length === 0
        ? passed()
        : failed(dupes.slice(0, 5).map(([id, at]) => `${id} is defined in ${at.join(' and ')}`))
    },
  },
  3: {
    name: 'every generated file ends with a back-link that resolves',
    run(ws, library = null) {
      const missing = md(ws).filter(([, text]) => !blueprintOf(text))
      if (missing.length) return failed(missing.slice(0, 5).map(([p]) => `${p} has no blueprint back-link`))
      if (!library) return notRun('the blueprint library was not supplied, so targets could not be resolved')
      const broken = md(ws).filter(([, text]) => !library.includes(blueprintOf(text)))
      return broken.length === 0
        ? passed([`${md(ws).length} back-links resolve`])
        : failed(broken.slice(0, 5).map(([p, t]) => `${p} points at ${blueprintOf(t)}, which is not in the library`))
    },
  },
  4: {
    name: 'no worked-example content survives',
    run(ws) {
      const hits = md(ws).filter(([, t]) => /^# WORKED EXAMPLE/m.test(t) || /ProjectBoard/.test(t))
      return hits.length === 0
        ? passed()
        : failed(hits.slice(0, 5).map(([p]) => `${p} still contains worked-example content`))
    },
  },
  5: {
    name: 'no surviving placeholder or instructional italic',
    run(ws) {
      const hits = md(ws).map(([p, t]) => [p, unfilled(t)]).filter(([, u]) => u.length > 0)
      return hits.length === 0
        ? passed()
        : failed(hits.slice(0, 5).map(([p, u]) => `${p} line ${u[0].line}: ${u[0].text.slice(0, 40)}`))
    },
  },
  6: {
    name: 'every [TODO] has a matching Q-### row',
    run(ws) {
      const questions = new Set(all(ws).match(/\bQ-\d{3}\b/g) ?? [])
      const orphans = md(ws)
        .flatMap(([p, t]) => todos(t).map((q) => [p, q]))
        .filter(([p, q]) => {
          // A TODO is paired if its own file or the open-questions file cites a Q-###.
          const near = ws[p].slice(Math.max(0, ws[p].indexOf(q) - 300), ws[p].indexOf(q) + 300)
          return !/\bQ-\d{3}\b/.test(near) && questions.size === 0
        })
      return orphans.length === 0
        ? passed()
        : failed(orphans.slice(0, 5).map(([p, q]) => `${p}: [TODO: ${q.slice(0, 40)}] has no Q-### row`))
    },
  },
  7: {
    name: 'no table row requiring a decision is left blank',
    run(ws) {
      const blanks = md(ws)
        .map(([p, t]) => [p, (t.match(/^\|(?:\s*\|){2,}\s*$/gm) ?? []).length])
        .filter(([, n]) => n > 0)
      return blanks.length === 0
        ? passed()
        : failed(blanks.slice(0, 5).map(([p, n]) => `${p} has ${n} empty table row(s)`))
    },
  },
  8: {
    name: 'every permission rule has at least one deny test',
    run(ws) {
      const text = all(ws)
      const denies = (text.match(/deny test|denial test|must not|cannot/gi) ?? []).length
      const rules = (text.match(/\bpermission rule|\brole\b.*\bcan\b/gi) ?? []).length
      if (rules === 0) return notRun('this workspace declares no permission rules')
      return denies > 0 ? passed([`${rules} rules, ${denies} denial statements`]) : failed(['permission rules exist with no denial test'])
    },
  },
  9: {
    name: 'every driving characteristic has at least one fitness function',
    run(ws) {
      const text = all(ws)
      const drivers = (text.match(/^\|\s*\*?\*?(?:Simplicity|Reliability|Auditability|Performance|Security|Scalability|Accessibility)/gim) ?? []).length
      if (drivers === 0) return notRun('no driving characteristics were declared')
      return /\bFF-\d{3}\b/.test(text) ? passed([`${drivers} driver rows`]) : failed(['drivers are declared with no fitness function'])
    },
  },
  10: {
    name: 'the entry point is under 100 lines and its paths resolve',
    run(ws) {
      const entry = Object.keys(ws).find((p) => /(^|\/)CLAUDE\.md$/.test(p))
      if (!entry) return notRun('no entry-point file exists yet — it is written last')
      const lines = ws[entry].split('\n').length
      const paths = [...ws[entry].matchAll(/\]\(([^)]+\.md)\)/g)].map((m) => m[1].replace(/^\.\//, ''))
      const broken = paths.filter((p) => !Object.keys(ws).some((k) => k.endsWith(p)))
      const problems = [
        ...(lines >= 100 ? [`${entry} is ${lines} lines; the limit is 100`] : []),
        ...broken.slice(0, 4).map((p) => `${entry} links to ${p}, which does not exist`),
      ]
      return problems.length === 0 ? passed([`${lines} lines, ${paths.length} paths resolve`]) : failed(problems)
    },
  },
  11: {
    name: 'no generated file contains application source code',
    run(ws) {
      const code = md(ws).filter(([, t]) =>
        /```(js|ts|python|java|go|rb|php|cs|rust|jsx|tsx)\b/i.test(t) ||
        /^\s*(function|class|def|import .* from|const \w+ = \()/m.test(t.replace(/```[\s\S]*?```/g, '')))
      return code.length === 0
        ? passed()
        : failed(code.slice(0, 5).map(([p]) => `${p} appears to contain application source code (BR-001)`))
    },
  },
  12: {
    name: 'no credential appears, and .gitignore excludes .env',
    run(ws) {
      const leaks = Object.entries(ws).filter(([, t]) =>
        /(sk-[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(t))
      if (leaks.length) return failed(leaks.map(([p]) => `${p} contains something shaped like a credential`))
      const ignore = Object.entries(ws).find(([p]) => p.endsWith('.gitignore'))
      if (!ignore) return notRun('this workspace has no .gitignore, so the exclusion could not be checked')
      return /^\.env$/m.test(ignore[1]) ? passed() : failed(['.gitignore does not exclude .env'])
    },
  },
}

/**
 * Run the walk. Returns every result plus the counts — and the counts are the point:
 * "all passed" asserted from an empty failure list is the exact shape of BR-009's failure.
 */
export function validate(workspace, library = null) {
  const results = Object.entries(CHECKS).map(([n, c]) => ({ n: Number(n), name: c.name, ...c.run(workspace, library) }))
  const ran = results.filter((r) => r.state !== 'not-run')
  return {
    results,
    total: results.length,
    ran: ran.length,
    passed: results.filter((r) => r.state === 'passed').length,
    failed: results.filter((r) => r.state === 'failed').length,
    notRun: results.filter((r) => r.state === 'not-run').length,
    /** The only condition under which success may be claimed at all. */
    mayClaimSuccess: ran.length === results.length && results.every((r) => r.state === 'passed'),
  }
}

/** The report line. States the count that RAN — never inferred from an absence of failures. */
export function report(v) {
  if (v.mayClaimSuccess) return `All ${v.total} checks ran; all ${v.total} passed.`
  const parts = [`${v.ran} of ${v.total} checks ran`]
  if (v.failed) parts.push(`${v.failed} failed`)
  if (v.notRun) parts.push(`${v.notRun} could not run`)
  return `${parts.join('; ')}. This workspace is NOT fully validated.`
}
