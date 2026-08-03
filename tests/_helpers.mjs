// Shared helpers for the fitness-function tests.
// Leading underscore so the test runner does not mistake it for a test file.

// execFileSync only, always with an argument array — no shell, so nothing here interpolates
// into a command string.
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
