# 🚀 Mitch-Auth v1.18.0 — Custom Branding, Passkey Control & Hardening

> **TL;DR** — Three upstream syncs (**63 commits**) bring per-application OIDC logos, custom page **background images**, a per-user **skip passkey prompt** preference, and upstream's own proxy-auth **basic-auth failure rate limiting**. The build moves to **dpdm + TypeScript 6**, fork CI gates every push, and a CodeQL pin regression is fixed.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🎨 Branding | Per-app OIDC logos and **uploaded asset** storage; `background.png` / `background.jpg` page backgrounds; `DISABLE_FILE_UPLOADS` kill switch |
| 🔐 Authentication | Per-user **skip passkey prompt**; upstream's `getUserByBasicAuth` failure limiter replaces fork hardening H10 |
| 🌍 Localization | Table headers, paginator and admin page titles translated; ru-RU completed (en-US now 550 keys) |
| 🛠️ Build & CI | Madge → **dpdm**, **TypeScript 6**, a fork verification workflow, CodeQL pin fix, and a Node 24.18 pin |

---

## ✨ Highlights

### 🎨 Branding, now with backgrounds

Drop a `background.png` or `background.jpg` into the mounted **`/app/config/branding`** directory and it becomes a page background on the user-facing screens that are not expected to scroll much — login, MFA, password reset, verification, consent and not-found pages. The fork's DB-backed `APP_LOGO` setting now composes with it instead of hiding it.

### 🖼️ Per-application OIDC logos

Each OIDC application can now carry its own logo. Uploads are content-hashed and de-duplicated under **`/app/config/uploads`**, with randomized filenames. If you would rather not accept any uploads, set **`DISABLE_FILE_UPLOADS=true`**.

### 🔑 Skip the passkey prompt

Users who prefer not to be asked about passkeys on every sign-in can opt out. The preference is stored per account (`skipPasskeyPrompt`, backfilled to `false` for existing users) and can be set from the passkey prompt itself.

### 🛡️ Proxy-auth hardening

Upstream moved proxy-auth basic-auth resolution into `server/util/userMiddleware.ts` and rate-limits **failed** basic-auth attempts there (2 failures / 10 s, successful requests are not counted). This supersedes the fork's own limiter, so hardening **H10 is retired** — one less divergence to carry across merges.

---

## 🔧 Fixes & reliability

- **CodeQL Advanced is green again.** Upstream's dependabot bumped only `codeql-action/init` to v4.38.3, leaving `analyze` on v4.38.2, which failed every push with a config/version mismatch. Both are now pinned to v4.38.3, and `fork:check` fails if they ever diverge.
- **`APP_LOGO` + background images** now work together (the DB-logo path previously returned before the background injection).
- **Docs encoding repaired** — `docs/Configuration.md` had been committed as cp1252-mangled UTF-8; emoji and arrows render correctly again.
- **Smoke-test failure counting** fixed (failures were counted twice).
- **TOTP harness de-flaked** — window arithmetic is anchored to a TOTP boundary instead of wall-clock time (~1/30 runs could fail at a boundary).
- `REDIRECT_PATHS.NOT_FOUND` was renamed from `not-found` to `not_found` by upstream.

---

## 🏗️ Under the hood

- Circular-dependency detection switched from **Madge to dpdm**; **TypeScript 6** is now an explicit dependency; dependency refresh across Angular 22.2, oidc-provider 9.12, express 5.3 and friends.
- New **`verify-fork.yml`** CI runs typecheck, lint, the dpdm bundle check, `fork:check`, the i18n check, an AOT frontend build and the integration harnesses on every push/PR to `mitch-auth`.
- Merge tooling: `docs:drift` (surfaces silently dropped `merge=ours` docs), `lockfiles:regen`, `test:integration`, and a `fork:check` that now also guards the fork-owned modules, i18n keys, docs encoding and CodeQL pins.
- `.nvmrc` / `.node-version` pin Node 24.18.0 (Angular's build floor).

---

## 📦 Upgrade notes

> [!NOTE]
> Database migrations run automatically at startup. This release adds `uploaded_assets` (with client-logo assets) and the `skipPasskeyPrompt` user column (existing users are backfilled to `false`).

- **Back up the config volume.** Uploaded assets live in `/app/config/uploads`; if you mount `./voidauth/config:/app/config` (as in `compose.fork.yml`), they are already persisted.
- **Disable uploads** with `DISABLE_FILE_UPLOADS=true` if your deployment should not accept user files.
- **Deep links:** the internal not-found route changed from `/not-found` to `/not_found`. Normal SPA navigation is unaffected.
- **Docker:** `ghcr.io/mitchelljfranklin/mitch-auth:1.18.0` — multi-arch `linux/amd64` and `linux/arm64`.

---

## ✅ Verification performed

Typecheck (`tsc`) and lint clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; production Angular AOT build; runtime smoke test (health, base href, CSP mirror, gated routes, migrations, LDAP listener); fork CI and CodeQL both green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
