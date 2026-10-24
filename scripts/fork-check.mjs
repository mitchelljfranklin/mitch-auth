import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import seams from './fork-seams.mjs'

const failures = []

function read(path) {
  if (!existsSync(path)) {
    failures.push(`MISSING FILE: ${path}`)
    return ''
  }
  return readFileSync(path, 'utf8')
}

// ---- seam checks: derived from scripts/fork-seams.mjs (single source of truth) ----
for (const seam of seams) {
  if (!existsSync(seam.file)) {
    failures.push(`MISSING FILE: ${seam.file}`)
    continue
  }
  if (!read(seam.file).includes(seam.applied)) {
    failures.push(`SEAM MISSING: ${seam.id} (${seam.description}) in ${seam.file} — run: npm run seams:apply`)
  }
}

// ---- owned-file / constant divergences (not seam-able) ----
const checks = [
  ['server/util/argon2id.ts', /runInPool/, 'H1 argon2 verification worker pool'],
  ['server/ldap/hardening.ts', /BIND_FAILURES_BEFORE_BACKOFF/, 'H2 ldap bind-failure backoff'],
  ['server/ldap/hardening.ts', /MAX_CONNECTIONS/, 'H2 ldap connection cap'],
  ['server/ldap/hardening.ts', /IDLE_TIMEOUT_MS/, 'H2 ldap idle timeout'],
  ['server/ldap/sync.ts', /LDAP_SYNC_LINK_EXISTING_USERS/, 'F1 ldap linking opt-in flag'],
  ['server/ldap/sync.ts', /SYNC_ACTOR_ID/, 'F1 provenance-based admin revocation'],
  ['server/ldap/sync.ts', /was not found among the synced groups/, 'F1 admin-group typo diagnostic'],
  ['server/ldap/sync.ts', /memberOf attribute/, 'F1 memberOf diagnostic'],
  ['server/util/config.ts', /LDAP_SYNC_LINK_EXISTING_USERS: boolean = false/, 'F1 linking config default false'],
  ['server/util/config.ts', /TRUSTED_PROXIES: string \| boolean/, 'upstream TRUSTED_PROXIES present'],
  ['shared/constants.ts', /SESSION: 14 \* DAY/, 'H3 session TTL 14 days'],
  ['shared/constants.ts', /GRANT: 90 \* DAY/, 'H3 grant TTL 90 days'],
  ['shared/constants.ts', /EMAIL_LOG: 30 \* DAY/, 'H3 email_log retention TTL'],
  ['server/routes/user.ts', /endUserSessions\(user\.id\)/, 'H4 password change ends sessions'],
  ['server/routes/public.ts', /delete\(\)\.where\(\{ userId: user\.id \}\)/, 'H5 reset invalidates all user tokens'],
  ['server/routes/auth.ts', /await getEmailVerification\(user\.id\)/, 'H6 send_verify_email gating'],
  ['server/db/totp.ts', /lastUsedTimestep/, 'H7 totp replay protection'],
  ['server/db/totp.ts', /totp\.expiresAt != null \? null : timestep/, 'H7 enrollment does not burn timestep'],
  ['server/db/client.ts', /LOWER\("name"\) IN/, 'H11 case-insensitive client group matching'],
  ['server/db/tableMaintenance.ts', /TTLs\.EMAIL_LOG/, 'H8 email_log purge'],
  ['frontend/src/app/pages/admin/emails/emails.component.ts', /sandbox=""/, 'H14 email preview iframe sandbox'],
  ['frontend/src/app/services/auth.service.ts', /e\.status === 0/, 'H15 opaque redirect handled as success'],
  ['frontend/src/app/pages/mfa/mfa.component.ts', /replaceUrl: true/, 'H16 deterministic MFA cancel'],
  ['server/util/redact.ts', /redactChallenges/, 'H9 email body redaction helper'],
  ['server/util/login-timing.ts', /timingEqualizedReject/, 'H12 login timing equalization'],
  ['server/cli/index-html.ts', /extractAngularScriptSrc/, 'H13 CSP script-src mirror helper'],
  ['server/cli/index-html.ts', /assetNotFoundGuard/, 'H13 asset 404 guard'],
  ['server/db/settings.ts', /SETTING_/, 'F2 DB-backed settings flag prefix'],
  ['server/util/config.ts', /applySettingsFromDB/, 'F2 runtime settings apply'],
]

// must NOT appear anywhere in these trees
const negativeChecks = [
  ['TRUST_PROXY', 'retired TRUST_PROXY must not reappear'],
  ['window.history.back()', 'mfa cancel must not use history.back()'],
]

const ignoreDirs = new Set(['node_modules', 'dist', 'dist-browser', '.angular', '.vitepress'])

function walkTree(dir) {
  const files = []
  let entries = []
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }
  for (const entry of entries) {
    if (ignoreDirs.has(entry)) continue
    const full = `${dir}/${entry}`
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      files.push(...walkTree(full))
    } else if (/\.(ts|html|md|json)$/.test(entry)) {
      files.push(full)
    }
  }
  return files
}

