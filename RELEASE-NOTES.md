# 🚀 Mitch-Auth v1.17.0 — Rebrand & MFA Model Rework

> **TL;DR** — The project is now **Mitch-Auth** (new name, new Docker image — migration required, see below). Upstream's **MFA model rework** makes per-account MFA authoritative with new CLI commands, **backchannel logout** now ends client sessions on signout and account deletion, admin tables are **paginated**, and a handful of upstream fixes land (password-strength enforcement, paginator, test-email dialog).

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🏷️ Rebranding | Project, Docker image, docs and repository are now **Mitch-Auth / mitch-auth** — migration required for existing deployments |
| 🔁 MFA model rework | Per-account MFA is now **authoritative**; app-level enforcement requires user MFA; new MFA CLI commands; TOTP codes cleared when admins disable MFA |
| 🚪 Backchannel logout | Admin signout and account deletion now end client sessions via backchannel logout |
| 📄 Admin tables | Paginated users/password-resets APIs; page size remembered across admin pages |
| 🐛 Fixes | Password-strength enforcement now always applies; paginator page size; pending OIDC interactions preserved during signup; test-email dialog |
| 🌍 Locales | pt-BR added; Estonian, Chinese, Russian, Dutch, German, French refreshed |

---

## 🏷️ Rebranding & Migration — **read this first**

This release renames the project from **Mitch-VoidAuth** to **Mitch-Auth**.

1. **Update your compose file's image line**:
   ```yaml
   image: ghcr.io/mitchelljfranklin/mitch-auth:latest   # was .../mitch-voidauth:latest
   ```
2. Your existing **config volume and database carry over unchanged** — no data migration beyond the automatic schema updates on first start (passkey verification tracking)
3. The GitHub repository is now `mitchelljfranklin/mitch-auth` (old URLs redirect automatically)
4. The old `mitch-voidauth` GHCR image is frozen (no further updates); all future releases publish under `mitch-auth`

---

## 🔁 MFA Model Rework

Upstream reworked how MFA enforcement works. The behavioral changes:

- **Per-account MFA is now authoritative** — completing the MFA page permanently enables MFA on that account, so users can never believe they have MFA when they don't
- **App-level enforcement is stricter** — OIDC client and ProxyAuth MFA requirements now *also* require the user's own MFA to be enabled
- **Admins disabling MFA clears stored TOTP codes** — no stale codes hanging around on accounts where MFA was turned off
- **Pre-login MFA setup restrictions** — users who already have a way to complete MFA are no longer offered pre-login passkey/TOTP registration
- **New MFA CLI commands**:
  ```bash
  voidauth user mfa enable <username>
  voidauth user mfa disable <username>
  ```
- **Passkeys record user-verification usage** (automatic schema migration on first start)
- MFA Required can now be set on the **Invitations page**

---

## 🚪 Backchannel Logout

- OIDC clients can now configure a **Backchannel Logout URL**
- **Admin user signout** and **account deletion** now attempt to end that user's sessions in connected client applications via backchannel logout
- See the updated [OIDC App Guides](docs/OIDC-Guides.md) (e.g. Immich) for client configuration

## 📄 Admin Table Pagination

- Users and password-resets APIs are now paginated
- Your chosen **page size is remembered** across admin pages and sessions
- Debounced dropdown searches in admin dialogs

## 🖥️ Login Page

- The **Sign-Up button moved to the header** of the login page
- Pending OIDC interactions are now **preserved during signup**, so starting a signup from a client app no longer loses the original redirect

---

## 🐛 Fixes

| Fix | Detail |
|---|---|
| Password-strength enforcement | The strength check now always prevents weak passwords from being applied, and API error responses consistently stop further processing |
| Paginator page size | Minimum page size corrected to match the UI; the count no longer accumulates in the dropdown |
| Custom Claims logo | Logo display fix on the Custom Claims admin page |
| Test-email dialog | Submit no longer reloads the page |
| Migration rollback | Missing `down()` added to the user-group-client-mfa migration |
| Search hardening | User search terms are escaped before use in queries |

---

## 🧰 Pipeline & Tooling

- **CodeQL**: action pins aligned (`init` + `analyze` at 4.37.9, fixing the version-mismatch failure) and CodeQL now scans this repository's actual deployment branch
- **Seam engine**: `seams:apply` preserves matched-line indentation — prevents YAML/code de-indentation in future upstream merges
- **Upstream drift monitor**: drift issues now include the commit count in the title and auto-close when a sync lands
- **`npm run base:set`** — one command records the upstream base in `FORK.md` and `CHANGELOG.md`, with a guard against recording unmerged bases
- GitHub Actions bumps: `build-push-action` 7.3.0, `setup-qemu-action` 4.3.0, `codeql-action` 4.37.9, `deploy-pages` 5.0.1

---

## 🌍 Locales

- **pt-BR (Brazilian Portuguese) added**
- Estonian, Chinese, Russian, Dutch, German and French translations refreshed

---

## ✅ Verification Performed

- `fork:check`: 30 seams + 22 owned-file divergences verified intact after the merge
- Integration harnesses: TOTP replay/lockout (re-verified against the reworked MFA model), LDAP sync provenance, LDAP bind guard — **all pass**
- Full pipeline: `tsc`, `eslint`, circular-dependency check, Angular AOT production build, multi-arch image, 15-assertion runtime smoke (incl. embedded LDAP listener)

**Full change details:** [CHANGELOG.md](CHANGELOG.md) · **Fork divergence manifest:** [FORK.md](FORK.md)

<sub>Neither VoidAuth nor this fork has been independently audited. Use at your own risk.</sub>
