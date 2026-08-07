// Shared helpers for the fitness-function tests, and for reading the prose modules the rest
// of the suite asserts against.
// Leading underscore so the test runner does not mistake it for a test file.

// execFileSync only, always with an argument array — no shell, so nothing here interpolates
// into a command string.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = fileURLToPath(new URL('..', import.meta.url))
export const check = (name) => fileURLToPath(new URL(`../ci/${name}`, import.meta.url))

/** Run a check script. Returns its exit code and output — never throws on a non-zero exit,
 *  because a non-zero exit is exactly what half these tests are asserting. */
export function run(script, args = [], cwd = REPO) {
  try {
    const stdout = execFileSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' })
    return { code: 0, stdout }
  } catch (e) {
    return { code: e.status ?? 1, stdout: `${e.stdout ?? ''}${e.stderr ?? ''}` }
  }
}

/** A throwaway copy of the real payload, so a test can break it without touching the repo. */
export function payloadCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'ff-payload-'))
  cpSync(join(REPO, 'plugin'), join(dir, 'plugin'), { recursive: true })
  return { root: join(dir, 'plugin'), cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

/** A throwaway git repository, for the checks that read commits rather than files. */
export function gitRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ff-git-'))
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' })
  git('init', '-q', '-b', 'main')
  git('config', 'user.email', 'test@example.invalid')
  git('config', 'user.name', 'fitness function test')
  return {
    dir,
    git,
    write(relPath, contents) {
      const full = join(dir, relPath)
      mkdirSync(dirname(full), { recursive: true })
      writeFileSync(full, contents)
    },
    commit(message) {
      git('add', '-A')
      git('commit', '-q', '-m', message)
    },
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  }
}

// --- Reading prose and tables -------------------------------------------------------------
//
// Two failure modes have cost this repository more test-integrity defects than anything else,
// and both are fixed here rather than in each test:
//
//   THE WRAP.  Every module hard-wraps at ~95 columns, so a regex written against the sentence
//              as a reader sees it dies on the line break. Eleven defects have been that —
//              including one in a test written to catch that very class. `norm()` first.
//
//   THE SPAN.  `/\*\*Core\*\*.*full chain/s` proves only that two strings appear SOMEWHERE in
//              a 139-line document in that order. Core and Supporting can swap depths and it
//              still passes. A claim about a table row has to be asserted against that row, so
//              `table()` addresses cells by header name and row label instead.

/** Collapse every run of whitespace, so an assertion survives the library's hard wrap. */
export const norm = (text) => text.replace(/\s+/g, ' ').trim()

/** The cells of one Markdown table row, whitespace-normalised, outer pipes dropped. */
export const cellsOf = (row) =>
  norm(row).replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())

const isRow = (line) => /^\s*\|/.test(line)
const isRule = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line)

/**
 * The Markdown table whose header row's first cell is `headerFirstCell`, addressable by name.
 *
 * `table(depth, 'Class').cell('**Core**', 'Specification depth')` is the thing REQ-F-017 is
 * actually about. Reading the header rather than hard-coding a column index means a reordered
 * or renamed column fails loudly instead of silently asserting the wrong cell.
 *
 * The table ends at the first line that is not a row, so a second table further down the
 * document cannot be mistaken for more of this one.
 */
export function table(text, headerFirstCell) {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((l) => isRow(l) && !isRule(l) && cellsOf(l)[0] === headerFirstCell)
  assert.notEqual(start, -1, `no table header whose first cell is "${headerFirstCell}"`)

  const header = cellsOf(lines[start])
  const rows = []
  for (const line of lines.slice(start + 1)) {
    if (!isRow(line)) break
    if (!isRule(line)) rows.push(cellsOf(line))
  }

  const columnIndex = (name) => {
    const i = header.indexOf(name)
    assert.notEqual(i, -1, `this table has no "${name}" column — it has: ${header.join(' | ')}`)
    return i
  }
  const rowFor = (label) => {
    const found = rows.filter((r) => r[0] === label)
    assert.equal(found.length, 1, `expected exactly one row labelled "${label}", found ${found.length}`)
    return found[0]
  }

  return {
    header,
    rows,
    /** Every row's first cell, in document order — the list a counting claim is made against. */
    labels: rows.map((r) => r[0]),
    row: rowFor,
    cell: (label, column) => rowFor(label)[columnIndex(column)],
  }
}

/**
 * Assert that every pattern occurs in `text`, AND that they occur in this order.
 *
 * `text.search(a) < text.search(b)` is not an ordering assertion. `String.prototype.search`
 * returns -1 when it finds nothing, and -1 is smaller than every real index — so the claim
 * "a comes before b" is satisfied by DELETING a.
 *
 * Six tests in this suite made their ordering claim that way. The sharpest was "the entry
 * point is written LAST, after validation": renaming intake.md's `## Step 3 — Validate` by one
 * letter sent the left-hand side to -1 and the test went green on a document with no
 * validation step at all — passing precisely because the thing it is about had vanished.
 */
export function inOrder(text, ...patterns) {
  let previousAt = -1
  let previous = null
  for (const pattern of patterns) {
    const at = text.search(pattern)
    assert.notEqual(at, -1, `${pattern} does not appear at all — an ordering claim about something absent proves nothing`)
    if (previous) assert.ok(at > previousAt, `${pattern} must come after ${previous}; it comes before`)
    previousAt = at
    previous = pattern
  }
}