for (const [file, pattern, description] of checks) {
  if (!pattern.test(read(file))) {
    failures.push(`FAIL: ${description} — pattern not found in ${file}`)
  }
}

for (const tree of ['server', 'shared', 'docs', 'frontend/src']) {
  for (const file of walkTree(tree)) {
    const content = read(file)
    for (const [pattern, description] of negativeChecks) {
      if (content.includes(pattern)) {
        failures.push(`FAIL: ${description} — found '${pattern}' in ${file}`)
      }
    }
  }
}

// ---- F2: fork-only i18n keys must survive i18n merges ----
function hasPath(object, path) {
  let current = object
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object' || !(part in current)) return false
    current = current[part]
  }
  return true
}

const i18nFile = 'frontend/public/i18n/en-US.json'
const forkI18nKeys = ['admin.settings', 'admin.common.actions.save', 'app.navigation.admin.settings']
const i18nRaw = read(i18nFile)
if (i18nRaw) {
  try {
    const i18n = JSON.parse(i18nRaw)
    for (const key of forkI18nKeys) {
      if (!hasPath(i18n, key)) {
        failures.push(`FAIL: F2 i18n key missing after merge: ${key} in ${i18nFile}`)
      }
    }
  } catch (e) {
    failures.push(`FAIL: ${i18nFile} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`)
  }
}

// ---- cp1252 double-encoding ("mojibake") corrupts fork docs/i18n silently ----
const mojibakePatterns = [
  /\u00e2\u20ac/, /\u00e2\u0153/, /\u00e2\u2020/, /\u00f0\u0178/, /\u00c2[\u00a0-\u00bf]/,
]
for (const tree of ['docs', 'frontend/public/i18n']) {
  for (const file of walkTree(tree)) {
    const content = read(file)
    if (mojibakePatterns.some(pattern => pattern.test(content))) {
      failures.push(`FAIL: mojibake (cp1252 double-encoding) in ${file} — re-save as UTF-8`)
    }
  }
}

// Dockerfile.fork must carry the same non-dhi.io FROM lines (digest pins) as Dockerfile
function registryOf(line) {
  // second whitespace token is the image ref; its registry is everything before the first '/'
  const image = line.split(/\s+/)[1] ?? ''
  const slash = image.indexOf('/')
  return slash === -1 ? '' : image.slice(0, slash)
}

function fromLines(path) {
  return read(path)
    .split('\n')
    .filter(l => l.startsWith('FROM ') && registryOf(l) !== 'dhi.io')
    .map(l => l.trim())
}
const upstreamFroms = fromLines('Dockerfile')
const forkFroms = new Set(fromLines('Dockerfile.fork'))
for (const from of upstreamFroms) {
  if (!forkFroms.has(from)) {
    failures.push(`FAIL: Dockerfile.fork missing upstream FROM line: ${from}`)
  }
}

// CodeQL init/analyze must be pinned to the same action version, or the run
// fails with "Loaded a configuration file for version X, but running version Y".
const codeqlWorkflow = read('.github/workflows/codeql.yml')
function codeqlActionSha(action) {
  return codeqlWorkflow.match(new RegExp(`codeql-action/${action}@([0-9a-f]{40})`))?.[1]
}
const codeqlInit = codeqlActionSha('init')
const codeqlAnalyze = codeqlActionSha('analyze')
if (codeqlInit && codeqlAnalyze && codeqlInit !== codeqlAnalyze) {
  failures.push(`FAIL: CodeQL init (${codeqlInit.slice(0, 7)}) and analyze (${codeqlAnalyze.slice(0, 7)}) pins differ — align to the same action version`)
}

// The admin background upload/detection mirrors upstream's branding filenames.
// If upstream renames or reorders them, update server/util/branding.ts (and the
// upload route's extension mapping); this check makes that review explicit.
function backgroundNames(source, marker) {
  const match = source.match(new RegExp(`${marker}\\s*=\\s*\\[([^\\]]*)\\]`))
  if (!match) return null
  return [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1])
}
const upstreamBackgrounds = backgroundNames(read('server/cli/server.ts'), 'const backgroundPreferenceOrder')
const forkBackgrounds = backgroundNames(read('server/util/branding.ts'), 'export const BACKGROUND_FILENAMES')
if (!upstreamBackgrounds || !forkBackgrounds) {
  failures.push('FAIL: could not locate the branding background filename list — review the Admin background feature (server/cli/server.ts + server/util/branding.ts)')
} else if (upstreamBackgrounds.join(',') !== forkBackgrounds.join(',')) {
  failures.push(`FAIL: branding background filenames differ — upstream [${upstreamBackgrounds.join(', ')}] vs fork [${forkBackgrounds.join(', ')}]`)
}

if (failures.length) {
  failures.forEach(f => console.error(f))
  console.error(`fork-check: ${failures.length} FAILURE(S)`)
  process.exit(1)
}
console.log(`fork-check: ${seams.length} seams + ${checks.length} owned-file divergences all present ✓`)
