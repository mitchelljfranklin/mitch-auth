# 🚀 Mitch-Auth v1.21.0 — LDAP Avatars & WebP Backgrounds

> **TL;DR** — User avatars now appear in LDAP as **`jpegPhoto`**, branding backgrounds accept **WebP**, proxy-auth got several fixes, passkey sign-up works again, and asset URLs are correct when `APP_URL` has no base path.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 👤 LDAP | User avatars exposed as `jpegPhoto` (directory server rewritten under the hood) |
| 🎨 Backgrounds | `background.webp` supported in the branding folder and in Admin upload |
| 🛡️ ProxyAuth | Max-session, schema support and a basic-auth rate-limit race fixed |
| 🔑 Sign-up | Passkey registration during sign-up fixed (no password required) |
| 🔗 URLs | Correct asset URLs when `APP_URL` has no base path |
| 🧭 Admin | Back buttons on individual record pages |

---

## ✨ Highlights

### 👤 Avatars in LDAP (`jpegPhoto`)

Directory entries now expose the user's avatar as `jpegPhoto`, so LDAP-aware apps can show profile pictures. It reuses the user-avatar uploads added in v1.20.0.

### 🎨 WebP backgrounds

`background.webp` is now recognized alongside `background.png` / `.jpg` / `.jpeg`. Drop one into `/app/config/branding`, or use **Admin → Settings → Appearance** — uploaded backgrounds are still optimized to JPEG client-side.

### 🛡️ ProxyAuth fixes

- Max-session no longer blocks users authenticating via `Authorization` / `Proxy-Authorization` headers.
- Broader schema support for proxy-auth domains.
- Fixed a race in basic-auth failure rate limiting.

### 🔑 Sign-up & URL fixes

Passkey registration during sign-up no longer requires a password. Asset URLs are now generated correctly when `APP_URL` has no base path — the wildcard URL matcher was rewritten and `matcher` was replaced with the platform `URLPattern`.

### 🧭 Admin polish

Individual record pages get a back button; header, button and language-switcher emoji styling were cleaned up.

---

## 🏗️ Under the hood

- `server/ldap/server.ts` refactored into focused `ber` / `filter` / `request` modules.
- Declared Docker clients with custom-scheme redirects are marked as native apps.
- Docker container inspection is resilient to a single container failing.
- Dependency refresh; CodeQL `init` / `analyze` at v4.39.0 (kept in lock-step by `fork:check`).
- i18n updates (en-US, nl-NL).

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.21.0` — multi-arch `linux/amd64` + `linux/arm64`
- **No new database migrations or configuration changes.**
- `jpegPhoto` reads existing user avatars; uploaded files stay in `/app/config/uploads`.

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
