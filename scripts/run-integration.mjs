import { execFileSync, execSync } from 'node:child_process'

// Boots a throwaway Postgres on localhost:5433, runs the fork's integration
// harnesses against it, then tears it down. Mirrors test/README.md.
//
//   npm run test:integration
//
// Requires Docker. Exits non-zero if any harness fails.

const container = 'voidauth-test-db'
const image = 'postgres:18'
// On Windows npm is npm.cmd, which Node refuses to spawn without a shell.
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function runShell(command) {
  execSync(command, { stdio: 'inherit', shell: true })
}

function quiet(command, args) {
  try {
    execFileSync(command, args, { stdio: 'ignore' })
  } catch {
    // best-effort cleanup / probes
  }
}

const harnesses = ['test:ldap-guard', 'test:totp', 'test:ldap-sync']

let failed = false

try {
  quiet('docker', ['rm', '-f', container])
  console.log(`integration: starting ${image} on localhost:5433 ...`)
  execFileSync('docker', ['run', '-d', '--name', container, '-p', '5433:5432', '-e', 'POSTGRES_PASSWORD=testpass123', image], { stdio: 'ignore' })

  let ready = false
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      execFileSync('docker', ['exec', container, 'pg_isready', '-U', 'postgres'], { stdio: 'ignore' })
      ready = true
      break
    } catch {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  if (!ready) {
    throw new Error('throwaway Postgres did not become ready')
  }

  for (const harness of harnesses) {
    try {
      runShell(`${npm} run ${harness}`)
    } catch {
      failed = true
    }
  }
} catch (error) {
  console.error(`integration: ${error instanceof Error ? error.message : String(error)}`)
  failed = true
} finally {
  quiet('docker', ['rm', '-f', container])
}

if (failed) {
  console.error('integration: FAILED')
  process.exit(1)
}
console.log('integration: ALL PASS')
