import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

// Surfaces upstream changes to fork-rewritten documentation since the fork's
// recorded upstream base. `docs/*`, `SECURITY.md` and the issue/PR templates
// are marked `merge=ours`, so upstream edits to them do not conflict on merge —
// they are dropped silently. This lists them so they can be cherry-picked
// deliberately (FORK.md merge playbook step 11).
//
//   npm run docs:drift                 — uses the base recorded in FORK.md
//   npm run docs:drift -- --base <sha> — compare from an explicit base
//   npm run docs:drift -- --check      — exit 1 if there is anything to review

const MERGE_OURS_PATHS = ['docs', 'SECURITY.md', '.github/ISSUE_TEMPLATE', '.github/PULL_REQUEST_TEMPLATE.md']

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' })
}

function option(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function recordedBase() {
  const match = readFileSync('FORK.md', 'utf8').match(/^\|\s*`([0-9a-f]{7,40})`/m)
  if (!match) {
    console.error('docs:drift: no recorded upstream base in FORK.md — run: npm run base:set')
    process.exit(1)
  }
  return match[1]
}

const base = option('--base') ?? recordedBase()
const check = process.argv.includes('--check')

try {
  git(['rev-parse', '--verify', 'upstream/main'])
} catch {
  console.error('docs:drift: upstream/main not found — run: git fetch upstream main')
  process.exit(1)
}

const stat = git(['diff', '--stat', `${base}..upstream/main`, '--', ...MERGE_OURS_PATHS]).trim()

if (!stat) {
  console.log(`docs:drift: no upstream doc/template changes since ${base}`)
  process.exit(0)
}

console.log(`docs:drift: upstream changes since ${base} touch merge=ours files — cherry-pick deliberately:\n`)
console.log(stat)

// The most common silent drop is a newly documented environment variable.
function documentedEnvVars(content) {
  const names = new Set()
  for (const line of content.split('\n')) {
    const match = line.match(/^\|\s*([A-Z][A-Z0-9_]{2,})\s*\|/)
    if (match) names.add(match[1])
  }
  return names
}

let upstreamConfig = ''
try {
  upstreamConfig = git(['show', 'upstream/main:docs/Configuration.md'])
} catch {
  upstreamConfig = ''
}
const localConfig = existsSync('docs/Configuration.md') ? readFileSync('docs/Configuration.md', 'utf8') : ''
const localVars = documentedEnvVars(localConfig)
const missing = [...documentedEnvVars(upstreamConfig)].filter(name => !localVars.has(name)).sort()

if (missing.length > 0) {
  console.log(`\ndocs:drift: documented upstream but missing from docs/Configuration.md:\n  ${missing.join(', ')}`)
} else {
  console.log('\ndocs:drift: docs/Configuration.md documents every upstream environment variable')
}

if (check) process.exit(1)
