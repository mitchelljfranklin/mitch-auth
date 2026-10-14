import { execFileSync, execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

// Regenerates the fork's lockfiles after an upstream merge.
//
// package.json is a union of fork + upstream dependencies (see FORK.md step 6),
// so the lockfiles cannot be merged by hand. Resolve package.json first, then:
//
//   npm run lockfiles:regen            (or: node scripts/regen-lockfiles.mjs)
//
// NOTE: `npm run` needs to parse package.json, so while package.json still has
// conflict markers use `node scripts/regen-lockfiles.mjs` directly.

const manifests = ['package.json', 'frontend/package.json']
const lockfiles = ['package-lock.json', 'frontend/package-lock.json']

for (const manifest of manifests) {
  if (!existsSync(manifest)) continue
  if (readFileSync(manifest, 'utf8').includes('<<<<<<<')) {
    console.error(`lockfiles:regen: ${manifest} still has merge conflict markers — resolve it before regenerating lockfiles.`)
    process.exit(1)
  }
}

function git(args) {
  try {
    execFileSync('git', args, { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function npm(args, cwd) {
  // On Windows npm is npm.cmd, which Node refuses to spawn without a shell.
  const command = `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} ${args.join(' ')}`
  console.log(`$ ${command}${cwd ? `  (in ${cwd})` : ''}`)
  execSync(command, { stdio: 'inherit', cwd, shell: true })
}

// Take upstream's lockfile as the base; it is regenerated from the unioned
// package.json below. Ignored when the file is not conflicted.
for (const lock of lockfiles) {
  git(['checkout', '--theirs', lock])
}

npm(['install', '--package-lock-only'])
npm(['install', '--package-lock-only'], 'frontend')

git(['add', ...lockfiles])
console.log('lockfiles:regen: package-lock.json + frontend/package-lock.json regenerated')
