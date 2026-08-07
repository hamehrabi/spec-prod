// UTEST-064 — Step 0 tries the POSIX forms first, and claims nothing about being permitted.
// Requirement: CON-004 · REQ-NF-001 · BR-009 · BUG-027 · BUG-030.
//
// BUG-027 gave Step 0 a Windows command, because without one the kit refused to start on a
// Windows host with no Git Bash. The wording that came with it said "On Windows, where neither
// of those exists, use PowerShell" — which reads, on Windows, as an instruction to start there.
//
// A traced run did exactly that. It went straight to the PowerShell line, had it **refused by a
// sandbox guard for containing script blocks**, lost 28 seconds, and then ran `sha256sum`
// successfully on the first attempt. Step 0 took 82 seconds where it should have taken about
// 30, on a host that had the POSIX tools all along.
//
// Two separate mistakes, and this file pins both.
//
// The ordering one is cheap: try what is most likely to be permitted first, because a refusal
// costs a round-trip and no document can know which guard a host runs.
//
// The other is worse, because it was a false claim in shipped payload. The doc said the
// PowerShell form "was observed to survive a guarded session" — true of the author running it
// by hand, false of the kit running it, and the trace is what showed the difference. A document
// that asserts an observation nobody made is the same defect as a check that reports a result
// it did not measure (BR-009). It now states the refusal as a known outcome and says what to do
// when it happens.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const DOC = readFileSync('plugin/instructions/integrity.md', 'utf8')

// Whitespace-normalised. Eleven defects in this repository have been a regex dying across a
// hard-wrapped line, and this file is hard-wrapped prose.
const flat = (s) => s.replace(/\s+/g, ' ')
const ORDER = flat(DOC.slice(DOC.indexOf('### Try the POSIX forms first')).split(/\n### /)[0])

test('UTEST-064: the order is stated explicitly, all four steps', () => {
  // Named in sequence rather than implied by layout. The previous wording was correct as a
  // layout — POSIX first, PowerShell after — and a run still started at the bottom, because a
  // sentence addressed to "on Windows" outranks the order things happen to be printed in.
  assert.match(ORDER, /`sha256sum`, then `shasum`, then the PowerShell line, then the stop message/)
  assert.match(ORDER, /Take the first that runs/)
})

test('UTEST-064: being on Windows is not a reason to start at the PowerShell form', () => {
  // The exact misreading the trace caught, contradicted in the words that produced it.
  assert.match(ORDER, /Being on Windows is a reason to \*have\* the third form, not a reason to start with it/)
})

test('UTEST-064: the reason is a measured cost, not a preference', () => {
  // A rule whose reason is "because I said so" gets re-litigated by the next reader who thinks
  // starting with the native tool is obviously right. It is obviously right, and it was slower.
  assert.match(ORDER, /28 seconds/)
  assert.match(ORDER, /a refusal costs a round-trip/)
})

test('UTEST-064: the doc no longer claims the PowerShell form survives a guard', () => {
  // The falsified claim. Asserted as an ABSENCE, because the failure mode is the sentence coming
  // back — it reads as reassuring and it is the kind of thing a later edit restores.
  assert.doesNotMatch(flat(DOC), /observed to survive a guarded session/)
})

test('UTEST-064: it states the refusal as a known outcome, with what to do', () => {
  // BR-009's shape applied to a document: say what was observed, and never more. A known
  // refusal with no stated fallback would send the run to the stop message on a host that had
  // `sha256sum` sitting there — which is BUG-005's ending reached by a new route.
  const claim = flat(DOC.slice(DOC.indexOf('It is not guaranteed to be permitted')))
  assert.match(claim, /refused by a sandbox guard for containing script blocks/)
  assert.match(claim, /not for anything the run added/)
  assert.match(claim, /fall through to the POSIX forms above/)
  assert.match(claim, /only use the stop message if those are refused too/)
})

test('UTEST-064: all three commands are still present', () => {
  // The cheap way to satisfy everything above is to delete the PowerShell form, which would
  // restore BUG-027 — the kit refusing to start on a host with no POSIX tools.
  for (const [platform, marker] of [['Linux', /sha256sum \*\.md/], ['macOS', /shasum -a 256 \*\.md/], ['Windows', /Get-FileHash/]])
    assert.match(DOC, marker, `no Step 0 command for ${platform}`)
})
