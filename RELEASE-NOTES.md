# 🚀 Mitch-Auth v1.19.0 — Branding Backgrounds & Theme Fix

> **TL;DR** — You can now upload a **page background** from **Admin → Settings → Appearance**, the **light-theme dark canvas** below the fold is fixed, and logo uploads take effect immediately.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 🎨 Background | Upload / remove a page background from Admin Settings; PNG, JPEG or WebP, resized automatically |
| 🌗 Theme | Light theme no longer shows a dark canvas when the OS is in dark mode |
| 🖼️ Logo | Uploads now apply immediately — no restart or extra save |
| 📦 Upgrade | No database migrations or configuration changes |

---

## ✨ Highlights

### 🎨 Background image from Admin Settings

**Admin → Settings → Appearance** now has a **Background Image** control next to the logo.

- Upload **PNG, JPEG or WebP** — the browser downscales it to at most **1920 px** and compresses it to JPEG before upload.
- The image is stored as **`background.jpg`** in your mounted **`/app/config/branding`** directory, so it persists with the rest of your config volume.
- **Remove** deletes it again.
- A manually placed `background.png` / `background.jpg` / `background.jpeg` still works (the upstream mechanism), and the settings page now detects and previews it.

> No new environment variable: the background stays file-based, matching upstream. Admin uploads simply manage that file.

### 🌗 Light-theme canvas fixed

Choosing **light** on a device whose OS is in dark mode could leave a dark band behind the content once you scrolled past the first screen. The theme toggle now applies the `light` / `dark` class to **`<html>`** instead of only `<body>`, so the page canvas matches the selected theme. **System** mode is unchanged.

### 🖼️ Logo uploads apply immediately

Uploading an app logo from Appearance now takes effect right away, instead of waiting for a restart or another settings save.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.19.0` — multi-arch `linux/amd64` + `linux/arm64`
- **No** database migrations or configuration changes.
- Background images live in `/app/config/branding`; keep that volume backed up (as before).

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; runtime smoke test including **background served + injected into the index**; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
