// UTEST-061 — Step 0 has a command on every platform CON-004 names.
// Requirement: CON-004 · REQ-NF-008 · BR-009 · BUG-004 · BUG-022 · BUG-027.
//
// integrity.md documented two commands, `sha256sum` and `shasum`. Both are POSIX tools. On a
// Windows host without Git Bash or WSL neither exists, so the mandatory Step 0 could not run,
// and the doc's own escape hatch then correctly stopped the run before question one. For that
// developer the kit did not degrade — it refused to start, which is the most complete failure
// available to it.
//
// It survived this long because every traced run happened on a Windows machine that HAS Git
// Bash, so `sha256sum` resolved and nothing looked wrong. A 400-agent audit raised it and its
// skeptics refuted it on the same evidence: they checked a host where the POSIX tools were
// present. The constraint is about the developer's machine, not the author's.
//
// The PowerShell form was verified by execution before being written down — it produces the
// same 64 characters as the POSIX form and as the manifest. That mattered more than usual here:
// the two obvious ways to write it are a temp file (BUG-004) and Compare-Object (BUG-022), and
// this repository has already paid for both.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const DOC = readFileSync('plugin/instructions/integrity.md', 'utf8')
const MANIFEST = readFileSync('plugin/blueprints/MANIFEST.md', 'utf8')

// Whitespace-normalised for the prose assertions. Eleven defects in this repository have been a
// regex dying across a hard-wrapped line.
const RATIONALE = DOC.slice(DOC.indexOf('### The Windows form is not optional')).split(/\n### /)[0].replace(/\s+/g, ' ')

test('UTEST-061: a Windows command exists at all', () => {
  // The whole defect in one assertion. Before the fix, the doc named no hasher that ships with
  // Windows, and there was nothing in the repository that would have noticed.
  assert.match(DOC, /Get-FileHash -Algorithm SHA256/)
  assert.match(DOC, /Get-ChildItem -Recurse -Filter \*\.md/)
})

test('UTEST-061: every platform CON-004 names has a command', () => {
  // Named individually, because "there are three commands" would pass if one platform had two
  // and another had none — which is the state this test was written to end.
  for (const [platform, marker] of [['Linux', /sha256sum \*\.md/], ['macOS', /shasum -a 256 \*\.md/], ['Windows', /Get-FileHash/]])
    assert.match(DOC, marker, `no Step 0 command for ${platform}`)
})

test('UTEST-061: the Windows form excludes the manifest, like the others', () => {
  // The manifest cannot be excluded by glob, so each form drops it by name. A Windows form that
  // hashed MANIFEST.md would produce a digest that never matches and can never be made to.
  assert.match(DOC, /\$_\.Name -ne 'MANIFEST\.md'/)
})

test('UTEST-061: it reaches the whole library at any depth', () => {
  // THE FIXED DEPTH IS THE RISK — the same one UTEST-034 guards for the POSIX forms, where the
  // glob is written out to four levels and silently misses a fifth. `-Recurse` has no depth, so
  // assert that it is what is used rather than a hand-written glob ladder.
  const windows = DOC.slice(DOC.indexOf('Get-ChildItem')).split('\n')[0]
  assert.match(windows, /-Recurse/)
  assert.doesNotMatch(windows, /\*\/\*/, 'the Windows form should recurse, not enumerate depths')
})

test('UTEST-061: it creates no file — BUG-004 is the rule it would break', () => {
  // A redirection or Out-File here would be the same defect as writing a helper script: a check
  // that writes something in order to run has broken the boundary it exists to protect, before
  // the developer has seen a word.
  const windows = DOC.slice(DOC.indexOf('Get-ChildItem')).split('\n')[0]
  assert.doesNotMatch(windows, /Out-File|Set-Content|Add-Content|New-Item|>/)
  assert.match(RATIONALE, /creates no file/)
})

test('UTEST-061: the rationale names both traps, so neither is re-entered', () => {
  // The two simplifications a future reader will reach for, each already paid for once.
  assert.match(RATIONALE, /temp file/)
  assert.match(RATIONALE, /BUG-004/)
  assert.match(RATIONALE, /Compare-Object/)
  assert.match(RATIONALE, /BUG-022/)
})

test('UTEST-061: the digest the doc claims is the digest the manifest declares', () => {
  // The doc quotes a verified value as evidence the Windows form agrees with the POSIX one. If
  // the library changes and the manifest is regenerated, that quoted value goes stale and the
  // evidence silently becomes a lie. This is what notices.
  const quoted = RATIONALE.match(/`([0-9a-f]{64})`/)?.[1]
  const declared = MANIFEST.match(/^\*\*Library digest:\*\*\s*`([0-9a-f]{64})`/m)?.[1]
  assert.ok(quoted, 'the rationale quotes no digest')
  assert.ok(declared, 'the manifest declares no library digest')
  assert.equal(quoted, declared, 'integrity.md quotes a digest the manifest no longer declares')
})
