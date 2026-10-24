# 🩹 Mitch-Auth v1.18.1 — Light Theme Background Fix

> **TL;DR** — Fixes a v1.18.0 regression where choosing the **light theme** on a device whose OS is in dark mode left the page canvas dark below the first screen.

---

## 🐛 What was wrong

The theme toggle applied `light` / `dark` only to `<body>`, while the generated Material theme sets `html { color-scheme: light dark }`. On a device with a dark OS and an explicit light theme:

- `<html>` kept the **dark** color scheme, so its `light-dark()` surface resolved to the dark color (`#151218`).
- `<body>` (viewport height) stayed light.
- Scrolling past the first screen revealed the dark `<html>` canvas behind the content.

Dark theme was unaffected, which made the bug look theme-specific.

---

## ✅ The fix

- The theme class is now applied to **`<html>`** (`documentElement`) — `styles.scss` targets `html.light` / `html.dark`.
- `color-scheme` now lives on the same element that paints the canvas, so the surface color matches the selected theme everywhere.
- **System** mode is unchanged and still follows the OS preference.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.18.1` — multi-arch `linux/amd64` + `linux/arm64`
- **No** database migrations or configuration changes.

---

## ✅ Verification

Typecheck and lint clean; production Angular AOT build passes; the compiled bundle now contains `html.light{color-scheme:light}` and the `documentElement.classList` toggle. Runtime smoke test (health, base href, CSP mirror, gated routes, migrations, LDAP listener) passes.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
