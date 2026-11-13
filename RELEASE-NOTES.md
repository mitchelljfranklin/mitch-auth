# 🩹 Mitch-Auth v1.22.1 — MFA Group Warnings, Invitation Hardening & Asset CORS

> **TL;DR** — The admin user page warns when a user is covered by an MFA-required group, invitation registration is hardened against reuse, uploaded avatars/logos can be embedded cross-origin, and the Russian translation is complete.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🔐 MFA groups | Group `mfaRequired` is exposed to the admin UI, with a warning when a user's own MFA toggle is off |
| 🧾 Invitations | Registration confirms the invitation was actually consumed (catches reuse/races) |
| 🖼️ Assets | Avatars and client logos are served with `Cross-Origin-Resource-Policy: cross-origin` |
| 🌍 i18n | Russian translation completed; new MFA warning string |
| 🧭 Browser check | Wildcard-URL validation now reports a missing `URLPattern` API clearly |

---

## ✨ Highlights

### 🔐 MFA-required group warnings

Group MFA requirements are now included in the user, invitation and admin-config group data. When editing a user who belongs to an MFA-required group but whose personal MFA toggle is off, the admin page shows a warning naming the group — so it's clear why MFA will still be enforced.

### 🧾 Invitation hardening

Registration and passkey registration now verify that the invitation row was actually deleted after use. If it was already consumed (a race or reuse attempt), registration fails with a clear error instead of proceeding on a stale invitation.

### 🖼️ Embeddable avatars and logos

Files under `/assets/uploads` (user avatars, OIDC app logos) now carry `Cross-Origin-Resource-Policy: cross-origin`, so external applications can embed them without being blocked by Helmet's default same-origin policy.

### 🌍 Localization & small fixes

Completed the Russian translation and added the new MFA-warning string. The frontend wildcard-redirect validator now reports when the browser lacks the `URLPattern` API, instead of failing opaquely.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.22.1` — multi-arch `linux/amd64` + `linux/arm64`
- **No database migrations or configuration changes.**

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
