# 🩹 Mitch-Auth v1.22.2 — LDAP Sync New-User Fix

> **TL;DR** — Fresh deployments can sync new LDAP users again. The sync insert was missing the `skipPasskeyPrompt` value required by the passkey-prompt migration, so every new LDAP user failed to create.

---

## 🐛 What was wrong

Every new LDAP user insert failed with:

```
NOT NULL constraint failed: user.skipPasskeyPrompt
```

The passkey-prompt migration made `user.skipPasskeyPrompt` `NOT NULL` **without a database default**. All other user-insert paths set it; the LDAP sync was the only one missed. This affected **both SQLite and PostgreSQL** — it was just easier to hit on SQLite because the migration rebuilds the table.

Reported in [#33](https://github.com/mitchelljfranklin/mitch-auth/issues/33).

---

## ✅ The fix

- `server/ldap/sync.ts` now writes `skipPasskeyPrompt: false` when provisioning a synced user.
- `test:ldap-sync` now provisions a **brand-new** LDAP user and asserts `skipPasskeyPrompt`, LDAP source and the stored external DN — so future `NOT NULL` additions to the user table are caught by the harness.
- **No schema change.** The migration intentionally has no default; every insert must supply the value. If you applied a SQLite `DEFAULT false` workaround manually, it is safe to leave in place or revert after upgrading.

---

## 📦 Upgrade

- Image: `ghcr.io/mitchelljfranklin/mitch-auth:1.22.2` — multi-arch `linux/amd64` + `linux/arm64`
- **No new migrations or configuration changes.**

---

## ✅ Verification

`tsc` / `eslint` clean; `dpdm` circular check and esbuild bundle pass; `fork:check` (27 seams + 29 divergences); production Angular AOT build; `test:integration` (`ldap-guard`, `totp`, `ldap-sync`) all pass, including the new LDAP provisioning assertions; runtime smoke test including branding-background serving; fork CI and CodeQL green.

---

**Full changelog:** [CHANGELOG.md](https://github.com/mitchelljfranklin/mitch-auth/blob/mitch-auth/CHANGELOG.md)
