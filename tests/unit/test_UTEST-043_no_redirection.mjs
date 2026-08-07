// UTEST-043 — the integrity command is run as written, redirections included.
// Requirement: BUG-025 · BUG-005 · BR-009 · REQ-NF-001.
//
// BUG-025 is the smallest defect in this repository and one of the more expensive. A traced run
// had the correct command, saw the shell complain that `*/*/*/*.md` matched nothing, appended
// `2>/dev/null` to tidy the message away — and the redirection read as file creation to the
// permission guard, so the command that would have worked was denied. The run then treated that
// refusal as the host being unable, which is the doorway straight back to BUG-005.
//
// UTEST-034 already forbids composing your own command. That was not enough, and the reason is
// worth keeping: the run was not composing a command, it was *tidying* one. A rule against
// invention does not read as a rule against a two-character addition.
//
// So the doc has to do two things, and these tests check both. Banning the act is the easy half.
// The half that decides whether it holds is removing the MOTIVE — saying plainly that the
// unmatched glob is expected, that the digests are already on stdout, and that nothing is
// missing from the result. A ban whose reason is never explained gets reasoned around by the
// next run that meets the same stderr line.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const DOC = readFileSync('plugin/instructions/integrity.md', 'utf8')

// Whitespace-normalised. Eleven defects in this repository have been a pattern that failed to
// match across a hard-wrapped line, and this section is hard-wrapped prose.
const SECTION = DOC.slice(DOC.indexOf('### Do not add a redirection')).split(/\n### /)[0].replace(/\s+/g, ' ')

test('UTEST-043: the ban names the redirection that actually happened', () => {
  // By name, because that is what a run will be about to type. A general rule about "redirections"
  // is not something you check yourself against mid-command.
  assert.match(SECTION, /never append `2>\/dev\/null`/)
})

test('UTEST-043: the Windows and cmd forms are named too', () => {
  // CON-004: identical behaviour on three platforms. Banning only the POSIX spelling would leave
  // the same mistake fully available on the platform this kit is most often run from.
  for (const form of ['2>\\$null', '2>nul']) assert.match(SECTION, new RegExp(`\`${form}\``))
})

test('UTEST-043: the stderr line is stated to be expected, not a failure', () => {
  // The motive. The run suppressed the message because it looked like something had gone wrong.
  assert.match(SECTION, /matches nothing in some installs/)
  assert.match(SECTION, /That line looks like a failure\. It is not\./)
})

test('UTEST-043: it says the result is complete anyway', () => {
  // The other half of the motive, and the part a run cannot safely assume: that ignoring the
  // complaint does not mean ignoring a file. If this is ever cut, the ban becomes an instruction
  // to knowingly skip part of the library, and no run should follow that.
  assert.match(SECTION, /digests are on stdout/i)
  assert.match(SECTION, /a glob that matches nothing contributes nothing/)
  assert.match(SECTION, /shallower globs have already covered every file that exists/)
})

test('UTEST-043: the cost of the redirection is stated, not just asserted', () => {
  assert.match(SECTION, /reads as \*\*file\s?creation\*\* to a permission guard/)
  assert.match(SECTION, /BUG-025/)
})

test('UTEST-043: a self-inflicted refusal is not the host refusing', () => {
  // Without this the run reaches the escape hatch honestly: it tried a command, it was refused,
  // the doc says a refusal means stop. It never gets to notice the refusal was its own doing.
  const ladder = DOC.slice(DOC.indexOf('### If a command is refused')).replace(/\s+/g, ' ')
  assert.match(ladder, /refused because you added something to it is not the host refusing/)
  assert.match(ladder, /Run the documented form unaltered before concluding anything about the host/)
})

test('UTEST-043: the documented commands still carry no redirection themselves', () => {
  // The doc cannot ban what it demonstrates. This is the one assertion here that reads the
  // commands rather than the prose, so it fails if someone ever "fixes" the stderr noise upstream.
  const commands = [...DOC.matchAll(/^\s{3}\S[^\n]*?\s{2,}(sha256sum .+|shasum .+)$/gm)].map((m) => m[1])
  assert.ok(commands.length >= 1, 'no command found in the doc')
  for (const command of commands) assert.doesNotMatch(command, /\d?>[&\s]*\S/)
})
