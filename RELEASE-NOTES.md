# 🚀 Mitch-Auth v1.23.0 — LDAP Credential Hardening, Italian Locale & Admin Polish

> **TL;DR** — LDAP-managed accounts are now **LDAP-only**: local passwords can no longer be set or used, closing a credential-shadowing issue. This release also adds an **Italian** locale, a **search bar** for ProxyAuth domains, and reorders the admin sidebar.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🔐 LDAP | Synced users authenticate **only** against the directory; local password changes are blocked and existing local hashes are ignored |
| 🇮🇹 Localization | Italian (`it-IT`) translation |
| 🔎 Admin | Search on the ProxyAuth domains page; reordered sidebar (Users/Invitations before Apps/Domains) |
| 🛠 CI | CodeQL `init`/`analyze` at v4.39.3 |
| 📦 Upgrade | No migrations or configuration changes |

---

## ✨ Highlights

### 🔐 LDAP credential hardening

Users synced from an external LDAP directory could previously set a **local password** from their profile page. Login then accepted **either** the directory password (LDAP bind) **or** the local password (argon2 fallback) — a local credential that survived directory password changes.

Now:
- LDAP-managed users authenticate **only** against the directory.
- The profile API rejects local password changes (`403`) and the UI replaces the password form with "Your password is managed by your LDAP directory".
- Any existing local password hash on an LDAP-linked account is ignored.
- Passkey management still works: the external LDAP credential counts as a login credential.

> **Behaviour change:** accounts linked to LDAP via `LDAP_SYNC_LINK_EXISTING_USERS` become LDAP-only too. Their credentials are managed in the directory; no data migration is required.

### 🇮🇹 Italian locale

Added the `it-IT` translation and its locale entry.

### 🔎 ProxyAuth domain search

The admin ProxyAuth domains page now has a debounced search/filter and keeps sorting/pagination in sync.

### 🧭 Admin sidebar & tooling

Admin sidebar items are reordered (Users and Invitations first, then Apps/Domains). CodeQL `init`/`analyze` are pinned to v4.39.3 and stay in lock-step via `fork:check`.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.23.0` — multi-arch `linux/amd64` + `linux/arm64`
- **No database migrations or configuration changes.**
- LDAP-linked users: no action needed. Local passwords are ignored; manage credentials in the directory.

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass, including the new assertion that LDAP users ignore local password hashes; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
