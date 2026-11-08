# 🚀 Mitch-Auth v1.22.0 — App Discovery, Hidden Apps & Sharper Startup

> **TL;DR** — The home page now shows the OIDC apps a user can access (with guessed icons), admins can **hide apps** from that list, the light theme is fixed upstream, and a failed `sharp` import no longer risks crashing startup.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🧭 App discovery | Home page lists the OIDC apps each user can access |
| 🙈 Hidden apps | Per-client `hide_from_home` (admin checkbox; `CLIENT_HIDE_FROM_HOME` for declared clients) |
| 🖼️ App icons | Uploaded logo, otherwise guessed from the app's home page (`apple-touch-icon.png`) |
| 🌗 Light theme | Light/dark classes now apply to both `<html>` and `<body>` |
| 🛡️ Startup | `sharp` is loaded lazily; image uploads return 400 vs 500 correctly |
| 🔐 Declared clients | New `CLIENT_MFA_REQUIRED` variable |

---

## ✨ Highlights

### 🧭 Your apps, on your home page

The user home page now has an **Apps** section with tiles for the OIDC applications the user can access (same group rule as login; admins see everything). Only apps with a home page URL are shown, and ProxyAuth domains are not included.

### 🙈 Hide an app from the home page

Each OIDC app has a **hide from home** option in the admin UI (`hide_from_home`), plus `CLIENT_HIDE_FROM_HOME` for environment/label-declared clients. Hidden apps remain fully usable through their normal login flow — they are just omitted from the home page.

### 🖼️ Sensible app icons

If an app has no uploaded logo, the tile falls back to the app's home page `apple-touch-icon.png` and hides broken images gracefully.

### 🌗 Light theme

Upstream now applies the `light` / `dark` classes to **both** `<html>` and `<body>`, fixing the light-theme canvas when the OS is in dark mode. This supersedes the fork's earlier equivalent fix.

### 🛡️ Safer startup

`sharp` is imported lazily (`getSharp`) and a failed native import no longer crashes the app at startup. Image uploads now distinguish invalid files (400) from processing failures (500).

### 🔐 Declared client MFA

Declared clients can set `CLIENT_MFA_REQUIRED` alongside the existing redirect/consent/group variables.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.22.0` — multi-arch `linux/amd64` + `linux/arm64`
- **No database migrations or configuration changes.**
- Existing OIDC apps remain visible on the home page (`hide_from_home` defaults to false).

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
