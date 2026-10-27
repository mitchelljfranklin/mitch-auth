# 🚀 Mitch-Auth v1.20.0 — User Avatars & TOTP Key-Rotation Fix

> **TL;DR** — Users and admins can now set **profile avatars** (with an opt-out switch), TOTP secrets are correctly **re-encrypted when `STORAGE_KEY` rotates**, image uploads share one hardened pipeline, and translations were refreshed.

---

## 📋 At a Glance

| Area | Summary |
|---|---|
| 👤 Avatars | Self-service on the home page; admins can manage avatars on users and invitations |
| 🔐 TOTP | Secrets are re-encrypted on `STORAGE_KEY` rotation (fix) |
| 🖼️ Uploads | Shared `imageUpload` / `normalizeUploadedImage` pipeline (client logos + avatars) |
| 🌍 i18n | German, French, Dutch, Russian and English updates |
| 🛠️ CI | CodeQL `init`/`analyze` aligned to v4.39.0; `actions/checkout` v7.0.1 |

---

## ✨ Highlights

### 👤 User avatars

- Users can upload or remove their avatar from the home page.
- Admins can set or remove avatars while editing a **user** or an **invitation**.
- PNG, JPEG or WebP, validated for size and dimensions, stored as content-hashed de-duplicated uploaded assets (orphans are cleaned up during maintenance).
- Set **`DISABLE_USER_AVATAR_UPLOADS=true`** to stop members from uploading avatars — admins can still manage them.

### 🔐 TOTP storage-key rotation fixed

When `STORAGE_KEY` was rotated, TOTP secrets could be checked for decryptability but were not actually re-encrypted with the new key. They now are, matching the other encrypted tables — so rotating keys no longer risks stale TOTP secrets.

### 🖼️ One image pipeline

Client logos and avatars now share a single multer + sharp pipeline with consistent size/dimension limits and normalization.

### 🌍 Localization & CI

Translation updates across German, French, Dutch, Russian and English. Upstream bumped CodeQL `init` to v4.39.0; the fork aligned `analyze` to the same pin (guarded by `fork:check`), and `actions/checkout` to v7.0.1.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.20.0` — multi-arch `linux/amd64` + `linux/arm64`
- **Database migration** `user_avatars` adds nullable `avatarHash` columns to `user` and `invitation`; it runs automatically at startup.
- Avatar files live alongside client logos in **`/app/config/uploads`** — keep that volume persisted/backed up.
- Optional: **`DISABLE_USER_AVATAR_UPLOADS=true`** prevents member avatar uploads.
- No other configuration changes.

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
