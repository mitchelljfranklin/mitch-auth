# Changelog

## Upstream base

This fork tracks [voidauth/voidauth](https://github.com/voidauth/voidauth).

| Upstream base | Merged on |
|---|---|
| `ca1fd29` | 2026-10-27 |
| `1e215b7` | 2026-10-24 |
| `c82c4c2` | 2026-10-19 |
| `aa260a8` | 2026-10-14 |
| `a1bafc5` | 2026-09-22 |
| `a9254ca` | 2026-09-22 |
| `33b826e` | 2026-09-13 |
| `d1f356b` | 2026-09-10 |
| `446aa19` | 2026-09-04 |
| `b577ba9` | 2026-08-30 |
| `b34e524` | 2026-08-26 |

## Fork changes

### [1.20.0] - 2026-10-27

#### Upstream sync

- **2026-10-27 sync (14 commits)**: **User avatars** — users can upload/remove an avatar on the home page; admins can manage avatars on the user and invitation pages. PNG/JPEG/WebP within size/dimension limits, stored as de-duplicated uploaded assets (new `user_avatars` migration adds `avatarHash` to `user` and `invitation`; orphaned assets are cleaned up in maintenance). New **`DISABLE_USER_AVATAR_UPLOADS`** environment variable disables member uploads while admins retain control. Image uploads were refactored into a shared `imageUpload`/`normalizeUploadedImage` helper (client logos now use it too). Fix: **TOTP secrets are now re-encrypted on `STORAGE_KEY` rotation** (previously they were only checked for decryptability). i18n updates across de/fr/nl/ru/en-US. Upstream bumped CodeQL `init` to v4.39.0 and `actions/checkout` to v7.0.1; the fork aligned CodeQL `analyze` to v4.39.0. Docs: cherry-picked the `DISABLE_USER_AVATAR_UPLOADS` row

#### Developer tooling

- `fork:check` now asserts the fork's branding background filename list (`server/util/branding.ts`) matches upstream's `backgroundPreferenceOrder` in `server.ts` — the Admin background upload/detection depends on it, and upstream can change it on a merge.

### [1.19.0] - 2026-10-24

#### Fork features

- **Background image in Admin Settings** — the Appearance section can now upload a page background (PNG/JPEG/WebP). The browser downscales it (max 1920 px, JPEG) and the server writes it to `config/branding/background.*`, which the existing page-background injection serves; it takes precedence over a manually placed branding file, and **Remove** deletes it. Uploading a logo now also applies immediately instead of waiting for a restart or the next settings save.

#### Fixes

- **Light-theme canvas** — the theme toggle now applies `light`/`dark` to `<html>` (`documentElement`) instead of only `<body>`, and `styles.scss` targets `html.light` / `html.dark`. The generated theme sets `html { color-scheme: light dark }`, so with a dark OS and an explicit light theme, `<html>` previously resolved its `light-dark()` surface to the dark color and painted a dark canvas below the viewport-height body (visible when scrolling). `System` mode still follows the OS.

### [1.18.0] - 2026-10-24

_Includes all changes shipped since v1.17.0; earlier entries are retained for history._

#### Upstream sync

- **2026-10-24 sync (12 commits)**: **Branding background image** — `background.png`/`background.jpg` in `/app/config/branding` is injected as `--page-background-image` and shown on user-facing pages flagged `data: { pageBackground: true }` (login, MFA, reset/forgot password, verify, consent, not-found, etc.); header/button/text width and style tweaks. Upstream changed the i18n table-column translation method (so i18nAlly recognizes the strings) and completed the ru-RU translation. `REDIRECT_PATHS.NOT_FOUND` renamed `not-found` → `not_found`. Upstream rotated the Docker Hub secret in its own workflows (the fork still uses `release-fork.yml`). Docs: branding background row/prose and a refreshed customization screenshot. No Dockerfile or dependency changes. Fork fix: the DB-backed `APP_LOGO` path returned from `modifyIndex` before upstream's new background injection, so it now injects the branding background too

- **2026-10-19 sync (18 commits)**: **Skip passkey prompt** — new per-user `skipPasskeyPrompt` (migration `20261016142429_skip_passkey_prompt`, NOT NULL), `PATCH /interaction/passkey-prompt`, exposed on `/user/me` + `/interaction/exists`, plus a `paginator-intl` service for localized paginator labels. Upstream refactored proxy-auth basic auth into `server/util/userMiddleware.ts` (`getUserByBasicAuth`) with its own failure rate limiter — this **supersedes fork H10**, so `basicAuthRateLimit` and its two `api.ts` seams were retired (`FORK.md` updated). Build tooling switched from **Madge to dpdm** for circular-dependency detection and pinned **TypeScript 6**; dependency refresh. i18n translated table headers, paginator and admin page titles (en-US now 550 keys). Test harnesses updated to supply the new NOT NULL `skipPasskeyPrompt` column

- **2026-10-14 sync (33 commits)**: **OIDC App logo upload** — per-client logos stored as content-hashed uploaded assets in `/app/config/uploads` (auto-dedup, randomized filenames; new `uploaded_asset` + `client_logo_asset` tables via migration `20260925309173_uploaded_assets`), with a new **`DISABLE_FILE_UPLOADS`** environment variable to turn all uploads off. Dependency refresh (Angular 22.2, oidc-provider 9.12, `multer` + `sharp` added, `matcher` 7). Upstream `Dockerfile` base image simplified from a digest-pinned `node:24-alpine3.22` to `node:24-alpine` — mirrored into `Dockerfile.fork`. i18n snackbar/confirmation-dialog translations plus a ru-RU theme-label fix. Fork re-application: upstream moved `upsertClient` from `server/oidc/provider.ts` to `server/db/client.ts`, so the H11 case-insensitive client-group matching was re-applied there (now guarded by `fork:check`). Also repaired pre-existing cp1252 mojibake in `docs/Configuration.md` and cherry-picked upstream's new *Uploaded Assets* docs section
- **2026-09-22 follow-up sync (3 commits)**: **Backchannel logout support** — admin user signout and account deletion now attempt to end client user sessions via backchannel logout. CodeQL action pins aligned (init + analyze at 4.37.9, fixing the version-mismatch workflow failure)
- **2026-09-22 follow-up sync (31 commits)**: **MFA model rework** — user `mfaRequired` is now authoritative: OIDC App and ProxyAuth MFA enforcement require the user's MFA to be enabled; completing the MFA page permanently enables MFA on the account; admins disabling MFA clears existing TOTP codes; new **MFA CLI commands** (`voidauth users mfa enable|disable`, password-reset moved under `users` with the old command kept); passkeys record user-verification usage (new migration); Sign-Up button moved to the login header; pending OIDC interactions preserved during signup; test-email dialog submit fix; pt-BR translation. Verified coexistence with the fork's TOTP replay protection, lockout, and all hardening seams
- **2026-08-30 follow-up sync (24 commits)**: ProxyAuth self-access bypass overmatching fix (security), TOTP failed-attempt lockout (10 attempts within a 10-minute window → 10-minute lockout, with countdown UX on the MFA page), oidc-provider client-metadata readonly fix, passkey wording simplification, dependency updates. Upstream's lockout coexists with the fork's TOTP replay protection — lockout is enforced at the route level, replay protection at the timestep level
- Merged 52 upstream commits: **Custom Claims** feature (users/groups/invitations, new admin page, `custom_claims` migration), **`TRUSTED_PROXIES`** environment variable (per-proxy/CIDR trust replacing the fork's `TRUST_PROXY` boolean — remove `TRUST_PROXY` from your environment when upgrading; the default `loopback, linklocal, uniquelocal` covers typical reverse-proxy setups), supply-chain hardening (GitHub Actions pinned to SHAs, base image digest-pinned, dependabot), prototype-pollution fix, COOP disabled for popup OIDC flows, and ru-RU locale
- Angular dependency pins aligned with upstream's Angular 22 line

#### Developer tooling

- **Fork logic extracted into fork-owned modules** — `server/cli/index-html.ts` (escaping, CSP mirror, asset-404 guard), `server/util/cors.ts`, `server/util/login-timing.ts`, `server/util/redact.ts`, `server/ldap/hardening.ts` (bind backoff, connection cap, idle timeout) — so upstream-hot files (`server.ts`, `provider.ts`, `interaction.ts`, `email.ts`, `api.ts`, `ldap/server.ts`) carry only single-line seams
- `scripts/fork-seams.mjs` + `npm run seams:apply` — after a merge, shared-file conflicts resolve with `git checkout --theirs` + one command that re-inserts all fork seams (idempotent; stale anchors fail loudly)
- `FORK.md` — authoritative fork-divergence manifest (H1-H16 hardening fixes, H10 retired, F1-F3 fork features) and upstream merge playbook
- `npm run fork:check` — post-merge semantic sweep asserting all divergences are still present (also catches `Dockerfile.fork` drift from upstream `Dockerfile` changes); now also guards the fork-owned modules (H9/H11/H12/H13/F2), the fork-only i18n keys, cp1252 mojibake in docs/i18n, and matching CodeQL `init`/`analyze` action pins
- **CodeQL Advanced fix** — upstream's dependabot bumped only `github/codeql-action/init` (to v4.38.3), leaving `analyze` at v4.38.2; the mismatch failed every push run with `Loaded a configuration file for version '4.38.3', but running version '4.38.2'`. Both steps are now pinned to v4.38.3, and `fork:check` fails if they ever diverge
- `npm run lockfiles:regen` — regenerates both lockfiles from the unioned `package.json` after a merge
- `npm run test:integration` — boots a throwaway Postgres, runs `test:ldap-guard` + `test:totp` + `test:ldap-sync`, tears it down
- `.github/workflows/verify-fork.yml` — fork CI on pushes/PRs to `mitch-auth` (`tsc`, `eslint`, `server:build`, `fork:check`, i18n check, AOT build, integration harnesses), since upstream's `test.yml` needs a dhi.io login and `release-fork.yml` only runs on a published Release
- `npm run i18n:normalize [--check]` — canonicalizes `en-US.json` formatting to keep i18n merges content-only
- `npm run docs:drift` — lists upstream changes to `merge=ours` docs/templates since the recorded base (they are dropped silently on merge) and flags env vars documented upstream but missing from the fork's `Configuration.md`
- `.nvmrc` / `.node-version` — pin Node 24.18.0 (the `engines` floor; Angular's production build needs >=24.15)
- `npm run test:totp` / `npm run test:ldap-sync` — integration harnesses in `test/` (real DB; they previously caught the weak-password and `user_group.id` bugs)
- `scripts/smoke.ps1` — runtime smoke test of a built image (base href, CSP mirroring, gated routes, migrations)
- `.github/workflows/upstream-drift.yml` — weekly check that opens an issue when upstream `main` has commits not yet absorbed by `mitch-auth`, to keep syncs small and frequent

#### Security

Security hardening release based on a full audit. Highlights:

- **Dependencies**: applied all available security fixes via lockfile-only updates (`npm audit fix`) — resolves 7 advisories in backend tooling/runtime chains (incl. `fast-uri`, `ip-address` used by express-rate-limit) and 10 in frontend (incl. DOMPurify XSS hardening for the admin email preview); zero `package.json` version changes

- **Fixed**: missing `return` after password-strength rejection allowed weak passwords to be silently stored during self-service password change (`PATCH /api/user/password`) and unauthenticated reset (`POST /api/public/reset_password`)
- **Hardened**: embedded LDAP server — per-source bind-failure backoff (5 consecutive failures → exponential block up to 15 min), max 64 concurrent connections, 5-minute idle timeout; argon2 verification moved off the event loop into a worker-thread pool so bind floods can no longer stall HTTP/OIDC
- **Changed**: default OIDC session TTL reduced from 1 year to 14 days, grant TTL from 1 year to 90 days (existing sessions keep their original expiry until they lapse)
- **Changed**: changing your password now signs out all other sessions for that account
- **Changed**: email log bodies are stored with secret challenges redacted, and `email_log` rows are now purged after 30 days
- **Changed**: successful password reset now invalidates *all* outstanding reset tokens for the account
- **Changed**: `send_verify_email` no longer re-sends while an active verification exists or the account is already verified (prevents mail-bombing via user UUID)
- **Added**: TOTP replay protection — an accepted code cannot be reused within its validity window
- **Changed**: LDAP sync no longer links matching local accounts by default; new opt-in `LDAP_SYNC_LINK_EXISTING_USERS` flag (admin accounts are never linked). Admin rights *granted by the sync* are revoked when a user leaves the configured LDAP admin group; manually assigned admin rights on synced accounts are never touched. Warns when the configured admin group is absent from the directory or no synced user's `memberOf` lists it
- **Fixed**: CSP `script-src` now mirrors the per-build `strict-dynamic` + hash policy that Angular's autoCsp emits as a meta tag, instead of a blanket `'self'` that blocked Angular's inline bootstrap scripts; scripts stay protected at the header level even for cached copies of the page
- **Added**: `TRUST_PROXY` setting (default `true`) controlling whether `X-Forwarded-*` headers are trusted for rate-limit identity
- **Changed**: CORS for OIDC endpoints now restricted to origins of each client's registered redirect / post-logout URIs instead of any HTTPS origin
- **Changed**: failed Basic-auth attempts on ProxyAuth endpoints (`/api/authz/*`) are now additionally rate limited
- **Changed**: admin-set logo/title values are HTML-escaped when injected into the served index page
- **Hardened**: admin email preview iframe is sandboxed
- **Fixed**: served `index.html` had an empty `<base href>` on root-path deployments, so deep links (e.g. `/logout/<secret>`) resolved JS/CSS assets under the route path and rendered a white page with MIME-type console errors; the base now always ends with `/`
- **Fixed**: TOTP enrollment confirmation consumed the current timestep, so logging in immediately afterwards with the still-displayed code was rejected as a replay until the 30 s window rolled over; enrollment no longer burns a timestep and replay protection still applies to real logins
- **Changed**: unresolved asset-like paths (`.js`, `.css`, fonts, images) now return 404 instead of falling through to the SPA index page
- **Fixed**: cancelling from the MFA screen used browser history to go back, but reaching that screen involves a chain of server redirects — going back re-entered the OIDC flow and bounced straight back to MFA with a stuck loading overlay; cancel now exits deterministically to the home page, logged out
- **Changed**: the frontend no longer logs a large error object after creating an OIDC interaction; browsers report the intentional manual redirect as an opaque status-0 response, which is now handled as success
- Login responses now take equal time for unknown usernames and wrong passwords
- **Hardened from OWASP ZAP scan**: CSP `worker-src` pinned to `'self'`; served index responses now sent with `Cache-Control: no-store` (also prevents stale-index deploy issues); version-control probe paths (`._darcs`, `.git`, `.svn`, `.hg`) return 404 instead of the SPA index. Remaining scan findings are documented as accepted trade-offs in `FORK.md`

#### Added
- **Admin Settings page** — DB-backed runtime config (Admin → Settings)
  - General: APP_TITLE, DEFAULT_REDIRECT, CONTACT_EMAIL
  - Security toggles: SIGNUP, SIGNUP_REQUIRES_APPROVAL, EMAIL_VERIFICATION, MFA_REQUIRED
  - Access: PASSWORD_STRENGTH (0-4 slider), API_RATELIMIT, ADMIN_EMAILS (dropdown), DEFAULT_USER_EXPIRES_IN
  - Appearance: APP_COLOR (colour picker), APP_FONT, logo upload (SVG + PNG, stored as base64)
  - Email: SMTP_FROM
- LDAP Directory Sync — pull users and groups from external LDAP directories (Active Directory, OpenLDAP, 389 DS, LLDAP)
- VitePress documentation site at [auth.mitchforge.com](https://auth.mitchforge.com) (replaces upstream Docsify)
- Multi-arch Docker builds (amd64 + arm64) via `release-fork.yml`
- Fork-specific GitHub Actions workflows (`release-fork.yml`, `docs-fork.yml`)
- Fork-specific issue templates (YAML forms with LDAP sync fields)
- Fork-specific `SECURITY.md` (reporting scope, security model, deployment checklist)
- Fork-specific `AGENTS.md` (developer operating guide)
- Fork-specific `CHANGELOG.md` (this file)
- `Dockerfile.fork` — uses public `node:24-alpine3.22` instead of private `dhi.io/node:24-alpine3.22`
- `compose.fork.yml` — points to `ghcr.io/mitchelljfranklin/mitch-auth`, enables LDAP port 3890
- `.github/README.md` — fork-specific README (root `README.md` kept as upstream mirror)
- `docs/package.json` — separate VitePress dependency to avoid merge conflicts with root `package.json`

#### Changed
- **Rebranded**: `mitch-voidauth` / `Mitch-VoidAuth` → `mitch-auth` / `Mitch-Auth`; GHCR image is now `ghcr.io/mitchelljfranklin/mitch-auth`; GitHub repository renamed to match (old URLs redirect automatically); deployment branch renamed `mitch-voidauth` → `mitch-auth`
- Docker image: `voidauth/voidauth:latest` → `ghcr.io/mitchelljfranklin/mitch-auth:latest`
- Docker base image: `dhi.io/node:24-alpine3.22` → `node:24-alpine3.22` (public) in `Dockerfile.fork`
- Documentation URLs: `voidauth.app` → `auth.mitchforge.com`
- GitHub URLs: `voidauth/voidauth` → `mitchelljfranklin/mitch-auth`
- Issue templates: Markdown → YAML forms with LDAP sync fields and pre-submission checklists
- PR template: added lint, build, multi-arch, and fork-file checklists
- `checkPasswordHash()` in `server/db/user.ts` — extended with LDAP bind auth fallback
- `server/util/config.ts` — extended with `LDAP_SYNC_*` environment variables and DB-backed settings
- `server/ldap/directory.ts` — updated to use upstream's renamed `getLDAPUserIdByDN`
- `server/ldap/server.ts` — integrated upstream's ALS context, logging, and error handling improvements
- `eslint.config.js` — added `docs/**` and `.github/**` to ignore list
- `.gitignore` — added VitePress cache directory
- `shared/db/Flag.ts` — added `updatedAt` column
- `docs/Configuration.md` — added Admin Settings section

#### Removed
- Docsify documentation site (`docs/index.html`, `docs/_sidebar.md`, `docs/CNAME`)
- Docker Hub publishing (no credentials for `voidauth/voidauth` registry)
- `dhi.io` private registry dependency (only in `Dockerfile.fork`)
