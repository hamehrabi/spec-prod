// Resume — stage completeness derived by inspection (REQ-F-028, ADR-004, FF-003).
//
// The whole design rests on one refusal: there is NO state file. Not a marker, not a
// manifest of progress, not a hidden field. Stage position is worked out by reading what
// exists, every time.
//
// That is not asceticism. A stored position is a second source of truth, and it starts
// disagreeing with the workspace the moment anyone edits a file by hand — which is exactly
// when a developer most needs resume to be right. Re-reading ~90 local files is cheap.
//
// A pure function of (files present, acceptance rows, stage definitions), so all eight
// interrupt cases are testable without running an intake.

import { acceptedStages } from './acceptance.mjs'

/** @typedef {{name: string, artifacts: string[]}} Stage */

export const ABSENT = 'absent'
export const PARTIAL = 'partial'
export const WRITTEN = 'written-not-accepted'
export const COMPLETE = 'complete'

/**
 * Four states, and the third is the one a simpler design would miss.
 *
 *   absent    nothing of this stage exists
 *   partial   some artifacts, not all -> redo the stage FROM ITS START, whole files
 *   written   every artifact, no acceptance row -> re-present the GATE. Do not re-ask the
 *             round, do not advance. The session ended between the write and the decision,
 *             and the developer has not answered yet (AC-041).
 *   complete  every artifact, and accepted
 */
export function stageStatus(stage, files, changeLog = '') {
  const present = stage.artifacts.filter((a) => files.includes(a))
  if (present.length === 0) return ABSENT
  if (present.length < stage.artifacts.length) return PARTIAL
  const accepted = acceptedStages(changeLog).map((s) => s.toLowerCase())
  const isAccepted = accepted.some((row) => row.startsWith(stage.name.toLowerCase()))
  return isAccepted ? COMPLETE : WRITTEN
}

/**
 * Where the run continues: the first stage that is not complete.
 *
 * Never the first ABSENT one — a partial stage earlier in the list must be finished before
 * anything later is touched, or resume would leave a hole behind it and call the workspace
 * done.
 */
export function derive(stages, files, changeLog = '') {
  const statuses = stages.map((s) => ({ stage: s.name, status: stageStatus(s, files, changeLog) }))
  const next = statuses.find((s) => s.status !== COMPLETE)
  return {
    statuses,
    resumeAt: next ? next.stage : null,
    action: next ? actionFor(next.status) : 'nothing — the workspace is complete',
    isEmpty: files.length === 0,
  }
}

const actionFor = (status) =>
  ({
    [ABSENT]: 'ask this round',
    [PARTIAL]: 'redo this stage from its start, replacing files whole',
    [WRITTEN]: 're-present this stage\'s acceptance gate — do not re-ask, do not advance',
  })[status]

/**
 * A generated file the kit did not write in its current form. Reported, never overwritten
 * silently — the correct behaviour is to ask (`database-design.md` §0 names this limit).
 *
 * The honest part: a hand-edited file and a correctly filled one are not always
 * distinguishable. What IS detectable is a file that lost its back-link, or one that is
 * empty. Anything subtler is asked about rather than guessed at.
 */
export function suspectFiles(fileContents) {
  return Object.entries(fileContents)
    .filter(([path, text]) => path.endsWith('.md') && (text.trim() === '' || !/^> Blueprint: blueprints\//m.test(text)))
    .map(([path]) => path)
}
