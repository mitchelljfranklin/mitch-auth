# 🚀 Mitch-Auth v2026.10.0 — Rebrand, MFA Model Rework & Backchannel Logout

> **TL;DR** — The project is now **Mitch-Auth** (new name, new Docker image — migration required, see below). This release brings upstream's **MFA model rework** (per-account MFA is now authoritative, with new CLI commands), **backchannel logout** for OIDC clients, **admin table pagination**, upstream's own fix for the password-strength bypass, and a full pipeline/tooling refresh (CodeQL green, drift monitor self-closing).

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🏷️ Rebranding | Project, Docker image, docs and repo are now **Mitch-Auth / mitch-auth** — migration required for existing deployments |
| 🔁 MFA model | Per-account MFA is **authoritative**; new MFA CLI commands; passkey user-verification tracking (new migration) |
| 🚪 Backchannel logout | Admin signout and account deletion now end client sessions via backchannel logout |
| 📄 Admin tables | Paginated users/password-resets APIs; page size remembered across admin pages |
| 🐛 Fixes | Password-strength enforcement, paginator page-size, test-email dialog, pending OIDC interactions during signup |
| 🧰 Tooling | CodeQL aligned and scanning the fork branch, seam indentation preservation, self-closing drift issues |

---

## 🏷️ Rebranding & Migration — **read this first**

This release renames the project from **Mitch-VoidAuth** to **Mitch-Auth**.

1. **Update your compose file's image line**:
   ```yaml
   image: ghcr.io/mitchelljfranklin/mitch-auth:latest   # was .../mitch-voidauth:latest
   ```
2. Your existing **config volume and database carry over unchanged** — no data migration beyond the automatic schema updates on first start
3. The GitHub repository is now `mitchelljfranklin/mitch-auth` (old URLs redirect automatically)
4. The old `mitch-voidauth` GHCR image is frozen (no further updates); all future releases publish under `mitch-auth`

---

## 🔁 MFA Model Rework

Upstream reworked how MFA enforcement works. The behavioral changes:

- **Per-account MFA is now authoritative** — completing the MFA page permanently enables MFA on that account, so users can never believe they have MFA when they don't
- **App-level enforcement is stricter** — OIDC client and ProxyAuth MFA requirements now *also* require the user's own MFA to be enabled
- **Admins disabling MFA clears stored TOTP codes** — no stale codes hanging around on accounts where MFA was turned off
- **New MFA CLI commands**:
  ```bash
  voidauth user mfa enable <username>
  voidauth user mfa disable <username>
  ```
- **Passkeys record user-verification usage** (automatic schema migration on first start)
- Pre-login MFA setup is no longer offered to users who already have a way to complete MFA

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

---

## 🐛 Fixes

| Fix | Detail |
|---|---|
| Password-strength enforcement | Upstream landed its own fix for the missing-`return` bypass (paralleling the fork's hardening); error responses now always return immediately |
| Paginator page size | Minimum page size corrected to match the UI; count no longer accumulates in the dropdown |
| Pending OIDC interactions | Signup no longer loses the pending OIDC interaction |
| Test-email dialog | Submit no longer reloads the page |
| Migration rollback | Missing `down()` added to the user-group-client-mfa migration |

---

## 🧰 Tooling & Pipeline

- **CodeQL**: action pins aligned (`init` + `analyze` at 4.37.9, fixing the version-mismatch failure) and CodeQL now scans this repository's actual deployment branch
- **Seam engine**: `seams:apply` preserves matched-line indentation — prevents YAML/code de-indentation in future upstream merges
- **Upstream drift monitor**: drift issues now auto-close when a sync lands, and titles include the commit count
- **`npm run base:set`** — one command records the upstream base in `FORK.md` and `CHANGELOG.md`
- pt-BR translation added; Estonian/French/Dutch/German/Russian/Chinese translations refreshed

---

## ✅ Verification Performed

- `fork:check`: 30 seams + 22 owned-file divergences verified intact after the merge
- Integration harnesses: TOTP replay/lockout, LDAP sync provenance, LDAP bind guard — **all pass**
- Full pipeline: `tsc`, `eslint`, circular-dependency check, Angular AOT production build, multi-arch image, 15-assertion runtime smoke (incl. embedded LDAP listener)

**Full change details:** [CHANGELOG.md](CHANGELOG.md) · **Fork divergence manifest:** [FORK.md](FORK.md)

<sub>Neither VoidAuth nor this fork has been independently audited. Use at your own risk.</sub>
